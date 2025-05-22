
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "../CustomerList/CustomerListItem";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { PaymentRecordList } from "./PaymentRecords/PaymentRecordList";

type CustomerDetailProps = {
  customer: Customer | null;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
};

export function CustomerDetail({ customer, onEditCustomer, onDeleteCustomer }: CustomerDetailProps) {
  if (!customer) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>請選擇一個客戶來查看詳細資訊</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium">{customer.name}</h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onClick={() => onDeleteCustomer(customer.id)}
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              刪除客戶
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-4 grid grid-cols-2 w-full">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="payments">付款記錄</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="p-4 bg-white border rounded-md">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 block">客戶名稱</label>
                <div>{customer.name}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">聯絡人</label>
                <div>{customer.contact || "-"}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">電子郵件</label>
                <div>{customer.email || "-"}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">地址</label>
                <div>{customer.address || "-"}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">建立日期</label>
                <div>{new Date(customer.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 block">狀態</label>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full bg-status-${customer.status}`}></span>
                  <span>
                    {customer.status === 'active' ? '進行中' : 
                     customer.status === 'paused' ? '暫停' : '不活躍'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">電話</label>
                <div>{customer.phone || "-"}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">部門</label>
                <div>{customer.departmentName}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 block">統一編號</label>
                <div>{customer.taxId || "-"}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="text-sm text-gray-500 block">備註</label>
            <div className="p-4 border rounded-md bg-gray-50 min-h-24">
              {customer.notes || "無備註資訊"}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => onEditCustomer(customer)}
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              編輯資訊
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="payments">
          <PaymentRecordList customerId={customer.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
