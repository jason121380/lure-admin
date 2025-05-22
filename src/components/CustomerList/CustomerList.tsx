
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Customer } from './CustomerListItem';
import { Button } from '@/components/ui/button';
import { PlusCircle, SearchIcon } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type CustomerListProps = {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
};

export function CustomerList({ customers: initialCustomers, selectedCustomerId, onSelectCustomer, onAddCustomer }: CustomerListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        // Transform Supabase data to match our Customer type
        const transformedData: Customer[] = data.map(item => ({
          id: item.id,
          name: item.name,
          department: item.department,
          departmentName: item.department_name,
          status: item.status,
          email: item.email || undefined,
          phone: item.phone || undefined,
          address: item.address || undefined,
          contact: item.contact || undefined,
          createdAt: item.created_at,
          notes: item.notes || undefined,
          taxId: item.tax_id || undefined,
        }));
        
        setCustomers(transformedData);
      } catch (error) {
        toast.error("無法載入客戶資料");
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCustomers();
  }, []);
  
  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
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
  
  return (
    <div className="border-r h-screen overflow-hidden flex flex-col bg-white">
      <div className="p-5 border-b sticky top-0 bg-white z-10 shadow-sm">
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
        {loading ? (
          <div className="p-4 space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : filteredCustomers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名稱</TableHead>
                <TableHead>部門</TableHead>
                <TableHead>狀態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className={`cursor-pointer ${customer.id === selectedCustomerId ? 'bg-slate-100' : ''}`}
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
        ) : (
          <div className="text-center py-10 text-gray-500">
            未找到客戶
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={currentPage === index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
