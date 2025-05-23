
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { CustomerList } from "@/components/CustomerList/CustomerList";
import { CustomerDetail } from "@/components/CustomerDetail/CustomerDetail";
import { Customer } from "@/components/CustomerList/CustomerListItem";
import { CustomerEditDialog } from "@/components/CustomerDetail/CustomerEditDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Menu, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type IndexProps = {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
};

const Index = ({ sidebarVisible, setSidebarVisible }: IndexProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeDepartment, setActiveDepartment] = useState("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  
  // Fetch customers on initial load
  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user, activeDepartment]);

  useEffect(() => {
    if (isMobile && selectedCustomer) {
      setShowCustomerDetail(true);
    }
  }, [selectedCustomer, isMobile]);
  
  const fetchCustomers = async () => {
    try {
      let query = supabase.from('customers').select('*');
      
      if (activeDepartment !== 'all') {
        query = query.eq('department', activeDepartment);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
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
      
      if (selectedCustomerId) {
        const updatedSelectedCustomer = transformedData.find(c => c.id === selectedCustomerId);
        if (updatedSelectedCustomer) {
          setSelectedCustomer(updatedSelectedCustomer);
        } else {
          setSelectedCustomerId(null);
          setSelectedCustomer(null);
        }
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
  
  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setSelectedCustomer(updatedCustomer);
    setCustomers(prevCustomers => 
      prevCustomers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
    );
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
        const { error } = await supabase
          .from('customers')
          .update(supabaseCustomerData)
          .eq('id', editingCustomer.id);
        
        if (error) throw error;
        toast.success("客戶資料已更新");
      } else {
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

  const handleBulkUpdateDepartment = async (
    customerIds: string[], 
    departmentData: { department: string; departmentName: string }
  ) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          department: departmentData.department,
          department_name: departmentData.departmentName,
          updated_at: new Date().toISOString()
        })
        .in('id', customerIds);

      if (error) throw error;

      toast.success(`已成功更新 ${customerIds.length} 位客戶的部門`);
      fetchCustomers();
    } catch (error) {
      toast.error("批量更新部門失敗");
      console.error("Error bulk updating departments:", error);
    }
  };

  const handleBackToList = () => {
    setShowCustomerDetail(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 側邊欄 - 增強視覺效果 */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block relative z-20`}>
        <div className="sidebar-enhanced h-full">
          <Sidebar 
            activeDepartment={activeDepartment} 
            setActiveDepartment={setActiveDepartment} 
            isVisible={true}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>
      </div>
      
      {/* 移動端遮罩 */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* 頂部導航欄 */}
      <div className="fixed top-0 left-0 right-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="p-2 h-10 w-10 md:hidden hover:bg-white/50"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">開啟部門選單</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                LURE CRM
              </h1>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 hidden md:block">
            {customers.length} 位客戶
          </div>
        </div>
      </div>
      
      {/* 主要內容區域 */}
      <div className="flex flex-1 h-full w-full pt-16">
        {/* 客戶列表面板 - 增強設計 */}
        <div className={`${isMobile && showCustomerDetail ? 'hidden' : 'block'} w-full md:w-2/5 min-w-0 md:min-w-[400px] h-full relative`}>
          <div className="main-content-area h-full border-r border-gray-200/50 card-shadow-md">
            <CustomerList 
              customers={customers} 
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={handleAddCustomer}
              onBulkUpdateDepartment={handleBulkUpdateDepartment}
            />
          </div>
        </div>
        
        {/* 客戶詳情面板 - 增強設計 */}
        <div className={`${isMobile && !showCustomerDetail ? 'hidden' : 'block'} w-full md:w-3/5 h-full relative`}>
          <div className="main-content-area h-full card-shadow-lg">
            {isMobile && (
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 p-4">
                <Button
                  variant="ghost"
                  className="p-2 flex items-center text-sm hover:bg-gray-100/50"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回客戶列表
                </Button>
              </div>
            )}
            
            {selectedCustomer ? (
              <CustomerDetail 
                customer={selectedCustomer} 
                onEditCustomer={handleEditCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onUpdateCustomer={handleUpdateCustomer}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 max-w-md">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    選擇客戶查看詳情
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    從左側清單中選擇一個客戶，查看完整的客戶資訊、服務方案和付款記錄
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
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
