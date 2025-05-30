import { useState, useEffect } from "react";
import { Plus, Check, Pencil, Columns2 } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">付款記錄</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            title={viewMode === 'table' ? '切換到卡片視圖' : '切換到表格視圖'}
          >
            <Columns2 className="h-4 w-4" />
            <span className="sr-only">切換視圖</span>
          </Button>
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
      </div>
      
      {paymentRecords.length > 0 ? (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {paymentRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-lg">{record.date}</h4>
                      {record.isConfirmed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />已確認
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          未確認
                        </span>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditClick(record)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">編輯</span>
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">支付方式:</span>
                      <span className="text-sm font-medium">{getPaymentMethodName(record.paymentMethod)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">帳戶:</span>
                      <span className="text-sm">{getAccountName(record.account)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">週期:</span>
                      <span className="text-sm">{getBillingCycleName(record.billingCycle)}</span>
                    </div>
                    
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">金額:</span>
                        <span className="text-sm font-medium">{record.amount.toLocaleString()} 元</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">稅金:</span>
                        <span className="text-sm">{record.taxAmount.toLocaleString()} 元</span>
                      </div>
                      
                      <div className="flex justify-between font-medium">
                        <span className="text-sm">總額:</span>
                        <span className="text-sm text-blue-600">{record.totalAmount.toLocaleString()} 元</span>
                      </div>
                    </div>
                    
                    {record.updatedAt && (
                      <div className="flex justify-between pt-1 border-t">
                        <span className="text-xs text-gray-500">更新時間:</span>
                        <span className="text-xs text-gray-500">{formatDateTime(record.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日期</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>帳戶</TableHead>
                    <TableHead>週期</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead className="text-right">稅金</TableHead>
                    <TableHead className="text-right">總額</TableHead>
                    <TableHead className="text-center">確認收款</TableHead>
                    <TableHead>更新時間</TableHead>
                    <TableHead className="text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{getPaymentMethodName(record.paymentMethod)}</TableCell>
                      <TableCell>{getAccountName(record.account)}</TableCell>
                      <TableCell>{getBillingCycleName(record.billingCycle)}</TableCell>
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
                      <TableCell className="text-sm text-gray-500">
                        {record.updatedAt ? formatDateTime(record.updatedAt) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditClick(record)}
                          className="h-8 w-8"
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
          )}
        </>
      ) : (
        <div className="p-12 text-center text-gray-500 border rounded-md">
          付款記錄將顯示於此
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
