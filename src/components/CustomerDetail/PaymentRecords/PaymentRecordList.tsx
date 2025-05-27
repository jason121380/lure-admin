import { useState, useEffect } from "react";
import { Plus, Check, Pencil } from "lucide-react";
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

// 支付方式列表
export const paymentMethods = [
  { id: 'transfer', name: '匯款' },
  { id: 'onlinePayment', name: '線上付款連結' },
  { id: 'cash', name: '現金' },
  { id: 'headquarterToDistrict', name: '總部返區處' },
  { id: 'districtToHeadquarter', name: '區處返總部' },
];

// 帳戶選項
const accountOptions = [
  { id: "attraction-personal", name: "吸引力個人帳戶" },
  { id: "attraction-company", name: "吸引力公司帳戶" },
  { id: "development", name: "發展處帳戶" }
];

// 週期選項
export const billingCycleOptions = [
  { id: '當月', name: '當月' },
  { id: '次月後付', name: '次月後付' },
  { id: '預儲', name: '預儲' },
];

export type PaymentRecord = {
  id: string;
  date: string;
  paymentMethod: string;
  account: string | null;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  isConfirmed: boolean;
  billingCycle: string;
  updatedAt?: string;
};

type PaymentRecordListProps = {
  customerId: string;
};

export const PaymentRecordList = ({ customerId }: PaymentRecordListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPaymentRecordOpen, setIsPaymentRecordOpen] = useState(false);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPaymentRecord, setEditingPaymentRecord] = useState<PaymentRecord | null>(null);

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
            isConfirmed: record.is_confirmed,
            billingCycle: record.billing_cycle,
            updatedAt: record.updated_at
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
          billing_cycle: newPaymentRecord.billingCycle,
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
          isConfirmed: data.is_confirmed,
          billingCycle: data.billing_cycle,
          updatedAt: data.updated_at
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

  const handleUpdatePaymentRecord = async (updatedPaymentRecord: PaymentRecord) => {
    try {
      const { data, error } = await supabase
        .from('payment_records')
        .update({
          date: updatedPaymentRecord.date,
          payment_method: updatedPaymentRecord.paymentMethod,
          account: updatedPaymentRecord.account,
          amount: updatedPaymentRecord.amount,
          tax_amount: updatedPaymentRecord.taxAmount,
          total_amount: updatedPaymentRecord.totalAmount,
          is_confirmed: updatedPaymentRecord.isConfirmed,
          billing_cycle: updatedPaymentRecord.billingCycle,
        })
        .eq('id', updatedPaymentRecord.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Update local state with updated_at from database
      if (data) {
        const formattedRecord: PaymentRecord = {
          ...updatedPaymentRecord,
          updatedAt: data.updated_at
        };
        
        setPaymentRecords(paymentRecords.map(record => 
          record.id === updatedPaymentRecord.id ? formattedRecord : record
        ));
      }
      
      setEditingPaymentRecord(null);
      setIsPaymentRecordOpen(false);
      
      toast({
        title: "付款記錄已更新",
        description: `更新了 ${updatedPaymentRecord.amount.toLocaleString()} 元的付款記錄`
      });
      
    } catch (error) {
      console.error('Error updating payment record:', error);
      toast({
        title: "更新付款記錄失敗",
        description: "請稍後再試",
        variant: "destructive"
      });
    }
  };

  const handleDeletePaymentRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('payment_records')
        .delete()
        .eq('id', recordId);
      
      if (error) throw error;
      
      // Update local state
      setPaymentRecords(paymentRecords.filter(record => record.id !== recordId));
      
      setEditingPaymentRecord(null);
      setIsPaymentRecordOpen(false);
      
      toast({
        title: "付款記錄已刪除",
        description: "付款記錄已成功刪除"
      });
      
    } catch (error) {
      console.error('Error deleting payment record:', error);
      toast({
        title: "刪除付款記錄失敗",
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

  // 獲取帳戶名稱
  const getAccountName = (accountId: string | null) => {
    if (!accountId) return "-";
    const account = accountOptions.find(a => a.id === accountId);
    return account ? account.name : accountId;
  };

  // 獲取週期名稱
  const getBillingCycleName = (cycleId: string) => {
    const cycle = billingCycleOptions.find(c => c.id === cycleId);
    return cycle ? cycle.name : cycleId;
  };

  const handleEditClick = (record: PaymentRecord) => {
    setEditingPaymentRecord(record);
    setIsPaymentRecordOpen(true);
  };

  // 格式化日期時間
  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return dateTimeString;
    }
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">付款記錄</h3>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => {
            setEditingPaymentRecord(null);
            setIsPaymentRecordOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">新增付款記錄</span>
        </Button>
      </div>
      
      {paymentRecords.length > 0 ? (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-6 py-4 font-semibold">日期</TableHead>
                  <TableHead className="px-6 py-4 font-semibold">支付方式</TableHead>
                  <TableHead className="px-6 py-4 font-semibold">帳戶</TableHead>
                  <TableHead className="px-6 py-4 font-semibold">週期</TableHead>
                  <TableHead className="px-6 py-4 text-right font-semibold">金額</TableHead>
                  <TableHead className="px-6 py-4 text-right font-semibold">稅金</TableHead>
                  <TableHead className="px-6 py-4 text-right font-semibold">總額</TableHead>
                  <TableHead className="px-6 py-4 text-center font-semibold">確認收款</TableHead>
                  <TableHead className="px-6 py-4 font-semibold min-w-[140px]">更新時間</TableHead>
                  <TableHead className="px-6 py-4 text-center font-semibold w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-gray-50/50">
                    <TableCell className="px-6 py-5 font-medium">{record.date}</TableCell>
                    <TableCell className="px-6 py-5">{getPaymentMethodName(record.paymentMethod)}</TableCell>
                    <TableCell className="px-6 py-5">{getAccountName(record.account)}</TableCell>
                    <TableCell className="px-6 py-5">{getBillingCycleName(record.billingCycle)}</TableCell>
                    <TableCell className="px-6 py-5 text-right font-medium">
                      <span className="text-blue-600">{record.amount.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">元</span>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right">
                      <span className="text-orange-600">{record.taxAmount.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">元</span>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right font-semibold">
                      <span className="text-green-600">{record.totalAmount.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">元</span>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      {record.isConfirmed ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Check className="h-4 w-4 mr-1.5" />已確認
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          未確認
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-5 text-sm text-gray-600 min-w-[140px]">
                      <div className="leading-5">
                        {record.updatedAt ? formatDateTime(record.updatedAt) : '-'}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(record)}
                        className="h-9 w-9 hover:bg-gray-100"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">編輯</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-600 mb-1">尚無付款記錄</p>
          <p className="text-sm text-gray-500">點擊右上角的 + 按鈕新增第一筆付款記錄</p>
        </div>
      )}

      <PaymentRecordDialog 
        isOpen={isPaymentRecordOpen} 
        onOpenChange={setIsPaymentRecordOpen}
        paymentRecord={editingPaymentRecord}
        onAddPaymentRecord={handleAddPaymentRecord}
        onUpdatePaymentRecord={handleUpdatePaymentRecord}
        onDeletePaymentRecord={handleDeletePaymentRecord}
      />
    </div>
  );
};
