
import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Customer } from './CustomerListItem';
import { Button } from '@/components/ui/button';
import { Plus, SearchIcon, Edit2 } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkDepartmentChangeDialog } from './BulkDepartmentChangeDialog';
import { Badge } from "@/components/ui/badge";
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
  onBulkUpdateDepartment?: (customerIds: string[], departmentData: { department: string; departmentName: string }) => Promise<void>;
};

export function CustomerList({ 
  customers: initialCustomers, 
  selectedCustomerId, 
  onSelectCustomer, 
  onAddCustomer,
  onBulkUpdateDepartment 
}: CustomerListProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayedCount, setDisplayedCount] = useState(20);
  const itemsPerLoad = 20;
  
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [loading, setLoading] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  
  // Bulk selection state
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  
  useEffect(() => {
    setCustomers(initialCustomers);
    setLoading(false);
  }, [initialCustomers]);
  
  // Filter customers based on search only
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
  }, [searchQuery]);

  // Clear selection when customers change
  useEffect(() => {
    setSelectedCustomerIds([]);
  }, [customers]);
  
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

  // Function to get status color - using the defined status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (customerId: string, checked: boolean) => {
    setSelectedCustomerIds(prev => 
      checked 
        ? [...prev, customerId]
        : prev.filter(id => id !== customerId)
    );
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectedCustomerIds(checked ? displayedCustomers.map(c => c.id) : []);
  };

  // Check if all displayed customers are selected
  const isAllSelected = displayedCustomers.length > 0 && 
    displayedCustomers.every(customer => selectedCustomerIds.includes(customer.id));

  // Check if some customers are selected
  const isSomeSelected = selectedCustomerIds.length > 0;

  // Handle bulk department change
  const handleBulkDepartmentChange = async (departmentData: { department: string; departmentName: string }) => {
    if (onBulkUpdateDepartment && selectedCustomerIds.length > 0) {
      await onBulkUpdateDepartment(selectedCustomerIds, departmentData);
      setSelectedCustomerIds([]);
      setIsBulkDialogOpen(false);
    }
  };
  
  return (
    <div className={`h-full flex flex-col ${isMobile ? 'w-full' : ''}`}>
      <div className={`p-4 md:p-5 border-b sticky top-0 bg-white z-10 ${isMobile ? 'w-full' : ''}`}>
        {!isMobile && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">客戶列表</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={onAddCustomer}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <div>
          <div className="relative">
            <SearchIcon className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-400" />
            <Input 
              placeholder="搜尋客戶名稱..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Bulk Actions Section */}
        {!isMobile && isSomeSelected && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">
                已選取 {selectedCustomerIds.length} 位客戶
              </span>
              <Button
                size="sm"
                variant="outline"
                className="text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400"
                onClick={() => setIsBulkDialogOpen(true)}
              >
                <Edit2 className="w-3 h-3 mr-1" />
                批量更改部門
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className={`flex-1 overflow-auto ${isMobile ? 'w-full' : ''}`}>
        {loading ? (
          <div className={`p-4 space-y-4 ${isMobile ? 'w-full' : ''}`}>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : filteredCustomers.length > 0 ? (
          <>
            <div className={isMobile ? 'w-full' : ''}>
              <Table>
                <TableHeader className={isMobile ? 'hidden' : ''}>
                  <TableRow className="border-slate-200">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
                        aria-label="選取全部"
                        className="border-slate-300"
                      />
                    </TableHead>
                    <TableHead className="w-[30%] text-slate-700">部門</TableHead>
                    <TableHead className="w-[40%] text-slate-700">名稱</TableHead>
                    <TableHead className="w-[30%] text-slate-700">狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedCustomers.map((customer) => (
                    <TableRow 
                      key={customer.id} 
                      className={`cursor-pointer hover:bg-slate-50 border-slate-100 ${customer.id === selectedCustomerId ? 'bg-slate-100' : ''}`}
                      onClick={() => onSelectCustomer(customer)}
                    >
                      {isMobile ? (
                        // Mobile layout - single horizontal row
                        <TableCell className="w-full p-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 flex-1 min-w-0 mr-3">
                              <Badge 
                                variant="outline" 
                                className="text-xs px-2 py-0.5 border-slate-300 text-slate-600 shrink-0"
                              >
                                {customer.departmentName}
                              </Badge>
                              <div className="font-medium text-sm truncate text-slate-900">{customer.name}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(customer.status)}`}>
                                {getStatusText(customer.status)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                      ) : (
                        // Desktop layout
                        <>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedCustomerIds.includes(customer.id)}
                              onCheckedChange={(checked: boolean) => handleCheckboxChange(customer.id, checked)}
                              aria-label={`選取 ${customer.name}`}
                              className="border-slate-300"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className="text-xs px-2 py-0.5 border-slate-300 text-slate-600"
                            >
                              {customer.departmentName}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">
                            {customer.name}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(customer.status)}`}>
                              {getStatusText(customer.status)}
                            </span>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Intersection observer target for infinite scroll */}
            {hasMore && (
              <div ref={observerRef} className={`p-4 text-center ${isMobile ? 'w-full' : ''}`}>
                <div className="flex items-center justify-center space-x-2">
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            )}
            
            {!hasMore && filteredCustomers.length > 20 && (
              <div className={`p-4 text-center text-slate-500 text-sm ${isMobile ? 'w-full' : ''}`}>
                已顯示全部 {filteredCustomers.length} 位客戶
              </div>
            )}
          </>
        ) : (
          <div className={`text-center py-10 text-slate-500 ${isMobile ? 'w-full' : ''}`}>
            未找到客戶
          </div>
        )}
      </div>

      {!isMobile && (
        <BulkDepartmentChangeDialog
          open={isBulkDialogOpen}
          onOpenChange={setIsBulkDialogOpen}
          selectedCount={selectedCustomerIds.length}
          onConfirm={handleBulkDepartmentChange}
        />
      )}
    </div>
  );
}
