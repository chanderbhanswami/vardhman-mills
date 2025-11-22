'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import StatsCard from '@/components/dashboard/StatsCard';
import SalesChart from '@/components/dashboard/SalesChart';

interface AnalyticsStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  totalProducts: number;
  productsGrowth: number;
  conversionRate: number;
  avgOrderValue: number;
  topProducts: Array<{
    _id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  topCategories: Array<{
    _id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  customersByMonth: Array<{
    month: string;
    newCustomers: number;
    returningCustomers: number;
  }>;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AnalyticsStats>({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    ordersGrowth: 0,
    totalCustomers: 0,
    customersGrowth: 0,
    totalProducts: 0,
    productsGrowth: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    topProducts: [],
    topCategories: [],
    salesByMonth: [],
    customersByMonth: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // Last 30 days

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]); // fetchAnalytics is stable due to useCallback

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-description">
            Track your business performance and insights
          </p>
        </div>
        <div className="page-actions">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            title="Select date range"
            className="input"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={CurrencyDollarIcon}
          loading={loading}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={ShoppingBagIcon}
          loading={loading}
        />
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={UserGroupIcon}
          loading={loading}
        />
        <StatsCard
          title="Average Order Value"
          value={formatCurrency(stats.avgOrderValue)}
          icon={ChartBarIcon}
          loading={loading}
        />
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue Growth</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(stats.revenueGrowth)}
                </p>
                {stats.revenueGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Orders Growth</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(stats.ordersGrowth)}
                </p>
                {stats.ordersGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customer Growth</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(stats.customersGrowth)}
                </p>
                {stats.customersGrowth >= 0 ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesChart />
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stats.topProducts.slice(0, 5).map((product, index) => (
                <div key={product._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-semibold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stats.topCategories.slice(0, 5).map((category, index) => (
                <div key={category._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-800 font-semibold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.sales} sales</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(category.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Products</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.totalProducts.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Products Growth</span>
              <span className={`text-sm font-medium ${
                stats.productsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(stats.productsGrowth)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Order Value</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(stats.avgOrderValue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.conversionRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
