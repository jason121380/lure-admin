import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { PaymentRecordDialog } from "./PaymentRecordDialog";

export type PaymentRecord = {
  id: string;
  date: string;
  paymentMethod: string;
  account: string;
  amount: number;
  invoiceNumber: string;
  total: number;
  isConfirmed: boolean;
};

// 更新支付方式列表
export const paymentMethods = [
  { id: 'transfer', name: '匯款' },
  { id: 'onlinePayment', name: '線上付款連結' },
];

export const PaymentRecordList = () => {
  const [isPaymentRecordOpen, setIsPaymentRecordOpen] = useState(false);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);

  const handleAddPaymentRecord = (newPaymentRecord: PaymentRecord) => {
    setPaymentRecords([...paymentRecords, newPaymentRecord]);
    setIsPaymentRecordOpen(false);
  };

  return (
    <div className="relative">
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
                <TableHead>稅金</TableHead>
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

      <PaymentRecordDialog 
        isOpen={isPaymentRecordOpen} 
        onOpenChange={setIsPaymentRecordOpen}
        onAddPaymentRecord={handleAddPaymentRecord}
      />
    </div>
  );
};
