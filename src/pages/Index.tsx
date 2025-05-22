
import { useState } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { CustomerList } from "@/components/CustomerList/CustomerList";
import { CustomerDetail } from "@/components/CustomerDetail/CustomerDetail";

type IndexProps = {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
};

const Index = ({ sidebarVisible, setSidebarVisible }: IndexProps) => {
  const [activeDepartment, setActiveDepartment] = useState("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

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
            departmentId={activeDepartment} 
            selectedCustomerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
          />
        </div>
        
        <div className="w-full md:w-2/3 overflow-auto">
          {selectedCustomerId ? (
            <CustomerDetail 
              customerId={selectedCustomerId} 
              onClose={() => setSelectedCustomerId(null)} 
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
