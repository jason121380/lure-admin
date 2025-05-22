
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Customer } from "../CustomerList/CustomerListItem";

type CustomerEditDialogProps = {
  customer?: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (customer: Partial<Customer>) => void;
};

export function CustomerEditDialog({ 
  customer, 
  open, 
  onOpenChange,
  onSave
}: CustomerEditDialogProps) {
  const isEditing = !!customer;
  
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || {
      name: "",
      department: "uncategorized",
      departmentName: "Uncategorized",
      status: "active",
      email: "",
      phone: "",
      address: "",
      contact: "",
      notes: "",
    }
  );
  
  const handleChange = (field: keyof Customer, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
      ...(field === 'department' && {
        departmentName: getDepartmentName(value)
      })
    });
  };
  
  const getDepartmentName = (departmentId: string): string => {
    const departments = {
      internal: "Internal Development",
      external: "External Development",
      digital: "Digital",
      alfred: "Alfred",
      jason: "Jason",
      uncategorized: "Uncategorized"
    };
    
    return departments[departmentId as keyof typeof departments] || "Uncategorized";
  };
  
  const handleSubmit = () => {
    onSave(formData);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your customer's information below"
              : "Fill in the details for your new customer"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => handleChange("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal Development</SelectItem>
                  <SelectItem value="external">External Development</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="alfred">Alfred</SelectItem>
                  <SelectItem value="jason">Jason</SelectItem>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">In Progress</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="contact">Contact Person</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => handleChange("contact", e.target.value)}
              placeholder="Contact person name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Email address"
                type="email"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Business address"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional information"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Add Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
