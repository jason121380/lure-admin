
import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Customer } from './CustomerListItem';
import { Button } from '@/components/ui/button';
import { PlusCircle, SearchIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type CustomerListProps = {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
};

export function CustomerList({ customers: initialCustomers, selectedCustomerId, onSelectCustomer, onAddCustomer }: CustomerListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayedCount, setDisplayedCount] = useState(20); // Start with 20 items
  const itemsPerLoad = 20; // Load 20 more items each time
  
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [loading, setLoading] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setCustomers(initialCustomers);
    setLoading(false);
  }, [initialCustomers]);
  
  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  // Get the customers to display (limited by displayedCount)
  const displayedCustomers = filteredCustomers.slice(0, displayedCount);
  const hasMore = displayedCount < filteredCustomers.length;
  
  // Load more items when intersection observer triggers
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setDisplayedCount(prev => prev + itemsPerLoad);
    }
  }, [hasMore, loading]);
  
  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, [loadMore]);
  
  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(20);
  }, [statusFilter, searchQuery]);
  
  // Function to get status text in Chinese
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "進行中";
      case "paused":
        return "暫停";
      case "inactive":
        return "終止";
      default:
        return status;
    }
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 font-medium";
      case "paused":
        return "bg-amber-100 text-amber-700 font-medium";
      case "inactive":
        return "bg-red-100 text-red-700 font-medium";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-5 border-b sticky top-0 bg-white z-10">
        <h2 className="text-xl font-semibold mb-4">客戶列表</h2>
        
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <SearchIcon className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
            <Input 
              placeholder="搜尋客戶名稱..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
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
              <SelectItem value="inactive">終止</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={onAddCustomer}>
          <PlusCircle className="w-4 h-4 mr-2" />
          新增客戶
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : filteredCustomers.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">名稱</TableHead>
                  <TableHead className="w-[30%]">部門</TableHead>
                  <TableHead className="w-[30%]">狀態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCustomers.map((customer) => (
                  <TableRow 
                    key={customer.id} 
                    className={`cursor-pointer hover:bg-gray-50 ${customer.id === selectedCustomerId ? 'bg-slate-100' : ''}`}
                    onClick={() => onSelectCustomer(customer)}
                  >
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.departmentName}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(customer.status)}`}>
                        {getStatusText(customer.status)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Intersection observer target for infinite scroll */}
            {hasMore && (
              <div ref={observerRef} className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            )}
            
            {/* Show total count */}
            {!hasMore && filteredCustomers.length > 20 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                已顯示全部 {filteredCustomers.length} 位客戶
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            未找到客戶
          </div>
        )}
      </div>
    </div>
  );
}
