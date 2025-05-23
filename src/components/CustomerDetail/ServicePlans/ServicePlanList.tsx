import { useState, useEffect } from "react";
import { Plus, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ServiceSelectionDialog } from "./ServiceSelectionDialog";
import { AdvertisingSelectionDialog } from "./AdvertisingSelectionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ServicePlanItem = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export type AdvertisingPlanItem = {
  id: string;
  platform: string;
  paymentMethod: string;
  details: {
    serviceFeePercentage?: string;
    prepaidAmount?: string;
    placementLimit?: string;
  };
};

export const serviceItems = [
  { id: '1v1', name: '1v1 輔導' },
  { id: 'social', name: '社群代操' },
  { id: 'advert', name: '廣告監測及回報' },
  { id: 'custom', name: '客製化店家方案' },
  { id: 'special', name: '特別專案' },
  { id: 'video', name: '影音拍攝' },
  { id: 'bos', name: 'BOS系統' },
  { id: 'reputation', name: '口碑行銷' },
];

export const advertisingPlatforms = [
  { id: 'meta', name: 'Meta' },
  { id: 'google', name: 'Google' },
];

export const paymentMethods = [
  { id: 'monthly', name: '次月算上月' },
  { id: 'prepaid-deduct', name: '預收內扣' },
  { id: 'prepaid-plus', name: '預收外+%' },
];

type ServicePlanListProps = {
  customerId?: string;
};

