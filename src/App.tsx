import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Tag, Trash2, Copy, Check, ExternalLink, 
  Filter, Sparkles, AlertCircle, Info, Lock, Unlock, 
  FileCheck, RefreshCw, X
} from 'lucide-react';

// Define Interface for Media Items
interface MediaItem {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'link' | 'document';
  url: string;
  thumbnailUrl?: string;
  description: string;
  creator: string;
  tags: string[];
  createdAt: string;
  clicksCount: number;
}

// Default Premium Starter Data
const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: '1',
    title: 'วิดีโอสาธิตการซ้อมแผนอพยพหนีไฟและรหัสภัยพิบัติฉุกเฉินระดับโรงพยาบาลปี 2569',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80', // video thumbnail
    thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    description: 'วิดีโอบันทึกการฝึกซ้อมแผนเผชิญเหตุฉุกเฉินและการเคลื่อนย้ายผู้ป่วยวิกฤต ความคมชัดระดับ 4K สำหรับทบทวนทักษะและอบรมบุคลากรทางการแพทย์',
    creator: 'งานโสตทัศนศึกษาและประชาสัมพันธ์ ฝ่ายสื่อสารองค์กร',
    tags: ['ซ้อมแผนฉุกเฉิน', 'อพยพหนีไฟ', 'ฝึกอบรมแพทย์', 'งานโสตฯ รพ.'],
    createdAt: '2026-05-15T09:00:00.000Z',
    clicksCount: 142
  },
  {
    id: '2',
    title: 'ภาพถ่ายทางอากาศมุมสูง (Drone) อาคารศูนย์การแพทย์เฉลิมพระเกียรติ และอาคารผู้ป่วยนอก (OPD)',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=400&q=80',
    description: 'ภาพถ่ายมุมสูงอาคารอำนวยการและอาคารบริการทางการแพทย์ ความละเอียดสูง 48 ล้านพิกเซล ถ่ายในช่วงแสงเย็นเพื่อใช้ทำหัวข้อนำเสนอผลงานวิจัยทางการแพทย์และแบนเนอร์เว็บไซต์',
    creator: 'นพ.ธีรเดช หัวหน้าหน่วยเทคโนโลยีและสื่อการสอน',
    tags: ['ภาพมุมสูง', 'ตึกOPD', 'ศูนย์การแพทย์', 'โดรนโรงพยาบาล'],
    createdAt: '2026-05-20T14:30:00.000Z',
    clicksCount: 98
  },
  {
    id: '3',
    title: 'ลิงก์คลังแชร์ไดรฟ์รวมไฟล์โลโก้โรงพยาบาลและภาพสัญลักษณ์กระทรวง (.PNG / .SVG / .AI)',
    type: 'link',
    url: 'https://drive.google.com',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    description: 'ลิงก์แชร์ไดรฟ์รวบรวมไฟล์ตราสัญลักษณ์โรงพยาบาล สัญลักษณ์งานวิชาการ และภาพกราฟิกประกอบสื่อสุขศึกษา ไม่มีพื้นหลัง สำหรับบุคลากรนำไปใช้ทางการผลิตสื่อ',
    creator: 'ฝ่ายโสตทัศนูปกรณ์และมัลติมีเดียส่วนกลาง',
    tags: ['ตราโลโก้', 'CIโรงพยาบาล', 'กราฟิกสุขศึกษา', 'GoogleDrive'],
    createdAt: '2026-05-25T08:15:00.000Z',
    clicksCount: 215
  },
  {
    id: '4',
    title: 'คู่มือสุขอนามัยและระเบียบการจัดทำสื่อวิดีโอเคสผ่าตัดและการยืมอุปกรณ์โสตฯ ล่าสุด',
    type: 'document',
    url: 'https://example.com/manual-2026.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80',
    description: 'ไฟล์เอกสาร PDF รวบรวมหลักเกณฑ์ความปลอดภัยของห้องบันทึกเสียงและขั้นตอนการเขียนคำร้องยืมกล้อง ไมโครโฟนไร้สาย สำหรับบันทึกขั้นตอนทางการแพทย์อย่างถูกต้อง',
    creator: 'ฝ่ายวิทยบริการและศูนย์การเรียนรู้แพทยศาสตรศึกษา',
    tags: ['คู่มือการยืม', 'ระเบียบห้องผ่าตัด', 'แนวทางทำสื่อ', 'PDF'],
    createdAt: '2026-05-28T11:00:00.000Z',
    clicksCount: 47
  }
];

