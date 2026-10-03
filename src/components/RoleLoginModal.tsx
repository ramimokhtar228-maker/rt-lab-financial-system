import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, X, Shield, KeyRound } from 'lucide-react';

export const RoleLoginModal: React.FC = () => {
  const {
    loginModalOpen,
    setLoginModalOpen,
    users,
    loginUser,
    language
  } = useApp();

  const [selectedUsername, setSelectedUsername] = useState<string>(users[0].username);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!loginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginUser(selectedUsername, pin);
    if (!success) {
      setErrorMsg(language === 'ar' ? 'رمز الـ PIN غير صحيح!' : 'Invalid PIN code!');
    } else {
      setPin('');
      setErrorMsg(null);
    }
  };

  const handleSelectUser = (username: string) => {
    setSelectedUsername(username);
    setPin('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-base">
              {language === 'ar' ? 'تبديل المستخدم وتأكيد الصلاحية' : 'Role-Based Authentication'}
            </h3>
          </div>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-xs text-slate-500 mb-4">
            {language === 'ar'
              ? 'اختر الحساب المطلوب وأدخل رمز الـ PIN المخصص للتحقق وضمان سرية البيانات المالية:'
              : 'Select account and enter authorized PIN code:'}
          </p>

          {/* User selector cards */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {users.map(u => {
              const isSelected = selectedUsername === u.username;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u.username)}
                  className={`p-3 text-right rounded-lg border transition-all text-xs ${
                    isSelected
                      ? 'border-rose-800 bg-rose-50 ring-1 ring-rose-800'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-slate-900">
                    {language === 'ar' ? u.nameAr : u.nameEn}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'ar' ? u.titleAr : u.titleEn}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-rose-900">
                    PIN: {u.pin}
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'رمز الـ PIN (المكون من 4 أرقام):' : 'Enter 4-digit PIN:'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={e => {
                    setPin(e.target.value);
                    setErrorMsg(null);
                  }}
                  autoFocus
                  placeholder="••••"
                  className="w-full text-center tracking-[0.5em] text-xl font-mono px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800"
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-600 font-semibold text-center bg-rose-50 py-1.5 rounded">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
              >
                {language === 'ar' ? 'تسجيل الدخول' : 'Authenticate & Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setLoginModalOpen(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
