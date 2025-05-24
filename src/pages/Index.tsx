
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { CustomerList } from "@/components/CustomerList/CustomerList";
import { CustomerDetail } from "@/components/CustomerDetail/CustomerDetail";
import { Customer } from "@/components/CustomerList/CustomerListItem";
import { CustomerEditDialog } from "@/components/CustomerDetail/CustomerEditDialog";
import { MobileBottomNav } from "@/components/Layout/MobileBottomNav";
import { MobileHeader } from "@/components/Layout/MobileHeader";
import { CustomerManagementPage } from "@/components/CustomerManagement/CustomerManagementPage";
import { ProfilePage } from "@/components/Profile/ProfilePage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Menu, Search } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("customers"); // New state for mobile tabs
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [sidebarKey, setSidebarKey] = useState(0);
  
  // Fetch customers on initial load
  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user, activeDepartment]);

  // Show customer detail panel on mobile when a customer is selected
  useEffect(() => {
    if (isMobile && selectedCustomer) {
      setShowCustomerDetail(true);
    }
  }, [selectedCustomer, isMobile]);
  
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
      
      // Update selected customer if it exists in the list
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

  // Force sidebar to refresh when customers data changes
  const refreshSidebar = () => {
    setSidebarKey(prev => prev + 1);
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
    // Update the customers list
    setCustomers(prevCustomers => 
      prevCustomers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
    );
    // Force sidebar refresh when customer is updated
    refreshSidebar();
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
      // Force sidebar refresh when customer is deleted
      refreshSidebar();
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
      // Force sidebar refresh when customer is saved
      refreshSidebar();
      setIsAddEditDialogOpen(false);
    } catch (error) {
      toast.error(editingCustomer ? "更新客戶資料失敗" : "新增客戶失敗");
      console.error("Error saving customer:", error);
    }
  };

  // Handle bulk department update
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
      // Force sidebar refresh when bulk department update happens
      refreshSidebar();
    } catch (error) {
      toast.error("批量更新部門失敗");
      console.error("Error bulk updating departments:", error);
    }
  };

  const handleBackToList = () => {
    setShowCustomerDetail(false);
    setSelectedCustomer(null);
    setSelectedCustomerId(null);
  };

  const getDepartmentName = (dept: string) => {
    const names: Record<string, string> = {
      'all': '全部客戶',
      'sales': '業務部門',
      'support': '客服部門',
      'marketing': '行銷部門'
    };
    return names[dept] || dept;
  };

  // Mobile tab content renderer
  const renderMobileTabContent = () => {
    switch (activeTab) {
      case 'customers':
        return (
          <CustomerManagementPage 
            customers={customers}
            onAddCustomer={handleAddCustomer}
          />
        );
      case 'list':
        return showCustomerDetail ? (
          <div className="min-h-screen bg-gray-50">
            <MobileHeader 
              title={selectedCustomer?.name || '客戶詳情'}
              showBackButton={true}
              onBack={handleBackToList}
            />
            <div className="pt-16 pb-20">
              {selectedCustomer && (
                <CustomerDetail 
                  customer={selectedCustomer} 
                  onEditCustomer={handleEditCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-gray-50">
            <MobileHeader 
              title="客戶列表"
              rightAction={
                <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
              }
            />
            <div className="pt-16 pb-20">
              <CustomerList 
                customers={customers} 
                selectedCustomerId={selectedCustomerId}
                onSelectCustomer={handleSelectCustomer}
                onAddCustomer={handleAddCustomer}
                onBulkUpdateDepartment={handleBulkUpdateDepartment}
              />
            </div>
          </div>
        );
      case 'profile':
        return <ProfilePage />;
      default:
        return null;
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderMobileTabContent()}

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <CustomerEditDialog
          customer={editingCustomer}
          open={isAddEditDialogOpen}
          onOpenChange={setIsAddEditDialogOpen}
          onSave={handleSaveCustomer}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar 
          key={sidebarKey}
          activeDepartment={activeDepartment} 
          setActiveDepartment={setActiveDepartment} 
          isVisible={true}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      
      {/* Desktop menu button */}
      <Button 
        variant="ghost" 
        className="fixed top-4 left-4 z-40 p-2 h-10 w-10 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">開啟部門選單</span>
      </Button>
      
      {/* Desktop main content */}
      <div className="flex flex-1 h-full w-full">
        <div className="w-full md:w-2/5 min-w-0 md:min-w-[400px] h-full border-r border-gray-200 bg-white overflow-y-auto">
          <CustomerList 
            customers={customers} 
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={handleSelectCustomer}
            onAddCustomer={handleAddCustomer}
            onBulkUpdateDepartment={handleBulkUpdateDepartment}
          />
        </div>
        
        <div className="w-full md:w-3/5 h-full bg-white overflow-y-auto">
          {selectedCustomer ? (
            <CustomerDetail 
              customer={selectedCustomer} 
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onUpdateCustomer={handleUpdateCustomer}
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
