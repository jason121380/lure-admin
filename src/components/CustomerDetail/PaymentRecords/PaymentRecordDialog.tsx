
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
  // Get today's date in yyyy-MM-dd format
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [paymentDate, setPaymentDate] = useState(today); // Default to today
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [paymentAccount, setPaymentAccount] = useState(accountOptions[0].id);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState(''); // 稅金欄位
  const [paymentConfirmed, setPaymentConfirmed] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0); // 總金額計算

  // Reset form when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setPaymentDate(today);
      setPaymentMethod(paymentMethods[0].id);
      setPaymentAccount(accountOptions[0].id);
      setPaymentAmount('');
      setTaxAmount('');
      setPaymentConfirmed(true);
    }
  }, [isOpen, today]);
  
  // 當金額或稅金變更時計算總金額
  useEffect(() => {
    const amount = Number(paymentAmount) || 0;
    const tax = Number(taxAmount) || 0;
    setTotalAmount(amount + tax);
  }, [paymentAmount, taxAmount]);

  const handleAddPaymentRecord = () => {
    if (paymentAmount) {
      const amount = Number(paymentAmount);
      const tax = Number(taxAmount) || 0;
      
      const newPaymentRecord: PaymentRecord = {
        id: `${Date.now()}`,
        date: paymentDate || today,
        paymentMethod: paymentMethod,
        account: accountOptions.find(item => item.id === paymentAccount)?.name || null,
        amount: amount,
        taxAmount: tax,
        totalAmount: amount + tax,
        isConfirmed: paymentConfirmed,
      };
      
      onAddPaymentRecord(newPaymentRecord);
      resetForm();
    }
  };

  const resetForm = () => {
    setPaymentDate(today); // Reset to today
    setPaymentMethod(paymentMethods[0].id);
    setPaymentAccount(accountOptions[0].id);
    setPaymentAmount('');
    setTaxAmount('');
    setPaymentConfirmed(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增付款記錄</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
            <Select 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選擇支付方式" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-gray-500 block mb-2">帳戶</label>
            <Select 
              value={paymentAccount} 
              onValueChange={setPaymentAccount}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選擇帳戶" />
              </SelectTrigger>
              <SelectContent>
                {accountOptions.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <label className="text-sm text-gray-500 block mb-2">稅金</label>
            <Input 
              placeholder="請輸入稅金"
              type="number"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-2">總金額</label>
            <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
              {totalAmount.toLocaleString()} 元
            </div>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleAddPaymentRecord}>
            新增
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
