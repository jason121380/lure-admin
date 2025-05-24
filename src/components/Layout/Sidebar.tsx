
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, X, LogOut, User, Mail, Key, Menu, ChevronLeft, ChevronRight, GripVertical, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type DepartmentType = {
  id: string;
  code: string;
  name: string;
  sort_order: number;
};

type SidebarProps = {
  activeDepartment: string;
  setActiveDepartment: (id: string) => void;
  isVisible: boolean;
  toggleSidebar?: () => void;
};

// Sortable department item component
const SortableDepartment = ({ 
  department, 
  activeDepartment,
  onSelectDepartment,
  onDeleteClick,
  onEditClick,
  customerCount
}: { 
  department: DepartmentType;
  activeDepartment: string;
  onSelectDepartment: (code: string) => void;
  onDeleteClick: (e: React.MouseEvent, dept: DepartmentType) => void;
  onEditClick: (e: React.MouseEvent, dept: DepartmentType) => void;
  customerCount: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: department.id,
    data: department
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="relative group flex items-center"
    >
      {department.code !== 'all' && department.code !== 'uncategorized' && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 absolute left-1 cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5 text-gray-400" />
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        className={cn(
          "w-full justify-start gap-3 font-normal",
          activeDepartment === department.code && "bg-slate-100",
          department.code !== 'all' && department.code !== 'uncategorized' && "pl-7 pr-10"
        )}
        onClick={() => onSelectDepartment(department.code)}
      >
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
        <span>{department.name} ({customerCount})</span>
      </Button>
      
      {/* Dropdown menu for department actions */}
      {department.code !== 'all' && department.code !== 'uncategorized' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">部門選項</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={(e) => onEditClick(e, department)}>
              <Edit className="h-4 w-4 mr-2" />
              編輯名稱
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => onDeleteClick(e, department)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              刪除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export function Sidebar({ activeDepartment, setActiveDepartment, isVisible, toggleSidebar }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [departmentsList, setDepartmentsList] = useState<DepartmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userFullName, setUserFullName] = useState<string>('');
  const [localIsVisible, setLocalIsVisible] = useState(isVisible);
  const [customerCounts, setCustomerCounts] = useState<Record<string, number>>({});
  
  // For delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentType | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // For user profile
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // For edit department
  const [isEditDepartmentOpen, setIsEditDepartmentOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<DepartmentType | null>(null);
  const [editDepartmentName, setEditDepartmentName] = useState('');

  // Virtual departments that always show regardless of DB state
  const [virtualDepartments, setVirtualDepartments] = useState<{all: boolean; uncategorized: boolean}>({
    all: false,
    uncategorized: false
  });

  // DND sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync local visibility state with prop
  useEffect(() => {
    setLocalIsVisible(isVisible);
  }, [isVisible]);

  // Fetch departments from Supabase
  useEffect(() => {
    if (user) {
      fetchDepartments();
    }
  }, [user]);

  // Get user profile info
  useEffect(() => {
    if (user) {
      // Get full name from user metadata
      const fullNameFromMeta = user.user_metadata?.full_name;
      if (fullNameFromMeta) {
        setFullName(fullNameFromMeta);
        setUserFullName(fullNameFromMeta);
      } else {
        // Use email as fallback
        setUserFullName(user.email?.split('@')[0] || '');
      }
    }
  }, [user]);

  // Fetch customer counts for each department
  useEffect(() => {
    if (user && departmentsList.length > 0) {
      fetchCustomerCounts();
    }
  }, [user, departmentsList]);

  // Real-time updates for customer counts
  useEffect(() => {
    if (!user) return;

    console.log("Setting up real-time customer count updates");
    
    const channel = supabase
      .channel('customer-count-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${user.id}` // Only listen to current user's customers
        },
        (payload) => {
          console.log('Customer change detected:', payload);
          // Refetch customer counts when any customer is added, updated, or deleted
          fetchCustomerCounts();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [user, departmentsList]);

  const fetchCustomerCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('department')
        .eq('user_id', user!.id); // Only fetch current user's customers

      if (error) throw error;

      const counts: Record<string, number> = {};
      
      // Count total customers for "all"
      counts['all'] = data?.length || 0;
      
      // Count customers by department
      if (data) {
        data.forEach(customer => {
          const dept = customer.department;
          counts[dept] = (counts[dept] || 0) + 1;
        });
      }
      
      // Ensure all departments have a count (even if 0)
      departmentsList.forEach(dept => {
        if (!(dept.code in counts)) {
          counts[dept.code] = 0;
        }
      });

      // Make sure virtual departments have counts
      if (!('all' in counts)) counts['all'] = data?.length || 0;
      if (!('uncategorized' in counts)) counts['uncategorized'] = counts['uncategorized'] || 0;

      console.log("Updated customer counts:", counts);
      setCustomerCounts(counts);
    } catch (error) {
      console.error("Error fetching customer counts:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching departments for user:", user?.id);
      
      // Get the user's departments
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('sort_order', { ascending: true });

      console.log("Departments data:", data);
      console.log("Departments error:", error);

      if (error) throw error;

      // Track if we found the critical departments
      let hasAllDept = false;
      let hasUncategorizedDept = false;

      if (data && data.length > 0) {
        // Map database fields to our component structure
        const departments: DepartmentType[] = data.map(dept => {
          // Check for critical departments
          if (dept.code === 'all') hasAllDept = true;
          if (dept.code === 'uncategorized') hasUncategorizedDept = true;
          
          return {
            id: dept.id,
            code: dept.code,
            name: dept.name,
            sort_order: (dept as any).sort_order || 0
          };
        });
        
        console.log("Mapped departments:", departments);
        setDepartmentsList(departments);
        
        // Update virtual department tracking
        setVirtualDepartments({
          all: !hasAllDept,
          uncategorized: !hasUncategorizedDept
        });

        // If critical departments are missing, try to create them
        if (!hasAllDept || !hasUncategorizedDept) {
          console.log("Critical departments missing, attempting to create them...");
          await ensureCriticalDepartments();
        }
      } else {
        console.log("No departments found for user, creating defaults...");
        // If user has no departments, create default ones
        await createDefaultDepartments();
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast({
        title: "載入失敗",
        description: "無法載入部門資料",
        variant: "destructive"
      });
      
      // Even if there's an error, ensure we show virtual critical departments
      setVirtualDepartments({
        all: true,
        uncategorized: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // New function to ensure critical departments exist
  const ensureCriticalDepartments = async () => {
    try {
      console.log("Ensuring critical departments exist for user:", user?.id);
      const criticalDepartments = [
        { code: 'all', name: '所有客戶', sort_order: 0 },
        { code: 'uncategorized', name: '未分類', sort_order: 1 },
      ];
      
      // Check which critical departments are missing
      const { data: existingDepts, error: checkError } = await supabase
        .from('departments')
        .select('code')
        .in('code', ['all', 'uncategorized'])
        .eq('user_id', user!.id);
        
      if (checkError) throw checkError;
      
      const existingCodes = existingDepts?.map(dept => dept.code) || [];
      
      // Create only the missing critical departments
      for (const dept of criticalDepartments) {
        if (!existingCodes.includes(dept.code)) {
          try {
            const { error } = await supabase.from('departments').insert({
              code: dept.code,
              name: dept.name,
              user_id: user!.id,
              sort_order: dept.sort_order
            });
            
            if (error) {
              console.error(`Error creating ${dept.code} department:`, error);
              // If it fails, mark it as virtual
              setVirtualDepartments(prev => ({
                ...prev,
                [dept.code]: true
              }));
            }
          } catch (err) {
            console.error(`Failed to create ${dept.code} department:`, err);
            // If it's a critical department and creation fails, ensure we still show it
            if (dept.code === 'all' || dept.code === 'uncategorized') {
              setVirtualDepartments(prev => ({
                ...prev,
                [dept.code]: true
              }));
            }
          }
        }
      }
      
      // Refresh departments after ensuring critical ones
      fetchDepartments();
    } catch (error) {
      console.error("Error ensuring critical departments:", error);
      // Set virtual departments as fallback
      setVirtualDepartments({
        all: true,
        uncategorized: true
      });
    }
  };

  const createDefaultDepartments = async () => {
    try {
      console.log("Creating default departments for user:", user?.id);
      const defaultDepartments = [
        { code: 'all', name: '所有客戶', sort_order: 0 },
        { code: 'uncategorized', name: '未分類', sort_order: 1 },
        { code: 'external', name: '發展 對外', sort_order: 2 },
        { code: 'internal', name: '發展 對內', sort_order: 3 },
        { code: 'digital', name: '數位行銷', sort_order: 4 },
        { code: 'alfred', name: 'Alfred', sort_order: 5 },
        { code: 'jason', name: 'Jason', sort_order: 6 }
      ];
      
      // 檢查哪些部門已經存在
      const { data: existingDepts, error: checkError } = await supabase
        .from('departments')
        .select('code')
        .eq('user_id', user!.id);
        
      if (checkError) throw checkError;
      
      const existingCodes = existingDepts?.map(dept => dept.code) || [];
      
      // 只創建不存在的部門
      for (const dept of defaultDepartments) {
        if (!existingCodes.includes(dept.code)) {
          try {
            const { error } = await supabase.from('departments').insert({
              code: dept.code,
              name: dept.name,
              user_id: user!.id,
              sort_order: dept.sort_order
            });
            
            if (error) {
              console.error("Error creating department:", dept.name, error);
              // If it's a critical department and creation fails, mark it as virtual
              if (dept.code === 'all' || dept.code === 'uncategorized') {
                setVirtualDepartments(prev => ({
                  ...prev,
                  [dept.code]: true
                }));
              }
            }
          } catch (err) {
            console.error(`Failed to create ${dept.code} department:`, err);
            // If it's a critical department and creation fails, ensure we still show it
            if (dept.code === 'all' || dept.code === 'uncategorized') {
              setVirtualDepartments(prev => ({
                ...prev,
                [dept.code]: true
              }));
            }
          }
        }
      }
      
      // 重新獲取部門列表
      await fetchDepartments();
    } catch (error) {
      console.error("Error creating default departments:", error);
      toast({
        title: "創建預設部門失敗",
        description: "無法創建預設部門，請稍後再試",
        variant: "destructive"
      });
      
      // Set virtual departments as fallback
      setVirtualDepartments({
        all: true,
        uncategorized: true
      });
    }
  };

  const handleAddDepartment = async () => {
    if (newDepartmentName.trim()) {
      const newDepartmentCode = newDepartmentName.toLowerCase().replace(/\s+/g, '-');
      
      // Check if this department code already exists for this user in local state
      const existingDept = departmentsList.find(dept => dept.code === newDepartmentCode);
      if (existingDept) {
        toast({
          title: "部門已存在",
          description: `${newDepartmentName} 部門已存在`,
          variant: "destructive"
        });
        return;
      }
      
      // Get the highest sort_order from current departments
      const highestOrder = Math.max(...departmentsList.map(dept => dept.sort_order || 0));
      
      try {
        const { data, error } = await supabase
          .from('departments')
          .insert({
            code: newDepartmentCode,
            name: newDepartmentName,
            user_id: user!.id,
            sort_order: highestOrder + 1
          })
          .select('*')
          .single();
          
        if (error) {
          // Handle duplicate key error with the new composite constraint
          if (error.code === '23505' && error.message.includes('departments_user_code_unique')) {
            toast({
              title: "部門已存在",
              description: `您已經有一個名為 ${newDepartmentName} 的部門`,
              variant: "destructive"
            });
            // Refresh the departments list to sync with database
            await fetchDepartments();
            return;
          }
          throw error;
        }
        
        // Add the new department to the local state
        if (data) {
          setDepartmentsList([
            ...departmentsList, 
            { 
              id: data.id, 
              code: data.code, 
              name: data.name,
              sort_order: (data as any).sort_order || 0
            }
          ]);
        }
        
        setNewDepartmentName('');
        setIsAddDepartmentOpen(false);
        
        toast({
          title: "部門已新增",
          description: `${newDepartmentName} 部門已成功新增`,
        });
      } catch (error) {
        console.error("Error adding department:", error);
        toast({
          title: "新增部門失敗",
          description: "無法新增部門，請稍後再試",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent, dept: DepartmentType) => {
    e.stopPropagation(); // Prevent triggering department selection
    if (dept.code === 'all' || dept.code === 'uncategorized') {
      return; // Don't allow deleting default departments
    }
    setDepartmentToDelete(dept);
    setIsDeleteDialogOpen(true);
    setDeletePassword('');
    setPasswordError(false);
  };
  
  const handleConfirmDelete = async () => {
    if (deletePassword === '96962779') {
      if (departmentToDelete) {
        try {
          // First, update all customers with this department to "uncategorized"
          const { error: updateError } = await supabase
            .from('customers')
            .update({ 
              department: 'uncategorized',
              department_name: '未分類'
            })
            .eq('department', departmentToDelete.code);
            
          if (updateError) {
            console.error("Error updating customers:", updateError);
            throw updateError;
          }
            
          // Then delete the department
          const { error: deleteError } = await supabase
            .from('departments')
            .delete()
            .eq('id', departmentToDelete.id);
            
          if (deleteError) {
            console.error("Error deleting department:", deleteError);
            throw deleteError;
          }
          
          // Remove the department from local state
          const updatedDepartments = departmentsList.filter(dept => dept.id !== departmentToDelete.id);
          setDepartmentsList(updatedDepartments);
          
          // If deleted department was active, reset to "all"
          if (activeDepartment === departmentToDelete.code) {
            setActiveDepartment('all');
          }
          
          toast({
            title: "部門已刪除",
            description: `${departmentToDelete.name} 部門已成功刪除，相關客戶已移至未分類`
          });
        } catch (error) {
          console.error("Error deleting department:", error);
          toast({
            title: "刪除部門失敗",
            description: "無法刪除部門，請稍後再試",
            variant: "destructive"
          });
        }
      }
      setIsDeleteDialogOpen(false);
      setDeletePassword('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleEditClick = (e: React.MouseEvent, dept: DepartmentType) => {
    e.stopPropagation();
    setDepartmentToEdit(dept);
    setEditDepartmentName(dept.name);
    setIsEditDepartmentOpen(true);
  };

  const handleUpdateDepartment = async () => {
    if (departmentToEdit && editDepartmentName.trim()) {
      try {
        const { error } = await supabase
          .from('departments')
          .update({ name: editDepartmentName.trim() })
          .eq('id', departmentToEdit.id);

        if (error) throw error;

        // Update local state
        setDepartmentsList(prev => 
          prev.map(dept => 
            dept.id === departmentToEdit.id 
              ? { ...dept, name: editDepartmentName.trim() }
              : dept
          )
        );

        setIsEditDepartmentOpen(false);
        setEditDepartmentName('');
        setDepartmentToEdit(null);

        toast({
          title: "部門名稱已更新",
          description: `部門名稱已成功更新為「${editDepartmentName.trim()}」`,
        });
      } catch (error) {
        console.error("Error updating department:", error);
        toast({
          title: "更新部門失敗",
          description: "無法更新部門名稱，請稍後再試",
          variant: "destructive"
        });
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleUpdateProfile = async () => {
    try {
      if (!user) return;

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) throw error;

      setUserFullName(fullName);
      setIsUserProfileOpen(false);
      toast({
        title: "個人資料已更新",
        description: "您的姓名已成功更新"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "更新失敗",
        description: "無法更新您的個人資料，請稍後再試",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!user?.email) return;

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      // 關閉彈窗
      setIsPasswordDialogOpen(false);
      
      // 顯示成功通知
      toast({
        title: "密碼重設郵件已發送",
        description: "請檢查您的電子郵件以完成密碼重設。如果沒收到郵件，請檢查垃圾郵件資料夾。",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "重設密碼失敗",
        description: "無法發送重設密碼郵件，請稍後再試",
        variant: "destructive"
      });
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userFullName) {
      return userFullName.substring(0, 2).toUpperCase();
    }
    
    if (!user) return '?';
    
    const email = user.email || '';
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  const handleToggleSidebar = () => {
    if (toggleSidebar) {
      toggleSidebar();
    } else {
      setLocalIsVisible(!localIsVisible);
    }
  };

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    // Skip dragging for "all" and "uncategorized" departments
    const dept = departmentsList.find(d => d.id === active.id);
    if (dept?.code === 'all' || dept?.code === 'uncategorized') {
      return;
    }
    
    // Find indices
    const activeIndex = departmentsList.findIndex((dept) => dept.id === active.id);
    const overIndex = departmentsList.findIndex((dept) => dept.id === over.id);
    
    // Skip dragging if trying to place department before "all"
    if (departmentsList[overIndex].code === 'all' && overIndex === 0) {
      return;
    }
    
    // Update local state with new order
    const newOrder = arrayMove(departmentsList, activeIndex, overIndex);
    setDepartmentsList(newOrder);
    
    // Generate new sort_order values (keeping "all" at top)
    const firstItem = newOrder[0];
    const otherItems = [...newOrder.slice(1)];
    
    // Ensure "all" is first
    if (firstItem.code !== 'all') {
      const allDept = otherItems.find(d => d.code === 'all');
      if (allDept) {
        // Move "all" to the top
        otherItems.splice(otherItems.indexOf(allDept), 1);
        const reordered = [allDept, firstItem, ...otherItems];
        setDepartmentsList(reordered);
      }
    }
    
    // Update database with new order
    try {
      // Skip update for "all" and "uncategorized" departments
      const updatedDepts = newOrder
        .filter(dept => dept.code !== 'all' && dept.code !== 'uncategorized')
        .map((dept, index) => ({
          id: dept.id,
          sort_order: index + 1, // Start from 1 (all is 0)
          code: dept.code, // Add these required fields to satisfy TypeScript
          name: dept.name,
          user_id: user!.id
        }));
      
      if (updatedDepts.length > 0) {
        for (const dept of updatedDepts) {
          const { error } = await supabase
            .from('departments')
            .update({ sort_order: dept.sort_order })
            .eq('id', dept.id);
            
          if (error) {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("Error updating department order:", error);
      toast({
        title: "更新失敗",
        description: "無法更新部門順序，請稍後再試",
        variant: "destructive"
      });
      // Revert to original order by refetching
      await fetchDepartments();
    }
  };

  // Generate virtual department object for rendering
  const getVirtualDepartment = (code: string): DepartmentType => {
    if (code === 'all') {
      return {
        id: 'virtual-all',
        code: 'all',
        name: '所有客戶',
        sort_order: 0
      };
    }
    return {
      id: 'virtual-uncategorized',
      code: 'uncategorized',
      name: '未分類',
      sort_order: 1
    };
  };

  return (
    <div className={cn(
      "w-64 min-h-screen bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out",
      isVisible ? "translate-x-0" : "-translate-x-full", 
      "h-screen fixed md:static z-30"
    )}>
      <div className="p-4 flex justify-between items-center border-b border-slate-200">
        <img src="/lovable-uploads/bf4895f7-2032-4f5d-a050-239497c44107.png" alt="LURE" className="h-6 w-auto" />
      </div>
      
      <div className="flex-1 flex flex-col gap-6 px-2">
        <div className="space-y-1">
          <h2 className="text-sm font-medium px-4 py-2">客戶管理</h2>
          
          {/* Always show "所有客戶" button - either from DB or virtual */}
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start px-4 gap-3 font-normal",
              activeDepartment === 'all' && "bg-slate-100"
            )}
            onClick={() => setActiveDepartment('all')}
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3 3 0 0 1 6 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <span>所有客戶 ({customerCounts['all'] || 0})</span>
          </Button>
          
          {/* Always show "未分類" button - either from DB or virtual */}
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start px-4 gap-3 font-normal",
              activeDepartment === 'uncategorized' && "bg-slate-100"
            )}
            onClick={() => setActiveDepartment('uncategorized')}
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <span>未分類 ({customerCounts['uncategorized'] || 0})</span>
          </Button>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-sm font-medium">部門</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIsAddDepartmentOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">新增部門</span>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="p-4 flex flex-col gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-gray-200 animate-pulse rounded-md" />
              ))}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={departmentsList.filter(dept => dept.code !== 'all' && dept.code !== 'uncategorized').map(dept => dept.id)}
                strategy={verticalListSortingStrategy}
              >
                {departmentsList
                  .filter(dept => dept.code !== 'all' && dept.code !== 'uncategorized')
                  .map((dept) => (
                    <SortableDepartment 
                      key={dept.id} 
                      department={dept} 
                      activeDepartment={activeDepartment}
                      onSelectDepartment={setActiveDepartment}
                      onDeleteClick={handleDeleteClick}
                      onEditClick={handleEditClick}
                      customerCount={customerCounts[dept.code] || 0}
                    />
                  ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
      
      {/* User account section */}
      <div className="p-4 mt-auto border-t border-slate-200">
        <div className="flex items-center justify-between">
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-2 rounded-md">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{userFullName || user?.email}</p>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{userFullName || '未設定姓名'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-sm"
                  onClick={() => setIsUserProfileOpen(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  個人資料
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  登出
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Add Department Dialog */}
      <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增部門</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">部門名稱</label>
              <Input 
                placeholder="部門名稱"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDepartmentOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddDepartment}>
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Department Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除部門</AlertDialogTitle>
            <AlertDialogDescription>
              您確定要刪除「{departmentToDelete?.name}」部門嗎？
              <div className="mt-4">
                <label className="text-sm text-gray-500 block mb-2">
                  請輸入密碼進行確認
                </label>
                <Input
                  type="password"
                  placeholder="請輸入密碼"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setPasswordError(false);
                  }}
                  className={cn(passwordError && "border-red-500")}
                />
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">密碼錯誤，請重新輸入</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeletePassword('');
              setPasswordError(false);
            }}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Profile Dialog */}
      <Dialog open={isUserProfileOpen} onOpenChange={setIsUserProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>個人資料</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-500 block mb-2">
                <Mail className="h-4 w-4" />
                電子郵件
              </label>
              <Input 
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-500 block mb-2">
                <User className="h-4 w-4" />
                姓名
              </label>
              <Input 
                placeholder="請輸入您的姓名"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserProfileOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateProfile}>
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDepartmentOpen} onOpenChange={setIsEditDepartmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯部門名稱</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">部門名稱</label>
              <Input 
                placeholder="部門名稱"
                value={editDepartmentName}
                onChange={(e) => setEditDepartmentName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDepartmentOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateDepartment}>
              更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
