import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { X, Plus, Tag, Link as LinkIcon, Calendar, Folder, Type, AlignLeft, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMediaModal: React.FC<AddMediaModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isCustomVault, setIsCustomVault] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    category: 'Photo',
    year: new Date().getFullYear(),
    tags: '',
    storageVault: 'Google Drive (คลังหลักโสตฯ)',
  });

  const autoDetectVault = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('drive.google.com') || lowerUrl.includes('google.com/drive')) {
      return 'Google Drive (คลังหลักโสตฯ)';
    } else if (lowerUrl.includes('onedrive') || lowerUrl.includes('sharepoint.com')) {
      return 'OneDrive (คลังสถาบัน)';
    } else if (lowerUrl.includes('dropbox.com')) {
      return 'Dropbox Archive';
    } else if (lowerUrl.includes('flickr.com')) {
      return 'Flickr (คลังภาพความละเอียดสูง)';
    } else if (lowerUrl.includes('icloud.com')) {
      return 'iCloud Drive';
    }
    return 'คลังเซิร์ฟเวอร์ภายนอก (External Cloud)';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำรายการ');
      return;
    }

    setLoading(true);
    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '');

      // Execute atomic Supabase Remote Procedure Call (RPC)
      // This automatically handles relational transactions for media_items, tags, and junction table
      // It includes resilient fallback to support old database schema signatures without throwing errors
      let { error } = await supabase.rpc('add_media_item_with_tags', {
        p_title: formData.title,
        p_description: formData.description || '',
        p_link: formData.link,
        p_year: Number(formData.year),
        p_category: formData.category,
        p_tags: tagsArray,
        p_storage_vault: formData.storageVault || 'Google Drive (ทีมโสตฯ)',
      });

      // Fail-safe fallback if column/parameter storage_vault doesn't exist yet on user's live Supabase instance
      if (error && (error.message?.includes('p_storage_vault') || error.message?.includes('storage_vault') || error.message?.includes('does not exist'))) {
        console.warn('Database schema does not support storage_vault yet. Falling back to old RPC parameter signature...', error.message);
        const fallbackRes = await supabase.rpc('add_media_item_with_tags', {
          p_title: formData.title,
          p_description: formData.description || '',
          p_link: formData.link,
          p_year: Number(formData.year),
          p_category: formData.category,
          p_tags: tagsArray,
        });
        error = fallbackRes.error;
      }

      if (error) {
        throw error;
      }

      setFormData({
        title: '',
        description: '',
        link: '',
        category: 'Photo',
        year: new Date().getFullYear(),
        tags: '',
        storageVault: 'Google Drive (คลังหลักโสตฯ)',
      });
      setIsCustomVault(false);
      onClose();
    } catch (error: any) {
      console.error('Error adding media archive item to Supabase:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (error.message || 'กรุณาลองใหม่อีกครั้ง'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                  <Plus size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">เพิ่มผลงานใหม่</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <Type size={12} />
                    ชื่องาน / โปรเจกต์
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="เช่น งานรับปริญญา 2567"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-primary transition-all focus:bg-white focus:ring-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <Folder size={12} />
                      หมวดหมู่
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-primary transition-all focus:bg-white focus:ring-2"
                    >
                      <option value="Photo">Photo</option>
                      <option value="Video">Video</option>
                      <option value="Design">Design</option>
                      <option value="Event">Event</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <Calendar size={12} />
                      ปีที่ผลิต (พ.ศ./ค.ศ.)
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-primary transition-all focus:bg-white focus:ring-2"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <LinkIcon size={12} />
                    ลิงก์ผลงาน (Google Drive / อื่นๆ)
                  </label>
                  <input
                    required
                    type="url"
                    value={formData.link}
                    onChange={(e) => {
                      const linkValue = e.target.value;
                      const detectedVault = autoDetectVault(linkValue);
                      setFormData({ 
                        ...formData, 
                        link: linkValue, 
                        storageVault: isCustomVault ? formData.storageVault : detectedVault 
                      });
                    }}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-primary transition-all focus:bg-white focus:ring-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <Database size={12} />
                    คลังเก็บข้อมูลตำแหน่งปลายทาง
                  </label>
                  <select
                    value={isCustomVault ? 'custom' : formData.storageVault}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setIsCustomVault(true);
                        setFormData({ ...formData, storageVault: '' });
                      } else {
                        setIsCustomVault(false);
                        setFormData({ ...formData, storageVault: val });
                      }
                    }}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-primary transition-all focus:bg-white focus:ring-2"
                  >
                    <option value="Google Drive (คลังหลักโสตฯ)">Google Drive (คลังหลักโสตฯ)</option>
                    <option value="Google Drive (ทีมโสตฯ)">Google Drive (ทีมโสตฯ)</option>
                    <option value="OneDrive (คลังสถาบัน)">OneDrive (คลังสถาบัน)</option>
                    <option value="Dropbox Archive">Dropbox Archive</option>
                    <option value="Flickr (คลังภาพความละเอียดสูง)">Flickr (คลังภาพความละเอียดสูง)</option>
                    <option value="iCloud Drive">iCloud Drive</option>
                    <option value="เซิร์ฟเวอร์สำรอง NAS">เซิร์ฟเวอร์สำรอง NAS</option>
                    <option value="custom">✏️ อื่นๆ/ระบุคลังเก็บข้อมูลเอง...</option>
                  </select>

                  {isCustomVault && (
                    <input
                      type="text"
                      required
                      value={formData.storageVault}
                      onChange={(e) => setFormData({ ...formData, storageVault: e.target.value })}
                      placeholder="เช่น NAS ทีมโสตฯ หรือ Drive สถาบันอันใหม่"
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-primary transition-all focus:bg-white focus:ring-2"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <AlignLeft size={12} />
                    คำอธิบายเพิ่มเติม
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="รายละเอียดสั้นๆ เกี่ยวกับงานนี้..."
                    rows={2}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-primary transition-all focus:bg-white focus:ring-2 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <Tag size={12} />
                    แท็ก (คั่นด้วยเครื่องหมายจุลภาค ,)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="เช่น กิจกรรม, มหาวิทยาลัย, 2567"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-primary transition-all focus:bg-white focus:ring-2"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
