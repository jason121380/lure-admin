
import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DepartmentStats {
  department: string;
  departmentName: string;
  count: number;
}

export const CustomerManagementPage = () => {
  const { user } = useAuth();
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [uncategorizedCount, setUncategorizedCount] = useState(0);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Get total customers
      const { count: total } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      setTotalCustomers(total || 0);

      // Get uncategorized customers (assuming null or empty department)
      const { count: uncategorized } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .or('department.is.null,department.eq.');

      setUncategorizedCount(uncategorized || 0);

      // Get department statistics
      const { data: departments } = await supabase
        .from('customers')
        .select('department, department_name')
        .not('department', 'is', null)
        .neq('department', '');

      if (departments) {
        const stats = departments.reduce((acc: Record<string, DepartmentStats>, customer) => {
          const key = customer.department;
          if (!acc[key]) {
            acc[key] = {
              department: customer.department,
              departmentName: customer.department_name || customer.department,
              count: 0
            };
          }
          acc[key].count++;
          return acc;
        }, {});

        setDepartmentStats(Object.values(stats));
      }
    } catch (error) {
      toast.error('無法載入統計資料');
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">客戶管理</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">所有客戶</h3>
                <p className="text-2xl font-bold text-blue-600">({totalCustomers})</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">未分類</h3>
                <p className="text-2xl font-bold text-gray-600">({uncategorizedCount})</p>
              </div>
            </div>
          </div>
        </div>

        {/* Departments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">部門</h2>
            <Button
              size="sm"
              variant="ghost"
              className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-2">
            {departmentStats.length > 0 ? (
              departmentStats.map((dept, index) => (
                <div
                  key={dept.department}
                  className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{dept.departmentName}</h3>
                    <p className="text-lg font-semibold text-gray-700">({dept.count})</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>目前沒有部門資料</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
