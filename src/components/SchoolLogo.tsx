import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  showText?: boolean;
  useImage?: boolean;
  glow?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  useImage = false,
  glow = false,
}) => {
  // Size preset mapping
  const sizeMap: Record<string, string> = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  const dimensionClass = typeof size === 'number' ? `w-[${size}px] h-[${size}px]` : sizeMap[size] || sizeMap.md;

  const content = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${dimensionClass} ${
        glow ? 'drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]' : 'drop-shadow-xs'
      } ${className}`}
    >
      <img
        src="/logo-upt275.svg"
        alt="Logo Resmi UPT SD Negeri 275 Gresik (Bangeran-Dukun)"
        className="w-full h-full object-contain transition-transform duration-200 hover:scale-105"
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );

  if (!showText) {
    return content;
  }

  return (
    <div className="inline-flex items-center gap-2.5">
      {content}
      <div className="flex flex-col text-left leading-tight">
        <span className="font-extrabold text-sm tracking-tight text-slate-900 uppercase">
          UPT SDN 275 Gresik
        </span>
        <span className="text-[11px] font-medium text-slate-500 tracking-wide">
          Bangeran - Dukun
        </span>
      </div>
    </div>
  );
};
