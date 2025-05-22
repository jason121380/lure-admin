
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { PaymentRecord, paymentMethods } from "./PaymentRecordList";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type PaymentRecordDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPaymentRecord: (paymentRecord: PaymentRecord) => void;
};

// 帳戶選項列表
const accountOptions = [
  { id: 'chenTaiyu', name: '陳泰宇' },
  { id: 'attractionCompany', name: '吸引力公司' },
  { id: 'attractionPersonal', name: '吸引力個人' },
];

export const PaymentRecordDialog = ({ 
  isOpen, 
  onOpenChange, 
  onAddPaymentRecord 
}: PaymentRecordDialogProps) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const form = useForm<{
    date: string;
    paymentMethod: string;
    account: string;
    amount: string;
    taxAmount: string;
    isConfirmed: boolean;
  }>({
    defaultValues: {
      date: today,
      paymentMethod: paymentMethods[0].id,
      account: accountOptions[0].id,
      amount: '',
      taxAmount: '0',
      isConfirmed: true,
    }
  });
  
  // Reset form when dialog is opened
  useEffect(() => {
    if (isOpen) {
      form.reset({
        date: today,
        paymentMethod: paymentMethods[0].id,
        account: accountOptions[0].id,
        amount: '',
        taxAmount: '0',
        isConfirmed: true,
      });
    }
  }, [isOpen, form, today]);
  
  // Calculate total amount when amount or tax amount changes
  useEffect(() => {
    const amount = Number(form.watch('amount')) || 0;
    const tax = Number(form.watch('taxAmount')) || 0;
    setTotalAmount(amount + tax);
  }, [form.watch('amount'), form.watch('taxAmount')]);

  const handleSubmit = form.handleSubmit((values) => {
    const amount = Number(values.amount);
    const tax = Number(values.taxAmount) || 0;
    
    const newPaymentRecord: PaymentRecord = {
      id: `temp-${Date.now()}`, // Will be replaced by the server-generated ID
      date: values.date,
      paymentMethod: values.paymentMethod,
      account: accountOptions.find(item => item.id === values.account)?.name || null,
      amount: amount,
      taxAmount: tax,
      totalAmount: amount + tax,
      isConfirmed: values.isConfirmed,
    };
    
    onAddPaymentRecord(newPaymentRecord);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增付款記錄</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>日期</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Payment method selection */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>支付方式</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇支付方式" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Account selection */}
            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>帳戶</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇帳戶" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountOptions.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Amount field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>金額</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="請輸入金額" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Tax amount field */}
            <FormField
              control={form.control}
              name="taxAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>稅金</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="請輸入稅金" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Total amount display */}
            <div>
              <p className="text-sm text-gray-500 mb-2">總金額</p>
              <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                {totalAmount.toLocaleString()} 元
              </div>
            </div>
            
            {/* Confirmation checkbox */}
            <FormField
              control={form.control}
              name="isConfirmed"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-gray-700">確認收款</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Action buttons */}
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit">
                新增
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
