
import { useState } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { CustomerList } from "@/components/CustomerList/CustomerList";
import { CustomerDetail } from "@/components/CustomerDetail/CustomerDetail";
import { Customer } from "@/components/CustomerList/CustomerListItem";

type IndexProps = {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
};

const Index = ({ sidebarVisible, setSidebarVisible }: IndexProps) => {
  const [activeDepartment, setActiveDepartment] = useState("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Mock customers data for demonstration
  const mockCustomers: Customer[] = [
    {
      id: "1",
      name: "台北科技股份有限公司",
      department: "tech",
      departmentName: "科技部門",
      status: "active",
      email: "info@taipeitech.com",
      phone: "02-1234-5678",
      address: "台北市信義區松高路123號",
      contact: "張先生",
      createdAt: new Date().toISOString(),
      notes: "重要客戶，優先處理",
      taxId: "12345678"
    },
    {
      id: "2",
      name: "高雄物流有限公司",
      department: "logistics",
      departmentName: "物流部門",
      status: "paused",
      createdAt: new Date().toISOString()
    }
  ];
  
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomer(customer);
  };
  
  const handleDeleteCustomer = (customerId: string) => {
    // Mock implementation for demonstration
    console.log(`Delete customer with ID: ${customerId}`);
    setSelectedCustomerId(null);
    setSelectedCustomer(null);
  };
  
  const handleEditCustomer = (customer: Customer) => {
    // Mock implementation for demonstration
    console.log(`Edit customer:`, customer);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <Sidebar 
        activeDepartment={activeDepartment} 
        setActiveDepartment={setActiveDepartment} 
        isVisible={sidebarVisible} 
      />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/3 border-r border-gray-200 bg-white">
          <CustomerList 
            customers={mockCustomers} 
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={handleSelectCustomer}
            onAddCustomer={() => console.log("Add customer clicked")}
          />
        </div>
        
        <div className="w-full md:w-2/3 overflow-auto">
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
        </div>
      </div>
    </div>
  );
};

export default Index;
