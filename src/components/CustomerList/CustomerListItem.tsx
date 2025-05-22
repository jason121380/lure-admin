import { Button } from "@/components/ui/button";

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
  return (
    <Button
      variant="ghost"
      className="w-full justify-start px-4 gap-3 font-normal rounded-none border-b hover:bg-slate-100"
      onClick={onClick}
    >
      {customer.name}
    </Button>
  );
}
