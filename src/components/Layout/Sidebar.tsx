import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SidebarProps {
  activeDepartment: string;
  setActiveDepartment: (department: string) => void;
  isVisible: boolean;
  toggleSidebar: () => void;
}

interface Department {
  id: string;
  name: string;
  customer_count: number;
}

export const Sidebar = ({ activeDepartment, setActiveDepartment, isVisible, toggleSidebar }: SidebarProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name, customer_count');

        if (error) {
          throw error;
        }

        setDepartments(data);
      } catch (error: any) {
        setError(error);
        toast.error("無法載入部門資料");
        console.error("Error fetching departments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, [activeDepartment]);

  return (
    <div className={`w-80 h-full bg-white border-r border-gray-200 flex flex-col ${isVisible ? 'block' : 'hidden'}`}>
      {/* Logo */}
      <div className="px-8 py-6">
        <img 
          src="/lovable-uploads/bf4895f7-2032-4f5d-a050-239497c44107.png" 
          alt="Logo" 
          className="h-8 w-auto"
        />
      </div>
      
      <Separator />
      
      {/* Department Navigation */}
      <nav className="flex flex-col flex-1 p-4 space-y-1">
        <Button
          variant="ghost"
          className={`justify-start w-full rounded-md ${activeDepartment === 'all' ? 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
          onClick={() => setActiveDepartment('all')}
        >
          <Building2 className="w-4 h-4 mr-2" />
          全部客戶
        </Button>
        {isLoading ? (
          <p className="text-sm text-gray-500">載入中...</p>
        ) : error ? (
          <p className="text-sm text-red-500">錯誤: {error.message}</p>
        ) : (
          departments.map((department) => (
            <Button
              key={department.id}
              variant="ghost"
              className={`justify-start w-full rounded-md ${activeDepartment === department.id ? 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
              onClick={() => setActiveDepartment(department.id)}
            >
              <Building2 className="w-4 h-4 mr-2" />
              {department.name}
              <Badge variant="secondary" className="ml-auto">{department.customer_count}</Badge>
            </Button>
          ))
        )}
      </nav>
      
      <Separator />
      
      {/* Footer */}
      <div className="p-4">
        <p className="text-xs text-gray-500">
          Lovable © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
