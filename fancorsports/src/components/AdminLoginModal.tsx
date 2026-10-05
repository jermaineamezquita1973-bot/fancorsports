import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Lock, 
  Mail, 
  ShieldAlert, 
  KeyRound, 
  ShieldCheck, 
  LogOut, 
  Database, 
  Sparkles,
  Info
} from "lucide-react";
import { auth, isFirebaseConfigured } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const ADMIN_EMAIL = "jermaineamezquita1973@gmail.com";

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Monitor auth state changes
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        if (user?.email === ADMIN_EMAIL) {
          onSuccess(user.email);
        }
      });
      return () => unsubscribe();
    } else {
      // Check local storage for sandbox simulated auth
      const savedAdmin = localStorage.getItem("sandbox_admin_user");
      if (savedAdmin === ADMIN_EMAIL) {
        setCurrentUser({ email: ADMIN_EMAIL, displayName: "Sandbox Admin" });
        onSuccess(ADMIN_EMAIL);
      }
    }
  }, [onSuccess]);

  // Autofill credentials when in local sandbox mode
  useEffect(() => {
    if (isOpen && !isFirebaseConfigured) {
      setEmail(ADMIN_EMAIL);
      setPassword("admin_pass_123");
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formattedEmail = email.trim();

    // Verification check: only allow designated admin email
    if (formattedEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError(`Access denied. Only authorized administrator accounts (e.g. ${ADMIN_EMAIL}) are permitted access.`);
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      // Sandbox mode simulation
      setTimeout(() => {
        setLoading(false);
        localStorage.setItem("sandbox_admin_user", ADMIN_EMAIL);
        setCurrentUser({ email: ADMIN_EMAIL, displayName: "Sandbox Admin" });
        onSuccess(ADMIN_EMAIL);
        onClose();
        // Trigger page event so other components (like ProductGrid) reload their admin states
        window.dispatchEvent(new Event("admin-auth-changed"));
      }, 800);
      return;
    }

    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, formattedEmail, password);
        onSuccess(formattedEmail);
        onClose();
        window.dispatchEvent(new Event("admin-auth-changed"));
      }
    } catch (err: any) {
      console.error("Firebase Admin Login Error:", err);
      let errMsg = "Failed to sign in. Please check your credentials.";
      if (err.code === "auth/invalid-credential") {
        errMsg = "Invalid password. Please verify your admin password.";
      } else if (err.code === "auth/user-not-found") {
        errMsg = "Admin account not found in Firebase. Please register or verify account settings.";
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = "Email/Password sign-in is disabled in your Firebase console. To enable it: Go to the Firebase Console > Authentication > Sign-in method, click 'Add new provider', select 'Email/Password', toggle Enable and save. Or, click the 'Sign In with Google' button below for instant admin entry!";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    if (!isFirebaseConfigured) {
      // Sandbox mode simulation
      setTimeout(() => {
        setLoading(false);
        localStorage.setItem("sandbox_admin_user", ADMIN_EMAIL);
        setCurrentUser({ email: ADMIN_EMAIL, displayName: "Sandbox Admin" });
        onSuccess(ADMIN_EMAIL);
        onClose();
        window.dispatchEvent(new Event("admin-auth-changed"));
      }, 800);
      return;
    }

    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        if (user && user.email) {
          if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            onSuccess(user.email);
            onClose();
            window.dispatchEvent(new Event("admin-auth-changed"));
          } else {
            // Sign out the non-admin user
            await signOut(auth);
            setError(`Access denied. The Google account ${user.email} is not authorized as the store administrator.`);
          }
        }
      }
    } catch (err: any) {
      console.error("Firebase Admin Google Login Error:", err);
      let errMsg = "Failed to sign in with Google. Please try again.";
      if (err.code === "auth/popup-blocked") {
        errMsg = "Sign-in popup was blocked by your browser. Please allow popups for this site.";
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = "Google Sign-In is disabled in your Firebase console. Please enable it in the Authentication > Sign-in method tab.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    setLoading(true);
    
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
        setCurrentUser(null);
        localStorage.removeItem("sandbox_admin_user");
        onClose();
        window.dispatchEvent(new Event("admin-auth-changed"));
      } catch (err) {
        console.error("Sign out failed", err);
      } finally {
        setLoading(false);
      }
    } else {
      // Sandbox mode logout
      setTimeout(() => {
        localStorage.removeItem("sandbox_admin_user");
        setCurrentUser(null);
        setLoading(false);
        onClose();
        window.dispatchEvent(new Event("admin-auth-changed"));
      }, 400);
    }
  };

  const handleSandboxBypass = () => {
    setEmail(ADMIN_EMAIL);
    setPassword("admin_pass_123");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-10 select-none font-sans"
          >
            {/* Ambient neon radial gradients */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00D2FF]/5 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16"></div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#00D2FF]/10 text-[#00D2FF] rounded-xl border border-[#00D2FF]/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-black tracking-widest text-[#00D2FF] uppercase">CONTROL CENTER</span>
                  <h3 className="text-white text-base font-black tracking-wider uppercase">ADMIN PORTAL</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {currentUser && currentUser.email === ADMIN_EMAIL ? (
              /* Already Logged In Panel */
              <div className="space-y-6 py-4 text-center">
                <div className="w-16 h-16 bg-[#00D2FF]/10 border border-[#00D2FF]/20 text-[#00D2FF] rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-extrabold text-base tracking-wide uppercase">ACCESS GRANTED</h4>
                  <p className="text-zinc-500 text-xs">You are authenticated as the store administrator.</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-850 rounded-full text-[11px] font-mono text-zinc-300 font-bold mt-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    {currentUser.email}
                  </div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 text-xs text-zinc-400 text-left space-y-2">
                  <p className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
                    ADMIN CAPABILITIES POWERED:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-500 font-medium">
                    <li>Dynamic Printify Inventory Monitoring & Verifications</li>
                    <li>Hide/Show Storefront Products on-the-fly</li>
                    <li>Synchronized Firestore Database Product Deletions</li>
                    <li>Real-time configuration controller controls</li>
                  </ul>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/20 active:scale-98 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  {loading ? "AUTHENTICATING OUT..." : "DISCONNECT ADMIN SESSION"}
                </button>
              </div>
            ) : (
              /* Login Form */
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-extrabold text-[10px] tracking-widest uppercase">ADMIN EMAIL</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="email"
                      required
                      placeholder={ADMIN_EMAIL}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black border border-zinc-900 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#00D2FF] transition-all font-bold"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-zinc-500 font-extrabold text-[10px] tracking-widest uppercase">SECURITY KEY / PASSWORD</label>
                    {!isFirebaseConfigured && (
                      <span className="text-[9px] font-mono text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">Any Password OK</span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black border border-zinc-900 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#00D2FF] transition-all font-bold"
                    />
                  </div>
                </div>

                {/* Error Box */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-medium leading-relaxed text-left"
                    >
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                      <div className="space-y-0.5">
                        <p className="font-extrabold uppercase text-[10px] tracking-wider leading-none">Access Denied</p>
                        <p className="text-zinc-500 text-[11px] leading-normal">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-950/25 hover:shadow-blue-500/15 hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <KeyRound className="w-4 h-4" />
                  {loading ? "VERIFYING AUTHORIZATION..." : "UNLOCK WITH EMAIL/PASSWORD"}
                </button>

                {/* Divider */}
                <div className="flex items-center my-4">
                  <div className="flex-1 h-px bg-zinc-900"></div>
                  <span className="px-3 text-[10px] text-zinc-600 font-extrabold uppercase tracking-widest">OR USE INSTANT GOOGLE LOGIN</span>
                  <div className="flex-1 h-px bg-zinc-900"></div>
                </div>

                {/* Google Sign In Action */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.29 1.845 15.54 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.74-.08-1.3-.176-1.85H12.24z"
                    />
                  </svg>
                  {loading ? "CONNECTING..." : "SIGN IN WITH GOOGLE"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
