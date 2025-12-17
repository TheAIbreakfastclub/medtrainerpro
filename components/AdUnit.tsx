import React from 'react';

export const AdUnit: React.FC<{ format?: 'horizontal' | 'square' }> = ({ format = 'horizontal' }) => {
    return (
        <div className={`
            relative overflow-hidden rounded-2xl flex flex-col items-center justify-center group cursor-pointer
            ${format === 'horizontal' ? 'w-full h-24 my-2' : 'w-full h-64'}
            bg-slate-900 border border-slate-800 shadow-xl
        `}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Shine */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>

            <div className="relative z-10 text-center">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border border-slate-700 px-2 py-0.5 rounded-full bg-black/30">Sponsor</span>
                 <div className="mt-2 text-xl font-display font-bold text-white group-hover:text-teal-400 transition-colors">
                     Medical Hardware
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1">Upgrade your clinical setup</p>
            </div>
        </div>
    );
};