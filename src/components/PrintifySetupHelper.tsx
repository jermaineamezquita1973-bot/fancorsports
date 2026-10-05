import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, CheckCircle, AlertCircle, Copy, ExternalLink, RefreshCw, Save, Trash2 } from 'lucide-react';

/**
 * PrintifySetupHelper
 * A beautifully expanded modal to manage Printify API Credentials and Server Secrets.
 */
export function PrintifySetupHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [testingProducts, setTestingProducts] = useState(false);

  // Custom Credentials states
  const [apiKey, setApiKeyState] = useState("");
  const [shopId, setShopIdState] = useState("");
  const [savingServerSecrets, setSavingServerSecrets] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load existing custom credentials on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiKeyState(window.localStorage.getItem("printify_api_key") || "");
      setShopIdState(window.localStorage.getItem("printify_shop_id") || "");
    }
  }, []);

  const handleSaveCredentials = async () => {
    if (typeof window !== "undefined") {
      setSavingServerSecrets(true);
      setSaveStatus(null);
      const cleanKey = apiKey.trim();
      const cleanShop = shopId.trim();

      // 1. Save to browser local storage for instant client header inclusion
      if (cleanKey) {
        window.localStorage.setItem("printify_api_key", cleanKey);
      } else {
        window.localStorage.removeItem("printify_api_key");
      }

      if (cleanShop) {
        window.localStorage.setItem("printify_shop_id", cleanShop);
      } else {
        window.localStorage.removeItem("printify_shop_id");
      }

      // 2. Sync to the server side configuration (.env and memory) so it runs smoothly for all background tasks
      try {
        const response = await fetch("/api/fulfillment/save-secrets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            apiKey: cleanKey,
            shopId: cleanShop
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setSaveStatus("Saved to server-side Secrets & Browser successfully! Connection active.");
          setDiagnosticLogs(prev => [
            `[${new Date().toLocaleTimeString()}] Saved and synchronized with server .env configuration.`,
            ...prev
          ]);
        } else {
          setSaveStatus(`Saved to browser, but server sync reported: ${data.error || "Unknown error"}`);
        }
      } catch (err: any) {
        setSaveStatus(`Saved to browser, but failed to synchronize with server: ${err.message}`);
        setDiagnosticLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Browser saved locally, but server API request failed: ${err.message}`,
          ...prev
        ]);
      } finally {
        setSavingServerSecrets(false);
        // Trigger reloads across parent frames
        window.dispatchEvent(new Event("products-synced"));
        window.dispatchEvent(new Event("admin-auth-changed"));
        setTimeout(() => setSaveStatus(null), 5000);
      }
    }
  };

  const handleClearCredentials = async () => {
    if (typeof window !== "undefined") {
      setSavingServerSecrets(true);
      setSaveStatus(null);

      window.localStorage.removeItem("printify_api_key");
      window.localStorage.removeItem("printify_shop_id");
      setApiKeyState("");
      setShopIdState("");

      try {
        const response = await fetch("/api/fulfillment/save-secrets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            apiKey: "",
            shopId: ""
          })
        });

        if (response.ok) {
          setSaveStatus("Cleared successfully! Restored default sandbox modes.");
          setDiagnosticLogs(prev => [
            `[${new Date().toLocaleTimeString()}] Cleared custom secrets from server .env and browser.`,
            ...prev
          ]);
        } else {
          setSaveStatus("Cleared browser cache, but failed to wipe server secrets.");
        }
      } catch (err: any) {
        setSaveStatus("Cleared browser, but server wipe failed: " + err.message);
      } finally {
        setSavingServerSecrets(false);
        window.dispatchEvent(new Event("products-synced"));
        window.dispatchEvent(new Event("admin-auth-changed"));
        setTimeout(() => setSaveStatus(null), 5000);
      }
    }
  };

  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      const currentApiKey = apiKey.trim() || (typeof window !== "undefined" ? window.localStorage.getItem("printify_api_key") || "" : "");
      if (currentApiKey) {
        headers["x-printify-api-key"] = currentApiKey;
      }

      const response = await fetch('/api/fulfillment/setup', { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch shops');
      }

      setShops(data.shops || []);
      setDiagnosticLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Successfully queried account shops. Found ${data.shops?.length || 0} shop(s).`,
        ...prev
      ]);
    } catch (err: any) {
      setError(err.message);
      setDiagnosticLogs(prev => [`[${new Date().toLocaleTimeString()}] Shop query failed: ${err.message}`, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const testFetchProducts = async () => {
    setTestingProducts(true);
    setDiagnosticLogs(prev => [`[${new Date().toLocaleTimeString()}] Fetching products from /api/products...`, ...prev]);
    try {
      const headers: Record<string, string> = {};
      const currentApiKey = apiKey.trim() || (typeof window !== "undefined" ? window.localStorage.getItem("printify_api_key") || "" : "");
      const currentShopId = shopId.trim() || (typeof window !== "undefined" ? window.localStorage.getItem("printify_shop_id") || "" : "");

      if (currentApiKey) headers["x-printify-api-key"] = currentApiKey;
      if (currentShopId) headers["x-printify-shop-id"] = currentShopId;

      const response = await fetch(`/api/products?t=${Date.now()}`, { headers });
      const status = response.status;
      const statusText = response.statusText;

      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        setDiagnosticLogs(prev => [`[ERROR ${status}]: Failed to parse API JSON response.`, ...prev]);
        return;
      }

      if (!response.ok) {
        setDiagnosticLogs(prev => [
          `[API ERROR ${status} ${statusText}]: ${data.error || data.details || JSON.stringify(data)}`,
          ...prev
        ]);
      } else {
        const count = data.products?.length ?? 0;
        setDiagnosticLogs(prev => [
          `[SUCCESS ${status}]: Retrieved ${count} product(s) from Printify inventory.`,
          ...(data.products?.slice(0, 5).map((p: any) => `  -> Found: ${p.title || p.name} (${p.id})`) || []),
          ...prev
        ]);
      }
    } catch (err: any) {
      setDiagnosticLogs(prev => [`[NETWORK/CLIENT ERROR]: ${err.message}`, ...prev]);
    } finally {
      setTestingProducts(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed top-24 left-6 z-[9999]">
      <motion.button
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && shops.length === 0) fetchShops();
        }}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 cursor-pointer transition-colors border border-emerald-500/20"
      >
        <Settings size={18} className={loading ? 'animate-spin' : ''} />
        <span className="text-sm font-bold tracking-tight">Printify Setup Helper</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-850 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 bg-emerald-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/30 p-2 rounded-xl">
                    <CheckCircle size={22} className="text-emerald-100" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base uppercase font-sans tracking-wide">
                      Printify Connection & Secrets Manager
                    </h3>
                    <p className="text-xs text-emerald-100">Configure your direct live print-on-demand fulfillment engine</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="opacity-70 hover:opacity-100 font-bold text-2xl leading-none transition-opacity w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-700/50"
                >
                  ×
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-left">
                
                {/* Info Card */}
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 flex gap-4 text-emerald-400">
                  <div className="bg-emerald-900/20 p-2 rounded-lg self-start">
                    <Settings className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider">Configure Direct Printify Fulfillment</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Pasting your API Token and Shop ID will write the secrets directly to the server's <code className="text-emerald-300 font-mono">.env</code> configuration file and update the active process memory. This updates your store catalog with authentic live items instantly!
                    </p>
                  </div>
                </div>

                {/* Form Section */}
                <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-850 space-y-4">
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Custom Credentials & Secrets Override
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] text-zinc-300 uppercase font-black tracking-wider">
                        Printify API Token (Key)
                      </label>
                      <a
                        href="https://printify.com/app/settings/api"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        Generate Key on Printify <ExternalLink size={10} />
                      </a>
                    </div>

                    <p className="text-[10px] text-zinc-500">
                      Paste your very long personal JWT API Token here. This text field is a large, scrollable box so you can verify that the key has been pasted fully without any clipping.
                    </p>

                    <div className="relative">
                      <textarea
                        placeholder="Paste your Printify API Token (usually starting with eyJ0eXAiOiJKV1Qi...)"
                        value={apiKey}
                        onChange={(e) => setApiKeyState(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500 font-mono resize-y h-28 leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] text-zinc-300 uppercase font-black tracking-wider">
                      Printify Shop ID
                    </label>
                    <p className="text-[10px] text-zinc-500">
                      Enter your numeric Printify shop ID (e.g. 23199113). If you don't know it, you can click <strong className="text-emerald-400">"Auto-Detect My Shop IDs"</strong> below once you paste your token.
                    </p>
                    <input
                      type="text"
                      placeholder="e.g. 23199113"
                      value={shopId}
                      onChange={(e) => setShopIdState(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveCredentials}
                      disabled={savingServerSecrets}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      {savingServerSecrets ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Saving Secrets to Server...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Save & Sync Server Secrets
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleClearCredentials}
                      disabled={savingServerSecrets}
                      className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-400 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      title="Clear overrides and restore defaults"
                    >
                      <Trash2 size={14} />
                      Clear
                    </button>
                  </div>

                  {saveStatus && (
                    <div className="bg-emerald-950/40 border border-emerald-900/30 p-2.5 rounded-xl">
                      <p className="text-[11px] text-emerald-400 font-bold text-center animate-pulse">{saveStatus}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Shop Detection Section */}
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h5 className="text-[11px] font-black uppercase text-zinc-300 tracking-wider">
                        Shop Detection & Auto-Resolution
                      </h5>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">
                        Query your Printify account to identify all valid shop IDs linked to your current token.
                      </p>
                    </div>
                    
                    <button
                      onClick={fetchShops}
                      disabled={loading}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-emerald-400 border border-zinc-800 rounded-xl py-2 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                      Auto-Detect My Shop IDs
                    </button>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-4 text-zinc-500">
                        <RefreshCw className="animate-spin mb-1 text-emerald-500" size={18} />
                        <p className="text-[10px]">Calling shops list API...</p>
                      </div>
                    ) : error ? (
                      <div className="bg-red-950/20 p-3 rounded-lg border border-red-900/20 text-red-400 text-left">
                        <p className="text-[10px] font-bold">Query Failed</p>
                        <p className="text-[9px] text-zinc-400 leading-relaxed">{error}</p>
                      </div>
                    ) : shops.length > 0 ? (
                      <div className="space-y-2 pt-1 text-left">
                        <p className="text-[10px] text-zinc-400">Found {shops.length} shop(s). Select one to prefill:</p>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                          {shops.map((shop) => (
                            <div key={shop.id} className="p-2 bg-black rounded-lg border border-zinc-900 flex justify-between items-center text-[10px]">
                              <div>
                                <span className="font-bold block text-zinc-300">{shop.title}</span>
                                <code className="text-emerald-400 font-mono text-[9px]">{shop.id}</code>
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setShopIdState(shop.id.toString())}
                                  className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 px-2 py-1 rounded font-bold"
                                >
                                  Use ID
                                </button>
                                <button
                                  onClick={() => copyToClipboard(shop.id.toString())}
                                  className="text-zinc-500 hover:text-emerald-400 transition-colors p-1"
                                >
                                  {copied === shop.id.toString() ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-600 text-center py-2 italic">No shops detected yet.</p>
                    )}
                  </div>

                  {/* API Diagnostics Log */}
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <h5 className="text-[11px] font-black uppercase text-zinc-300 tracking-wider">
                          Real-time Diagnostics
                        </h5>
                        <button
                          onClick={testFetchProducts}
                          disabled={testingProducts}
                          className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 disabled:opacity-50 text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 border border-emerald-900/30"
                        >
                          <RefreshCw size={10} className={testingProducts ? "animate-spin" : ""} />
                          Run Test
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">
                        Verify if your saved API configuration is pulling inventory successfully from Printify's server.
                      </p>
                    </div>

                    <div className="bg-black p-3 rounded-xl border border-zinc-900 font-mono text-[9px] h-28 overflow-y-auto space-y-1 text-left select-text custom-scrollbar">
                      {diagnosticLogs.length === 0 ? (
                        <p className="text-zinc-600 italic">Click "Run Test" to fetch and verify products.</p>
                      ) : (
                        diagnosticLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className={
                              log.includes("ERROR")
                                ? "text-red-400 font-semibold"
                                : log.includes("SUCCESS")
                                ? "text-emerald-400 font-semibold"
                                : "text-zinc-400"
                            }
                          >
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
