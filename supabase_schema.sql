-- =========================================================================
-- SUPABASE SQL SCHEMA FOR MEDIA ARCHIVE
-- โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช (Somdej Phra Chao Taksin Maharat Hospital)
-- =========================================================================

-- 1. Create custom structure types (Enum) for media category
CREATE TYPE media_type AS ENUM ('photo', 'video', 'link', 'document');

-- 2. Create media_items Table
CREATE TABLE public.media_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type media_type NOT NULL DEFAULT 'photo',
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    description TEXT DEFAULT 'ไม่มีคำอธิบายเพิ่มเติมเกี่ยวกับชิ้นงานนี้',
    creator TEXT DEFAULT 'ศูนย์โสตทัศนศึกษาโรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    clicks_count INTEGER DEFAULT 0 NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow anyone (including anonymous visitors) to view all media items
CREATE POLICY "Allow public read access to media items" 
ON public.media_items 
FOR SELECT 
USING (true);

-- Allow authenticated staffs/admins to insert new media items
CREATE POLICY "Allow authenticated staff to insert" 
ON public.media_items 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated staffs/admins to update existing media items
CREATE POLICY "Allow authenticated staff to update" 
ON public.media_items 
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated staffs/admins to delete media items
CREATE POLICY "Allow authenticated staff to delete" 
ON public.media_items 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- 5. Helper Function to increment clicks atomically without complex updates
CREATE OR REPLACE FUNCTION public.increment_media_clicks(item_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.media_items
    SET clicks_count = clicks_count + 1
    WHERE id = item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================================
-- 6. INITIAL STARTER SEED DATA
-- =========================================================================
INSERT INTO public.media_items (title, type, url, thumbnail_url, description, creator, tags, clicks_count)
VALUES 
(
    'วิดีโอสาธิตการซ้อมแผนอพยพหนีไฟและรหัสภัยพิบัติฉุกเฉินระดับโรงพยาบาลปี 2569',
    'video',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    'วิดีโอบันทึกการฝึกซ้อมแผนเผชิญเหตุฉุกเฉินและการเคลื่อนย้ายผู้ป่วยวิกฤต ความคมชัดระดับ 4K สำหรับทบทวนทักษะและอบรมบุคลากรทางการแพทย์',
    'งานโสตทัศนศึกษาและประชาสัมพันธ์ ฝ่ายสื่อสารองค์กร',
    ARRAY['ซ้อมแผนฉุกเฉิน', 'อพยพหนีไฟ', 'ฝึกอบรมแพทย์', 'งานโสตฯ รพ.'],
    142
),
(
    'ภาพถ่ายทางอากาศมุมสูง (Drone) อาคารศูนย์การแพทย์เฉลิมพระเกียรติ และอาคารผู้ป่วยนอก (OPD)',
    'photo',
    'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=400&q=80',
    'ภาพถ่ายมุมสูงอาคารอำนวยการและอาคารบริการทางการแพทย์ ความละเอียดสูง 48 ล้านพิกเซล ถ่ายในช่วงแสงเย็นเพื่อใช้ทำหัวข้อนำเสนอผลงานวิจัยทางการแพทย์และแบนเนอร์เว็บไซต์',
    'นพ.ธีรเดช หัวหน้าหน่วยเทคโนโลยีและสื่อการสอน',
    ARRAY['ภาพมุมสูง', 'ตึกOPD', 'ศูนย์การแพทย์', 'โดรนโรงพยาบาล'],
    98
),
(
    'ลิงก์คลังแชร์ไดรฟ์รวมไฟล์โลโก้โรงพยาบาลและภาพสัญลักษณ์กระทรวง (.PNG / .SVG / .AI)',
    'link',
    'https://drive.google.com',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    'ลิงก์แชร์ไดรฟ์รวบรวมไฟล์ตราสัญลักษณ์โรงพยาบาล สัญลักษณ์งานวิชาการ และภาพกราฟิกประกอบสื่อสุขศึกษา ไม่มีพื้นหลัง สำหรับบุคลากรนำไปใช้ทางการผลิตสื่อ',
    'ฝ่ายโสตทัศนูปกรณ์และมัลติมีเดียส่วนกลาง',
    ARRAY['ตราโลโก้', 'CIโรงพยาบาล', 'กราฟิกสุขศึกษา', 'GoogleDrive'],
    215
),
(
    'คู่มือสุขอนามัยและระเบียบการจัดทำสื่อวิดีโอเคสผ่าตัดและการยืมอุปกรณ์โสตฯ ล่าสุด',
    'document',
    'https://example.com/manual-2026.pdf',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80',
    'ไฟล์เอกสาร PDF รวบรวมหลักเกณฑ์ความปลอดภัยของห้องบันทึกเสียงและขั้นตอนการเขียนคำร้องยืมกล้อง ไมโครโฟนไร้สาย สำหรับบันทึกขั้นตอนทางการแพทย์อย่างถูกต้อง',
    'ฝ่ายวิทยบริการและศูนย์การเรียนรู้แพทยศาสตรศึกษา',
    ARRAY['คู่มือการยืม', 'ระเบียบห้องผ่าตัด', 'แนวทางทำสื่อ', 'PDF'],
    47
);
