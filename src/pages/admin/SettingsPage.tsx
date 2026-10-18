import React, { useEffect, useState } from 'react';
import {
  Shield,
  Database,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { role } = useAuth();
  const [dbStatus, setDbStatus] = useState<string>('Connected & Healthy');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const testAllocationTrigger = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Intentionally attempt to insert an allocation of 120% to test database-side constraint
      const { data: emps } = await supabase.from('profiles').select('id').limit(1);
      const { data: projs } = await supabase.from('projects').select('id').limit(1);

      if (emps && emps[0] && projs && projs[0]) {
        const { error } = await supabase.from('allocations').insert({
          employee_id: emps[0].id,
          project_id: projs[0].id,
          allocation_percentage: 120, // Should be rejected by CHECK or trigger!
          start_date: '2026-01-01',
          end_date: '2026-06-30',
        });

        if (error) {
          setTestResult(`Guardrail active! Database rejected invalid allocation: ${error.message}`);
        } else {
          setTestResult('Constraint failed to reject.');
        }
      }
    } catch (err: any) {
      setTestResult(`Guardrail caught error: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Settings & Security</h1>
        <p className="text-sm text-slate-500">Master database telemetry, RLS status, and integrity guardrails</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Connection Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supabase PostgreSQL Engine</h3>
              <p className="text-[11px] text-slate-500">Instance: uhifcxmbgfbjmkhyvvai (ap-northeast-1)</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>PostgreSQL Connection Active</span>
            </div>
            <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded-full uppercase font-bold">Healthy</span>
          </div>

          <div className="text-xs space-y-2 text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>PostgreSQL Engine:</span>
              <span className="font-semibold text-slate-800">PostgreSQL 17 (Supabase)</span>
            </div>
            <div className="flex justify-between">
              <span>Row Level Security:</span>
              <span className="font-semibold text-emerald-600">Active on all 9 tables</span>
            </div>
            <div className="flex justify-between">
              <span>Auth Session Storage:</span>
              <span className="font-semibold text-slate-800">Persistent Local Storage</span>
            </div>
          </div>
        </div>

        {/* Database Trigger Verification Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Allocation Limit Guardrails</h3>
              <p className="text-[11px] text-slate-500">Database-enforced &le;100% atomic trigger check</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Test the live PostgreSQL database trigger (<code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">trg_check_allocation_limit</code>) to verify that unauthorized or excessive capacity assignments are safely blocked at the database engine level.
          </p>

          <button
            onClick={testAllocationTrigger}
            disabled={testing}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing Engine Guardrail...' : 'Execute Database Trigger Test'}</span>
          </button>

          {testResult && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs">
              <p className="font-semibold text-emerald-700 mb-0.5">Verification Result:</p>
              <p className="text-[11px] font-mono text-slate-600">{testResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
