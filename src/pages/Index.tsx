
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { CustomerList } from "@/components/CustomerList/CustomerList";
import { CustomerDetail } from "@/components/CustomerDetail/CustomerDetail";
import { CustomerEditDialog } from "@/components/CustomerDetail/CustomerEditDialog";
import { CustomerDeleteDialog } from "@/components/CustomerDetail/CustomerDeleteDialog";
import { Customer } from "@/components/CustomerList/CustomerListItem";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeDepartment, setActiveDepartment] = useState("all");
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | undefined>(undefined);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Fetch customers from Supabase
  useEffect(() => {
    if (!user) return;
    
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Transform from database format to app format
          const formattedCustomers = data.map((item: Tables<'customers'>): Customer => ({
            id: item.id,
            name: item.name,
            department: item.department,
            departmentName: item.department_name,
            status: item.status as "active" | "paused" | "inactive",
            email: item.email || undefined,
            phone: item.phone || undefined,
            address: item.address || undefined,
            contact: item.contact || undefined,
            createdAt: new Date(item.created_at).toISOString().split('T')[0],
            notes: item.notes || undefined,
            taxId: item.tax_id || undefined
          }));
          
          setCustomers(formattedCustomers);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast({
          title: "獲取客戶資料失敗",
          description: "請稍後再試",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, [user, toast]);

  const filteredCustomers = activeDepartment === "all" || activeDepartment === "all-customers"
    ? customers
    : customers.filter((c) => c.department === activeDepartment);
  
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;
  
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
  };
  
  const handleAddCustomer = () => {
    setCustomerToEdit(undefined);
    setEditDialogOpen(true);
  };
  
  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setEditDialogOpen(true);
  };
  
  const handleDeleteCustomer = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setCustomerToDelete(customer);
      setDeleteDialogOpen(true);
    }
  };
  
  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    if (!user) return;
    
    try {
      if (customerToEdit) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
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
            updated_at: new Date().toISOString()
          })
          .eq('id', customerToEdit.id);
          
        if (error) throw error;
        
        // Update local state
        const updatedCustomers = customers.map((c) => 
          c.id === customerToEdit.id ? { ...c, ...customerData } : c
        );
        setCustomers(updatedCustomers);
        
        toast({
          title: "客戶已更新",
          description: `${customerData.name} 已成功更新。`
        });
      } else {
        // Add new customer
        const { data, error } = await supabase
          .from('customers')
          .insert({
            name: customerData.name || "未命名客戶",
            department: customerData.department || "uncategorized",
            department_name: customerData.departmentName || "未分類",
            status: customerData.status || "active",
            email: customerData.email || null,
            phone: customerData.phone || null,
            address: customerData.address || null,
            contact: customerData.contact || null,
            notes: customerData.notes || null,
            tax_id: customerData.taxId || null,
            user_id: user.id
          })
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Transform from database format to app format
          const newCustomer: Customer = {
            id: data.id,
            name: data.name,
            department: data.department,
            departmentName: data.department_name,
            status: data.status as "active" | "paused" | "inactive",
            email: data.email || undefined,
            phone: data.phone || undefined,
            address: data.address || undefined,
            contact: data.contact || undefined,
            createdAt: new Date(data.created_at).toISOString().split('T')[0],
            notes: data.notes || undefined,
            taxId: data.tax_id || undefined
          };
          
          setCustomers([newCustomer, ...customers]);
          setSelectedCustomerId(newCustomer.id);
          
          toast({
            title: "客戶已新增",
            description: `${newCustomer.name} 已成功新增。`
          });
        }
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "儲存失敗",
        description: "請稍後再試",
        variant: "destructive"
      });
    }
  };
  
  const handleConfirmDelete = async () => {
    if (customerToDelete) {
      try {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', customerToDelete.id);
          
        if (error) throw error;
        
        const updatedCustomers = customers.filter((c) => c.id !== customerToDelete.id);
        setCustomers(updatedCustomers);
        
        if (selectedCustomerId === customerToDelete.id) {
          setSelectedCustomerId(null);
        }
        
        toast({
          title: "客戶已刪除",
          description: `${customerToDelete.name} 已被刪除。`,
          variant: "destructive"
        });
        
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast({
          title: "刪除失敗",
          description: "請稍後再試",
          variant: "destructive"
        });
      } finally {
        setCustomerToDelete(null);
        setDeleteDialogOpen(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入客戶資料中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar 
        activeDepartment={activeDepartment}
        setActiveDepartment={setActiveDepartment}
      />
      
      <div className="flex-1 flex">
        <CustomerList 
          customers={filteredCustomers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={handleSelectCustomer}
          onAddCustomer={handleAddCustomer}
        />
        
        <CustomerDetail 
          customer={selectedCustomer}
          onEditCustomer={handleEditCustomer}
          onDeleteCustomer={handleDeleteCustomer}
        />
      </div>
      
      <CustomerEditDialog 
        customer={customerToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveCustomer}
      />
      
      <CustomerDeleteDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        customerName={customerToDelete?.name || ""}
      />
    </div>
  );
};

export default Index;
