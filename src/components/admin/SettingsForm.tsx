'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from "@/context/AdminContext";

export default function SettingsForm() {
  const { siteSettings, updateSiteSettings } = useAdmin();

  // Local state for settings form
  const [hotline, setHotline] = useState('');
  const [zaloPhone, setZaloPhone] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [zaloOaUrl, setZaloOaUrl] = useState('');
  const [bannerSlogan, setBannerSlogan] = useState('');

  // Hydrate local state when context mounts
  useEffect(() => {
    if (siteSettings) {
      setHotline(siteSettings.hotline);
      setZaloPhone(siteSettings.zaloPhone);
      setOfficeAddress(siteSettings.officeAddress);
      setWorkingHours(siteSettings.workingHours);
      setFacebookUrl(siteSettings.facebookUrl);
      setZaloOaUrl(siteSettings.zaloOaUrl || '');
      setBannerSlogan(siteSettings.bannerSlogan);
    }
  }, [siteSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateSiteSettings({
      hotline,
      zaloPhone,
      officeAddress,
      workingHours,
      facebookUrl,
      zaloOaUrl,
      bannerSlogan
    });

    alert('Đã lưu cấu hình thông tin website thành công!');
  };

  return (
    <div className="rounded-3xl border border-[#e8dccb] bg-[#fffdf8] p-6 shadow-sm font-sans">
      <h2 className="text-lg font-black text-[#102033]">Cài đặt thông tin website</h2>
      <p className="mt-1 text-sm text-[#5f6b76]">Các thông tin cấu hình dưới đây sẽ tự động hiển thị trực tiếp ở phần đầu trang (Header), chân trang (Footer) và Banner của Landing Page.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-[#5f6b76]">Điện thoại Hotline</span>
          <input 
            value={hotline}
            onChange={(e) => setHotline(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] px-4 py-3 outline-none transition focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925] text-sm font-semibold" 
            placeholder="Ví dụ: 0905 123 456"
            required
          />
        </label>
        
        <label className="block">
          <span className="text-sm font-bold text-[#5f6b76]">Zalo Hotline hỗ trợ</span>
          <input 
            value={zaloPhone}
            onChange={(e) => setZaloPhone(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] px-4 py-3 outline-none transition focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925] text-sm font-semibold" 
            placeholder="Ví dụ: 0905 123 456"
            required
          />
        </label>

        <label className="md:col-span-2 block">
          <span className="text-sm font-bold text-[#5f6b76]">Địa chỉ văn phòng chính</span>
          <input 
            value={officeAddress}
            onChange={(e) => setOfficeAddress(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] px-4 py-3 outline-none transition focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925] text-sm font-semibold" 
            placeholder="Ví dụ: 12 Hùng Vương, Huế"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#5f6b76]">Giờ hoạt động đón khách</span>
          <input 
            value={workingHours}
            onChange={(e) => setWorkingHours(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] px-4 py-3 outline-none transition focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925] text-sm font-semibold" 
            placeholder="Ví dụ: 06:00 - 22:00"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#5f6b76]">Facebook URL liên kết</span>
          <input 
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] px-4 py-3 outline-none transition focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925] text-sm font-semibold" 
            placeholder="Ví dụ: https://facebook.com/..."
          />
        </label>

        <label className="md:col-span-2 block">
          <span className="text-sm font-bold text-[#5f6b76]">Zalo OA hoặc Zalo cá nhân URL link</span>
          <input 
            value={zaloOaUrl}
            onChange={(e) => setZaloOaUrl(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] px-4 py-3 outline-none transition focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925] text-sm font-semibold" 
            placeholder="Ví dụ: https://zalo.me/..."
          />
        </label>

        <label className="md:col-span-2 block">
          <span className="text-sm font-bold text-[#5f6b76]">Banner slogan / Câu giới thiệu</span>
          <textarea 
            rows={3} 
            value={bannerSlogan}
            onChange={(e) => setBannerSlogan(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] p-3 text-sm outline-none transition focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925] font-medium" 
            placeholder="Viết lời giới thiệu nổi bật..."
            required
          />
        </label>

        <div className="md:col-span-2 pt-2">
          <button 
            type="submit" 
            className="rounded-2xl bg-[#c88925] px-6 py-3.5 text-sm font-black text-white hover:bg-[#a86e19] hover:shadow-md transition duration-150 focus:outline-none"
          >
            Lưu cấu hình hệ thống
          </button>
        </div>
      </form>
    </div>
  );
}
