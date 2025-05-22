
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Customer = {
  id: string;
  name: string;
  department: string;
  departmentName: string;
  status: "active" | "paused" | "inactive";
  email?: string;
  phone?: string;
  address?: string;
  contact?: string;
  createdAt: string;
  notes?: string;
  taxId?: string;
};

type CustomerListItemProps = {
  customer: Customer;
  isSelected: boolean;
  onClick: () => void;
};

export function CustomerListItem({ customer, isSelected, onClick }: CustomerListItemProps) {
  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-status-active/20 text-status-active font-medium";
      case "paused":
        return "bg-status-paused/20 text-status-paused font-medium";
      case "inactive":
        return "bg-status-inactive/20 text-status-inactive font-medium";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get department color
  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "alfred":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "jason":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "internal":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "external":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "digital":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Function to get status text in Chinese
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "進行中";
      case "paused":
        return "暫停";
      case "inactive":
        return "不活躍";
      default:
        return status;
    }
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start px-4 py-3 gap-3 font-normal rounded-none border-b hover:bg-slate-100",
        isSelected ? 'bg-slate-100' : ''
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-start w-full space-y-2">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <span className="font-medium">{customer.name}</span>
            {customer.taxId && (
              <span className="text-xs text-gray-500">({customer.taxId})</span>
            )}
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(customer.status)}`}>
            {getStatusText(customer.status)}
          </span>
        </div>
        
        <Badge 
          variant="outline" 
          className={`text-xs ${getDepartmentColor(customer.department)} px-2 py-0.5 border`}
        >
          {customer.departmentName}
        </Badge>
      </div>
    </Button>
  );
}
