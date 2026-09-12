import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Key,
  Globe,
  UploadCloud,
  Check,
} from 'lucide-react';
import {
  getSupabaseConfig,
  supabaseService,
  saveCustomCredentials,
  clearCustomCredentials,
} from '../../lib/supabase';
import { useStore } from '../../context/StoreContext';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { orders, showNotification } = useStore();
  const config = getSupabaseConfig();

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const [customUrl, setCustomUrl] = useState(config.url || '');
  const [customKey, setCustomKey] = useState(config.key || '');
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);
  const [syncCount, setSyncCount] = useState<number | null>(null);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await supabaseService.testConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        connected: false,
        message: err.message || 'Error executing test query',
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runTest();
    }
  }, [isOpen]);

  const handleSaveCredentials = () => {
    if (!customUrl.trim() || !customKey.trim()) {
      showNotification('Please provide both the Supabase URL and Anon Key');
      return;
    }
    saveCustomCredentials(customUrl, customKey);
    showNotification('Supabase credentials saved for this browser session!');
    runTest();
  };

  const handleResetCredentials = () => {
    clearCustomCredentials();
    const updated = getSupabaseConfig();
    setCustomUrl(updated.url || '');
    setCustomKey(updated.key || '');
    showNotification('Reset to build-time environment variables');
    runTest();
  };

  const handlePushLocalOrdersToSupabase = async () => {
    setIsSyncingOrders(true);
    let successCount = 0;
    try {
      for (const order of orders) {
        const res = await supabaseService.createOrder(order);
        if (res.success) {
          successCount++;
        }
      }
      setSyncCount(successCount);
      showNotification(`Successfully uploaded ${successCount} order(s) to Supabase!`);
    } catch (err: any) {
      showNotification(`Sync encountered an error: ${err.message}`);
    } finally {
      setIsSyncingOrders(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-900 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                Supabase Connection Status
              </h2>
              <p className="text-xs text-stone-300">
                Live PostgreSQL database synchronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-stone-800 text-sm">
          {/* Status banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              testResult?.connected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {testResult?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold text-sm flex items-center gap-2">
                {testing ? (
                  <span>Testing connection to Supabase...</span>
                ) : testResult?.connected ? (
                  <span>Connected & Ready to Record Orders</span>
                ) : (
                  <span>Database Not Yet Connected</span>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {testing
                  ? 'Connecting to public.orders table...'
                  : testResult?.message}
              </p>
            </div>
          </div>

          {/* Explanation of why orders exist locally */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Why orders exist on frontend before Supabase:
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              The application uses <strong>optimistic local persistence</strong>{' '}
              (browser <code className="bg-stone-200/80 px-1 py-0.5 rounded text-[11px]">localStorage</code>).
              This guarantees customer carts and driver workflows are never lost even if the connection is slow.
              However, to record into Supabase, the live credentials must be loaded into the build or provided below.
            </p>
          </div>

          {/* Quick Connect & Override */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-stone-400" />
                Live Credentials in this browser:
              </label>
              {config.source === 'local' && (
                <button
                  onClick={handleResetCredentials}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Clear manual override
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                  Supabase Project URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://dmzxcnmdtsyqmolgbmxx.supabase.co"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                  Supabase Anon Public Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveCredentials}
                  className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply & Test Connection
                </button>
                <button
                  type="button"
                  disabled={testing}
                  onClick={runTest}
                  className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  Retest
                </button>
              </div>
            </div>
          </div>

          {/* Sync existing local orders to Supabase */}
          {testResult?.connected && orders.length > 0 && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-emerald-900">
                  Upload Existing Local Orders
                </div>
                <div className="text-[11px] text-emerald-700">
                  You have {orders.length} orders saved locally. Click to sync them to Supabase.
                </div>
              </div>
              <button
                type="button"
                disabled={isSyncingOrders}
                onClick={handlePushLocalOrdersToSupabase}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className={`w-3.5 h-3.5 ${isSyncingOrders ? 'animate-spin' : ''}`} />
                <span>{isSyncingOrders ? 'Syncing...' : 'Sync to Supabase'}</span>
              </button>
            </div>
          )}

          {/* Vercel Redeployment checklist */}
          <div className="p-3 bg-stone-100/70 rounded-xl text-xs text-stone-600 space-y-1.5">
            <div className="font-bold text-stone-800 flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              Crucial Step for Vercel:
            </div>
            <p className="text-[11px] leading-relaxed">
              Vite embeds environment variables <strong>only during build time</strong>.
              If you added <code className="bg-stone-200 px-1 py-0.2 rounded font-mono">VITE_SUPABASE_URL</code> and{' '}
              <code className="bg-stone-200 px-1 py-0.2 rounded font-mono">VITE_SUPABASE_ANON_KEY</code> in Vercel project settings,
              go to <strong>Vercel ➔ Deployments ➔ Click the 3 dots on latest deployment ➔ Redeploy</strong> so the production build receives them!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
