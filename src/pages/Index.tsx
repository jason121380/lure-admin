
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { CustomerList } from "@/components/CustomerList/CustomerList";
import { CustomerDetail } from "@/components/CustomerDetail/CustomerDetail";
import { Customer } from "@/components/CustomerList/CustomerListItem";
import { CustomerEditDialog } from "@/components/CustomerDetail/CustomerEditDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

type IndexProps = {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
};

const Index = ({ sidebarVisible, setSidebarVisible }: IndexProps) => {
  const { user } = useAuth();
  const [activeDepartment, setActiveDepartment] = useState("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Fetch customers on initial load
  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user, activeDepartment]);
  
  const fetchCustomers = async () => {
    try {
      let query = supabase.from('customers').select('*');
      
      // Filter by department if not showing all
      if (activeDepartment !== 'all') {
        query = query.eq('department', activeDepartment);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Transform Supabase data to match our Customer type
      const transformedData: Customer[] = data.map(item => ({
        id: item.id,
        name: item.name,
        department: item.department,
        departmentName: item.department_name,
        status: item.status,
        email: item.email || undefined,
        phone: item.phone || undefined,
        address: item.address || undefined,
        contact: item.contact || undefined,
        createdAt: item.created_at,
        notes: item.notes || undefined,
        taxId: item.tax_id || undefined,
      }));
      
      setCustomers(transformedData);
      
      // Reset selection if the customer no longer exists in the list
      if (selectedCustomerId && !transformedData.some(c => c.id === selectedCustomerId)) {
        setSelectedCustomerId(null);
        setSelectedCustomer(null);
      }
    } catch (error) {
      toast.error("無法載入客戶資料");
      console.error("Error fetching customers:", error);
    }
  };
  
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomer(customer);
  };
  
  const handleAddCustomer = () => {
    setEditingCustomer(undefined);
    setIsAddEditDialogOpen(true);
  };
  
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsAddEditDialogOpen(true);
  };
  
  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);
      
      if (error) {
        throw error;
      }
      
      toast.success("已成功刪除客戶");
      setSelectedCustomerId(null);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error) {
      toast.error("刪除客戶時發生錯誤");
      console.error("Error deleting customer:", error);
    }
  };
  
  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      // Transform data for Supabase
      const supabaseCustomerData = {
        name: customerData.name,
        department: customerData.department,
        department_name: customerData.departmentName,
        status: customerData.status,
        email: customerData.email || null,
        phone: customerData.phone || null,
        address: customerData.address || null,
        contact: customerData.contact || null,
        notes: customerData.notes || null,
        tax_id: customerData.taxId || null,
        user_id: user?.id,
      };
      
      if (editingCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update(supabaseCustomerData)
          .eq('id', editingCustomer.id);
        
        if (error) throw error;
        toast.success("客戶資料已更新");
      } else {
        // Create new customer
        const { data, error } = await supabase
          .from('customers')
          .insert(supabaseCustomerData)
          .select();
        
        if (error) throw error;
        toast.success("已新增客戶");
        
        if (data && data.length > 0) {
          setSelectedCustomerId(data[0].id);
          fetchCustomers();
        }
      }
      
      fetchCustomers();
      setIsAddEditDialogOpen(false);
    } catch (error) {
      toast.error(editingCustomer ? "更新客戶資料失敗" : "新增客戶失敗");
      console.error("Error saving customer:", error);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar directly in the layout */}
      <Sidebar 
        activeDepartment={activeDepartment} 
        setActiveDepartment={setActiveDepartment} 
        isVisible={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      {/* Toggle button */}
      <Button 
        variant="ghost" 
        className="fixed top-4 left-4 z-40 p-2 h-10 w-10"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">開啟部門選單</span>
      </Button>
      
      {/* Main content with resizable panels */}
      <div className={`flex-1 flex flex-col pt-16 px-4 md:px-6 lg:px-8 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border overflow-hidden bg-white">
          <ResizablePanel 
            defaultSize={40} 
            minSize={30}
            className="border-r"
          >
            <CustomerList 
              customers={customers} 
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={handleAddCustomer}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={60} minSize={40}>
            {selectedCustomer ? (
              <CustomerDetail 
                customer={selectedCustomer} 
                onEditCustomer={handleEditCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6 max-w-sm">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    請選擇客戶
                  </h3>
                  <p className="text-gray-500">
                    從左側清單中選擇一個客戶以查看詳細資訊
                  </p>
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      <CustomerEditDialog
        customer={editingCustomer}
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSave={handleSaveCustomer}
      />
    </div>
  );
};

export default Index;
