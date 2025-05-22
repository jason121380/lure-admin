
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ServicePlanDialog } from "./ServicePlanDialog";

export type ServicePlanItem = {
  id: string;
  name: string;
  description: string;
  price: number;
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

export const ServicePlanList = () => {
  const [isServicePlanOpen, setIsServicePlanOpen] = useState(false);
  const [servicePlans, setServicePlans] = useState<ServicePlanItem[]>([]);

  const handleAddServicePlan = (newServicePlan: ServicePlanItem) => {
    setServicePlans([...servicePlans, newServicePlan]);
    setIsServicePlanOpen(false);
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute right-3 top-3 z-10"
        onClick={() => setIsServicePlanOpen(true)}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">新增服務方案</span>
      </Button>
      
      {servicePlans.length > 0 ? (
        <div className="p-4 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>服務項目</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="text-right">價格</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicePlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
                  <TableCell className="text-right">{plan.price.toLocaleString()} 元</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-12 text-center text-gray-500 border rounded-md">
          服務方案資訊將顯示於此
        </div>
      )}

      <ServicePlanDialog 
        isOpen={isServicePlanOpen} 
        onOpenChange={setIsServicePlanOpen}
        onAddServicePlan={handleAddServicePlan}
      />
    </div>
  );
};
