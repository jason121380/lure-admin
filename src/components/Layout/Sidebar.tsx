
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type DepartmentType = {
  id: string;
  name: string;
  color?: string;
};

const departments: DepartmentType[] = [
  { id: 'all', name: '所有部門' },
  { id: 'internal', name: '內部開發', color: 'bg-blue-500' },
  { id: 'external', name: '外部開發', color: 'bg-blue-500' },
  { id: 'digital', name: '數位行銷', color: 'bg-blue-500' },
  { id: 'alfred', name: 'Alfred', color: 'bg-red-500' },
  { id: 'jason', name: 'Jason', color: 'bg-cyan-500' },
  { id: 'uncategorized', name: '未分類', color: 'bg-gray-400' }
];

type SidebarProps = {
  activeDepartment: string;
  setActiveDepartment: (id: string) => void;
};

export function Sidebar({ activeDepartment, setActiveDepartment }: SidebarProps) {
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [departmentsList, setDepartmentsList] = useState<DepartmentType[]>(departments);

  const handleAddDepartment = () => {
    if (newDepartmentName.trim()) {
      const newDepartment: DepartmentType = {
        id: newDepartmentName.toLowerCase().replace(/\s+/g, '-'),
        name: newDepartmentName,
        color: 'bg-blue-500'
      };
      
      setDepartmentsList([...departmentsList, newDepartment]);
      setNewDepartmentName('');
      setIsAddDepartmentOpen(false);
    }
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
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
            <Button 
              key={dept.id}
              variant="ghost" 
              className={cn(
                "w-full justify-start px-4 gap-3 font-normal",
                activeDepartment === dept.id && "bg-slate-100"
              )}
              onClick={() => setActiveDepartment(dept.id)}
            >
              {dept.color ? (
                <span className={`inline-block w-2 h-2 rounded-full ${dept.color}`}></span>
              ) : (
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              )}
              {dept.name}
            </Button>
          ))}
        </div>
      </div>
      
      <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增部門</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="部門名稱"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
            />
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
    </div>
  );
}
