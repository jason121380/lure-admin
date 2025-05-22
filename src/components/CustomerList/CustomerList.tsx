
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerListItem, Customer } from './CustomerListItem';
import { Button } from '@/components/ui/button';

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
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  return (
    <div className="w-full max-w-md border-r">
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <h2 className="text-lg font-medium mb-4">Customer List</h2>
        
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">In Progress</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={onAddCustomer}>
          <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Customer
        </Button>
      </div>
      
      <div className="p-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <CustomerListItem
              key={customer.id}
              customer={customer}
              isSelected={customer.id === selectedCustomerId}
              onClick={() => onSelectCustomer(customer)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No customers found
          </div>
        )}
      </div>
    </div>
  );
}
