import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { advertisingPlatforms, paymentMethods } from "./ServicePlanList";

type AdvertisingSelectionDialogProps = {
  onSelectAdvertising: (platformId: string, paymentMethodId: string, formData?: any) => void;
  disabled?: boolean;
};

export const AdvertisingSelectionDialog = ({ 
  onSelectAdvertising, 
  disabled = false 
}: AdvertisingSelectionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [formData, setFormData] = useState({
    serviceFeePercentage: "",
    prepaidAmount: "",
    placementLimit: ""
  });

  const handleAdvertisingSelect = () => {
    if (!selectedPlatform || !selectedPaymentMethod) return;
    
    onSelectAdvertising(selectedPlatform, selectedPaymentMethod, formData);
    setIsOpen(false);
    setSelectedPlatform("");
    setSelectedPaymentMethod("");
    setFormData({
      serviceFeePercentage: "",
      prepaidAmount: "",
      placementLimit: ""
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderConditionalInputs = () => {
    switch (selectedPaymentMethod) {
      case 'monthly':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="serviceFee">服務費%</Label>
              <Input
                id="serviceFee"
                type="number"
                placeholder="請輸入服務費百分比"
                value={formData.serviceFeePercentage}
                onChange={(e) => handleInputChange('serviceFeePercentage', e.target.value)}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
        );
      case 'prepaid-deduct':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="prepaidAmount">預收金額</Label>
              <Input
                id="prepaidAmount"
                type="number"
                placeholder="請輸入預收金額"
                value={formData.prepaidAmount}
                onChange={(e) => handleInputChange('prepaidAmount', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="placementLimit">投放上限</Label>
              <Input
                id="placementLimit"
                type="number"
                placeholder="請輸入投放上限"
                value={formData.placementLimit}
                onChange={(e) => handleInputChange('placementLimit', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        );
      case 'prepaid-plus':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="prepaidAmount">預收金額</Label>
              <Input
                id="prepaidAmount"
                type="number"
                placeholder="請輸入預收金額"
                value={formData.prepaidAmount}
                onChange={(e) => handleInputChange('prepaidAmount', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="serviceFee">服務費%</Label>
              <Input
                id="serviceFee"
                type="number"
                placeholder="請輸入服務費百分比"
                value={formData.serviceFeePercentage}
                onChange={(e) => handleInputChange('serviceFeePercentage', e.target.value)}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isFormValid = () => {
    if (!selectedPlatform || !selectedPaymentMethod) return false;
    
    switch (selectedPaymentMethod) {
      case 'monthly':
        return formData.serviceFeePercentage !== "";
      case 'prepaid-deduct':
        return formData.prepaidAmount !== "" && formData.placementLimit !== "";
      case 'prepaid-plus':
        return formData.prepaidAmount !== "" && formData.serviceFeePercentage !== "";
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 w-8 p-0" disabled={disabled}>
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>選擇廣告投放</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">選擇投放平台</h3>
            <div className="grid grid-cols-2 gap-3">
              {advertisingPlatforms.map((platform) => (
                <Card 
                  key={platform.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedPlatform === platform.id 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPlatform(platform.id)}
                >
                  <CardContent className="p-3 text-center">
                    <h4 className="font-medium text-gray-900">{platform.name}</h4>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {selectedPlatform && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">選擇付款方式</h3>
              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((method) => (
                  <Card 
                    key={method.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <CardContent className="p-3">
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedPaymentMethod && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">填寫相關資訊</h3>
              {renderConditionalInputs()}
            </div>
          )}

          {selectedPaymentMethod && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                取消
              </Button>
              <Button 
                onClick={handleAdvertisingSelect}
                disabled={!isFormValid()}
              >
                確認新增
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
