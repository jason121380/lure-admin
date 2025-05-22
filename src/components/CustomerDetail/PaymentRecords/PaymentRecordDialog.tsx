
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { PaymentRecord, paymentMethods } from "./PaymentRecordList";

type PaymentRecordDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPaymentRecord: (paymentRecord: PaymentRecord) => void;
};

export const PaymentRecordDialog = ({ 
  isOpen, 
  onOpenChange, 
  onAddPaymentRecord 
}: PaymentRecordDialogProps) => {
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [paymentAccount, setPaymentAccount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(true);

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
      
      onAddPaymentRecord(newPaymentRecord);
      resetForm();
    }
  };

  const resetForm = () => {
    setPaymentDate('');
    setPaymentMethod(paymentMethods[0].id);
    setPaymentAccount('');
    setPaymentAmount('');
    setInvoiceNumber('');
    setPaymentConfirmed(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
