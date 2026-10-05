import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  large?: boolean;
  className?: string;
}

export function Logo({ variant = 'dark', large = false, className = '' }: LogoProps) {
  const textColor = variant === 'dark' ? 'text-white' : 'text-black';

  return (
    <div className={`flex items-center ${className}`}>
      {/* Typographic "Make It One" Brand Name */}
      <div className="flex flex-col justify-center text-left">
        <span className={`font-anton ${large ? 'text-5xl md:text-8xl' : 'text-3xl md:text-5xl'} leading-none ${textColor} tracking-wider uppercase`}>
          FanCor
        </span>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-[2px] flex-1 bg-[#4fc3f7] opacity-50" />
          <span className={`text-[#4fc3f7] font-bold ${large ? 'text-sm md:text-xl tracking-[0.6em]' : 'text-[10px] md:text-[12px] tracking-[0.4em]'} uppercase leading-none`}>
            Iconz
          </span>
        </div>
      </div>
    </div>
  );
}