export default function App() {
  // --- STATES ---
  const [items, setItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('media_archive_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading items from localStorage:', e);
      }
    }
    return DEFAULT_MEDIA_ITEMS;
  });

  // Mode settings
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // default to true so users can manage straight away!
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'photo' | 'video' | 'link' | 'document'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for creating a new item
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'photo' | 'video' | 'link' | 'document'>('photo');
  const [newUrl, setNewUrl] = useState('');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCreator, setNewCreator] = useState('');
  const [newTagsString, setNewTagsString] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // File Upload emulation refs & logic
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('media_archive_items', JSON.stringify(items));
  }, [items]);

  // Handle URL short copy
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1800);

    // Increment clicks
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, clicksCount: item.clicksCount + 1 };
      }
      return item;
    }));
  };

  // Open direct url and increment click
  const handleOpenLink = (url: string, id: string) => {
    window.open(url, '_blank', 'noreferrer');
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, clicksCount: item.clicksCount + 1 };
      }
      return item;
    }));
  };

  // Delete item handler
  const handleDeleteItem = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการสื่อนี้ออกจากคลังข้อมูลโสตฯ?')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Preset quick registration of sample data if empty
  const handleRestoreDefaults = () => {
    if (confirm('ระบบจะกู้คืนข้อมูลเริ่มต้นที่โสตฯ แนะนำให้ทันที ทับซ้อนรายการปัจจุบัน คุณต้องการยืนยันหรือไม่?')) {
      setItems(DEFAULT_MEDIA_ITEMS);
      setActiveCategory('all');
      setSelectedTag(null);
    }
  };

  // Parse tags safely from string input
  const parseTags = (input: string): string[] => {
    return input
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  // Form Submission
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      alert('กรุณากรอกหัวข้อผลงาน');
      return;
    }
    if (!newUrl.trim()) {
      alert('กรุณาระบุ ลิงก์เก็บไฟล์ หรือ URL ของภาพ/วิดีโอ');
      return;
    }

    const typePresetImages: Record<'photo' | 'video' | 'link' | 'document', string> = {
      photo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=400&q=80',
      video: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80',
      link: 'https://images.unsplash.com/photo-1546074177-ffedd1d85d4c?auto=format&fit=crop&w=400&q=80',
      document: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
    };

    const finalThumbnail = newThumbnailUrl.trim() || typePresetImages[newType];

    const newItem: MediaItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      type: newType,
      url: newUrl.trim(),
      thumbnailUrl: finalThumbnail,
      description: newDescription.trim() || 'ไม่มีคำอธิบายเพิ่มเติมเกี่ยวกับชิ้นงานนี้',
      creator: newCreator.trim() || 'ศูนย์โสตทัศนศึกษาโรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช',
      tags: parseTags(newTagsString),
      createdAt: new Date().toISOString(),
      clicksCount: 0
    };

    setItems(prev => [newItem, ...prev]);
    setIsAddModalOpen(false);

    // Reset Form
    setNewTitle('');
    setNewType('photo');
    setNewUrl('');
    setNewThumbnailUrl('');
    setNewDescription('');
    setNewCreator('');
    setNewTagsString('');
  };

  // Dropzone file handling emulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateFileUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      simulateFileUpload(file);
    }
  };

  const simulateFileUpload = (file: File) => {
    // Generate an object URL for preview and autofill fields
    const objectUrl = URL.createObjectURL(file);
    setNewUrl(objectUrl);
    setNewTitle(file.name.replace(/\.[^/.]+$/, "")); // Strip file extension
    setNewCreator('อัปโหลดไฟล์โดยเจ้าหน้าที่');
    setNewTagsString(file.type.split('/')[0] || 'ไฟล์ท้องถิ่น');
    
    // Auto preset thumbnails
    if (file.type.startsWith('image/')) {
      setNewType('photo');
      setNewThumbnailUrl(objectUrl);
    } else if (file.type.startsWith('video/')) {
      setNewType('video');
      setNewThumbnailUrl('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80');
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      setNewType('document');
    } else {
      setNewType('link');
    }
  };

  // Get all unique tags from items to show on sidebar
  const allTags = Array.from(
    new Set(items.flatMap(item => item.tags))
  );

  // Filter Items Reactive
  const filteredItems = items.filter(item => {
    // 1. Filter Category
    if (activeCategory !== 'all' && item.type !== activeCategory) {
      return false;
    }
    // 2. Filter Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q);
      const inDesc = item.description.toLowerCase().includes(q);
      const inCreator = item.creator.toLowerCase().includes(q);
      const inTags = item.tags.some(t => t.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inCreator && !inTags) {
        return false;
      }
    }
    // 3. Filter Sidebar Tag
    if (selectedTag && !item.tags.includes(selectedTag)) {
      return false;
    }
    return true;
  });

  return (
    <div id="media-archive-root" className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans transition-all selection:bg-teal-500 selection:text-slate-900">
      
      {/* HEADER NAVBAR */}
      <header id="app-nav" className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 sm:px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/10">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
                Media Archive
              </h1>
              <p className="text-[10px] sm:text-[11px] text-teal-400/80 font-bold tracking-wider uppercase">
                คลังบริการสื่อศึกษาและผลงานโสตทัศนศึกษาโรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2.5">
            {/* Direct Admin Switching Badge */}
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-300 ${
                isAdmin 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/15 border border-teal-300/20' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
              title="สลับโหมดผู้ใช้งานหลัก (โหมดผู้จัดการข้อมูล / โหมดผู้เยี่ยมชมคลัง)"
            >
              {isAdmin ? (
                <>
                  <Unlock size={12} className="stroke-[3]" />
                  <span>สิทธิ์การแก้ไข: เปิด</span>
                </>
              ) : (
                <>
                  <Lock size={12} />
                  <span>สิทธิ์บุคคลทั่วไป: ส่องดูคลัง</span>
                </>
              )}
            </button>

            {/* Restore defaults */}
            <button
              onClick={handleRestoreDefaults}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-all hover:bg-slate-700 active:scale-95"
              title="ล้างข้อมูลและโหลดค่าเริ่มต้นสำหรับชมระบบ"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* TOP DESCRIPTIVE INFORMATION BAR */}
      <section id="banner-section" className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 px-4 py-6 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full">
              ✨ เปิดทำงานสมบูรณ์ (เข้าสู่หน้าหลักโดยตรง)
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              ศูนย์บริการและคลังจัดเก็บผลงานโสตทัศนูปกรณ์โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช 🏥
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              สืบค้น คัดลอก และดาวน์โหลดสื่อสุขศึกษาคุณภาพสูง วิดีโองานวิชาการทางการแพทย์ ภาพถ่ายโดรนตึกศูนย์การแพทย์ และคู่มือแนะนำอุปกรณ์โสตทัศนูปกรณ์ได้อย่างรวดเร็วในคลิกเดียว
            </p>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-auto">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">ข้อมูลสื่อรวม</p>
              <p className="text-xl font-black text-teal-400">{items.length} รายการ</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">การเข้าสืบค้น</p>
              <p className="text-xl font-black text-emerald-400">
                {items.reduce((sum, item) => sum + (item.clicksCount || 0), 0)} ครั้ง
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH AND CATEGORY CONTROLS */}
      <div id="search-bar-wrap" className="sticky top-[73px] z-30 bg-slate-900/95 py-4 border-b border-slate-800/60 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          
          {/* Search box input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อผลงาน, คำอธิบาย, ชื่อผู้บันทึก หรือแฮชแท็กที่กำหนด..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-400 transition-all focus:ring-1 focus:ring-teal-400/20"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 text-xs px-1.5 py-0.5 rounded bg-slate-900 font-bold"
              >
                ล้างข้อมูล
              </button>
            )}
          </div>

          {/* Quick Category filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => { setActiveCategory('all'); setSelectedTag(null); }}
              className={`px-3 py-2 rounded-lg text-xs font-black transition-all ${
                activeCategory === 'all' && !selectedTag
                  ? 'bg-slate-100 text-slate-900 font-black'
                  : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              🗂️ ทั้งหมด
            </button>
            <button
              onClick={() => { setActiveCategory('photo'); setSelectedTag(null); }}
              className={`px-3 py-2 rounded-lg text-xs font-black transition-all inline-flex items-center gap-1 ${
                activeCategory === 'photo'
                  ? 'bg-emerald-550 bg-teal-500 text-slate-950 font-black'
                  : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              📸 ภาพถ่าย
            </button>
            <button
              onClick={() => { setActiveCategory('video'); setSelectedTag(null); }}
              className={`px-3 py-2 rounded-lg text-xs font-black transition-all inline-flex items-center gap-1 ${
                activeCategory === 'video'
                  ? 'bg-teal-500 text-slate-950 font-black'
                  : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              🎥 วิดีโอ
            </button>
            <button
              onClick={() => { setActiveCategory('link'); setSelectedTag(null); }}
              className={`px-3 py-2 rounded-lg text-xs font-black transition-all inline-flex items-center gap-1 ${
                activeCategory === 'link'
                  ? 'bg-teal-500 text-slate-950 font-black'
                  : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              🔗 ไดรฟ์แชร์ลิงก์
            </button>
            <button
              onClick={() => { setActiveCategory('document'); setSelectedTag(null); }}
              className={`px-3 py-2 rounded-lg text-xs font-black transition-all inline-flex items-center gap-1 ${
                activeCategory === 'document'
                  ? 'bg-teal-500 text-slate-950 font-black'
                  : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              📄 เอกสาร / PDF
            </button>

            {/* Admin add media button */}
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="ml-auto lg:ml-2 px-3.5 py-2 rounded-lg text-xs font-black bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-teal-400/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>เพิ่มมีเดียผลงาน</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* CORE WORKSPACE CONTENT GRID */}
      <main id="main-content-layout" className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 flex flex-col lg:flex-row gap-6">
        
        {/* LEFTSIDE BAR - Tag Indexer & Access Policies */}
        <aside id="sidebar-widgets" className="w-full lg:w-64 space-y-5 flex-shrink-0">
          
          {/* Quick Notice Widget */}
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl p-4 border border-slate-800/80">
            <h3 className="text-xs font-black text-slate-350 flex items-center gap-1.5 uppercase tracking-wider">
              <Info size={13} className="text-teal-400" />
              ระเบียบความปลอดภัยข้อมูล
            </h3>
            <p className="mt-2 text-[11px] text-slate-400 leading-normal">
              ชิ้นงานสื่อการสอนและคู่มือทั้งหมดที่เผยแพร่ ถือเป็นลิขสิทธิ์ความดูแลของโรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช บุคลากรทางการแพทย์ทุกฝ่ายงานสามารถดาวน์โหลดเพื่อจัดระเบียบและใช้ประกอบการทำงาน คัดลอกข้อมูลโดยเคารพต่อความเป็นส่วนตัวของผู้รับบริการ
            </p>
          </div>

          {/* Tag filtering Index box */}
          <div className="bg-slate-950 rounded-2xl p-4.5 border border-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-black text-slate-350 flex items-center gap-1.5 uppercase tracking-wider">
                <Tag size={13} className="text-amber-400" />
                ดัชนีแฮชแท็กด่วน
              </h3>
              {(selectedTag || activeCategory !== 'all') && (
                <button
                  onClick={() => { setSelectedTag(null); setActiveCategory('all'); }}
                  className="text-[10px] text-teal-400 hover:text-teal-300 font-black cursor-pointer"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            {allTags.length === 0 ? (
              <p className="text-[11px] text-slate-500">ไม่มีป้ายกำกับในระบบโสตทัศนศึกษาขณะนี้</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {allTags.map(tag => {
                  const isCurrent = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isCurrent ? null : tag)}
                      className={`px-2 py-1 rounded text-[11px] transition-all font-medium ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 font-black shadow-inner shadow-amber-400'
                          : 'bg-slate-900 text-slate-450 hover:bg-slate-850 hover:text-slate-200 text-slate-400'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick tip info for Visitor */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-5050 from-indigo-950/40 via-slate-950 to-slate-950 p-4 border border-indigo-900/40 text-left space-y-2">
            <p className="text-[11px] font-black text-indigo-400 flex items-center gap-1">
              ⚡ เคล็ดลับมีเดียฟราย:
            </p>
            <p className="text-[10px] text-slate-400 leading-normal">
              สามารถลบและสร้างข้อมูลมีเดียลิงก์ด้วยตนเองผ่านเบราว์เซอร์นี้ ข้อมูลจะถูกบันทึกไว้อย่างปลอดภัยถาวรในเครื่องคอมพิวเตอร์ของคุณจนกว่าจะล้างแคช!
            </p>
          </div>
        </aside>

        {/* RIGHTSIDE BAR - Core Portfolio Deck list */}
        <section id="portfolio-deck" className="flex-1 space-y-5">
          
          {/* Header Title displaying filters config */}
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400">
                พบ {filteredItems.length} จาก {items.length} รายการมีเดียทั้งหมด
              </span>
              {selectedTag && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black">
                  แท็ก: #{selectedTag}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Filter size={11} />
              <span>เรียงลำดับจากชิ้นงานล่าสุด</span>
            </div>
          </div>

          {/* Handle EMPTY STATE screen */}
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl bg-slate-950 border border-slate-850 border-dashed p-12 text-center text-slate-400 max-w-xl mx-auto my-6 space-y-4">
              <div className="h-14 w-14 bg-slate-900 text-slate-500 mx-auto rounded-full flex items-center justify-center border border-slate-800">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-200">ไม่พบข้อมูลมีเดียคลังงานโสตฯ ที่ระบุดังกล่าว</h4>
                <p className="mt-1.5 text-xs text-slate-500">
                  คุณสามารถพิมพ์ค้นหาด้วยค่าใหม่อื่นๆ สลับแท็บ หรือสามารถสร้างผลงานจัดเก็บใหม่ได้โดยกดปุ่ม "เพิ่มมีเดียผลงาน" ด้านขวาบน
                </p>
              </div>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); setSelectedTag(null); }}
                className="px-4 py-2 rounded-lg bg-teal-500 text-slate-950 text-xs font-black"
              >
                ล้างข้อมูลตัวกรองเพื่อเรียกดูทั้งหมด
              </button>
            </div>
          ) : (
            // Core media list grid
            <div id="media-card-grid" className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredItems.map(item => {
                const badgeTypes = {
                  photo: { label: 'ภาพถ่าย 📸', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                  video: { label: 'วิดีโอ 🎥', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                  link: { label: 'แชร์ไดรฟ์ลิงก์ 🔗', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                  document: { label: 'เอกสาร/คู่มือ 📄', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
                };

                return (
                  <div 
                    key={item.id} 
                    className="group bg-slate-950 border border-slate-850/80 rounded-2xl overflow-hidden flex flex-col hover:border-slate-700 transition-all duration-300 shadow-xl hover:shadow-black/40"
                  >
                    
                    {/* Visual Media Thumbnail Area with category badge */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      
                      {/* Thumbnail Image display */}
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.title} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                        onError={(e) => {
                          // Fallback source if users type broken links
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=400&q=80';
                        }}
                      />

                      {/* Cover Dark Glass Overlay for visual quality overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/10 to-transparent pointer-events-none" />

                      {/* Header Category Badge */}
                      <span className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border ${badgeTypes[item.type].color}`}>
                        {badgeTypes[item.type].label}
                      </span>

                      {/* Click counters indicator */}
                      <span className="absolute bottom-2.5 right-2.5 text-[10px] font-black text-slate-300 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-800 shadow">
                        เข้าถึง {item.clicksCount || 0} ครั้ง
                      </span>
                    </div>

                    {/* Meta and description content card and tags */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                      
                      <div className="space-y-2">
                        {/* Title and date */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500">
                            ลงทะเบียนเมื่อ: {new Date(item.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <h4 className="text-sm font-black text-white hover:text-teal-400 transition-colors line-clamp-2 leading-relaxed">
                            {item.title}
                          </h4>
                        </div>

                        {/* Description paragraphs */}
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Creator information info badge */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                          <span className="font-bold text-slate-500">อัปโหลดโดย:</span>
                          <span className="text-teal-400 font-bold">{item.creator}</span>
                        </div>
                      </div>

                      {/* Dynamic Hashtags badges within specific card layout */}
                      <div className="space-y-4 pt-2 border-t border-slate-850">
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.tags.map(t => (
                              <button
                                key={t}
                                onClick={() => setSelectedTag(t)}
                                className="text-[10px] font-bold text-slate-450 hover:text-teal-400 text-slate-400 transition-colors bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons: Visitor copy link, open links, optionally deleting items in admin role */}
                        <div className="flex items-center gap-2">
                          
                          {/* Copy Link button */}
                          <button
                            onClick={() => handleCopyLink(item.url, item.id)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-850 text-slate-250 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer active:scale-95"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check size={13} className="text-emerald-400" />
                                <span className="text-emerald-400">คัดลอกสำเร็จ!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>คัดลอกลิงก์</span>
                              </>
                            )}
                          </button>

                          {/* Open files or Direct linkages */}
                          <button
                            onClick={() => handleOpenLink(item.url, item.id)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-black bg-gradient-to-tr from-teal-500/10 to-teal-400/20 text-teal-400 hover:from-teal-500/20 hover:to-teal-400/30 border border-teal-500/20 hover:border-teal-500/35 transition-all cursor-pointer active:scale-95"
                          >
                            <span>เปิดดูตรงนี้</span>
                            <ExternalLink size={12} />
                          </button>

                          {/* Admin only delete function right on button control */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 rounded-xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/25 transition-all shadow cursor-pointer active:scale-95"
                              title="ลบพอร์ทหรือชิ้นงานแชร์"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER METADATA (NO INFRASTRUCTURE LARPING OR TELEMETRY ONLINE LABELS) */}
      <footer id="global-footer" className="bg-slate-950 border-t border-slate-850 mt-12 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <p className="text-xs font-bold text-slate-400">
              Media Archive (คลังบริการผลงานโสตทัศนศึกษาโรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช) - ปีงบประมาณ 2569
            </p>
            <p className="text-[11px] text-slate-500">
              พัฒนาขึ้นเพื่ออำนวยความสะดวกในการจัดเก็บไฟล์ต้นฉบับบันทึกการซ้อมรหัสวิกฤต วารสารวิชาการแพทย์ ภาพนิ่งอาคาร และระเบียบส่วนงานอย่างเป็นทางการ
            </p>
          </div>
          <p className="text-[10px] text-slate-500">
            ระบบจัดเก็บเป็นแบบ Offline Local Storage ปลอดภัย 100% ไม่มีข้อมูลรั่วไหล
          </p>
        </div>
      </footer>

      {/* DETAILED DIALOG MODAL: ADDING AND REGISTERING MEDIA */}
      {isAddModalOpen && (
        <div id="modal-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop screen filter */}
          <div 
            onClick={() => setIsAddModalOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-all" 
          />

          {/* Dialog Container */}
          <div className="relative bg-slate-900 border border-slate-805 border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            
            {/* Modal Heading */}
            <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">ลงทะเบียนอัปโหลดผลงานสื่อใหม่</h3>
                  <p className="text-[10px] text-slate-400 font-bold">กรอกข้อมูลหรือลากไฟล์ภาพ/วิดีโอลงในปุ่มเพื่อสร้างมีเดีย</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drag & Drop emulation layout */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mb-5 p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${
                dragActive 
                  ? 'border-teal-400 bg-teal-500/10 text-white shadow-lg' 
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400 hover:text-slate-350'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                accept="image/*,video/*,application/pdf"
              />
              <div className="flex flex-col items-center gap-2">
                <FileCheck size={28} className={dragActive ? 'text-teal-400 animate-bounce' : 'text-slate-500'} />
                <p className="text-xs font-black">
                  {dragActive ? 'ปล่อยไฟล์ลากตรงนี้ทันที!' : 'ลากไฟล์ผลงานมาวาง หรือ คลิกเพื่ออัปโหลดจำลอง'}
                </p>
                <p className="text-[10px] text-slate-500 leading-normal">
                  รองรับไฟล์รูปภาพ, วิดีโอคลิป หรือ PDF เอกสารคู่มือ (ระบบจะกรอกข้อมูลและจัดหมวดถอดค่าเบื้องต้นให้ทันที)
                </p>
              </div>
            </div>

            {/* Core input fields form */}
            <form onSubmit={handleCreateItem} className="space-y-4">
              
              {/* Form item: title */}
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1.5">ชื่อหัวข้อผลงาน / ชื่อกิจกรรม *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คู่มือระเบียบการผลิตสื่อสุขศึกษาและห้องสตูดิโอ"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-teal-400 text-slate-200"
                />
              </div>

              {/* Form group: Type and Creator */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1.5">ประเภทชิ้นงาน *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-teal-400"
                  >
                    <option value="photo">ภาพถ่าย 📸</option>
                    <option value="video">วิดีโอ 🎥</option>
                    <option value="link">แชร์ไดรฟ์ลิงก์ 🔗</option>
                    <option value="document">เอกสาร/คู่มือ 📄</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1.5">ชื่อผู้อัปโหลด / ฝ่ายงาน</label>
                  <input
                    type="text"
                    placeholder="เช่น งานโสตทัศนศึกษาเพื่อแพทยศาสตรศึกษา"
                    value={newCreator}
                    onChange={(e) => setNewCreator(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-teal-400 text-slate-200"
                  />
                </div>
              </div>

              {/* Form item: url */}
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1.5">ลิงก์ภาพต้นฉบับ / แหล่งเก็บไฟล์ (URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... หรือคัดลอกไฟล์ต้นทางมาวาง"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-teal-400 text-slate-200"
                />
              </div>

              {/* Form item: thumbnailUrl */}
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1.5">ลิงก์ภาพหน้าปก / ภาพพรีวิวขนาดเล็ก (Thumbnail URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... หรือเว้นว่างเพื่อให้ระบบสุ่มรูปที่สวยงามเหมาะสม"
                  value={newThumbnailUrl}
                  onChange={(e) => setNewThumbnailUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-teal-400 text-slate-200"
                />
              </div>

              {/* Form item: description */}
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1.5">คำอธิบายรายละเอียดชิ้นงานพอสังเขป</label>
                <textarea
                  rows={2}
                  placeholder="เช่น รายละเอียดโครงการ ภาพนี้ถ่ายด้วยเครื่องโดรนความสูง 100 เมตร..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-teal-400 text-slate-200"
                />
              </div>

              {/* Form item: tags */}
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1.5">ป้ายกำกับสำหรับค้นหาแถบซ้าย (แฮชแท็ก คั่นด้วยเครื่องหมายจุลภาค ",")</label>
                <input
                  type="text"
                  placeholder="เช่น อบรมแพทย์, ตึกOPD, คู่มือการใช้งาน, สื่อสุขศึกษา (ไม่จำเป็นต้องใส่เครื่องหมาย #)"
                  value={newTagsString}
                  onChange={(e) => setNewTagsString(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-teal-400 text-slate-200"
                />
              </div>

              {/* Dialog Submission Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-teal-400/10 cursor-pointer"
                >
                  บันทึกลงคลังมีเดีย
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
}
