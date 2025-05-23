
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, X, LogOut, User, Mail, Key, Menu, ChevronLeft, ChevronRight, GripVertical, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

interface Department {
  id: string;
  name: string;
  code: string;
  customer_count: number;
  sort_order: number;
  user_id: string;
  created_at: string;
}

interface SidebarProps {
  isVisible: boolean;
  onToggle: () => void;
  activeDepartment: string | null;
  setActiveDepartment: (departmentId: string | null) => void;
  onCustomerAdded: () => void;
  totalCustomerCounts: { [departmentId: string]: number };
}

const SortableItem = ({ id, name }: { id: string, name: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center space-x-2 py-2 px-4 rounded-md bg-gray-100 border border-gray-200">
      <GripVertical className="h-4 w-4 text-gray-500 cursor-grab" />
      <span>{name}</span>
    </div>
  );
};

export const Sidebar = ({ 
  isVisible, 
  onToggle, 
  activeDepartment, 
  setActiveDepartment, 
  onCustomerAdded, 
  totalCustomerCounts 
}: SidebarProps) => {
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .eq('user_id', user.id)
          .order('sort_order', { ascending: true });

        if (error) {
          console.error("Error fetching departments:", error);
          return;
        }

        // Transform the data to match our Department interface
        const transformedDepartments: Department[] = data.map(item => ({
          ...item,
          customer_count: totalCustomerCounts[item.id] || 0
        }));

        setDepartments(transformedDepartments);
      } catch (error) {
        console.error("Unexpected error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, [user, totalCustomerCounts]);

  const handleAddDepartment = async () => {
    if (!user || !newDepartmentName.trim()) return;

    try {
      const newSortOrder = departments.length > 0 ? Math.max(...departments.map(d => d.sort_order)) + 1 : 1;

      const { data, error } = await supabase
        .from('departments')
        .insert([{ 
          user_id: user.id, 
          name: newDepartmentName, 
          code: newDepartmentName.toLowerCase().replace(/\s+/g, '_'),
          sort_order: newSortOrder 
        }])
        .select('*')
        .single();

      if (error) {
        console.error("Error adding department:", error);
        toast({
          title: "Error",
          description: "Failed to add department.",
          variant: "destructive",
        });
        return;
      }

      const newDepartment: Department = {
        ...data,
        customer_count: 0
      };

      setDepartments([...departments, newDepartment]);
      setNewDepartmentName('');
      setIsAddingDepartment(false);
      toast({
        title: "Success",
        description: "Department added successfully.",
      });
    } catch (error) {
      console.error("Unexpected error adding department:", error);
      toast({
        title: "Error",
        description: "Unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', departmentId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting department:", error);
        toast({
          title: "Error",
          description: "Failed to delete department.",
          variant: "destructive",
        });
        return;
      }

      setDepartments(departments.filter(d => d.id !== departmentId));
      setActiveDepartment('all');
      toast({
        title: "Success",
        description: "Department deleted successfully.",
      });
    } catch (error) {
      console.error("Unexpected error deleting department:", error);
      toast({
        title: "Error",
        description: "Unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;

    if (over && active.id !== over.id) {
      const oldIndex = departments.findIndex(d => d.id === active.id);
      const newIndex = departments.findIndex(d => d.id === over.id);

      const updatedDepartments = arrayMove(departments, oldIndex, newIndex);

      // Optimistically update the UI
      setDepartments(updatedDepartments);

      // Update sort_order in the database
      try {
        // Prepare updates for all departments
        const updates = updatedDepartments.map((department, index) => ({
          id: department.id,
          sort_order: index + 1, // sort_order should be 1-based
        }));
  
        // Execute the batch update using individual updates since upsert might not work as expected
        for (const update of updates) {
          const { error } = await supabase
            .from('departments')
            .update({ sort_order: update.sort_order })
            .eq('id', update.id);
            
          if (error) {
            throw error;
          }
        }
  
        toast({
          title: "Success",
          description: "Department positions updated successfully.",
        });
      } catch (error) {
        console.error("Unexpected error updating department positions:", error);
        toast({
          title: "Error",
          description: "Unexpected error occurred while updating positions.",
          variant: "destructive",
        });
        // Revert the UI if an unexpected error occurs
        setDepartments(departments);
      }
    }
  };

  return (
    <div className={cn(
      "h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      isVisible ? "w-80" : "w-16"
    )}>
      <div className="flex items-center justify-between py-4 px-4 border-b border-gray-200">
        {isVisible && <span className="text-lg font-semibold">客戶管理系統</span>}
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {isVisible ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col gap-6 px-2">
        <div className="space-y-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-4 py-2 text-sm font-medium">
                功能選單
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => setActiveDepartment('all')}>
                客戶管理
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/accounting')}>
                帳務中心
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" className="w-full justify-start px-4 py-2 text-sm font-medium" onClick={onCustomerAdded}>
            <Plus className="mr-2 h-4 w-4" />
            新增客戶
          </Button>
        </div>

        <div className="space-y-2">
          {isVisible && <Label className="px-4 text-sm font-medium">部門</Label>}
          <Button variant="ghost" className={cn("w-full justify-start px-4 py-2 text-sm font-medium", activeDepartment === 'all' ? 'bg-gray-100 hover:bg-gray-100' : '')} onClick={() => setActiveDepartment('all')}>
            所有客戶 {totalCustomerCounts['all'] !== undefined ? `(${totalCustomerCounts['all']})` : ''}
          </Button>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={departments.map(d => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {departments.map((department) => (
                  <SortableItem key={department.id} id={department.id} name={`${department.name} (${totalCustomerCounts[department.id] || 0})`} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {departments.map(department => (
            <div key={department.id} className="flex items-center justify-between">
              <Button variant="ghost" className={cn("w-full justify-start px-4 py-2 text-sm font-medium", activeDepartment === department.id ? 'bg-gray-100 hover:bg-gray-100' : '')} onClick={() => setActiveDepartment(department.id)}>
                {department.name} {totalCustomerCounts[department.id] !== undefined ? `(${totalCustomerCounts[department.id]})` : ''}
              </Button>
              {isVisible && (
                <Button variant="ghost" size="icon" onClick={() => handleDeleteDepartment(department.id)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {isVisible && !isAddingDepartment && (
            <Button variant="ghost" className="w-full justify-start px-4 py-2 text-sm font-medium" onClick={() => setIsAddingDepartment(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新增部門
            </Button>
          )}

          {isVisible && isAddingDepartment && (
            <div className="flex flex-col gap-2 px-4">
              <Input
                type="text"
                placeholder="部門名稱"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsAddingDepartment(false)}>
                  取消
                </Button>
                <Button size="sm" onClick={handleAddDepartment}>
                  儲存
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isVisible && (
        <div className="flex items-center justify-between py-4 px-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback>{user?.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => {
            signOut();
            navigate('/auth');
          }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
