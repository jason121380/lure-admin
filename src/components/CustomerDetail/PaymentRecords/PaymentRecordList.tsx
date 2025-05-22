
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export type PaymentRecord = {
  id: string;
  date: string;
  paymentMethod: string;
  account: string | null;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  isConfirmed: boolean;
};

// 支付方式列表
export const paymentMethods = [
  { id: 'transfer', name: '匯款' },
  { id: 'onlinePayment', name: '線上付款連結' },
  { id: 'cash', name: '現金' },
  { id: 'headquarterToDistrict', name: '總部返區處' },
  { id: 'districtToHeadquarter', name: '區處返總部' },
];

type PaymentRecordListProps = {
  customerId: string;
};

export const PaymentRecordList = ({ customerId }: PaymentRecordListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPaymentRecordOpen, setIsPaymentRecordOpen] = useState(false);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 獲取付款記錄
  useEffect(() => {
    if (!customerId || !user) return;
    
    const fetchPaymentRecords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('payment_records')
          .select('*')
          .eq('customer_id', customerId)
          .order('date', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedRecords: PaymentRecord[] = data.map(record => ({
            id: record.id,
            date: record.date,
            paymentMethod: record.payment_method,
            account: record.account || null,
            amount: Number(record.amount),
            taxAmount: Number(record.tax_amount || 0),
            totalAmount: Number(record.total_amount),
            isConfirmed: record.is_confirmed
          }));
          
          setPaymentRecords(formattedRecords);
        }
      } catch (error) {
        console.error('Error fetching payment records:', error);
        toast({
          title: "獲取付款記錄失敗",
          description: "請稍後再試",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentRecords();
  }, [customerId, user, toast]);

  const handleAddPaymentRecord = async (newPaymentRecord: PaymentRecord) => {
    try {
      // First save to database
      const { data, error } = await supabase
        .from('payment_records')
        .insert({
          customer_id: customerId,
          date: newPaymentRecord.date,
          payment_method: newPaymentRecord.paymentMethod,
          account: newPaymentRecord.account,
          amount: newPaymentRecord.amount,
          tax_amount: newPaymentRecord.taxAmount,
          total_amount: newPaymentRecord.totalAmount,
          is_confirmed: newPaymentRecord.isConfirmed,
          user_id: user?.id
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Then update local state
      if (data) {
        const formattedRecord: PaymentRecord = {
          id: data.id,
          date: data.date,
          paymentMethod: data.payment_method,
          account: data.account || null,
          amount: Number(data.amount),
          taxAmount: Number(data.tax_amount || 0),
          totalAmount: Number(data.total_amount),
          isConfirmed: data.is_confirmed
        };
        
        setPaymentRecords([formattedRecord, ...paymentRecords]);
        setIsPaymentRecordOpen(false);
        
        toast({
          title: "付款記錄已新增",
          description: `新增了 ${formattedRecord.amount.toLocaleString()} 元的付款記錄`
        });
      }
    } catch (error) {
      console.error('Error adding payment record:', error);
      toast({
        title: "新增付款記錄失敗",
        description: "請稍後再試",
        variant: "destructive"
      });
    }
  };

  // 獲取支付方式名稱
  const getPaymentMethodName = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? method.name : methodId;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">載入付款記錄中...</p>
      </div>
    );
  }

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
                <TableHead className="text-right">稅金</TableHead>
                <TableHead className="text-right">總額</TableHead>
                <TableHead className="text-center">確認收款</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{getPaymentMethodName(record.paymentMethod)}</TableCell>
                  <TableCell>{record.account || "-"}</TableCell>
                  <TableCell className="text-right">{record.amount.toLocaleString()} 元</TableCell>
                  <TableCell className="text-right">{record.taxAmount.toLocaleString()} 元</TableCell>
                  <TableCell className="text-right">{record.totalAmount.toLocaleString()} 元</TableCell>
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
