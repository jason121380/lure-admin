import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, X, LogOut, User, Mail, Key, Menu, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
  sort_order?: number;
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
  onDeleteClick
}: { 
  department: DepartmentType;
  activeDepartment: string;
  onSelectDepartment: (code: string) => void;
  onDeleteClick: (e: React.MouseEvent, dept: DepartmentType) => void;
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
          "w-full justify-start px-4 gap-3 font-normal",
          activeDepartment === department.code && "bg-slate-100",
          department.code !== 'all' && department.code !== 'uncategorized' && "pl-7"
        )}
        onClick={() => onSelectDepartment(department.code)}
      >
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
        {department.name}
      </Button>
      
      {/* Delete button */}
      {department.code !== 'all' && department.code !== 'uncategorized' && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => onDeleteClick(e, department)}
        >
          <X className="h-3 w-3" />
        </Button>
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

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Map database fields to our component structure
        const departments: DepartmentType[] = data.map(dept => ({
          id: dept.id,
          code: dept.code,
          name: dept.name,
          sort_order: dept.sort_order || 0 // Add default of 0 if sort_order is missing
        }));
        
        // Make sure 'all' is at the top
        const allDept = departments.find(dept => dept.code === 'all');
        const otherDepts = departments.filter(dept => dept.code !== 'all');
        
        setDepartmentsList(allDept ? [allDept, ...otherDepts] : departments);
      } else {
        // If no departments found, create default ones
        await createDefaultDepartments();
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast({
        title: "載入失敗",
        description: "無法載入部門資料",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultDepartments = async () => {
    try {
      const defaultDepartments = [
        { code: 'all', name: '所有部門', sort_order: 0 },
        { code: 'external', name: '發展 對外', sort_order: 1 },
        { code: 'internal', name: '發展 對內', sort_order: 2 },
        { code: 'digital', name: '數位行銷', sort_order: 3 },
        { code: 'alfred', name: 'Alfred', sort_order: 4 },
        { code: 'jason', name: 'Jason', sort_order: 5 },
        { code: 'uncategorized', name: '未分類', sort_order: 6 }
      ];
      
      for (const dept of defaultDepartments) {
        await supabase.from('departments').insert({
          code: dept.code,
          name: dept.name,
          user_id: user!.id,
          sort_order: dept.sort_order
        });
      }
      
      await fetchDepartments();
    } catch (error) {
      console.error("Error creating default departments:", error);
    }
  };

  const handleAddDepartment = async () => {
    if (newDepartmentName.trim()) {
      const newDepartmentCode = newDepartmentName.toLowerCase().replace(/\s+/g, '-');
      
      // First check if this department already exists
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
          
        if (error) throw error;
        
        // Add the new department to the local state
        if (data) {
          setDepartmentsList([
            ...departmentsList, 
            { 
              id: data.id, 
              code: data.code, 
              name: data.name,
              sort_order: data.sort_order || 0
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
    if (deletePassword === '1234') {
      if (departmentToDelete) {
        try {
          // Update customers in Supabase
          await supabase
            .from('customers')
            .update({ 
              department: 'uncategorized',
              department_name: '未分類'
            })
            .eq('department', departmentToDelete.code);
            
          // Delete the department
          const { error } = await supabase
            .from('departments')
            .delete()
            .eq('id', departmentToDelete.id);
            
          if (error) throw error;
          
          // Remove the department from local state
          const updatedDepartments = departmentsList.filter(dept => dept.id !== departmentToDelete.id);
          setDepartmentsList(updatedDepartments);
          
          // If deleted department was active, reset to "all"
          if (activeDepartment === departmentToDelete.code) {
            setActiveDepartment('all');
          }
          
          toast({
            title: "部門已刪除",
            description: `${departmentToDelete.name} 部門已成功刪除`
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
      if (!newPassword || !user?.email) return;

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setNewPassword('');
      setIsPasswordDialogOpen(false);
      toast({
        title: "密碼重設郵件已發送",
        description: "請檢查您的電子郵件以完成密碼重設"
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
          sort_order: index + 1 // Start from 1 (all is 0)
        }));
      
      if (updatedDepts.length > 0) {
        const { error } = await supabase
          .from('departments')
          .upsert(updatedDepts, { onConflict: 'id' });
          
        if (error) {
          throw error;
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

  return (
    <div className={cn(
      "w-64 min-h-screen bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out",
      isVisible ? "translate-x-0" : "-translate-x-full", 
      "h-screen fixed md:static z-30" // Change from absolute to fixed for mobile and static for md+
    )}>
      <div className="p-4 flex justify-between items-center border-b border-slate-200">
        <img src="/lovable-uploads/bf4895f7-2032-4f5d-a050-239497c44107.png" alt="LURE" className="h-6 w-auto" />
      </div>
      
      <div className="flex-1 flex flex-col gap-6 px-2">
        <div className="space-y-1">
          <h2 className="text-sm font-medium px-4 py-2">客戶管理</h2>
          {departmentsList.some(dept => dept.code === 'all') && (
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start px-4 gap-3 font-normal",
                activeDepartment === 'all' && "bg-slate-100"
              )}
              onClick={() => setActiveDepartment('all')}
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              所有客戶
            </Button>
          )}
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
                items={departmentsList.filter(dept => dept.code !== 'all').map(dept => dept.id)}
                strategy={verticalListSortingStrategy}
              >
                {departmentsList
                  .filter(dept => dept.code !== 'all')
                  .map((dept) => (
                    <SortableDepartment 
                      key={dept.id} 
                      department={dept} 
                      activeDepartment={activeDepartment}
                      onSelectDepartment={setActiveDepartment}
                      onDeleteClick={handleDeleteClick}
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
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{userFullName || user?.email}</p>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
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
                  className="w-full justify-start text-sm"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  更改密碼
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
                  請輸入密碼「1234」進行確認
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
                  <p className="text-sm text-red-500 mt-1">密碼錯誤</p>
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

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更改密碼</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              系統將會發送密碼重設連結至您的電子郵件信箱。
            </p>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-500 block mb-2">
                <Mail className="h-4 w-4" />
                您的電子郵件
              </label>
              <Input 
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleChangePassword}>
              發送重設連結
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
