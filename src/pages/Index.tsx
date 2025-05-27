import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { CustomerList } from "@/components/CustomerList/CustomerList";
import { CustomerDetail } from "@/components/CustomerDetail/CustomerDetail";
import { Customer } from "@/components/CustomerList/CustomerListItem";
import { CustomerEditDialog } from "@/components/CustomerDetail/CustomerEditDialog";
import { MobileHeader } from "@/components/Layout/MobileHeader";
import { FilterDialog } from "@/components/CustomerList/FilterDialog";
import { UserProfileDialog } from "@/components/Layout/UserProfileDialog";
import { NotificationDialog } from "@/components/Layout/NotificationDialog";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

type IndexProps = {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
};

const Index = ({ sidebarVisible, setSidebarVisible }: IndexProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { notifications, addNotification, clearAllNotifications, unreadCount } = useNotifications();
  
  const [activeDepartment, setActiveDepartment] = useState("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarKey, setSidebarKey] = useState(0);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isUserProfileDialogOpen, setIsUserProfileDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    department: "all"
  });
  
  // Fetch customers on initial load
  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);
  
  // Apply filters whenever customers, filters, or activeDepartment change
  useEffect(() => {
    applyFilters();
  }, [customers, filters, activeDepartment]);
  
  const fetchCustomers = async () => {
    try {
      console.log("Fetching customers for department:", activeDepartment);
      let query = supabase.from('customers').select('*');
      
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

  // Apply filters to customers
  const applyFilters = () => {
    let filtered = [...customers];

    // Apply department filter first (from sidebar)
    if (activeDepartment !== "all") {
      filtered = filtered.filter(customer => customer.department === activeDepartment);
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }

    // Apply department filter from filter dialog (this should override sidebar if set)
    if (filters.department !== "all") {
      filtered = filtered.filter(customer => customer.department === filters.department);
    }

    console.log("Filtered customers:", filtered.length, "Active department:", activeDepartment);
    setFilteredCustomers(filtered);
  };

  // Force sidebar to refresh when customers data changes
  const refreshSidebar = () => {
    setSidebarKey(prev => prev + 1);
  };

  // Handle department change from sidebar
  const handleSetActiveDepartment = (department: string) => {
    console.log("Setting active department to:", department);
    setActiveDepartment(department);
    // Reset department filter in filters when sidebar changes
    setFilters(prev => ({ ...prev, department: "all" }));
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
    // Add notification
    addNotification('edit', `已更新客戶資料`, updatedCustomer.name);
  };
  
  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const customerToDelete = customers.find(c => c.id === customerId);
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
      // Add notification
      addNotification('delete', `已刪除客戶`, customerToDelete?.name);
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
        // Add notification
        addNotification('edit', `已更新客戶資料`, customerData.name);
      } else {
        // Create new customer
        const { data, error } = await supabase
          .from('customers')
          .insert(supabaseCustomerData)
          .select();
        
        if (error) throw error;
        toast.success("已新增客戶");
        // Add notification
        addNotification('create', `已新增客戶`, customerData.name);
        
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
      // Add notification
      addNotification('edit', `已批量更新 ${customerIds.length} 位客戶的部門`);
    } catch (error) {
      toast.error("批量更新部門失敗");
      console.error("Error bulk updating departments:", error);
    }
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
    setSelectedCustomerId(null);
  };

  const handleApplyFilters = (newFilters: { status: string; department: string }) => {
    setFilters(newFilters);
    toast.success("已套用篩選條件");
  };

  const handleOpenFilter = () => {
    setIsFilterDialogOpen(true);
  };

  const handleOpenUserProfile = () => {
    setIsUserProfileDialogOpen(true);
  };

  const handleOpenNotifications = () => {
    setIsNotificationDialogOpen(true);
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 w-full">
        {/* Mobile Header */}
        <MobileHeader 
          title={selectedCustomer ? selectedCustomer.name : ""}
          showBackButton={!!selectedCustomer}
          onBack={handleBackToList}
          showLogo={!selectedCustomer}
          onAddCustomer={() => handleAddCustomer()}
          onFilter={!selectedCustomer ? handleOpenFilter : undefined}
          onUserProfile={handleOpenUserProfile}
          onNotifications={handleOpenNotifications}
          notificationCount={unreadCount}
        />

        {/* Main Content */}
        <div className="pt-16 h-screen w-full">
          {!selectedCustomer ? (
            <div className="h-full w-full">
              <CustomerList 
                customers={filteredCustomers} 
                selectedCustomerId={selectedCustomerId}
                onSelectCustomer={handleSelectCustomer}
                onAddCustomer={handleAddCustomer}
                onBulkUpdateDepartment={handleBulkUpdateDepartment}
              />
            </div>
          ) : (
            <div className="h-full w-full">
              <CustomerDetail 
                customer={selectedCustomer} 
                onEditCustomer={handleEditCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onUpdateCustomer={handleUpdateCustomer}
              />
            </div>
          )}
        </div>

        <CustomerEditDialog
          customer={editingCustomer}
          open={isAddEditDialogOpen}
          onOpenChange={setIsAddEditDialogOpen}
          onSave={handleSaveCustomer}
        />

        <FilterDialog
          open={isFilterDialogOpen}
          onOpenChange={setIsFilterDialogOpen}
          onApplyFilters={handleApplyFilters}
          currentFilters={filters}
        />

        <UserProfileDialog
          open={isUserProfileDialogOpen}
          onOpenChange={setIsUserProfileDialogOpen}
        />

        <NotificationDialog
          open={isNotificationDialogOpen}
          onOpenChange={setIsNotificationDialogOpen}
          notifications={notifications}
          onClearAll={clearAllNotifications}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block relative`}>
        <Sidebar 
          key={sidebarKey}
          activeDepartment={activeDepartment} 
          setActiveDepartment={handleSetActiveDepartment} 
          isVisible={true}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      
      {/* Desktop notification bell - positioned in top right corner */}
      <div className="fixed top-4 right-4 z-50 hidden md:block">
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative p-2 h-10 w-10 bg-white shadow-sm border" 
          onClick={handleOpenNotifications}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
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
            customers={filteredCustomers} 
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

      <NotificationDialog
        open={isNotificationDialogOpen}
        onOpenChange={setIsNotificationDialogOpen}
        notifications={notifications}
        onClearAll={clearAllNotifications}
      />
    </div>
  );
};

export default Index;
