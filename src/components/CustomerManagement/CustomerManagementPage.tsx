
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Clock, UserCheck } from "lucide-react";
import { MobileHeader } from "../Layout/MobileHeader";
import { Customer } from "../CustomerList/CustomerListItem";

interface CustomerManagementPageProps {
  customers: Customer[];
  onAddCustomer: () => void;
}

export const CustomerManagementPage = ({ customers, onAddCustomer }: CustomerManagementPageProps) => {
  // Calculate statistics
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const pausedCustomers = customers.filter(c => c.status === 'paused').length;
  const inactiveCustomers = customers.filter(c => c.status === 'inactive').length;
  const totalCustomers = customers.length;

  const stats = [
    {
      title: '總客戶數',
      value: totalCustomers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: '進行中',
      value: activeCustomers,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: '暫停',
      value: pausedCustomers,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    {
      title: '終止',
      value: inactiveCustomers,
      icon: UserCheck,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="客戶管理" />
      
      <div className="pt-16 pb-20 px-4">
        {/* Quick Actions */}
        <div className="mb-6">
          <Button 
            onClick={onAddCustomer}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Users className="w-5 h-5 mr-2" />
            新增客戶
          </Button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">最近活動</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customers.slice(0, 5).map((customer) => (
                <div key={customer.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer.departmentName}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    customer.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : customer.status === 'paused'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {customer.status === 'active' ? '進行中' : 
                     customer.status === 'paused' ? '暫停' : '終止'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
