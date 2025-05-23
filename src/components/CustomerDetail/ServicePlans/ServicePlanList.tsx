
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
  const [servicePlans, setServicePlans] = useState<ServicePlanItem[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>("");

  const handleAddService = () => {
    if (!selectedService) return;
    
    const serviceItem = serviceItems.find(item => item.id === selectedService);
    if (!serviceItem) return;

    const newServicePlan: ServicePlanItem = {
      id: `${Date.now()}`,
      name: serviceItem.name,
      description: "",
      price: 0
    };
    
    setServicePlans([...servicePlans, newServicePlan]);
    setSelectedService("");
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

  const handleCancelEdit = () => {
    setEditingPriceId(null);
    setEditingPrice("");
  };

  const handleRemoveService = (id: string) => {
    setServicePlans(prev => prev.filter(plan => plan.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* 上方菜單選擇 */}
      <div className="flex items-center gap-4 p-4 border rounded-md bg-gray-50">
        <div className="flex-1">
          <label className="text-sm text-gray-600 block mb-2">選擇服務項目</label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="請選擇服務項目" />
            </SelectTrigger>
            <SelectContent>
              {serviceItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleAddService}
          disabled={!selectedService}
          className="mt-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增服務
        </Button>
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
          請從上方選擇並新增服務項目
        </div>
      )}
    </div>
  );
};
