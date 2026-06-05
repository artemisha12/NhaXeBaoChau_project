'use client';

import { useState } from 'react';
import { changePasswordAction } from '@/app/actions/auth/actions';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function PasswordInput({
  id, label, value, onChange, show, onToggle, placeholder,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

// Strength bar
function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Rất yếu', color: 'bg-red-500' },
    { label: 'Yếu',     color: 'bg-orange-400' },
    { label: 'Trung bình', color: 'bg-yellow-400' },
    { label: 'Mạnh',    color: 'bg-lime-500' },
    { label: 'Rất mạnh', color: 'bg-emerald-500' },
  ];
  const level = levels[Math.max(0, score - 1)];

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 h-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`flex-1 rounded-full transition-all ${i <= score ? level.color : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className="text-[11px] text-slate-400 mt-1">{level.label}</p>
    </div>
  );
}

export default function ChangePasswordForm() {
  const [oldPass,  setOldPass]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showCfm,  setShowCfm]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const reset = () => { setOldPass(''); setNewPass(''); setConfirm(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!oldPass)  { setMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại.' }); return; }
    if (newPass.length < 8) { setMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 8 ký tự.' }); return; }
    if (newPass !== confirm) { setMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' }); return; }
    if (newPass === oldPass) { setMsg({ type: 'error', text: 'Mật khẩu mới phải khác mật khẩu hiện tại.' }); return; }

    setSaving(true);
    const result = await changePasswordAction(oldPass, newPass);
    setSaving(false);

    if (result.success) {
      setMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      reset();
    } else {
      setMsg({ type: 'error', text: result.error || 'Đổi mật khẩu thất bại.' });
    }
  };

  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">Đổi mật khẩu</h2>
        <p className="text-xs text-slate-400 mt-0.5">Mật khẩu mới phải có ít nhất 8 ký tự.</p>
      </div>

      {msg && (
        <div className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
          msg.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          {msg.type === 'success' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        <PasswordInput
          id="old-pass" label="Mật khẩu hiện tại"
          value={oldPass} onChange={setOldPass}
          show={showOld} onToggle={() => setShowOld(v => !v)}
          placeholder="Mật khẩu đang dùng"
        />
        <div>
          <PasswordInput
            id="new-pass" label="Mật khẩu mới"
            value={newPass} onChange={setNewPass}
            show={showNew} onToggle={() => setShowNew(v => !v)}
            placeholder="Ít nhất 8 ký tự"
          />
          <StrengthBar password={newPass} />
        </div>
        <PasswordInput
          id="confirm-pass" label="Xác nhận mật khẩu mới"
          value={confirm} onChange={setConfirm}
          show={showCfm} onToggle={() => setShowCfm(v => !v)}
          placeholder="Nhập lại mật khẩu mới"
        />

        <div className="md:col-span-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed"
          >
            {saving ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  );
}
