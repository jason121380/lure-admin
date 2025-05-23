
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
import { advertisingPlatforms, paymentMethods } from "./ServicePlanList";

type AdvertisingSelectionDialogProps = {
  onSelectAdvertising: (platformId: string, paymentMethodId: string) => void;
};

export const AdvertisingSelectionDialog = ({ onSelectAdvertising }: AdvertisingSelectionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  const handleAdvertisingSelect = (platformId: string, paymentMethodId: string) => {
    onSelectAdvertising(platformId, paymentMethodId);
    setIsOpen(false);
    setSelectedPlatform("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
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
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleAdvertisingSelect(selectedPlatform, method.id)}
                  >
                    <CardContent className="p-3">
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
