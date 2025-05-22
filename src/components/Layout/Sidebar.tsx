
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, X, LogOut } from 'lucide-react';
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

type DepartmentType = {
  id: string;
  name: string;
};

const initialDepartments: DepartmentType[] = [
  { id: 'all', name: '所有部門' },
  { id: 'external', name: '發展 對外' },
  { id: 'internal', name: '發展 對內' },
  { id: 'digital', name: '數位行銷' },
  { id: 'alfred', name: 'Alfred' },
  { id: 'jason', name: 'Jason' },
  { id: 'uncategorized', name: '未分類' }
];

type SidebarProps = {
  activeDepartment: string;
  setActiveDepartment: (id: string) => void;
};

export function Sidebar({ activeDepartment, setActiveDepartment }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [departmentsList, setDepartmentsList] = useState<DepartmentType[]>(initialDepartments);
  
  // For delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentType | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleAddDepartment = () => {
    if (newDepartmentName.trim()) {
      const newDepartment: DepartmentType = {
        id: newDepartmentName.toLowerCase().replace(/\s+/g, '-'),
        name: newDepartmentName,
      };
      
      setDepartmentsList([...departmentsList, newDepartment]);
      setNewDepartmentName('');
      setIsAddDepartmentOpen(false);
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent, dept: DepartmentType) => {
    e.stopPropagation(); // Prevent triggering department selection
    if (dept.id === 'all' || dept.id === 'uncategorized') {
      return; // Don't allow deleting default departments
    }
    setDepartmentToDelete(dept);
    setIsDeleteDialogOpen(true);
    setDeletePassword('');
    setPasswordError(false);
  };
  
  const handleConfirmDelete = () => {
    if (deletePassword === '1234') {
      if (departmentToDelete) {
        const updatedDepartments = departmentsList.filter(dept => dept.id !== departmentToDelete.id);
        setDepartmentsList(updatedDepartments);
        
        // If deleted department was active, reset to "all"
        if (activeDepartment === departmentToDelete.id) {
          setActiveDepartment('all');
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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '?';
    
    const email = user.email || '';
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  return (
    <div className="w-64 min-h-screen bg-slate-50 border-r border-slate-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">LURE</h1>
        <div className="w-12 h-1 bg-indigo-600 mt-2"></div>
      </div>
      
      <div className="flex-1 flex flex-col gap-6 px-2">
        <div className="space-y-1">
          <h2 className="text-sm font-medium px-4 py-2">客戶管理</h2>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start px-4 gap-3 font-normal",
              activeDepartment === 'all-customers' && "bg-slate-100"
            )}
            onClick={() => setActiveDepartment('all-customers')}
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            所有客戶
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
          
          {departmentsList.map((dept) => (
            <div key={dept.id} className="relative group">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start px-4 gap-3 font-normal",
                  activeDepartment === dept.id && "bg-slate-100"
                )}
                onClick={() => setActiveDepartment(dept.id)}
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
                {dept.name}
              </Button>
              
              {/* Delete button - only show for non-default departments */}
              {dept.id !== 'all' && dept.id !== 'uncategorized' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteClick(e, dept)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* User account section */}
      <div className="p-4 mt-auto border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout} 
            className="h-8 w-8 text-slate-500 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">登出</span>
          </Button>
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
    </div>
  );
}
