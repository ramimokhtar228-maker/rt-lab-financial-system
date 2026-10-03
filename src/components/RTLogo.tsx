import React from 'react';

interface RTLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  variant?: 'full' | 'compact' | 'badge' | 'horizontal';
  theme?: 'dark' | 'light' | 'auto';
  sloganColor?: string;
}

export const RTLogo: React.FC<RTLogoProps> = ({
  className = '',
  size = 'md',
  showSlogan = true,
  variant = 'full',
  theme = 'light',
  sloganColor = 'text-rose-700'
}) => {
  const sizeMap = {
    sm: { icon: 'w-9 h-9', text: 'text-base', badge: 'text-[9px]', sub: 'text-[10px]', slogan: 'text-[10px]', rtText: 'text-xl' },
    md: { icon: 'w-12 h-12', text: 'text-xl', badge: 'text-[10px]', sub: 'text-xs', slogan: 'text-xs', rtText: 'text-2xl' },
    lg: { icon: 'w-16 h-16', text: 'text-2xl', badge: 'text-xs', sub: 'text-sm', slogan: 'text-sm', rtText: 'text-3xl' },
    xl: { icon: 'w-24 h-24', text: 'text-4xl', badge: 'text-sm', sub: 'text-base', slogan: 'text-base', rtText: 'text-5xl' }
  };

  const currentSize = sizeMap[size];
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D High-Tech RT LABS Icon: Deep Red Chrome & Ruby Droplet */}
      <div
        className={`relative ${currentSize.icon} shrink-0 rounded-2xl bg-gradient-to-br from-[#4c0519] via-[#881337] to-[#0f172a] p-1 shadow-lg shadow-rose-950/40 border border-rose-600/40 group`}
      >
        {/* Glow backdrop */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl blur-xs opacity-60 group-hover:opacity-100 transition duration-300"></div>

        <div className="relative w-full h-full rounded-xl bg-[#090b10] flex items-center justify-center overflow-hidden border border-rose-900/50">
          {/* Circuit and DNA helix lines */}
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" fill="none">
            <path d="M10 20 H35 L45 35 H75" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M90 80 H65 L55 65 H25" stroke="#dc2626" strokeWidth="1.5" />
            <circle cx="75" cy="35" r="3" fill="#ef4444" />
            <circle cx="25" cy="65" r="3" fill="#dc2626" />
          </svg>

          {/* Central 3D Blood Droplet & RT Lockup */}
          <div className="relative flex items-center justify-center leading-none">
            {/* Metallic Red 'R' */}
            <span
              className="font-black text-transparent bg-clip-text bg-gradient-to-b from-rose-200 via-red-500 to-red-900 drop-shadow-[0_2px_4px_rgba(239,68,68,0.6)]"
              style={{
                fontSize:
                  size === 'xl' ? '2.5rem' : size === 'lg' ? '1.8rem' : size === 'md' ? '1.35rem' : '0.95rem'
              }}
            >
              R
            </span>

            {/* Hyper-glossy Ruby Blood Droplet */}
            <div className="relative mx-[-2px] flex items-center justify-center">
              <svg
                viewBox="0 0 32 40"
                className={`${
                  size === 'xl' ? 'w-8 h-10' : size === 'lg' ? 'w-6 h-8' : size === 'md' ? 'w-4 h-6' : 'w-3 h-4'
                } drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]`}
                fill="none"
              >
                <defs>
                  <linearGradient id="rtDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff4d4d" />
                    <stop offset="40%" stopColor="#cc0000" />
                    <stop offset="85%" stopColor="#660000" />
                    <stop offset="100%" stopColor="#330000" />
                  </linearGradient>
                  <radialGradient id="rtHighlight" cx="30%" cy="30%" r="40%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#ff9999" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <path
                  d="M16 2 C16 2 2 18 2 26 C2 33.7 8.3 40 16 40 C23.7 40 30 33.7 30 26 C30 18 16 2 16 2 Z"
                  fill="url(#rtDropGrad)"
                  stroke="#ff6666"
                  strokeWidth="0.8"
                />
                <ellipse cx="11" cy="18" rx="4" ry="7" transform="rotate(-25 11 18)" fill="url(#rtHighlight)" />
              </svg>
            </div>

            {/* Metallic White/Silver 'T' */}
            <span
              className="font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]"
              style={{
                fontSize:
                  size === 'xl' ? '2.5rem' : size === 'lg' ? '1.8rem' : size === 'md' ? '1.35rem' : '0.95rem'
              }}
            >
              T
            </span>
          </div>

          {/* Underline wave swoosh */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-blue-600 opacity-90"></div>
        </div>
      </div>

      {/* Typography & Brand Labels */}
      {variant !== 'badge' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} ${currentSize.text} leading-none`}>
              معامل <span className="text-rose-700 font-black">RT</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-900 text-rose-100 font-extrabold text-[10px] tracking-wider shadow-xs">
              LABORATORIES
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-blue-950 text-blue-200 font-bold text-[10px] border border-blue-800/40">
              للتحاليل التشخيصية
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'} ${currentSize.sub}`}>
              معامل رامي مختار
            </span>
            <span className="text-rose-600 font-bold">·</span>
            <span className={`font-bold ${isDark ? 'text-blue-300' : 'text-blue-900'} ${currentSize.sub}`}>
              أطباء كلية طب قصر العيني
            </span>
          </div>

          {/* Slogan */}
          {showSlogan && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`font-bold tracking-tight ${currentSize.slogan} ${isDark ? 'text-rose-400' : sloganColor} flex items-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                <span>التشخيص الصحيح يبدأ معنا</span>
              </span>
              <span className={`text-[10px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'} hidden md:inline`} dir="ltr">
                | Accurate Diagnosis Starts With Us
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
