
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
import { serviceItems } from "./ServicePlanList";

type ServiceSelectionDialogProps = {
  onSelectService: (serviceId: string) => void;
};

export const ServiceSelectionDialog = ({ onSelectService }: ServiceSelectionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleServiceSelect = (serviceId: string) => {
    onSelectService(serviceId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center justify-center w-8 h-8 p-0 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Plus className="h-4 w-4 text-gray-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>選擇服務項目</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4">
          {serviceItems.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleServiceSelect(item.id)}
            >
              <CardContent className="p-4 text-center">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
