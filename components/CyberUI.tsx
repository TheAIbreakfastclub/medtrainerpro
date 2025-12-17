import React, { useEffect, useRef, useState } from 'react';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
    variant?: 'default' | 'primary' | 'ghost' | 'danger';
    icon?: React.ReactNode;
}

export const CyberButton: React.FC<CyberButtonProps> = ({ 
    children, 
    active, 
    variant = 'default', 
    className = '', 
    icon,
    ...props 
}) => {
    // Transition to Charter Button Styles
    const baseStyles = "relative px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden transform active:scale-95";
    
    const variants = {
        default: active 
            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg" 
            : "bg-white border-2 border-teal-100 text-slate-600 hover:border-teal-300 hover:text-teal-700 hover:shadow-md",
        primary: "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        danger: "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg hover:shadow-rose-500/30",
        ghost: "bg-transparent text-slate-500 hover:text-teal-600 hover:bg-teal-50"
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {icon && <span className={active ? "animate-pulse" : ""}>{icon}</span>}
            <span>{children}</span>
        </button>
    );
};

export const CyberPanel: React.FC<{ 
    children: React.ReactNode; 
    className?: string; 
    title?: React.ReactNode;
    action?: React.ReactNode;
    glow?: 'cyan' | 'purple' | 'none'; // Kept for prop compatibility, but mapped to new styles
}> = ({ children, className = '', title, action }) => {
    
    return (
        <div className={`glass-panel rounded-2xl flex flex-col overflow-hidden ${className}`}>
            {(title || action) && (
                <div className="px-6 py-4 border-b border-teal-100/50 flex justify-between items-center bg-white/40">
                    <div className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
                        {title}
                    </div>
                    <div>{action}</div>
                </div>
            )}
            <div className="flex-grow text-slate-700">{children}</div>
        </div>
    );
};

export const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (domRef.current) observer.unobserve(domRef.current);
                }
            });
        }, { threshold: 0.1 });

        const currentElement = domRef.current;
        if (currentElement) observer.observe(currentElement);

        return () => {
            if (currentElement) observer.unobserve(currentElement);
        };
    }, []);

    return (
        <div
            ref={domRef}
            className={`transition-all duration-700 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};