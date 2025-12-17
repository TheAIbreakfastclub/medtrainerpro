import React, { useState } from 'react';
import { CyberButton } from './CyberUI';
import { User, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!username.trim()) {
            setError('Identifiant requis');
            return;
        }

        try {
            let user;
            if (mode === 'LOGIN') {
                user = authService.login(username);
            } else {
                user = authService.signup(username);
            }
            onLogin(user);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Authentication Failed');
        }
    };

    return (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-4xl rounded-3xl flex overflow-hidden shadow-2xl relative min-h-[600px] bg-white">
                
                {/* LEFT: VISUAL BRANDING */}
                <div className="hidden md:block w-1/2 relative bg-slate-100 overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=1000&auto=format&fit=crop" 
                        alt="Medical Tech" 
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 to-slate-800/80"></div>
                    
                    <div className="absolute bottom-12 left-8 right-8 z-10 text-white">
                         <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/20">
                            <Lock className="w-6 h-6 text-teal-300" />
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-4 leading-tight">
                            Accéder à la <br/>
                            <span className="text-teal-300">Plateforme EDN</span>
                        </h2>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed opacity-90">
                            Rejoignez la communauté médicale pour accéder aux simulations cliniques et analyses basées sur l'IA.
                        </p>
                    </div>
                </div>

                {/* RIGHT: FORM */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-white">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                    >
                        ✕
                    </button>

                    <div className="mb-8">
                        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">
                            {mode === 'LOGIN' ? 'Bon retour' : 'Créer un compte'}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Saisissez votre identifiant pour continuer.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Identifiant Operative</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-12 p-3.5 rounded-xl text-sm font-semibold focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all placeholder-slate-400"
                                    placeholder="Nom d'utilisateur"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-rose-600 text-xs font-bold bg-rose-50 py-3 px-4 rounded-xl border border-rose-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {error}
                            </div>
                        )}

                        <CyberButton variant="primary" className="w-full py-4 text-base shadow-lg shadow-teal-500/30 rounded-xl" type="submit">
                            {mode === 'LOGIN' ? 'Se Connecter' : 'S\'inscrire'}
                        </CyberButton>

                        <div className="text-center pt-4 border-t border-slate-100">
                            <button 
                                type="button"
                                onClick={() => { setError(''); setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); }}
                                className="text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors"
                            >
                                {mode === 'LOGIN' ? 'Pas encore de compte ? S\'inscrire' : 'Déjà membre ? Se connecter'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};