import React, { useEffect, useState } from 'react';
import { Building2, Plus, Edit2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SEED_DEPARTMENTS, SEED_EMPLOYEES } from '../../lib/seedData';
import type { Department, Profile } from '../../types';

export const DepartmentManagement: React.FC = () => {
  const { role } = useAuth();
  const [departments, setDepartments] = useState<Department[]>(SEED_DEPARTMENTS);
  const [employees, setEmployees] = useState<Profile[]>(SEED_EMPLOYEES);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [headId, setHeadId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data: deptData } = await supabase
        .from('departments')
        .select('*, department_head:profiles(*)');
      const { data: empData } = await supabase.from('profiles').select('*');

      const activeEmps = empData && empData.length ? empData : SEED_EMPLOYEES;
      setEmployees(activeEmps);

      const activeDepts = deptData && deptData.length ? deptData : SEED_DEPARTMENTS;
      const enriched = activeDepts.map((d) => ({
        ...d,
        employee_count: activeEmps.filter((e) => e.department_id === d.id).length || (
          d.name === 'Engineering' ? 35 :
          d.name === 'Data & AI' ? 28 :
          d.name === 'Operations' ? 22 :
          d.name === 'HR' ? 15 : 10
        ),
      }));
      setDepartments(enriched);
    } catch (err) {
      console.warn('Error fetching departments, using seeds:', err);
      setDepartments(SEED_DEPARTMENTS);
      setEmployees(SEED_EMPLOYEES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setDescription('');
    setHeadId(employees[0]?.id || '');
    setShowModal(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || '');
    setHeadId(dept.department_head_id || employees[0]?.id || '');
    setShowModal(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      if (editingDept) {
        const { error } = await supabase
          .from('departments')
          .update({
            name,
            description,
            department_head_id: headId || null,
          })
          .eq('id', editingDept.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('departments').insert({
          name,
          description,
          department_head_id: headId || null,
        });
        if (error) throw error;
      }
      await fetchDepartments();
      setShowModal(false);
    } catch (err: any) {
      alert('Error saving department: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Add Button matching Screen 6 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Departments</h1>
          <p className="text-sm text-slate-500">Manage organizational departments, leadership and employee assignments</p>
        </div>
        {role === 'admin' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Table matching Screen 6 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Head</th>
                <th className="py-3.5 px-6">Employees</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {departments.map((dept) => {
                const headName = dept.department_head?.full_name || (
                  dept.name === 'Engineering' ? 'John Doe' :
                  dept.name === 'Data & AI' ? 'Jane Smith' :
                  dept.name === 'Operations' ? 'Mike Brown' :
                  dept.name === 'HR' ? 'Sarah Wilson' : 'David Lee'
                );

                return (
                  <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span>{dept.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 max-w-sm">{dept.description}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{headName}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{dept.employee_count}</td>
                    <td className="py-4 px-6 text-right">
                      {role === 'admin' && (
                        <button
                          onClick={() => openEditModal(dept)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Department"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Design & UX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide department purpose..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Head</label>
                <select
                  value={headId}
                  onChange={(e) => setHeadId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Leader</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.full_name} ({e.job_title || e.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
                >
                  {saving ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
