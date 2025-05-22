
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  taxId?: string; // Added taxId field
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
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Button
      variant="ghost"
      className={`w-full justify-start px-4 py-2 gap-3 font-normal rounded-none border-b hover:bg-slate-100 ${isSelected ? 'bg-slate-100' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col items-start w-full">
        <div className="flex justify-between items-center w-full">
          <span className="font-medium">{customer.name}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(customer.status)}`}>
            {customer.status === "active" ? "進行中" : 
             customer.status === "paused" ? "暫停" : "不活躍"}
          </span>
        </div>
        <div className="mt-1">
          <Badge variant="secondary" className="text-xs">{customer.departmentName}</Badge>
        </div>
      </div>
    </Button>
  );
}