export const ServicePlanList = ({ customerId }: ServicePlanListProps) => {
  const { user } = useAuth();
  const [servicePlans, setServicePlans] = useState<ServicePlanItem[]>([]);
  const [advertisingPlans, setAdvertisingPlans] = useState<AdvertisingPlanItem[]>([]);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [editingDescriptionId, setEditingDescriptionId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 從資料庫讀取資料
  useEffect(() => {
    if (customerId && user) {
      fetchServicePlans();
      fetchAdvertisingPlans();
    } else {
      setServicePlans([]);
      setAdvertisingPlans([]);
      setLoading(false);
    }
  }, [customerId, user]);

  const fetchServicePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('service_plans')
        .select('*')
        .eq('customer_id', customerId);
      
      if (error) throw error;
      
      const formattedData: ServicePlanItem[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.price
      }));
      
      setServicePlans(formattedData);
    } catch (error) {
      console.error("Error fetching service plans:", error);
      toast.error("無法讀取服務項目資料");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvertisingPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('advertising_plans')
        .select('*')
        .eq('customer_id', customerId);
      
      if (error) throw error;
      
      const formattedData: AdvertisingPlanItem[] = data.map(item => ({
        id: item.id,
        platform: item.platform,
        paymentMethod: item.payment_method,
        details: {
          serviceFeePercentage: item.service_fee_percentage || undefined,
          prepaidAmount: item.prepaid_amount || undefined,
          placementLimit: item.placement_limit || undefined
        }
      }));
      
      setAdvertisingPlans(formattedData);
    } catch (error) {
      console.error("Error fetching advertising plans:", error);
      toast.error("無法讀取廣告投放資料");
    }
  };

  const handleServiceFromDialog = async (serviceId: string) => {
    if (!customerId || !user) {
      toast.error("請先選擇客戶");
      return;
    }

    const serviceItem = serviceItems.find(item => item.id === serviceId);
    if (!serviceItem) return;

    try {
      // 新增服務項目到資料庫
      const { data, error } = await supabase
        .from('service_plans')
        .insert({
          customer_id: customerId,
          name: serviceItem.name,
          description: "",
          price: 0,
          user_id: user.id
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newServicePlan: ServicePlanItem = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description || "",
          price: data[0].price
        };
        
        setServicePlans(prev => [...prev, newServicePlan]);
        toast.success("成功新增服務項目");
      }
    } catch (error) {
      console.error("Error adding service plan:", error);
      toast.error("新增服務項目失敗");
    }
  };

  const handleAdvertisingFromDialog = async (platformId: string, paymentMethodId: string, formData?: any) => {
    if (!customerId || !user) {
      toast.error("請先選擇客戶");
      return;
    }

    const platformItem = advertisingPlatforms.find(item => item.id === platformId);
    const paymentItem = paymentMethods.find(item => item.id === paymentMethodId);
    if (!platformItem || !paymentItem) return;
    
    try {
      // 新增廣告投放到資料庫
      const { data, error } = await supabase
        .from('advertising_plans')
        .insert({
          customer_id: customerId,
          platform: platformItem.name,
          payment_method: paymentItem.name,
          service_fee_percentage: formData?.serviceFeePercentage || null,
          prepaid_amount: formData?.prepaidAmount || null,
          placement_limit: formData?.placementLimit || null,
          user_id: user.id
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newAdvertisingPlan: AdvertisingPlanItem = {
          id: data[0].id,
          platform: data[0].platform,
          paymentMethod: data[0].payment_method,
          details: {
            serviceFeePercentage: data[0].service_fee_percentage || undefined,
            prepaidAmount: data[0].prepaid_amount || undefined,
            placementLimit: data[0].placement_limit || undefined,
          }
        };
        
        // 替換任何現有廣告計劃
        setAdvertisingPlans([newAdvertisingPlan]);
        toast.success("成功新增廣告投放");
      }
    } catch (error) {
      console.error("Error adding advertising plan:", error);
      toast.error("新增廣告投放失敗");
    }
  };

  const handleEditPrice = (id: string, currentPrice: number) => {
    setEditingPriceId(id);
    setEditingPrice(currentPrice.toString());
  };

  const handleSavePrice = async (id: string) => {
    const newPrice = parseFloat(editingPrice);
    if (!isNaN(newPrice) && newPrice >= 0) {
      try {
        // 更新價格到資料庫
        const { error } = await supabase
          .from('service_plans')
          .update({ price: newPrice, updated_at: new Date().toISOString() })
          .eq('id', id);
        
        if (error) throw error;
        
        setServicePlans(prev => 
          prev.map(plan => 
            plan.id === id ? { ...plan, price: newPrice } : plan
          )
        );
        toast.success("價格已更新");
      } catch (error) {
        console.error("Error updating price:", error);
        toast.error("更新價格失敗");
      }
    }
    setEditingPriceId(null);
    setEditingPrice("");
  };

  const handleCancelEdit = () => {
    setEditingPriceId(null);
    setEditingPrice("");
    setEditingDescriptionId(null);
    setEditingDescription("");
  };

  const handleEditDescription = (id: string, currentDescription: string) => {
    setEditingDescriptionId(id);
    setEditingDescription(currentDescription || "");
  };

  const handleSaveDescription = async (id: string) => {
    try {
      // 更新描述到資料庫
      const { error } = await supabase
        .from('service_plans')
        .update({ description: editingDescription, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      setServicePlans(prev => 
        prev.map(plan => 
          plan.id === id ? { ...plan, description: editingDescription } : plan
        )
      );
      toast.success("描述已更新");
    } catch (error) {
      console.error("Error updating description:", error);
      toast.error("更新描述失敗");
    }
    setEditingDescriptionId(null);
    setEditingDescription("");
  };

  const handleRemoveService = async (id: string) => {
    try {
      // 從資料庫刪除服務項目
      const { error } = await supabase
        .from('service_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setServicePlans(prev => prev.filter(plan => plan.id !== id));
      toast.success("服務項目已刪除");
    } catch (error) {
      console.error("Error removing service plan:", error);
      toast.error("刪除服務項目失敗");
    }
  };

  const handleRemoveAdvertising = async (id: string) => {
    try {
      // 從資料庫刪除廣告投放
      const { error } = await supabase
        .from('advertising_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAdvertisingPlans([]);
      toast.success("廣告投放已刪除");
    } catch (error) {
      console.error("Error removing advertising plan:", error);
      toast.error("刪除廣告投放失敗");
    }
  };
  
  // 根據付款方式渲染廣告詳細資訊
  const renderAdvertisingDetails = (plan: AdvertisingPlanItem) => {
    if (plan.paymentMethod === "次月算上月" && plan.details.serviceFeePercentage) {
      return `服務費: ${plan.details.serviceFeePercentage}%`;
    }
    
    if (plan.paymentMethod === "預收內扣" && plan.details.prepaidAmount && plan.details.placementLimit) {
      return `預收: ${parseFloat(plan.details.prepaidAmount).toLocaleString()} / 上限: ${parseFloat(plan.details.placementLimit).toLocaleString()}`;
    }
    
    if (plan.paymentMethod === "預收外+%" && plan.details.prepaidAmount && plan.details.serviceFeePercentage) {
      return `預收: ${parseFloat(plan.details.prepaidAmount).toLocaleString()} / 服務費: ${plan.details.serviceFeePercentage}%`;
    }
    
    return "";
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-500">載入中...</div>;
  }

  return (
    <div className="space-y-8">
      {/* 第一區塊：服務項目 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">服務項目</h3>
          <ServiceSelectionDialog onSelectService={handleServiceFromDialog} />
        </div>

        {/* 下方項目列表 */}
        {servicePlans.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>服務項目</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead className="text-right">價格 (元)</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicePlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      {editingDescriptionId === plan.id ? (
                        <div className="flex items-center gap-2">
                          <Textarea
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            className="min-h-[60px] resize-none"
                            placeholder="請輸入描述"
                            autoFocus
                          />
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveDescription(plan.id)}
                              className="p-1 h-8 w-8"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="p-1 h-8 w-8"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 group">
                          <span className="text-gray-600 flex-1 min-h-[20px]">
                            {plan.description || "無描述"}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditDescription(plan.id, plan.description)}
                            className="p-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingPriceId === plan.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                            className="w-24 text-right"
                            min="0"
                            step="0.01"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSavePrice(plan.id)}
                            className="p-1 h-8 w-8"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="p-1 h-8 w-8"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span>{plan.price.toLocaleString()}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditPrice(plan.id, plan.price)}
                            className="p-1 h-8 w-8"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveService(plan.id)}
                        className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 border rounded-md">
            點擊右上角 + 按鈕新增服務項目
          </div>
        )}
      </div>

      {/* 第二區塊：廣告投放 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">廣告投放</h3>
          <AdvertisingSelectionDialog 
            onSelectAdvertising={handleAdvertisingFromDialog} 
            disabled={advertisingPlans.length > 0}
          />
        </div>

        {/* 下方項目列表 */}
        {advertisingPlans.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>投放平台</TableHead>
                  <TableHead>付款方式</TableHead>
                  <TableHead>詳細資訊</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advertisingPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.platform}</TableCell>
                    <TableCell>{plan.paymentMethod}</TableCell>
                    <TableCell>{renderAdvertisingDetails(plan)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveAdvertising(plan.id)}
                        className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 border rounded-md">
            點擊右上角 + 按鈕新增廣告投放項目
          </div>
        )}
      </div>
    </div>
  );
};
