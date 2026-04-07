import React from 'react';
import { LogIn, LogOut, Plus, Search, Archive, User as UserIcon } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';

interface NavbarProps {
  onAddClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAddClick }) => {
  const { user, role, login, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Archive size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-gray-900">Media Archive</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-primary-dark">คลังผลงานโสตฯ</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {role === 'admin' && (
                <button
                  onClick={onAddClick}
                  className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-dark active:scale-95"
                >
                  <Plus size={16} />
                  <span>เพิ่มผลงาน</span>
                </button>
              )}
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <div className="hidden flex-col items-end sm:flex">
                  <span className="text-sm font-medium text-gray-900">{user.displayName}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{role}</span>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="h-8 w-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <UserIcon size={16} />
                  </div>
                )}
                <button
                  onClick={logout}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50 active:scale-95"
            >
              <LogIn size={16} />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
