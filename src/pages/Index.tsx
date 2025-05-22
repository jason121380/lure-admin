
import { useState } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { CustomerList } from "@/components/CustomerList/CustomerList";
import { CustomerDetail } from "@/components/CustomerDetail/CustomerDetail";
import { CustomerEditDialog } from "@/components/CustomerDetail/CustomerEditDialog";
import { CustomerDeleteDialog } from "@/components/CustomerDetail/CustomerDeleteDialog";
import { Customer } from "@/components/CustomerList/CustomerListItem";
import { useToast } from "@/components/ui/use-toast";

// Sample initial data
const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "美麗花店",
    department: "alfred",
    departmentName: "Alfred",
    status: "active",
    email: "beauty@floral.com",
    phone: "123-456-7890",
    address: "花園城市花街123號",
    contact: "張小姐",
    createdAt: "2023-05-15",
    notes: "定期月度服務合約",
    taxId: "12345678"
  },
  {
    id: "2",
    name: "科技先鋒有限公司",
    department: "internal",
    departmentName: "發展 對內",
    status: "paused",
    email: "info@techpioneer.com",
    phone: "987-654-3210",
    address: "創新區科技大道456號",
    contact: "王先生",
    createdAt: "2023-04-20",
    notes: "專案暫停 - 等待預算批准",
    taxId: "87654321"
  },
  {
    id: "3",
    name: "全球行銷服務",
    department: "digital",
    departmentName: "數位行銷",
    status: "active",
    email: "hello@globalmarketing.com",
    phone: "555-123-4567",
    address: "媒體城市行銷大道789號",
    contact: "李小姐",
    createdAt: "2023-06-10",
    taxId: "23456789"
  }
];

const Index = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeDepartment, setActiveDepartment] = useState("all");
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | undefined>(undefined);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

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
  
  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    if (customerToEdit) {
      // Update existing customer
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
      const newCustomer: Customer = {
        id: `${Date.now()}`,
        name: customerData.name || "未命名客戶",
        department: customerData.department || "uncategorized",
        departmentName: customerData.departmentName || "未分類",
        status: customerData.status || "active",
        email: customerData.email || "",
        phone: customerData.phone || "",
        address: customerData.address || "",
        contact: customerData.contact || "",
        createdAt: new Date().toISOString().split('T')[0],
        notes: customerData.notes || ""
      };
      
      setCustomers([...customers, newCustomer]);
      setSelectedCustomerId(newCustomer.id);
      toast({
        title: "客戶已新增",
        description: `${newCustomer.name} 已成功新增。`
      });
    }
  };
  
  const handleConfirmDelete = () => {
    if (customerToDelete) {
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
      
      setCustomerToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

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
