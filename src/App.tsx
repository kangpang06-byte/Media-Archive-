import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Navbar } from './components/Navbar';
import { MediaList } from './components/MediaList';
import { AddMediaModal } from './components/AddMediaModal';
import { Archive, Search, ShieldAlert } from 'lucide-react';

function AppContent() {
  const { user, loading, login } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-gray-500 animate-pulse">กำลังเตรียมข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[32px] bg-primary text-white shadow-2xl shadow-primary/20">
          <Archive size={40} />
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Media Archive
        </h1>
        <p className="mb-10 max-w-md text-lg text-gray-500 leading-relaxed">
          คลังรวบรวมผลงานและสื่อส่วนกลาง เข้าถึงไฟล์งานย้อนหลังได้ง่ายๆ ด้วยระบบค้นหาอัจฉริยะ
        </p>
        <button
          onClick={login}
          className="group relative flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-lg font-bold text-white transition-all hover:bg-primary-dark active:scale-95"
        >
          <span>เข้าใช้งานระบบ</span>
          <div className="h-2 w-2 rounded-full bg-white transition-all group-hover:w-8" />
        </button>
        
        <div className="mt-16 flex items-center gap-8 text-gray-400">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-gray-900">100%</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Self-Service</span>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-gray-900">Fast</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Tag Search</span>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-gray-900 text-primary">Secure</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Cloud Storage</span>
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
