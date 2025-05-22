
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerListItem, Customer } from './CustomerListItem';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

type CustomerListProps = {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
};

export function CustomerList({ customers, selectedCustomerId, onSelectCustomer, onAddCustomer }: CustomerListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const filteredCustomers = customers.filter(customer => {
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (customer.taxId && customer.taxId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });
  
  return (
    <div className="w-full max-w-md border-r h-screen overflow-hidden flex flex-col">
      <div className="p-5 border-b sticky top-0 bg-white z-10 shadow-sm">
        <h2 className="text-xl font-semibold mb-5">客戶列表</h2>
        
        <div className="flex gap-2 mb-5">
          <div className="flex-1">
            <Input 
              placeholder="搜尋客戶名稱或統編..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 shrink-0">
              <SelectValue placeholder="所有狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有狀態</SelectItem>
              <SelectItem value="active">進行中</SelectItem>
              <SelectItem value="paused">暫停</SelectItem>
              <SelectItem value="inactive">不活躍</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={onAddCustomer}>
          <PlusCircle className="w-4 h-4 mr-2" />
          新增客戶
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredCustomers.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <CustomerListItem
                key={customer.id}
                customer={customer}
                isSelected={customer.id === selectedCustomerId}
                onClick={() => onSelectCustomer(customer)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            未找到客戶
          </div>
        )}
      </div>
    </div>
  );
}
