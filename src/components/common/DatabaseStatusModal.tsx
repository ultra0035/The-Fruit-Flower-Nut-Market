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
  Sparkles,
  Copy,
  Terminal,
  Server,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  getSupabaseConfig,
  supabaseService,
  saveCustomCredentials,
  clearCustomCredentials,
  TestConnectionResult,
} from '../../lib/supabase';
import { useStore } from '../../context/StoreContext';
import { SUPABASE_SQL_SCHEMA } from '../../data/supabaseSql';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    orders,
    products,
    showNotification,
    refreshFromDatabase,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'connection' | 'sql' | 'vercel' | 'sync'>('connection');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);

  const config = getSupabaseConfig();
  const [customUrl, setCustomUrl] = useState(config.url || '');
  const [customKey, setCustomKey] = useState(config.key || '');
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);
  const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedVarName, setCopiedVarName] = useState<string | null>(null);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await supabaseService.testConnection();
      setTestResult(res);
      if (res.connected) {
        await refreshFromDatabase();
      }
    } catch (err: any) {
      setTestResult({
        connected: false,
        actionRequired: 'network_error',
        message: err.message || 'Error executing connection test query',
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const currentConfig = getSupabaseConfig();
      setCustomUrl(currentConfig.url || '');
      setCustomKey(currentConfig.key || '');
      runTest();
    }
  }, [isOpen]);

  const handleSaveCredentials = async () => {
    if (!customUrl.trim() || !customKey.trim()) {
      showNotification('Please provide both the Supabase URL and Anon Key');
      return;
    }
    saveCustomCredentials(customUrl, customKey);
    showNotification('Supabase credentials saved! Connecting and refreshing...');
    await runTest();
    await refreshFromDatabase();
  };

  const handleResetCredentials = async () => {
    clearCustomCredentials();
    const updated = getSupabaseConfig();
    setCustomUrl(updated.url || '');
    setCustomKey(updated.key || '');
    showNotification('Reset to build-time environment variables');
    await runTest();
    await refreshFromDatabase();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    showNotification('SQL Schema copied to clipboard! Paste it into Supabase SQL Editor.');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCopyText = (text: string, varId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVarName(varId);
    showNotification(`Copied "${text}" to clipboard`);
    setTimeout(() => setCopiedVarName(null), 2500);
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
      showNotification(`Successfully synced ${successCount} order(s) to Supabase!`);
    } catch (err: any) {
      showNotification(`Sync encountered an error: ${err.message}`);
    } finally {
      setIsSyncingOrders(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 min-h-screen">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                Supabase Database Control Center
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-200/80">
                Live PostgreSQL cloud persistence &amp; dispatch sync
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50/80 px-4 sm:px-6 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'connection'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Connection &amp; Credentials</span>
            {testResult?.connected ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Schema Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'vercel'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Vercel Deploy Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Data &amp; Catalog Sync</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 text-stone-800 text-sm overflow-y-auto flex-1">
          {/* Diagnostic Status Card (Always visible) */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              testResult?.connected
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/90 border-amber-300 text-amber-950'
            }`}
          >
            {testResult?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <div className="font-bold text-sm flex items-center justify-between flex-wrap gap-2">
                <span>
                  {testing
                    ? 'Testing connection to Supabase...'
                    : testResult?.connected
                    ? 'Supabase Database Connected & Live!'
                    : 'Supabase Database Not Connected'}
                </span>
                {config.source !== 'none' && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      config.source === 'local'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Source: {config.source === 'local' ? 'Browser Override' : 'Build / Env'}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {testing ? 'Pinging public.products & public.orders...' : testResult?.message}
              </p>

              {/* Action recommendation pill */}
              {testResult && !testResult.connected && testResult.actionRequired === 'missing_tables' && (
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('sql')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Go to SQL Setup &amp; Copy Schema</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: CONNECTION & CREDENTIALS */}
          {activeTab === 'connection' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-stone-500" />
                    Live Supabase Credentials
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Paste your credentials below to connect immediately in this browser.
                  </p>
                </div>
                {config.source === 'local' && (
                  <button
                    onClick={handleResetCredentials}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
                  >
                    Clear custom override
                  </button>
                )}
              </div>

              <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Supabase Project URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://your-project-id.supabase.co"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-stone-900"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Found in Supabase Dashboard ➔ Project Settings ➔ API ➔ Project URL
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-stone-900"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Found in Supabase Dashboard ➔ Project Settings ➔ API ➔ Project API Keys (anon public)
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveCredentials}
                    className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply &amp; Test Connection</span>
                  </button>

                  <button
                    type="button"
                    disabled={testing}
                    onClick={runTest}
                    className="py-2.5 px-4 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                    <span>Retest</span>
                  </button>
                </div>
              </div>

              {/* Optimistic offline note */}
              <div className="p-3 bg-stone-100/80 rounded-xl text-stone-600 text-xs space-y-1">
                <div className="font-bold text-stone-800 flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Offline Resilience Active:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Even if Supabase is disconnected or during network drops, customer carts, orders, and driver dispatches are saved in browser storage (<code className="bg-stone-200 px-1 py-0.5 rounded font-mono">localStorage</code>) so nothing is lost. Once connected, changes synchronize directly with PostgreSQL.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SQL SCHEMA SETUP */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                    Supabase PostgreSQL Tables &amp; Policies
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Creates <code className="font-mono">products</code>, <code className="font-mono">drivers</code>, <code className="font-mono">delivery_zones</code>, <code className="font-mono">orders</code>, and <code className="font-mono">order_items</code>.
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              {/* Step by step */}
              <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  How to setup in 30 seconds:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-emerald-900 text-[11px] leading-relaxed">
                  <li>
                    Open your <strong>Supabase Dashboard</strong> (
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-bold inline-flex items-center gap-0.5"
                    >
                      supabase.com/dashboard <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    ).
                  </li>
                  <li>Click on your project and navigate to the <strong>SQL Editor</strong> tab on the left.</li>
                  <li>Click <strong>+ New Query</strong>.</li>
                  <li>Click <strong>&ldquo;Copy SQL Schema&rdquo;</strong> above, paste it into the editor, and click <strong>Run</strong>.</li>
                  <li>Come back here and click <strong>&ldquo;Apply &amp; Test Connection&rdquo;</strong>!</li>
                </ol>
              </div>

              {/* SQL Preview container */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 text-stone-200 font-mono text-[11px] max-h-56 overflow-y-auto p-4">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: VERCEL DEPLOYMENT GUIDE */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-stone-500" />
                  Vercel Environment Variables Setup
                </h3>
                <p className="text-[11px] text-stone-500">
                  Because this is a Vite app, variables must be named exactly with the <code className="font-mono bg-stone-200 px-1 py-0.5 rounded text-stone-800">VITE_</code> prefix.
                </p>
              </div>

              <div className="space-y-3">
                {/* Var 1 */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold font-mono text-stone-900">
                      VITE_SUPABASE_URL
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Your project URL (e.g. <span className="font-mono">https://xyz.supabase.co</span>)
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyText('VITE_SUPABASE_URL', 'v1')}
                    className="py-1 px-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedVarName === 'v1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Name</span>
                  </button>
                </div>

                {/* Var 2 */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold font-mono text-stone-900">
                      VITE_SUPABASE_ANON_KEY
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Your anon/public API key (starts with <span className="font-mono">eyJ...</span>)
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyText('VITE_SUPABASE_ANON_KEY', 'v2')}
                    className="py-1 px-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedVarName === 'v2' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Name</span>
                  </button>
                </div>
              </div>

              {/* Crucial redeploy warning */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2 text-amber-950">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Info className="w-4 h-4 text-amber-700" />
                  Crucial: Vite Bundles Variables at Build-Time!
                </div>
                <p className="text-[11px] leading-relaxed">
                  When you add or update environment variables in Vercel (<code className="font-mono">Project Settings ➔ Environment Variables</code>), <strong>existing deployments do not automatically update</strong>.
                </p>
                <p className="text-[11px] leading-relaxed">
                  You must trigger a new build:
                  <br />
                  Go to <strong>Vercel ➔ Deployments ➔ Click the 3 dots (⋯) on the latest deployment ➔ Click &ldquo;Redeploy&rdquo;</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: DATA & CATALOG SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  Catalog &amp; Order Synchronization
                </h3>
                <p className="text-[11px] text-stone-500">
                  Synchronize your live Supabase database with this browser session.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pull from Supabase */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pull Live Products</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Fetch the latest products from <code className="font-mono">public.products</code> ({products.length} currently loaded).
                  </p>
                  <button
                    type="button"
                    disabled={isRefreshingProducts}
                    onClick={async () => {
                      setIsRefreshingProducts(true);
                      await refreshFromDatabase();
                      setIsRefreshingProducts(false);
                      showNotification('Products refreshed directly from Supabase!');
                    }}
                    className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingProducts ? 'animate-spin' : ''}`} />
                    <span>Refresh Products</span>
                  </button>
                </div>

                {/* Real-time Subscriptions Status */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-600" />
                    <span>Real-time Live Sync</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Listening to real-time events on <code className="font-mono text-[10px]">public.products</code> and <code className="font-mono text-[10px]">public.orders</code>.
                  </p>
                  <div className="py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Real-time Channel Active</span>
                  </div>
                </div>

                {/* Upload Local Orders */}
                {orders.length > 0 && (
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 sm:col-span-2">
                    <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                      <span>Upload Local Orders ({orders.length} orders saved)</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Sync orders created while offline directly to <code className="font-mono">public.orders</code> and <code className="font-mono">public.order_items</code>.
                    </p>
                    <button
                      type="button"
                      disabled={isSyncingOrders}
                      onClick={handlePushLocalOrdersToSupabase}
                      className="py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <UploadCloud className={`w-3.5 h-3.5 ${isSyncingOrders ? 'animate-spin' : ''}`} />
                      <span>{isSyncingOrders ? 'Uploading...' : 'Sync Orders to Supabase'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Cache Clear */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.removeItem('ffn_products_v1');
                      localStorage.removeItem('ffn_orders_v1');
                      showNotification('Cleared local browser cache! Refreshing...');
                      refreshFromDatabase();
                    } catch (e) {}
                  }}
                  className="text-[11px] text-rose-600 hover:text-rose-800 underline font-semibold cursor-pointer"
                >
                  Clear local browser cache &amp; reload
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                testResult?.connected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
            <span>
              Status: {testResult?.connected ? 'Live PostgreSQL Active' : 'Operating in Local Mode'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
