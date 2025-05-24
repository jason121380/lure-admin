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
        <div className="flex items-center justify-between mb-4">
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 h-8 w-8 ml-auto"
              onClick={onAddCustomer}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <SearchIcon className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
            <Input 
              placeholder="搜尋客戶名稱..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
          </div>
        </div>

        {/* Bulk actions - only show on desktop */}
        {!isMobile && isSomeSelected && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              已選擇 {selectedCustomerIds.length} 位客戶
            </span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsBulkDialogOpen(true)}
              className="text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              批量更改部門
            </Button>
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
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
                        aria-label="選取全部"
                      />
                    </TableHead>
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
                      {isMobile ? (
                        // Mobile layout - single horizontal row
                        <TableCell className="w-full p-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex-1 min-w-0 mr-3">
                              <div className="font-medium text-sm truncate">{customer.name}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge 
                                variant="outline" 
                                className="text-xs px-2 py-0.5 border"
                              >
                                {customer.departmentName}
                              </Badge>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(customer.status)}`}>
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
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {customer.name}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className="text-xs px-2 py-0.5 border"
                            >
                              {customer.departmentName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(customer.status)}`}>
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
            
            {/* Show total count */}
            {!hasMore && filteredCustomers.length > 20 && (
              <div className={`p-4 text-center text-gray-500 text-sm ${isMobile ? 'w-full' : ''}`}>
                已顯示全部 {filteredCustomers.length} 位客戶
              </div>
            )}
          </>
        ) : (
          <div className={`text-center py-10 text-gray-500 ${isMobile ? 'w-full' : ''}`}>
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
