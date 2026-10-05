import React from 'react';

interface RTLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  variant?: 'full' | 'compact' | 'badge';
  sloganColor?: string;
  theme?: string;
}

export const RTLogo: React.FC<RTLogoProps> = ({
  className = '',
  size = 'md',
  showSlogan = true,
  variant = 'full',
  sloganColor = 'text-rose-400'
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', badge: 'text-[9px]', sub: 'text-[10px]', slogan: 'text-[11px]' },
    md: { icon: 'w-12 h-12', text: 'text-2xl', badge: 'text-[10px]', sub: 'text-xs', slogan: 'text-xs' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl', badge: 'text-xs', sub: 'text-sm', slogan: 'text-sm' },
    xl: { icon: 'w-24 h-24', text: 'text-5xl', badge: 'text-sm', sub: 'text-base', slogan: 'text-base' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* 3D High-Tech RT LABS Icon: Red Chrome, Ruby Drop, Circuits */}
      <div className={`relative ${currentSize.icon} shrink-0 rounded-2xl bg-gradient-to-br from-[#590404] via-[#850909] to-[#0d1117] p-1 shadow-xl shadow-red-950/60 border border-red-500/40 group`}>
        {/* Glow backdrop */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl blur-xs opacity-60 group-hover:opacity-100 transition duration-300"></div>

        <div className="relative w-full h-full rounded-xl bg-[#090b10] flex items-center justify-center overflow-hidden border border-red-900/50">
          {/* Circuit background lines */}
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" fill="none">
            <path d="M10 20 H35 L45 35 H75" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M90 80 H65 L55 65 H25" stroke="#dc2626" strokeWidth="1.5" />
            <circle cx="75" cy="35" r="3" fill="#ef4444" />
            <circle cx="25" cy="65" r="3" fill="#dc2626" />
            <circle cx="35" cy="20" r="2" fill="#ef4444" />
          </svg>

          {/* Central 3D Blood Droplet & RT Lockup */}
          <div className="relative flex items-center justify-center leading-none">
            {/* Metallic Red 'R' */}
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-b from-rose-200 via-red-500 to-red-900 drop-shadow-[0_2px_4px_rgba(239,68,68,0.6)]" style={{ fontSize: size === 'xl' ? '2.5rem' : size === 'lg' ? '1.8rem' : size === 'md' ? '1.4rem' : '0.95rem' }}>
              R
            </span>

            {/* Hyper-glossy Ruby Blood Droplet with refraction */}
            <div className="relative mx-[-2px] flex items-center justify-center">
              <svg 
                viewBox="0 0 32 40" 
                className={`${size === 'xl' ? 'w-8 h-10' : size === 'lg' ? 'w-6 h-8' : size === 'md' ? 'w-4 h-6' : 'w-3 h-4'} drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]`} 
                fill="none"
              >
                <defs>
                  <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff4d4d" />
                    <stop offset="40%" stopColor="#cc0000" />
                    <stop offset="85%" stopColor="#660000" />
                    <stop offset="100%" stopColor="#330000" />
                  </linearGradient>
                  <radialGradient id="highlight" cx="30%" cy="30%" r="40%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#ff9999" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Droplet Body */}
                <path 
                  d="M16 2 C16 2 2 18 2 26 C2 33.7 8.3 40 16 40 C23.7 40 30 33.7 30 26 C30 18 16 2 16 2 Z" 
                  fill="url(#dropGrad)" 
                  stroke="#ff6666" 
                  strokeWidth="0.8" 
                />
                {/* 3D Specular Highlight */}
                <ellipse cx="11" cy="18" rx="4" ry="7" transform="rotate(-25 11 18)" fill="url(#highlight)" />
                <circle cx="13" cy="30" r="2" fill="#ffffff" opacity="0.6" />
              </svg>
            </div>

            {/* Metallic Silver/Chrome 'T' */}
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]" style={{ fontSize: size === 'xl' ? '2.5rem' : size === 'lg' ? '1.8rem' : size === 'md' ? '1.4rem' : '0.95rem' }}>
              T
            </span>
          </div>

          {/* LABS Sub-label inside badge */}
          <div className="absolute bottom-0.5 inset-x-0 flex justify-center">
            <span className="text-[7px] font-black tracking-widest text-slate-300 drop-shadow-sm scale-90">
              LABS
            </span>
          </div>
        </div>
      </div>

      {/* Typography & Brand Labels */}
      {variant !== 'badge' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-wider text-white ${currentSize.text} leading-tight`}>
              RT <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">LAB</span>
            </span>
            <span className={`rounded px-1.5 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold tracking-wider ${currentSize.badge}`}>
              LABORATORIES
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <span className={`${currentSize.sub}`}>معامل رامي مختار</span>
            <span className="text-rose-500/70 text-[10px]">·</span>
            <span className="text-rose-300/80 text-[11px] font-medium hidden sm:inline">كلية طب قصر العيني</span>
          </div>

          {/* Slogan requested explicitly by user: "التشخيص الصحيح يبدأ معنا" */}
          {showSlogan && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`font-black tracking-wide ${currentSize.slogan} ${sloganColor} drop-shadow-xs flex items-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>التشخيص الصحيح يبدأ معنا</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal hidden md:inline" dir="ltr">
                | Accurate Diagnosis Starts With Us
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
