'use client';

import { useState, useEffect } from 'react';
import { Users, FileText, Package, Heart, Eye, EyeOff, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalPatches: number;
  totalModules: number;
  recentUsers: number;
  recentPatchesCount: number;
  recentModulesCount: number;
  publicPatches: number;
  privatePatches: number;
  totalLikes: number;
  averageLikesPerPatch: number;
  recentPatches: Array<{
    id: string;
    title: string;
    private: boolean;
    createdAt: string;
    likeCount: number;
    user: { name: string; email: string };
    _count: { patchModules: number; likes: number };
  }>;
  recentModules: Array<{
    id: string;
    name: string;
    manufacturer: string;
    types: string[];
    createdAt: string;
    user: { name: string; email: string };
    _count: { patchModules: number };
  }>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required');
        } else if (response.status === 403) {
          setError('Admin access required');
        } else {
          setError('Failed to load statistics');
        }
        return;
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchStats}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: stats.recentUsers,
      changeLabel: 'new this week'
    },
    {
      title: 'Total Patches',
      value: stats.totalPatches,
      icon: FileText,
      color: 'bg-green-500',
      change: stats.recentPatchesCount,
      changeLabel: 'new this week'
    },
    {
      title: 'Total Modules',
      value: stats.totalModules,
      icon: Package,
      color: 'bg-purple-500',
      change: stats.recentModulesCount,
      changeLabel: 'new this week'
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes,
      icon: Heart,
      color: 'bg-red-500',
      change: stats.averageLikesPerPatch,
      changeLabel: 'avg per patch'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                {stat.change !== null && (
                  <p className="text-sm text-gray-500 mt-1">
                    {stat.change} {stat.changeLabel}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Patch Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patch Visibility</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">Public Patches</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.publicPatches}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <EyeOff className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Private Patches</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.privatePatches}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ 
                  width: `${stats.totalPatches > 0 ? (stats.publicPatches / stats.totalPatches) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {stats.totalPatches > 0 ? Math.round((stats.publicPatches / stats.totalPatches) * 100) : 0}% of patches are public
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link 
              href="/admin/users"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              <Users className="h-5 w-5 text-blue-500 mr-3" />
              <span className="text-gray-700">Manage Users ({stats.totalUsers})</span>
            </Link>
            <Link 
              href="/admin/patches"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              <FileText className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-gray-700">Manage Patches ({stats.totalPatches})</span>
            </Link>
            <Link 
              href="/admin/modules"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              <Package className="h-5 w-5 text-purple-500 mr-3" />
              <span className="text-gray-700">Manage Modules ({stats.totalModules})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Patches */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Patches</h3>
          <Link 
            href="/admin/patches"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {stats.recentPatches && stats.recentPatches.length > 0 ? (
            stats.recentPatches.map((patch) => (
              <div key={patch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{patch.title}</p>
                      {patch.private ? (
                        <EyeOff className="h-3 w-3 text-gray-400" title="Private" />
                      ) : (
                        <Eye className="h-3 w-3 text-green-500" title="Public" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">by {patch.user.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(patch.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Heart className="h-3 w-3" />
                    {patch.likeCount}
                    <Package className="h-3 w-3 ml-1" />
                    {patch._count.patchModules}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent patches found</p>
          )}
        </div>
      </div>

      {/* Recent Modules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Modules</h3>
          <Link 
            href="/admin/modules"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {stats.recentModules && stats.recentModules.length > 0 ? (
            stats.recentModules.map((module) => (
              <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{module.name}</p>
                    <p className="text-xs text-gray-500">
                      {module.manufacturer} • by {module.user.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(module.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Package className="h-3 w-3" />
                    {module._count.patchModules} uses
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent modules found</p>
          )}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{stats.recentUsers} new users</p>
              <p className="text-sm text-gray-500">in the last 7 days</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{stats.recentPatchesCount} new patches</p>
              <p className="text-sm text-gray-500">in the last 7 days</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{stats.recentModulesCount} new modules</p>
              <p className="text-sm text-gray-500">in the last 7 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
