
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CustomerStatus = 'active' | 'paused' | 'inactive';

export type Customer = {
  id: string;
  name: string;
  department: string;
  departmentName: string;
  status: CustomerStatus;
  email: string;
  phone: string;
  address: string;
  contact: string;
  createdAt: string;
  notes?: string;
};

const statusConfig = {
  active: { label: '進行中', color: 'bg-status-active' },
  paused: { label: '暫停', color: 'bg-status-paused' },
  inactive: { label: '不活躍', color: 'bg-status-inactive' }
};

type CustomerListItemProps = {
  customer: Customer;
  isSelected: boolean;
  onClick: () => void;
};

export function CustomerListItem({ customer, isSelected, onClick }: CustomerListItemProps) {
  const status = statusConfig[customer.status];
  const departmentColor = customer.department === 'alfred' ? 'bg-red-500' : 
                         customer.department === 'internal' ? 'bg-blue-500' : 'bg-gray-500';
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-3 border rounded-md mb-2 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between",
        isSelected && "border-indigo-500 bg-slate-50"
      )}
    >
      <div className="flex items-center gap-3">
        <Badge className={cn("text-xs font-normal py-0.5", departmentColor === 'bg-red-500' ? "bg-red-500" : "bg-blue-500")}>
          {customer.departmentName}
        </Badge>
        <span className="font-medium">{customer.name}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
        <span className="text-sm text-gray-600">{status.label}</span>
      </div>
    </div>
  );
}
