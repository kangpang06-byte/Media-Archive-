import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Navbar } from './components/Navbar';
import { MediaList } from './components/MediaList';
import { AddMediaModal } from './components/AddMediaModal';
import { Archive, Lock, Mail, User, ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';

function AppContent() {
  const { user, loading, login, loginWithEmail, signUpWithEmail } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Custom Email Sign-In / Sign-Up form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setSubmitting(true);

    if (!email || !password) {
      setAuthError('กรุณากรอกภาษาอีเมลและรหัสผ่าน');
      setSubmitting(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!name) {
          setAuthError('กรุณากรอกชื่อ-นามสกุลของคุณ');
          setSubmitting(false);
          return;
        }
        const { error } = await signUpWithEmail(email, password, name);
        if (error) throw error;
        setAuthSuccess('สมัครโปรไฟล์สำเร็จแล้ว! คุณสามารถเข้าใช้งานได้ทันที');
        setIsSignUp(false);
      } else {
        const { error } = await loginWithEmail(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      console.error('Authentication process failed:', err);
      setAuthError(err.message || 'รหัสผ่านผิดพลาดหรืออีเมลไม่ถูกต้อง');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-gray-500 animate-pulse">กำลังเตรียมเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col lg:flex-row bg-gray-50">
        {/* Left Aspect: Branding and visuals */}
        <div className="flex-1 flex flex-col justify-center items-center lg:items-start p-8 lg:p-24 bg-gradient-to-br from-primary-light/50 to-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[32px] bg-primary text-white shadow-2xl shadow-primary/20 relative z-10 animate-bounce">
            <Archive size={40} />
          </div>
          
          <div className="max-w-xl text-center lg:text-left relative z-10">
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-gray-900 leading-none">
              Media Archive
            </h1>
            <p className="mt-2 text-lg font-bold uppercase tracking-widest text-primary-dark">
              คลังผลงานโสตฯ ส่วนกลาง
            </p>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              สตรีมมิ่งและจัดการลิงก์ภาพถ่าย วิดีโอ หรือคลังข้อมูลผลงานย้อนหลังทั้งหมด สะดวก ง่ายดาย ด้วยระบบความปลอดภัยแบบ Supabase PostgreSQL และ RLS
            </p>
          </div>

          <div className="mt-16 hidden lg:flex items-center gap-8 text-gray-400 relative z-10">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">100%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Self-Service</span>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900 text-primary-dark">RDBMS</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Row Level Security</span>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">Instant</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Live Sync</span>
            </div>
          </div>
        </div>

        {/* Right Aspect: Authentication Panel */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md bg-white p-8 lg:p-10 rounded-[36px] shadow-xl border border-gray-100 flex flex-col">
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {isSignUp ? 'สร้างบัญชีของโสตฯ' : 'ยินดีต้อนรับกลับมา'}
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">
                {isSignUp ? 'สร้างรหัสผ่านเพื่อสลับสิทธิ์การอัปโหลดไฟล์' : 'ลงชื่อเข้าใช้คลังรวบรวมข้อมูลด้วย Supabase'}
              </p>
            </div>

            {authError && (
              <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-600 flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-6 rounded-2xl bg-teal-50 border border-teal-100 p-4 text-xs text-teal-600 flex items-center gap-2">
                <Lock size={16} />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Quick Login Assist Card */}
            {!isSignUp && (
              <div 
                onClick={async () => {
                  if (submitting) return;
                  try {
                    setSubmitting(true);
                    setAuthError('');
                    setEmail('photo');
                    setPassword('photo');
                    const { error } = await loginWithEmail('photo', 'photo');
                    if (error) throw error;
                  } catch (err: any) {
                    setAuthError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบแบบด่วน');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="mb-6 cursor-pointer group flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary-dark transition-all hover:bg-primary/10 active:scale-95"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-transform group-hover:scale-110">
                  <KeyRound size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 flex items-center justify-between">
                    <span>⚡ เข้าสู่ระบบแบบด่วน (Quick Login)</span>
                    <span className="text-[10px] font-bold text-primary underline group-hover:text-primary-dark">คลิกเพื่อเข้าสู่ระบบ &rarr;</span>
                  </p>
                  <p className="mt-1 text-gray-500">
                    เข้าใช้งานด่วนด้วย รหัส: <code className="rounded bg-white border border-gray-100 px-1 py-0.5 font-bold font-mono">photo</code> | รหัสผ่าน: <code className="rounded bg-white border border-gray-100 px-1 py-0.5 font-bold font-mono">photo</code>
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <User size={12} />
                    ชื่อ - นามสกุลของคุณ
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น โสต ศรีนครินทร์"
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm outline-none ring-primary transition-all focus:bg-white focus:ring-2"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Mail size={12} />
                  ชื่อผู้ใช้งาน หรือ อีเมล
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="photo หรือ email@example.com"
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm outline-none ring-primary transition-all focus:bg-white focus:ring-2"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Lock size={12} />
                    รหัสผ่านเข้าใช้งาน
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? 'ตั้งรหัสผ่าน 6 ตัวอักษรขึ้นไป' : 'กรอกรหัสผ่านของคุณ'}
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 pl-4 pr-10 py-3 text-sm outline-none ring-primary transition-all focus:bg-white focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                disabled={submitting}
                type="submit"
                className="w-full mt-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{submitting ? 'กำลังดำเนินการ...' : isSignUp ? 'ลงทะเบียนเข้าใช้' : 'เข้าใช้งานคลังข้อมูล'}</span>
                {!submitting && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="my-6 flex items-center justify-center gap-3">
              <div className="h-px bg-gray-100 flex-1" />
              <span className="text-[10px] uppercase font-bold text-gray-300">หรือจะสแกน Google</span>
              <div className="h-px bg-gray-100 flex-1" />
            </div>

            <button
              onClick={login}
              className="w-full py-3 border border-gray-200 hover:bg-gray-50 rounded-2xl text-sm font-semibold text-gray-700 flex items-center justify-center gap-2.5 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>ผ่านบัญชี Google Account</span>
            </button>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="text-xs font-semibold text-primary-dark hover:underline"
              >
                {isSignUp ? 'มีสิทธิ์โปรไฟล์อยู่แล้ว? คลิกเข้าสู่ระบบ' : 'พนักงานใหม่ยังไม่มีบัญชีโสตฯ? สมัครที่นี่'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar onAddClick={() => setIsAddModalOpen(true)} />
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            ค้นหาผลงานย้อนหลัง
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            เลือกดูตามหมวดหมู่ ปี หรือค้นหาด้วยแท็กที่คุณต้องการ
          </p>
        </header>

        <MediaList />
      </main>

      <AddMediaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <footer className="mt-20 border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Archive size={16} />
            <span className="text-sm font-medium uppercase tracking-widest">Media Archive System</span>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Media Archive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
