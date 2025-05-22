
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
    name: "Beauty Flower Shop",
    department: "alfred",
    departmentName: "Alfred",
    status: "active",
    email: "beauty@floral.com",
    phone: "123-456-7890",
    address: "123 Flower St, Garden City",
    contact: "Jane Smith",
    createdAt: "2023-05-15",
    notes: "Regular monthly service contract"
  },
  {
    id: "2",
    name: "Tech Pioneer Co., Ltd.",
    department: "internal",
    departmentName: "Internal Development",
    status: "paused",
    email: "info@techpioneer.com",
    phone: "987-654-3210",
    address: "456 Tech Avenue, Innovation District",
    contact: "John Doe",
    createdAt: "2023-04-20",
    notes: "Project on hold - waiting for budget approval"
  },
  {
    id: "3",
    name: "Global Marketing Services",
    department: "digital",
    departmentName: "Digital",
    status: "active",
    email: "hello@globalmarketing.com",
    phone: "555-123-4567",
    address: "789 Marketing Blvd, Media City",
    contact: "Sarah Johnson",
    createdAt: "2023-06-10"
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
        title: "Customer updated",
        description: `${customerData.name} has been updated successfully.`
      });
    } else {
      // Add new customer
      const newCustomer: Customer = {
        id: `${Date.now()}`,
        name: customerData.name || "Unnamed Customer",
        department: customerData.department || "uncategorized",
        departmentName: customerData.departmentName || "Uncategorized",
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
        title: "Customer added",
        description: `${newCustomer.name} has been added successfully.`
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
        title: "Customer deleted",
        description: `${customerToDelete.name} has been deleted.`,
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
