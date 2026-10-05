import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, CheckCircle, AlertCircle, Copy, ExternalLink, RefreshCw, Save, Trash2, HelpCircle } from "lucide-react";

export function StripeSetupHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [testingStripe, setTestingStripe] = useState(false);

  // Stripe keys states
  const [secretKey, setSecretKey] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [savingServerSecrets, setSavingServerSecrets] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load existing configuration on mount
  useEffect(() => {
    // Check if Stripe is already configured on the server
    fetch("/api/checkout/config")
      .then(res => res.json())
      .then(data => {
        if (data.publishableKey) {
          setPublishableKey(data.publishableKey);
          localStorage.setItem("stripe_publishable_key", data.publishableKey);
        }
        if (data.stripeConfigured) {
          setDiagnosticLogs(prev => [
            `[${new Date().toLocaleTimeString()}] SUCCESS: Stripe API connection verified. Server-side Secret Key is active.`,
            ...prev
          ]);
        } else {
          setDiagnosticLogs(prev => [
            `[${new Date().toLocaleTimeString()}] WARNING: Stripe is in standard Mock Fallback mode. Configure secret keys below to activate live checkout redirect.`,
            ...prev
          ]);
        }
      })
      .catch(err => {
        console.warn("Failed to fetch initial Stripe configuration:", err);
      });
  }, []);

  const handleSaveKeys = async () => {
    setSavingServerSecrets(true);
    setSaveStatus(null);
    const cleanSecret = secretKey.trim();
    const cleanPublishable = publishableKey.trim();

    // Save publishable key to client local storage for easy integration
    if (cleanPublishable) {
      localStorage.setItem("stripe_publishable_key", cleanPublishable);
    } else {
      localStorage.removeItem("stripe_publishable_key");
    }

    try {
      const response = await fetch("/api/checkout/save-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          secretKey: cleanSecret,
          publishableKey: cleanPublishable
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSaveStatus("Saved to server-side Secrets successfully! Connection active.");
        setDiagnosticLogs(prev => [
          `[${new Date().toLocaleTimeString()}] SUCCESS: Saved and synchronized Stripe credentials with server .env configuration.`,
          ...prev
        ]);
        // Clear secret field visually for security
        setSecretKey("");
      } else {
        setSaveStatus(`Saved locally, but server reported: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setSaveStatus(`Saved locally, but failed to sync server: ${err.message}`);
      setDiagnosticLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ERROR: Failed to synchronize keys with server: ${err.message}`,
        ...prev
      ]);
    } finally {
      setSavingServerSecrets(false);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const handleClearKeys = async () => {
    setSavingServerSecrets(true);
    setSaveStatus(null);
    localStorage.removeItem("stripe_publishable_key");
    setSecretKey("");
    setPublishableKey("");

    try {
      const response = await fetch("/api/checkout/save-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          secretKey: "",
          publishableKey: ""
        })
      });

      if (response.ok) {
        setSaveStatus("Cleared successfully! Restored standard Mock checkout fallback.");
        setDiagnosticLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Cleared custom Stripe secrets. Restored standard Mock sandbox mode.`,
          ...prev
        ]);
      } else {
        setSaveStatus("Cleared browser cache, but failed to wipe server secrets.");
      }
    } catch (err: any) {
      setSaveStatus("Cleared browser, but server wipe failed: " + err.message);
    } finally {
      setSavingServerSecrets(false);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const testConnection = async () => {
    setTestingStripe(true);
    try {
      const res = await fetch("/api/checkout/config");
      const config = await res.json();
      if (config.stripeConfigured) {
        setDiagnosticLogs(prev => [
          `[${new Date().toLocaleTimeString()}] SUCCESS: Verified server keys are present. Stripe redirection ready!`,
          ...prev
        ]);
      } else {
        setDiagnosticLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ERROR: No server keys found. Running in interactive demonstration fallback.`,
          ...prev
        ]);
      }
    } catch (err: any) {
      setDiagnosticLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ERROR: Server diagnostic endpoint unresponsive. Details: ${err.message}`,
        ...prev
      ]);
    } finally {
      setTestingStripe(false);
    }
  };

  return (
    <div className="fixed top-24 left-[224px] z-[9999]">
      <motion.button
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 cursor-pointer transition-colors border border-blue-500/20"
      >
        <CreditCard size={18} />
        <span className="text-sm font-bold tracking-tight">Stripe Setup Helper</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white hover:bg-zinc-905 p-2 rounded-full transition-all cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-bold tracking-widest uppercase bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                  ⚡ SECURE GATEWAY CONFIGURATION
                </div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
                  STRIPE API INTEGRATION ASSISTANT
                </h3>
                <p className="text-zinc-500 text-xs">
                  Manage Stripe publishable and secret tokens to link shopping cart items directly to live Checkout redirects.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Credentials Inputs Column */}
                <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                    API Credentials Overrides
                  </h4>

                  <div className="space-y-1 text-xs">
                    <label className="text-zinc-400 font-semibold block">Stripe Publishable Key (Client)</label>
                    <input
                      type="text"
                      placeholder="pk_test_..."
                      value={publishableKey}
                      onChange={(e) => setPublishableKey(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-zinc-400 font-semibold block">Stripe Secret Key (Server-side ONLY)</label>
                    <input
                      type="password"
                      placeholder="sk_test_..."
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveKeys}
                      disabled={savingServerSecrets}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
                      onClick={handleClearKeys}
                      disabled={savingServerSecrets}
                      className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-400 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      title="Clear overrides and restore standard mock demonstration"
                    >
                      <Trash2 size={14} />
                      Clear
                    </button>
                  </div>

                  {saveStatus && (
                    <div className="bg-blue-950/40 border border-blue-900/30 p-2.5 rounded-xl">
                      <p className="text-[11px] text-blue-400 font-bold text-center animate-pulse">{saveStatus}</p>
                    </div>
                  )}
                </div>

                {/* Instruction and Diagnostics Column */}
                <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                  <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-blue-400" />
                      Setup Guidelines
                    </h4>
                    <ul className="text-[10px] text-zinc-500 space-y-2 leading-relaxed text-left list-disc pl-4">
                      <li>
                        Sign in to your{" "}
                        <a
                          href="https://dashboard.stripe.com/test/apikeys"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline inline-flex items-center gap-0.5 font-semibold"
                        >
                          Stripe Dashboard <ExternalLink size={8} />
                        </a>
                      </li>
                      <li>Copy your <strong className="text-zinc-300">Publishable Key (pk_test_...)</strong> and paste it in the client input box.</li>
                      <li>Copy your <strong className="text-zinc-300">Secret Key (sk_test_...)</strong> and paste it in the private input box.</li>
                      <li>Click <strong className="text-blue-400">Save & Sync Server Secrets</strong> to update the system.</li>
                    </ul>
                  </div>

                  {/* API Diagnostics Log */}
                  <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <h5 className="text-[11px] font-black uppercase text-zinc-300 tracking-wider">
                          Real-time Diagnostics
                        </h5>
                        <button
                          onClick={testConnection}
                          disabled={testingStripe}
                          className="bg-blue-950 text-blue-400 hover:bg-blue-900 disabled:opacity-50 text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 border border-blue-900/30"
                        >
                          <RefreshCw size={10} className={testingStripe ? "animate-spin" : ""} />
                          Run Test
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">
                        Verify if your server credentials are setup to route shopping carts directly to Stripe's payment servers.
                      </p>
                    </div>

                    <div className="bg-black p-3 rounded-xl border border-zinc-900 font-mono text-[9px] h-28 overflow-y-auto space-y-1 text-left select-text custom-scrollbar">
                      {diagnosticLogs.length === 0 ? (
                        <p className="text-zinc-600 italic">Click "Run Test" to verify Stripe connectivity.</p>
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
