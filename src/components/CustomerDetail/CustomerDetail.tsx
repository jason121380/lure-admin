import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "../CustomerList/CustomerListItem";
import { Plus, MoreHorizontal, Text, Calendar, Receipt, CreditCard, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

type CustomerDetailProps = {
  customer: Customer | null;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
};

type ServicePlanItem = {
  id: string;
  name: string;
  description: string;
  price: number;
};

// Define the Payment Record type
type PaymentRecord = {
  id: string;
  date: string;
  paymentMethod: string;
  account: string;
  amount: number;
  invoiceNumber: string;
  total: number;
  isConfirmed: boolean;
};

const serviceItems = [
  { id: '1v1', name: '1v1 輔導' },
  { id: 'social', name: '社群代操' },
  { id: 'advert', name: '廣告監測及回報' },
  { id: 'custom', name: '客製化店家方案' },
  { id: 'special', name: '特別專案' },
  { id: 'video', name: '影音拍攝' },
  { id: 'bos', name: 'BOS系統' },
];

const paymentMethods = [
  { id: 'bank', name: '銀行轉帳' },
  { id: 'cash', name: '現金' },
  { id: 'credit', name: '信用卡' },
  { id: 'line', name: 'Line Pay' },
];

export function CustomerDetail({ customer, onEditCustomer, onDeleteCustomer }: CustomerDetailProps) {
  const [isServicePlanOpen, setIsServicePlanOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(serviceItems[0].id);
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePlans, setServicePlans] = useState<ServicePlanItem[]>([]);
  
  // Payment records state and dialog state
  const [isPaymentRecordOpen, setIsPaymentRecordOpen] = useState(false);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [paymentAccount, setPaymentAccount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(true);

  const handleAddServicePlan = () => {
    if (selectedService && servicePrice) {
      const selectedServiceItem = serviceItems.find(item => item.id === selectedService);
      
      if (selectedServiceItem) {
        const newServicePlan: ServicePlanItem = {
          id: `${Date.now()}`,
          name: selectedServiceItem.name,
          description: serviceDescription,
          price: Number(servicePrice)
        };
        
        setServicePlans([...servicePlans, newServicePlan]);
        setIsServicePlanOpen(false);
        setSelectedService(serviceItems[0].id);
        setServicePrice('');
        setServiceDescription('');
      }
    }
  };
  
  // Handle adding a new payment record
  const handleAddPaymentRecord = () => {
    if (paymentAmount) {
      const amount = Number(paymentAmount);
      
      const newPaymentRecord: PaymentRecord = {
        id: `${Date.now()}`,
        date: paymentDate || format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: paymentMethods.find(item => item.id === paymentMethod)?.name || '銀行轉帳',
        account: paymentAccount,
        amount: amount,
        invoiceNumber: invoiceNumber,
        total: amount, // For simplicity, total equals amount
        isConfirmed: paymentConfirmed,
      };
      
      setPaymentRecords([...paymentRecords, newPaymentRecord]);
      setIsPaymentRecordOpen(false);
      resetPaymentForm();
    }
  };
  
  // Reset payment form fields
  const resetPaymentForm = () => {
    setPaymentDate('');
    setPaymentMethod(paymentMethods[0].id);
    setPaymentAccount('');
    setPaymentAmount('');
    setInvoiceNumber('');
    setPaymentConfirmed(true);
  };

  if (!customer) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>請選擇一個客戶來查看詳細資訊</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium">{customer.name}</h2>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => onEditCustomer(customer)}
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            編輯資訊
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer"
                onClick={() => onDeleteCustomer(customer.id)}
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                刪除客戶
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-4 grid grid-cols-5 w-full">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="services">服務方案</TabsTrigger>
          <TabsTrigger value="payments">付款記錄</TabsTrigger>
          <TabsTrigger value="advertising">廣告成本</TabsTrigger>
          <TabsTrigger value="profit">利潤計算</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="p-4 bg-white border rounded-md">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 block">客戶名稱</label>
                <div>{customer.name}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">聯絡人</label>
                <div>{customer.contact || "-"}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">電子郵件</label>
                <div>{customer.email || "-"}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">地址</label>
                <div>{customer.address || "-"}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">建立日期</label>
                <div>{new Date(customer.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 block">狀態</label>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full bg-status-${customer.status}`}></span>
                  <span>
                    {customer.status === 'active' ? '進行中' : 
                     customer.status === 'paused' ? '暫停' : '不活躍'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">電話</label>
                <div>{customer.phone || "-"}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">部門</label>
                <div>{customer.departmentName}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">統一編號</label>
                <div>{customer.taxId || "-"}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="text-sm text-gray-500 block">備註</label>
            <div className="p-4 border rounded-md bg-gray-50 min-h-24">
              {customer.notes || "無備註資訊"}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="services" className="relative">
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute right-3 top-3 z-10"
            onClick={() => setIsServicePlanOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">新增服務方案</span>
          </Button>
          
          {servicePlans.length > 0 ? (
            <div className="p-4 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>服務項目</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead className="text-right">價格</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicePlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
                      <TableCell className="text-right">{plan.price.toLocaleString()} 元</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 border rounded-md">
              服務方案資訊將顯示於此
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="payments" className="relative">
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute right-3 top-3 z-10"
            onClick={() => setIsPaymentRecordOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">新增付款記錄</span>
          </Button>
          
          {paymentRecords.length > 0 ? (
            <div className="p-4 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日期</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>帳戶</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead>發票號碼</TableHead>
                    <TableHead className="text-right">總額</TableHead>
                    <TableHead className="text-center">確認收款</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.paymentMethod}</TableCell>
                      <TableCell>{record.account || "-"}</TableCell>
                      <TableCell className="text-right">{record.amount.toLocaleString()} 元</TableCell>
                      <TableCell>{record.invoiceNumber || "-"}</TableCell>
                      <TableCell className="text-right">{record.total.toLocaleString()} 元</TableCell>
                      <TableCell className="text-center">
                        {record.isConfirmed ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />已確認
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            未確認
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 border rounded-md">
              付款記錄將顯示於此
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="advertising">
          <div className="p-12 text-center text-gray-500 border rounded-md">
            廣告成本將顯示於此
          </div>
        </TabsContent>
        
        <TabsContent value="profit">
          <div className="p-12 text-center text-gray-500 border rounded-md">
            利潤計算將顯示於此
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Service Plan Dialog */}
      <Dialog open={isServicePlanOpen} onOpenChange={setIsServicePlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增服務方案</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">服務項目</label>
              <select 
                className="w-full border border-gray-300 rounded-md p-2"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {serviceItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-500 block mb-2">文字描述</label>
              <Textarea 
                placeholder="請輸入服務描述"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                className="min-h-24"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-500 block mb-2">價格</label>
              <Input 
                placeholder="請輸入價格"
                type="number"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServicePlanOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddServicePlan}>
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Payment Record Dialog */}
      <Dialog open={isPaymentRecordOpen} onOpenChange={setIsPaymentRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增付款記錄</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">日期</label>
              <Input 
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-500 block mb-2">支付方式</label>
              <select 
                className="w-full border border-gray-300 rounded-md p-2"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {paymentMethods.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-500 block mb-2">帳戶</label>
              <Input 
                placeholder="請輸入帳戶資訊"
                value={paymentAccount}
                onChange={(e) => setPaymentAccount(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-500 block mb-2">金額</label>
              <Input 
                placeholder="請輸入金額"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-500 block mb-2">發票號碼</label>
              <Input 
                placeholder="請輸入發票號碼"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="payment-confirmed"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={paymentConfirmed}
                onChange={(e) => setPaymentConfirmed(e.target.checked)}
              />
              <label htmlFor="payment-confirmed" className="text-sm text-gray-700">確認收款</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentRecordOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddPaymentRecord}>
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
