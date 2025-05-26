import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Trash2 } from "lucide-react";
import { PaymentRecord, paymentMethods, billingCycleOptions } from "./PaymentRecordList";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface PaymentRecordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  paymentRecord: PaymentRecord | null;
  onAddPaymentRecord: (record: PaymentRecord) => void;
  onUpdatePaymentRecord: (record: PaymentRecord) => void;
  onDeletePaymentRecord?: (recordId: string) => void;
}

// Define the account options
const accountOptions = [
  { id: "attraction-personal", name: "吸引力個人" },
  { id: "attraction-company", name: "吸引力公司" },
  { id: "development", name: "發展處" }
];

export function PaymentRecordDialog({
  isOpen,
  onOpenChange,
  paymentRecord,
  onAddPaymentRecord,
  onUpdatePaymentRecord,
  onDeletePaymentRecord,
}: PaymentRecordDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [account, setAccount] = useState("");
  const [billingCycle, setBillingCycle] = useState("當月");
  const [amount, setAmount] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  
  // Reset form when dialog opens/closes or when paymentRecord changes
  useEffect(() => {
    if (isOpen) {
      if (paymentRecord) {
        // Set form values for editing
        setDate(paymentRecord.date ? new Date(paymentRecord.date) : new Date());
        setPaymentMethod(paymentRecord.paymentMethod);
        setAccount(paymentRecord.account || "");
        setBillingCycle(paymentRecord.billingCycle);
        setAmount(paymentRecord.amount.toString());
        setTaxAmount(paymentRecord.taxAmount.toString());
        setTotalAmount(paymentRecord.totalAmount.toString());
        setIsConfirmed(paymentRecord.isConfirmed);
      } else {
        // Set default values for new record
        setDate(new Date());
        setPaymentMethod("transfer");
        setAccount("");
        setBillingCycle("當月");
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
      billingCycle,
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

  const handleDeleteClick = () => {
    setIsDeleteAlertOpen(true);
    setDeletePassword("");
    setPasswordError(false);
  };

  const handleDeleteConfirm = () => {
    if (deletePassword === '96962779') {
      if (paymentRecord && onDeletePaymentRecord) {
        onDeletePaymentRecord(paymentRecord.id);
        setIsDeleteAlertOpen(false);
        setDeletePassword("");
        setPasswordError(false);
      }
    } else {
      setPasswordError(true);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteAlertOpen(false);
    setDeletePassword("");
    setPasswordError(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>{paymentRecord ? "編輯付款記錄" : "新增付款記錄"}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6">
            <form onSubmit={handleSubmit} className="space-y-4 pb-6">
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
                <Select value={account} onValueChange={setAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇帳戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountOptions.map(option => (
                      <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billingCycle">週期</Label>
                <Select value={billingCycle} onValueChange={setBillingCycle}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇週期" />
                  </SelectTrigger>
                  <SelectContent>
                    {billingCycleOptions.map(option => (
                      <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              
              <div className="flex justify-between pt-4">
                {paymentRecord && onDeletePaymentRecord && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDeleteClick}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    刪除
                  </Button>
                )}
                <div className="ml-auto">
                  <Button type="submit">{paymentRecord ? "更新" : "新增"}</Button>
                </div>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除付款記錄</AlertDialogTitle>
            <AlertDialogDescription>
              此操作無法撤銷，請輸入密碼確認刪除此付款記錄。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="deletePassword">密碼</Label>
              <Input
                id="deletePassword"
                type="password"
                placeholder="請輸入密碼"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setPasswordError(false);
                }}
                className={cn(passwordError && "border-red-500")}
              />
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">密碼錯誤，請重新輸入</p>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-red-600 hover:bg-red-700"
              disabled={!deletePassword}
            >
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
