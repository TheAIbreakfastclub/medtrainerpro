import React, { useState } from 'react';
import { CyberButton, CyberPanel } from './CyberUI';
import { Check, Shield, Crown, Sparkles } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUpgrade: (user: User) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, user, onUpgrade }) => {
    const [billing, setBilling] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');

    if (!isOpen) return null;

    const handleSubscribe = () => {
        if (!user) return;
        setTimeout(() => {
            const updated = authService.upgradeSubscription(user);
            onUpgrade(updated);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-5xl relative">
                
                <button 
                    onClick={onClose} 
                    className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm transition-colors"
                >
                    ✕
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* FREE */}
                    <div className="glass-panel p-8 bg-white rounded-3xl border border-slate-200">
                        <div className="flex flex-col h-full items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                                <Shield className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Découverte</h3>
                            <div className="text-4xl font-bold text-slate-400 mb-8">Gratuit</div>
                            
                            <ul className="space-y-4 mb-8 w-full px-8 text-left">
                                <li className="flex items-center gap-3 text-slate-600 text-sm"><Check className="w-4 h-4 text-teal-500" /> 3 Essais Gratuits / Mois</li>
                                <li className="flex items-center gap-3 text-slate-600 text-sm"><Check className="w-4 h-4 text-teal-500" /> Accès limité aux outils</li>
                            </ul>
                            
                            <div className="mt-auto w-full">
                                <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider bg-slate-50 py-2 rounded-lg">Plan Actuel</div>
                            </div>
                        </div>
                    </div>

                    {/* PREMIUM */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-teal-400/30 blur-2xl rounded-[3rem] opacity-50 transform translate-y-4"></div>
                        <div className="glass-panel p-8 relative bg-gradient-to-br from-slate-900 to-slate-800 border-teal-500/50 transform md:scale-105 shadow-2xl rounded-3xl text-white">
                            <div className="absolute top-6 right-6 bg-teal-400 text-teal-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-teal-400/50">
                                RECOMMANDÉ
                            </div>
                            
                            <div className="flex flex-col h-full items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">EDN Premium</h3>
                                
                                <div className="flex items-center gap-1 mb-8">
                                    <span className="text-5xl font-bold text-white tracking-tight">{billing === 'YEARLY' ? '€100' : '€10'}</span>
                                    <span className="text-slate-400 text-sm text-left leading-tight ml-2 font-medium">{billing === 'YEARLY' ? '/an' : '/mois'}</span>
                                </div>

                                {/* Toggle */}
                                <div className="flex items-center bg-black/30 rounded-full p-1 mb-8 border border-white/10 w-full max-w-[200px]">
                                    <button 
                                        onClick={() => setBilling('MONTHLY')}
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-full transition-all ${billing === 'MONTHLY' ? 'bg-white text-black' : 'text-slate-400'}`}
                                    >
                                        Mensuel
                                    </button>
                                    <button 
                                        onClick={() => setBilling('YEARLY')}
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-full transition-all ${billing === 'YEARLY' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400'}`}
                                    >
                                        Annuel
                                    </button>
                                </div>
                                
                                <ul className="space-y-4 mb-8 w-full px-8 text-left">
                                    <li className="flex items-center gap-3 text-slate-200 text-sm"><Sparkles className="w-4 h-4 text-purple-400" /> Essais Illimités</li>
                                    <li className="flex items-center gap-3 text-slate-200 text-sm"><Sparkles className="w-4 h-4 text-purple-400" /> Analyse IA Approfondie</li>
                                    <li className="flex items-center gap-3 text-slate-200 text-sm"><Sparkles className="w-4 h-4 text-purple-400" /> Mode Examen Complet</li>
                                </ul>
                                
                                <button 
                                    onClick={handleSubscribe}
                                    className="w-full py-4 text-lg rounded-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl hover:shadow-teal-500/20 transition-all transform hover:-translate-y-1"
                                >
                                    Passer Premium
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};