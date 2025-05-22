
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerListItem, Customer } from './CustomerListItem';
import { Button } from '@/components/ui/button';
import { PlusCircle, SearchIcon, ListFilter } from 'lucide-react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";

type CustomerListProps = {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
};

export function CustomerList({ customers, selectedCustomerId, onSelectCustomer, onAddCustomer }: CustomerListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (customer.taxId && customer.taxId.toLowerCase().includes(searchQuery.toLowerCase()));
    
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
  
  return (
    <div className="w-full max-w-md border-r h-screen overflow-hidden flex flex-col bg-white">
      <div className="p-5 border-b sticky top-0 bg-white z-10 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">客戶列表</h2>
        
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <SearchIcon className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
            <Input 
              placeholder="搜尋客戶名稱或統編..." 
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
        
        <div className="flex gap-2 mb-4">
          <Button 
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm" 
            className="flex-1"
            onClick={() => setViewMode("list")}
          >
            列表檢視
          </Button>
          <Button 
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm" 
            className="flex-1"
            onClick={() => setViewMode("table")}
          >
            表格檢視
          </Button>
        </div>
        
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={onAddCustomer}>
          <PlusCircle className="w-4 h-4 mr-2" />
          新增客戶
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredCustomers.length > 0 ? (
          <>
            {viewMode === "list" ? (
              <div className="divide-y divide-gray-100">
                {paginatedCustomers.map((customer) => (
                  <CustomerListItem
                    key={customer.id}
                    customer={customer}
                    isSelected={customer.id === selectedCustomerId}
                    onClick={() => onSelectCustomer(customer)}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-0 rounded-none shadow-none">
                <CardContent className="p-0">
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
                          className={customer.id === selectedCustomerId ? "bg-slate-100" : ""}
                          onClick={() => onSelectCustomer(customer)}
                        >
                          <TableCell className="font-medium">
                            {customer.name}
                            {customer.taxId && (
                              <span className="text-xs text-gray-500 block">
                                {customer.taxId}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{customer.departmentName}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2.5 py-1 rounded-full ${
                              customer.status === "active" ? "bg-status-active/20 text-status-active" :
                              customer.status === "paused" ? "bg-status-paused/20 text-status-paused" :
                              "bg-status-inactive/20 text-status-inactive"
                            } font-medium`}>
                              {getStatusText(customer.status)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
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
