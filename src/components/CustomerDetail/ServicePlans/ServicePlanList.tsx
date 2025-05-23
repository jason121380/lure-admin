
import { useState } from "react";
import { Plus, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServiceSelectionDialog } from "./ServiceSelectionDialog";

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
  amount: number;
};

export const serviceItems = [
  { id: '1v1', name: '1v1 輔導' },
  { id: 'social', name: '社群代操' },
  { id: 'advert', name: '廣告監測及回報' },
  { id: 'custom', name: '客製化店家方案' },
  { id: 'special', name: '特別專案' },
  { id: 'video', name: '影音拍攝' },
  { id: 'bos', name: 'BOS系統' },
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

export const ServicePlanList = () => {
  const [servicePlans, setServicePlans] = useState<ServicePlanItem[]>([]);
  const [advertisingPlans, setAdvertisingPlans] = useState<AdvertisingPlanItem[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>("");

  const handleServiceFromDialog = (serviceId: string) => {
    const serviceItem = serviceItems.find(item => item.id === serviceId);
    if (!serviceItem) return;

    const newServicePlan: ServicePlanItem = {
      id: `service-${Date.now()}`,
      name: serviceItem.name,
      description: "",
      price: 0
    };
    
    setServicePlans([...servicePlans, newServicePlan]);
  };

  const handleAddAdvertising = () => {
    if (!selectedPlatform || !selectedPaymentMethod) return;
    
    const platformItem = advertisingPlatforms.find(item => item.id === selectedPlatform);
    const paymentItem = paymentMethods.find(item => item.id === selectedPaymentMethod);
    if (!platformItem || !paymentItem) return;

    const newAdvertisingPlan: AdvertisingPlanItem = {
      id: `ad-${Date.now()}`,
      platform: platformItem.name,
      paymentMethod: paymentItem.name,
      amount: 0
    };
    
    setAdvertisingPlans([...advertisingPlans, newAdvertisingPlan]);
    setSelectedPlatform("");
    setSelectedPaymentMethod("");
  };

  const handleEditPrice = (id: string, currentPrice: number) => {
    setEditingPriceId(id);
    setEditingPrice(currentPrice.toString());
  };

  const handleSavePrice = (id: string) => {
    const newPrice = parseFloat(editingPrice);
    if (!isNaN(newPrice) && newPrice >= 0) {
      setServicePlans(prev => 
        prev.map(plan => 
          plan.id === id ? { ...plan, price: newPrice } : plan
        )
      );
    }
    setEditingPriceId(null);
    setEditingPrice("");
  };

  const handleEditAmount = (id: string, currentAmount: number) => {
    setEditingAmountId(id);
    setEditingAmount(currentAmount.toString());
  };

  const handleSaveAmount = (id: string) => {
    const newAmount = parseFloat(editingAmount);
    if (!isNaN(newAmount) && newAmount >= 0) {
      setAdvertisingPlans(prev => 
        prev.map(plan => 
          plan.id === id ? { ...plan, amount: newAmount } : plan
        )
      );
    }
    setEditingAmountId(null);
    setEditingAmount("");
  };

  const handleCancelEdit = () => {
    setEditingPriceId(null);
    setEditingPrice("");
    setEditingAmountId(null);
    setEditingAmount("");
  };

  const handleRemoveService = (id: string) => {
    setServicePlans(prev => prev.filter(plan => plan.id !== id));
  };

  const handleRemoveAdvertising = (id: string) => {
    setAdvertisingPlans(prev => prev.filter(plan => plan.id !== id));
  };

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
                  <TableHead className="text-right">價格 (元)</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicePlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
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
        <h3 className="text-lg font-semibold text-gray-900">廣告投放</h3>
        
        {/* 上方菜單選擇 */}
        <div className="flex items-center gap-4 p-4 border rounded-md bg-blue-50">
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-2">平台選擇</label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="請選擇投放平台" />
              </SelectTrigger>
              <SelectContent>
                {advertisingPlatforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-2">付款方式</label>
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="請選擇付款方式" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleAddAdvertising}
            disabled={!selectedPlatform || !selectedPaymentMethod}
            className="mt-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增廣告
          </Button>
        </div>

        {/* 下方項目列表 */}
        {advertisingPlans.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>投放平台</TableHead>
                  <TableHead>付款方式</TableHead>
                  <TableHead className="text-right">金額 (元)</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advertisingPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.platform}</TableCell>
                    <TableCell>{plan.paymentMethod}</TableCell>
                    <TableCell className="text-right">
                      {editingAmountId === plan.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            type="number"
                            value={editingAmount}
                            onChange={(e) => setEditingAmount(e.target.value)}
                            className="w-24 text-right"
                            min="0"
                            step="0.01"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSaveAmount(plan.id)}
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
                          <span>{plan.amount.toLocaleString()}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditAmount(plan.id, plan.amount)}
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
            請從上方選擇平台和付款方式並新增廣告投放項目
          </div>
        )}
      </div>
    </div>
  );
};
