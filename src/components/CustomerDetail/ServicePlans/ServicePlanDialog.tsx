
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ServicePlanItem, serviceItems } from "./ServicePlanList";

type ServicePlanDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddServicePlan: (servicePlan: ServicePlanItem) => void;
};

export const ServicePlanDialog = ({ 
  isOpen, 
  onOpenChange, 
  onAddServicePlan 
}: ServicePlanDialogProps) => {
  const [selectedService, setSelectedService] = useState(serviceItems[0].id);
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');

  const handleAddServicePlan = () => {
    if (selectedService && servicePrice) {
      const selectedServiceItem = serviceItems.find(item => item.id === selectedService);
      
      if (selectedServiceItem) {
        const newServicePlan: ServicePlanItem = {
          id: `${Date.now()}`,
          name: selectedServiceItem.name,
          description: serviceDescription,
          price: Number(servicePrice)
        };
        
        onAddServicePlan(newServicePlan);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setSelectedService(serviceItems[0].id);
    setServicePrice('');
    setServiceDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增服務方案</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-2">服務項目</label>
            <select 
              className="w-full border border-gray-300 rounded-md p-2"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              {serviceItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-500 block mb-2">文字描述</label>
            <Textarea 
              placeholder="請輸入服務描述"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              className="min-h-24"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-500 block mb-2">價格</label>
            <Input 
              placeholder="請輸入價格"
              type="number"
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleAddServicePlan}>
            新增
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
