
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { PaymentRecord, paymentMethods } from "./PaymentRecordList";

interface PaymentRecordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  paymentRecord: PaymentRecord | null;
  onAddPaymentRecord: (record: PaymentRecord) => void;
  onUpdatePaymentRecord: (record: PaymentRecord) => void;
}

export function PaymentRecordDialog({
  isOpen,
  onOpenChange,
  paymentRecord,
  onAddPaymentRecord,
  onUpdatePaymentRecord,
}: PaymentRecordDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(true);
  
  // Reset form when dialog opens/closes or when paymentRecord changes
  useEffect(() => {
    if (isOpen) {
      if (paymentRecord) {
        // Set form values for editing
        setDate(paymentRecord.date ? new Date(paymentRecord.date) : new Date());
        setPaymentMethod(paymentRecord.paymentMethod);
        setAccount(paymentRecord.account || "");
        setAmount(paymentRecord.amount.toString());
        setTaxAmount(paymentRecord.taxAmount.toString());
        setTotalAmount(paymentRecord.totalAmount.toString());
        setIsConfirmed(paymentRecord.isConfirmed);
      } else {
        // Set default values for new record
        setDate(new Date());
        setPaymentMethod("transfer");
        setAccount("");
        setAmount("");
        setTaxAmount("0");
        setTotalAmount("");
        setIsConfirmed(true);
      }
    }
  }, [isOpen, paymentRecord]);

  const calculateTotal = () => {
    const amountValue = parseFloat(amount) || 0;
    const taxValue = parseFloat(taxAmount) || 0;
    setTotalAmount((amountValue + taxValue).toString());
  };
  
  useEffect(() => {
    calculateTotal();
  }, [amount, taxAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const numAmount = parseFloat(amount);
    const numTaxAmount = parseFloat(taxAmount) || 0;
    const numTotalAmount = parseFloat(totalAmount);
    
    const paymentData: PaymentRecord = {
      id: paymentRecord?.id || "",
      date: formattedDate,
      paymentMethod,
      account: account || null,
      amount: numAmount,
      taxAmount: numTaxAmount,
      totalAmount: numTotalAmount,
      isConfirmed,
    };
    
    if (paymentRecord) {
      onUpdatePaymentRecord(paymentData);
    } else {
      onAddPaymentRecord(paymentData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{paymentRecord ? "編輯付款記錄" : "新增付款記錄"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">日期</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy-MM-dd") : <span>選擇日期</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">支付方式</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="選擇支付方式" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="account">帳戶</Label>
            <Input
              id="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="可選"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">金額</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxAmount">稅金</Label>
            <Input
              id="taxAmount"
              type="number"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="totalAmount">總額</Label>
            <Input
              id="totalAmount"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0"
              required
              readOnly
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isConfirmed"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked === true)}
            />
            <label
              htmlFor="isConfirmed"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              確認收款
            </label>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button type="submit">{paymentRecord ? "更新" : "新增"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
