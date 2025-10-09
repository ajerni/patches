import { requireAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import { UserManagement } from '@/components/admin/UserManagement';

export default async function AdminUsersPage() {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/dashboard?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage user accounts and monitor activity</p>
            </div>
            <a
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
        
        <UserManagement />
      </div>
    </div>
  );
}
