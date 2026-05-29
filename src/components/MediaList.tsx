import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ExternalLink, Calendar, Tag, Folder, Search, Filter, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface MediaItem {
  id: string;
  title: string;
  description?: string;
  link: string;
  tags: string[];
  year: number;
  category: string;
  createdAt: string;
}

export const MediaList: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select(`
          id,
          title,
          description,
          link,
          year,
          category,
          created_at,
          media_item_tags (
            tags (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formatted = (data || []).map((item: any) => {
        const tagsList = item.media_item_tags
          ? item.media_item_tags
              .map((mit: any) => mit.tags?.name)
              .filter(Boolean)
          : [];

        return {
          id: String(item.id),
          title: item.title,
          description: item.description || '',
          link: item.link,
          year: Number(item.year),
          category: item.category,
          createdAt: item.created_at,
          tags: tagsList,
        };
      });

      setItems(formatted);
    } catch (err) {
      console.error('Error loading media archives from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    // Listen to real-time additions/modifications
    const channel = supabase
      .channel('realtime_media_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'media_items' },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesYear = !selectedYear || item.year === selectedYear;

    return matchesSearch && matchesCategory && matchesYear;
  });

  const categories = Array.from(new Set(items.map(i => i.category)));
  const years = Array.from(new Set(items.map(i => i.year))).sort((a: number, b: number) => b - a);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark" size={18} />
          <input
            type="text"
            placeholder="ค้นหาชื่องาน, แท็ก, หรือคำอธิบาย..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-primary transition-all focus:ring-2"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary transition-all">
            <Filter size={14} className="text-primary-dark" />
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="bg-transparent text-sm font-medium outline-none"
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary transition-all">
            <Calendar size={14} className="text-primary-dark" />
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(Number(e.target.value) || null)}
              className="bg-transparent text-sm font-medium outline-none"
            >
              <option value="">ทุกปี</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {(search || selectedCategory || selectedYear) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory(null);
                setSelectedYear(null);
              }}
              className="flex items-center gap-1 rounded-full bg-primary-light/30 px-3 py-1.5 text-xs font-medium text-primary-dark hover:bg-primary-light/50"
            >
              <X size={12} />
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 transition-all hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light/20 text-primary-dark transition-colors group-hover:bg-primary group-hover:text-white">
                    <Folder size={24} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-primary-light/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-dark">
                      {item.category}
                    </span>
                    <span className="text-xs font-medium text-gray-400">{item.year}</span>
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-primary-dark">
                  {item.title}
                </h3>
                
                <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-500 line-clamp-2">
                  {item.description || 'ไม่มีคำอธิบาย'}
                </p>

                <div className="mb-6 flex flex-wrap gap-1.5">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary-light/10 px-2 py-1 text-[10px] font-medium text-primary-dark"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gray-50 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-primary hover:text-white active:scale-95"
                >
                  <Download size={16} />
                  เข้าชมไฟล์งาน
                  <ExternalLink size={14} className="opacity-50" />
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-primary-light/10 p-6 text-primary-light">
            <Search size={48} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">ไม่พบผลงานที่ค้นหา</h3>
          <p className="text-sm text-gray-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่</p>
        </div>
      )}
    </div>
  );
};
