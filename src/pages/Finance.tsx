
import { useState } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type FinanceProps = {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
};

const Finance = ({ sidebarVisible, setSidebarVisible }: FinanceProps) => {
  const isMobile = useIsMobile();
  const [activeDepartment, setActiveDepartment] = useState("all");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar - 修正定位和點擊問題 */}
      {sidebarVisible && (
        <div className="fixed md:relative z-40 h-full">
          <Sidebar 
            activeDepartment={activeDepartment} 
            setActiveDepartment={setActiveDepartment} 
            isVisible={sidebarVisible}
            toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          />
        </div>
      )}
      
      {/* Mobile overlay when sidebar is open */}
      {isMobile && sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarVisible(false)}
        />
      )}
      
      {/* Main content container */}
      <div className={`flex flex-1 h-full w-full transition-all duration-300 ${
        sidebarVisible && !isMobile ? 'ml-64' : ''
      }`}>
        {/* Mobile menu button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            className="fixed top-4 left-4 z-50 p-2 h-10 w-10 md:hidden bg-white shadow-md"
            onClick={() => setSidebarVisible(!sidebarVisible)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">開啟部門選單</span>
          </Button>
        )}
        
        <div className="w-full h-full bg-white overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-6">財務中心</h1>
          
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">收入報表</h2>
            <p className="text-gray-600">財務資料即將上線，敬請期待！</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
