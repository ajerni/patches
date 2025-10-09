import { requireAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import { PatchManagement } from '@/components/admin/PatchManagement';

export default async function AdminPatchesPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Patch Management</h1>
              <p className="text-gray-600 mt-2">Manage and moderate all patches in the system</p>
            </div>
            <a
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
        
        <PatchManagement />
      </div>
    </div>
  );
}
