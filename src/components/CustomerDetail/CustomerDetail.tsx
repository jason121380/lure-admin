
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, FileText, CreditCard, Settings, StickyNote } from 'lucide-react';
import { Customer } from '@/components/CustomerList/CustomerListItem';
import { CustomerDeleteDialog } from './CustomerDeleteDialog';
import { NotesEditDialog } from './NotesEditDialog';
import { ServicePlanList } from './ServicePlans/ServicePlanList';
import { PaymentRecordList } from './PaymentRecords/PaymentRecordList';
import { FileManager } from './FileManager/FileManager';

type CustomerDetailProps = {
  customer: Customer;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onUpdateCustomer: (customer: Customer) => void;
};

export function CustomerDetail({ 
  customer, 
  onEditCustomer, 
  onDeleteCustomer,
  onUpdateCustomer 
}: CustomerDetailProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '進行中';
      case 'paused':
        return '暫停';
      case 'inactive':
        return '終止';
      default:
        return status;
    }
  };

  const handleNotesUpdate = (newNotes: string) => {
    const updatedCustomer = { ...customer, notes: newNotes };
    onUpdateCustomer(updatedCustomer);
  };

  return (
    <div className="h-full w-full bg-white overflow-y-auto">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 md:p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{customer.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {customer.departmentName}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(customer.status)}`}>
                  {getStatusText(customer.status)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNotesDialogOpen(true)}
                className="hidden md:flex"
              >
                <StickyNote className="h-4 w-4 mr-2" />
                備註
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditCustomer(customer)}
                className="hidden md:flex"
              >
                <Edit className="h-4 w-4 mr-2" />
                編輯
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="hidden md:flex"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                刪除
              </Button>
              
              {/* Mobile buttons */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsNotesDialogOpen(true)}
                className="md:hidden"
              >
                <StickyNote className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEditCustomer(customer)}
                className="md:hidden"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="md:hidden"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-4 md:p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {customer.email && (
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-600">{customer.email}</p>
              </div>
            )}
            {customer.phone && (
              <div>
                <span className="font-medium text-gray-700">電話:</span>
                <p className="text-gray-600">{customer.phone}</p>
              </div>
            )}
            {customer.contact && (
              <div>
                <span className="font-medium text-gray-700">聯絡人:</span>
                <p className="text-gray-600">{customer.contact}</p>
              </div>
            )}
            {customer.taxId && (
              <div>
                <span className="font-medium text-gray-700">統一編號:</span>
                <p className="text-gray-600">{customer.taxId}</p>
              </div>
            )}
            {customer.address && (
              <div className="md:col-span-2 lg:col-span-3">
                <span className="font-medium text-gray-700">地址:</span>
                <p className="text-gray-600">{customer.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Content */}
        <div className="flex-1 p-4 md:p-6">
          <Tabs defaultValue="services" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">服務方案</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">付款記錄</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">檔案管理</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-6">
              <ServicePlanList customerId={customer.id} customerName={customer.name} />
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              <PaymentRecordList customerId={customer.id} customerName={customer.name} />
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              <FileManager customerId={customer.id} customerName={customer.name} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CustomerDeleteDialog
        customer={customer}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => onDeleteCustomer(customer.id)}
      />

      <NotesEditDialog
        customerId={customer.id}
        notes={customer.notes || ''}
        open={isNotesDialogOpen}
        onOpenChange={setIsNotesDialogOpen}
        onSave={handleNotesUpdate}
        customerName={customer.name}
      />
    </div>
  );
}
