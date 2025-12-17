import React, { useState, useEffect } from 'react';
import { Terminal, Activity, FileText, User as UserIcon, LogOut, Crown, Search, Zap, Stethoscope, Menu, Microscope, ChevronDown, Video, BookOpen, Gavel, GraduationCap, ArrowRight, Lock, BrainCircuit, Library, ArrowLeft, Sparkles, Timer, Dna, ActivitySquare, Pill, Bone, Brain, HeartPulse, Target, Star, SplitSquareHorizontal, Languages, Database, Calculator, PenTool, Eye, LayoutGrid, Bug, Flame, FlaskConical, Target as TargetIcon, Skull, AlertTriangle, ShieldCheck, ListChecks, X, ClipboardCheck, Zap as ZapIcon, CheckCircle2, TrendingUp, Users, Radio, MoveRight, Layers, Fingerprint, ChevronRight, Clock, Signal, Wifi, Home, MousePointer2, ChevronRightCircle, HelpCircle, Check, Shield, Mic } from 'lucide-react';
import { CyberButton, CyberPanel, FadeIn } from './components/CyberUI';
import { ArticleReader } from './components/ArticleReader';
import { Dashboard } from './components/Dashboard';
import { ExamModal } from './components/ExamModal';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SmartAssistant } from './components/SmartAssistant';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { PedagogicalBoard } from './components/PedagogicalBoard';
import { MedicalEnglishModule } from './components/MedicalEnglishModule';
import { ECOSModule } from './components/ECOSModule';
import { LCAModule } from './components/LCAModule';
import { AICoachWidget } from './components/AICoachWidget';
import { StudyCalendar } from './components/StudyCalendar';
import { AdUnit } from './components/AdUnit';
import { PresentationModal } from './components/PresentationModal';
import { fetchRandomArticle, fetchByManualId } from './services/pmcService';
import { authService } from './services/authService';
import { Article, EDN_BANK, User, ExamResult, EffortType } from './types';
import { SPECIALTIES, ACADEMIC_YEARS, PACES_PROGRAM, R2C_GROUPS, DFGSM2_PROGRAM, DFGSM3_PROGRAM, DISCORDANCE_RULES } from './constants';

// --- VIEW TYPES ---
type ViewState = 'LANDING' | 'LEVEL_HUB' | 'LCA_MODULE' | 'MEDICAL_ENGLISH' | 'ECOS_MODULE';

// ============================================================================
// 1. LANDING PAGE (MODERN & DYNAMIC HIGH-FIDELITY)
// ============================================================================
const LandingView: React.FC<{ onSelectYear: (id: string) => void }> = ({ onSelectYear }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const [latency, setLatency] = useState<number>(25);
    const [presentationOpen, setPresentationOpen] = useState(false);

    // URL mise à jour : Jeune femme médecin, brune, stéthoscope, dossier (clipboard)
    const HERO_IMAGE = "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            setSessionSeconds(prev => prev + 1);
            if (Math.random() > 0.7) setLatency(Math.floor(Math.random() * 5) + 20);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDuration = (s: number) => {
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${m}m ${sec}s`;
    };

    const scrollToGrid = () => {
        document.getElementById('level-selector')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleStartFromModal = () => {
        setPresentationOpen(false);
        setTimeout(() => scrollToGrid(), 300);
    };

    return (
        <div className="relative w-full min-h-screen flex flex-col font-sans overflow-x-hidden bg-[#F0F4F8]">
            
            {/* AMBIENT BACKGROUNDS */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-200/40 blur-[120px] pointer-events-none animate-pulse-slow fixed"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-teal-200/30 blur-[100px] pointer-events-none fixed"></div>

            {/* HERO IMAGE LAYER - Floating Animation */}
            <div className="hidden lg:block absolute right-[-5%] top-[10%] h-[90vh] w-[50%] z-0 pointer-events-none animate-float">
                <img 
                    src={HERO_IMAGE}
                    alt="Docteur Med Trainer"
                    className="w-full h-full object-contain object-center drop-shadow-2xl"
                    referrerPolicy="no-referrer"
                    style={{ 
                        maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                    }}
                />
            </div>

            <div className="container mx-auto max-w-[1400px] px-6 md:px-12 pt-10 pb-4 relative z-10 flex flex-col">
                
                {/* 1. MODERN HEADER */}
                <header className="flex justify-between items-center mb-16 animate-fadeIn" style={{ animationDelay: '0ms' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Activity className="w-7 h-7" />
                        </div>
                        <span className="text-3xl font-display font-bold tracking-tight text-slate-900">
                            MEDTRAINER<span className="text-teal-500">.PRO</span>
                        </span>
                    </div>
                    
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/60 text-xs font-bold text-slate-600 shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        GEMINI NEURAL ENGINE 2.5
                    </div>
                </header>

                {/* 2. HERO CONTENT - Updated Copy */}
                <div className="flex flex-col lg:flex-row items-center justify-between relative mb-24 min-h-[60vh]">
                    <div className="flex-1 max-w-[720px] z-20 mb-16 lg:mb-0 text-left">
                        
                        <h1 className="text-6xl lg:text-7xl font-display font-extrabold leading-[0.95] tracking-tighter text-slate-900 mb-8 animate-fadeIn" style={{ animationDelay: '100ms' }}>
                            Ne révisez plus au hasard. <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Laissez l'IA piloter votre réussite.</span>
                        </h1>
                        
                        <p className="text-lg lg:text-xl font-medium text-slate-500 mb-10 leading-relaxed max-w-lg animate-fadeIn" style={{ animationDelay: '200ms' }}>
                            La première application adaptative qui transforme les Référentiels R2C en un plan de bataille personnalisé, de la PASS aux ECOS. Finis les plannings manuels et les impasses.
                        </p>

                        <div className="flex flex-wrap gap-4 animate-fadeIn" style={{ animationDelay: '300ms' }}>
                            <button 
                                onClick={scrollToGrid}
                                className="group relative px-8 py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-rose-600/30 hover:shadow-2xl hover:bg-rose-700 hover:scale-105 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shimmer"></div>
                                <span className="relative flex items-center gap-3">
                                    LANCER MON ENTRAÎNEMENT
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                            
                            <button 
                                onClick={() => setPresentationOpen(true)}
                                className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 hover:-translate-y-0.5 shadow-sm"
                            >
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                POURQUOI MEDTRAINER ?
                            </button>
                        </div>

                         {/* Social Proof */}
                         <div className="mt-12 flex flex-col gap-3 animate-fadeIn" style={{ animationDelay: '400ms' }}>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Conforme aux dernières recommandations des Collèges & R2C 2024/2025
                             </p>
                             <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
                                 <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-slate-200">
                                     <CheckCircle2 className="w-4 h-4 text-teal-500" /> Anatomie 3D
                                 </div>
                                 <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-slate-200">
                                     <CheckCircle2 className="w-4 h-4 text-teal-500" /> Base PubMed
                                 </div>
                                 <div className="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-slate-200">
                                     <CheckCircle2 className="w-4 h-4 text-teal-500" /> Guidelines HAS
                                 </div>
                             </div>
                         </div>
                    </div>

                     {/* Mobile Image Fallback */}
                     <div className="lg:hidden w-full flex justify-center relative mt-8 animate-fadeIn">
                         <img 
                            src={HERO_IMAGE}
                            alt="Médecin Med Trainer"
                            className="max-w-[90%] h-auto object-contain drop-shadow-2xl"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </div>

                {/* 3. SEGMENTATION SECTION (R2C ALIGNED) */}
                <div className="mb-24 relative z-20">
                     <div className="text-center mb-12">
                         <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Un Parcours R2C Complet</h2>
                         <p className="text-slate-500 max-w-2xl mx-auto">Sélectionnez votre profil pour découvrir nos outils spécifiques.</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                         
                         {/* BLOC 1: PASS / LAS */}
                         <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-xl hover:-translate-y-1 transition-transform duration-300 group">
                             <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                 <Target className="w-6 h-6 text-rose-600" />
                             </div>
                             <h3 className="text-xl font-bold text-slate-900 mb-2">PASS / LAS</h3>
                             <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-4">Objectif Sélection</p>
                             <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                "Domptez le classement. Algorithmes de mémorisation J-Method, génération de QCMs infinis sur l'Anatomie et la Physio pour sécuriser votre place en médecine."
                             </p>
                             <div className="flex flex-wrap gap-2 mb-4">
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Numérus</span>
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Anatomie 3D</span>
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Méthode J</span>
                             </div>
                         </div>

                         {/* BLOC 2: DFGSM 2-3 */}
                         <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-xl hover:-translate-y-1 transition-transform duration-300 group">
                             <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                 <Stethoscope className="w-6 h-6 text-indigo-600" />
                             </div>
                             <h3 className="text-xl font-bold text-slate-900 mb-2">DFGSM 2-3</h3>
                             <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4">Socle des Connaissances</p>
                             <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                "Le socle du R2C. Ne apprenez plus par cœur, comprenez la physiopathologie. Vidéos de sémiologie, auscultation cardiaque virtuelle et fiches de synthèse par systèmes."
                             </p>
                             <div className="flex flex-wrap gap-2 mb-4">
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Sémiologie</span>
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Physio</span>
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">UE Cliniques</span>
                             </div>
                         </div>

                         {/* BLOC 3: DFASM Externat */}
                         <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-xl hover:-translate-y-1 transition-transform duration-300 group">
                             <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                 <ListChecks className="w-6 h-6 text-teal-600" />
                             </div>
                             <h3 className="text-xl font-bold text-slate-900 mb-2">DFASM (Externat)</h3>
                             <p className="text-xs font-bold text-teal-500 uppercase tracking-wider mb-4">Objectif EDN (Écrit)</p>
                             <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                "Préparation R2C intensive. Hiérarchisation automatique Rang A / Rang B. Entraînement aux KFP, TCS et Dossiers Progressifs avec détection des Discordances."
                             </p>
                             <div className="flex flex-wrap gap-2 mb-4">
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">KFP / DP</span>
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Rang A & B</span>
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">LCA Expert</span>
                             </div>
                         </div>

                         {/* BLOC 4: DFASM 3 ECOS */}
                         <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-xl hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden">
                             <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">ORAL</div>
                             <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                 <Mic className="w-6 h-6 text-purple-600" />
                             </div>
                             <h3 className="text-xl font-bold text-slate-900 mb-2">DFASM 3 (ECOS)</h3>
                             <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-4">Objectif Simulation</p>
                             <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                "Le simulateur ECOS vocal n°1. Interrogez des patients virtuels (Gemini Audio), annoncez des diagnostics difficiles et recevez une note sur 20 selon la grille officielle."
                             </p>
                             <div className="flex flex-wrap gap-2 mb-4">
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Patient Audio</span>
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Grille Notation</span>
                                 <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Situations</span>
                             </div>
                         </div>

                     </div>
                </div>

                {/* 4. TECHNOLOGY & DIFFERENTIATION */}
                <div className="mb-24">
                     <div className="text-center mb-12">
                         <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Pourquoi Med-IA écrase les méthodes classiques ?</h2>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                             <BrainCircuit className="w-10 h-10 text-blue-500 mb-4" />
                             <h3 className="text-lg font-bold text-slate-900 mb-2">L'Adaptabilité Temps Réel</h3>
                             <p className="text-sm text-slate-600">
                                "Vous êtes fatigué à 23h ? L'appli le sait et vous propose des Flashcards rapides plutôt que des cas cliniques lourds."
                             </p>
                         </div>
                         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                             <Shield className="w-10 h-10 text-rose-500 mb-4" />
                             <h3 className="text-lg font-bold text-slate-900 mb-2">La Chasse aux Discordances</h3>
                             <p className="text-sm text-slate-600">
                                "Aux EDN, une erreur tue votre classement. Notre mode 'Mort Subite' vous entraîne à détecter les pièges mortels et les contre-indications formelles."
                             </p>
                         </div>
                         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                             <Library className="w-10 h-10 text-teal-500 mb-4" />
                             <h3 className="text-lg font-bold text-slate-900 mb-2">Sources Officielles (RAG)</h3>
                             <p className="text-sm text-slate-600">
                                "Pas d'hallucination d'IA. Toutes les réponses sont sourcées directement dans les PDF officiels des Collèges et les recommandations HAS."
                             </p>
                         </div>
                     </div>
                </div>

                {/* 5. ORIGINAL BENTO GRID (FUNCTIONAL LEVEL SELECTOR) */}
                <div id="level-selector" className="mb-24 scroll-mt-24">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-grow bg-gradient-to-r from-slate-300 to-transparent"></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Accès Direct aux Modules</span>
                        <div className="h-px flex-grow bg-gradient-to-l from-slate-300 to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        {ACADEMIC_YEARS.map((year, idx) => {
                            const isCycle1 = idx < 2; 
                            const isCycle2 = idx >= 2 && idx < 3;
                            const isCycle3 = idx >= 3;
                            
                            let accentColor = "bg-emerald-500";
                            if (isCycle2) accentColor = "bg-blue-500";
                            if (isCycle3) accentColor = "bg-violet-500";

                            return (
                                <button
                                    key={year.id}
                                    onClick={() => onSelectYear(year.id)}
                                    className="group relative bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 text-left transition-all duration-300 hover:bg-white/80 hover:shadow-card-hover hover:-translate-y-2 overflow-hidden"
                                >
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${isCycle3 ? 'from-violet-400 to-fuchsia-400' : isCycle2 ? 'from-blue-400 to-cyan-400' : 'from-emerald-400 to-teal-400'}`}></div>
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className={`w-1.5 h-1.5 rounded-full ${accentColor} mb-4`}></div>
                                        <h3 className="text-2xl font-display font-bold text-slate-800 mb-1 tracking-tight group-hover:text-slate-900">{year.id}</h3>
                                        <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700 line-clamp-2 leading-relaxed">{year.desc}</p>
                                        <div className="mt-auto pt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entrer</span>
                                            <ArrowRight className="w-3 h-3 text-slate-800" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 6. FAQ SECTION (SEO Long Tail) */}
                <div className="mb-24 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-display font-bold text-slate-900 mb-8 text-center">Questions fréquentes des futurs médecins</h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: "L'application est-elle à jour avec la réforme R2C (EDN) ?",
                                r: "Oui, absolument. Notre base de données distingue strictement les connaissances de Rang A, Rang B et exclut le Rang C. Les exercices (DP, KFP, TCS) respectent le format exact de l'examen sur tablette SIDES-NG."
                            },
                            {
                                q: "Comment fonctionne le simulateur ECOS ?",
                                r: "C'est unique. Nous utilisons l'IA générative vocale (Gemini Live). Vous parlez, le patient vous répond. L'IA analyse votre interrogatoire, votre diagnostic et votre empathie pour vous donner une note sur 20 immédiate."
                            },
                            {
                                q: "L'appli marche-t-elle hors ligne pour les stages à l'hôpital ?",
                                r: "Oui, téléchargez vos modules (Cardio, Pneumo...) pour réviser dans le métro ou à l'internat, même sans réseau."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-lg text-slate-800 mb-2 flex gap-3"><HelpCircle className="w-5 h-5 text-teal-500 mt-1" /> {faq.q}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed ml-8">{faq.r}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7. FOOTER */}
                <footer className="border-t border-slate-200 pt-12 pb-8 text-slate-500 text-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="font-bold text-slate-800 mb-4">Programme</h4>
                            <ul className="space-y-2 text-xs">
                                <li className="hover:text-teal-600 cursor-pointer">Cardiologie EDN</li>
                                <li className="hover:text-teal-600 cursor-pointer">Pneumologie EDN</li>
                                <li className="hover:text-teal-600 cursor-pointer">Annales Corrigées LCA</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-4">Ressources</h4>
                            <ul className="space-y-2 text-xs">
                                <li className="hover:text-teal-600 cursor-pointer">Blog : "Réussir sa PACES"</li>
                                <li className="hover:text-teal-600 cursor-pointer">Méthodologie ECOS</li>
                                <li className="hover:text-teal-600 cursor-pointer">Fiches R2C Gratuites</li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold text-slate-800 mb-4">Légal</h4>
                            <ul className="space-y-2 text-xs">
                                <li className="hover:text-teal-600 cursor-pointer">CGU</li>
                                <li className="hover:text-teal-600 cursor-pointer">Mentions Légales</li>
                                <li className="hover:text-teal-600 cursor-pointer">Données Personnelles</li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold text-slate-800 mb-4">Support</h4>
                            <ul className="space-y-2 text-xs">
                                <li className="hover:text-teal-600 cursor-pointer">Contact</li>
                                <li className="hover:text-teal-600 cursor-pointer">Signaler un bug</li>
                                <li className="hover:text-teal-600 cursor-pointer">Devenir Ambassadeur</li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-center border-t border-slate-100 pt-8 flex items-center justify-center gap-2">
                         <Activity className="w-4 h-4 text-slate-400" />
                         <span>© 2024 Med-IA. Tous droits réservés.</span>
                    </div>
                </footer>

                 {/* 4. FLOATING HUD STATUS BAR (Kept) */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 animate-fadeIn" style={{ animationDelay: '600ms' }}>
                    <div className="bg-slate-900/90 backdrop-blur-xl text-white rounded-full px-2 py-2 shadow-2xl border border-white/10 flex items-center justify-between">
                        
                        <div className="flex items-center gap-6 px-6">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-white/10 rounded-full">
                                     <Clock className="w-3.5 h-3.5 text-teal-300" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Local Time</span>
                                    <span className="text-xs font-mono font-medium">{currentTime.toLocaleTimeString()}</span>
                                </div>
                            </div>
                            
                            <div className="h-8 w-px bg-white/10"></div>

                            <div className="flex items-center gap-3">
                                 <div className="p-1.5 bg-white/10 rounded-full">
                                     <Timer className="w-3.5 h-3.5 text-blue-300" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Session</span>
                                    <span className="text-xs font-mono font-medium">{formatDuration(sessionSeconds)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pr-2">
                             <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                                 <Signal className="w-3 h-3 text-emerald-400" />
                                 <span className="text-[10px] font-bold text-emerald-400">{latency} ms</span>
                            </div>
                            <div className="px-4 py-2 bg-white text-slate-900 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                                <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
                                HDS SÉCURISÉ
                            </div>
                        </div>

                    </div>
                </div>

                <PresentationModal 
                    isOpen={presentationOpen} 
                    onClose={() => setPresentationOpen(false)}
                    onCtaClick={handleStartFromModal}
                />

            </div>
        </div>
    );
};

// ============================================================================
// 2. LEVEL HUB VIEW (DASHBOARD PAR ANNÉE)
// ============================================================================
const LevelHubView: React.FC<{ 
    yearId: string; 
    onLaunchLCA: () => void;
    onLaunchEnglish: () => void;
    onLaunchECOS: () => void;
    user: User | null;
}> = ({ yearId, onLaunchLCA, onLaunchEnglish, onLaunchECOS, user }) => {
    const yearInfo = ACADEMIC_YEARS.find(y => y.id === yearId);
    
    // Determine Pedagogical Strategy based on year
    const isPACES = yearId === 'PACES';
    const isDFGSM2 = yearId === 'DFGSM2';
    const isDFGSM3 = yearId === 'DFGSM3';
    const isDFASM = ['DFASM1', 'DFASM2', 'DFASM3'].includes(yearId);
    const isDFASM1 = yearId === 'DFASM1';
    const isDFASM2 = yearId === 'DFASM2';
    const isDFASM3 = yearId === 'DFASM3';

    // Effort Type Icon Mapper
    const getEffortIcon = (type: EffortType) => {
        switch(type) {
            case 'CALCUL': return <Calculator className="w-5 h-5 text-blue-500" />;
            case 'VISUEL': return <Eye className="w-5 h-5 text-purple-500" />;
            case 'LOGIQUE': return <BrainCircuit className="w-5 h-5 text-teal-500" />;
            case 'MEMOIRE': return <Brain className="w-5 h-5 text-rose-500" />;
            case 'REDACTION': return <PenTool className="w-5 h-5 text-amber-500" />;
            default: return <Brain className="w-5 h-5 text-slate-500" />;
        }
    };
    
    // DFGSM3 Icon Mapper
    const getDfgsm3Icon = (iconName: string) => {
        switch(iconName) {
            case 'PILL': return <Pill className="w-6 h-6 text-rose-500" />;
            case 'BOOK': return <BookOpen className="w-6 h-6 text-indigo-500" />;
            case 'DNA': return <Dna className="w-6 h-6 text-teal-500" />;
            case 'MICROSCOPE': return <Microscope className="w-6 h-6 text-purple-500" />;
            case 'BUG': return <Bug className="w-6 h-6 text-emerald-500" />;
            case 'ACTIVITY': return <ActivitySquare className="w-6 h-6 text-rose-500" />;
            case 'FLAME': return <Flame className="w-6 h-6 text-orange-500" />;
            case 'BRAIN': return <Brain className="w-6 h-6 text-cyan-500" />;
            default: return <Star className="w-6 h-6 text-slate-400" />;
        }
    };

    return (
        <div className="flex-grow bg-slate-50 min-h-[calc(100vh-64px)] animate-fadeIn">
            
            {/* DYNAMIC HEADER */}
            <div className={`border-b py-12 px-4 ${
                isPACES ? 'bg-slate-900 text-white border-slate-800' : 
                isDFGSM2 ? 'bg-indigo-900 text-white border-indigo-800' : 
                isDFGSM3 ? 'bg-cyan-900 text-white border-cyan-800' :
                isDFASM2 ? 'bg-purple-900 text-white border-purple-800' :
                isDFASM3 ? 'bg-rose-900 text-white border-rose-800' :
                'bg-white text-slate-900 border-slate-200'
            }`}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <span className={`font-bold text-xs uppercase tracking-wider px-2 py-1 rounded ${
                                 isPACES ? 'bg-rose-500 text-white' :
                                 isDFGSM2 ? 'bg-indigo-500 text-white' :
                                 isDFGSM3 ? 'bg-cyan-500 text-white' :
                                 isDFASM2 ? 'bg-purple-500 text-white' :
                                 isDFASM3 ? 'bg-rose-500 text-white' :
                                 'bg-teal-100 text-teal-700'
                             }`}>
                                {yearInfo?.desc}
                             </span>
                             {isPACES && <span className="font-bold text-xs uppercase tracking-wider px-2 py-1 rounded bg-slate-700 text-slate-300">PASS / LAS</span>}
                             {isDFASM && <span className="font-bold text-xs uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-500">R2C</span>}
                        </div>
                        <h2 className={`text-4xl font-display font-bold ${isDFASM && !isDFASM2 && !isDFASM3 ? 'text-slate-800' : 'text-white'}`}>
                            Espace {yearInfo?.label}
                        </h2>
                        <p className={`mt-2 max-w-xl ${isDFASM && !isDFASM2 && !isDFASM3 ? 'text-slate-500' : 'text-slate-300'}`}>
                            {isPACES && "Mode Data Architect : Structure des données par UE. Densité mémorielle et logique."}
                            {isDFGSM2 && "Objectif Fondations : Transition Théorie -> Clinique. Sémiologie et Physiopathologie."}
                            {isDFGSM3 && "Objectif Transition : Pharmacologie, Processus et Synthèse Clinique. Préparation R2C."}
                            {isDFASM1 && "Objectif Premier Tour : Hiérarchisation Rang A vs B. Injection systématique LCA."}
                            {isDFASM2 && "Objectif Expertise : KFP, TCS, et Gestion de l'Incertitude. Attention aux Discordances."}
                            {isDFASM3 && "Objectif Sprint Final : Mode Blitz (Top Items) & Simulation ECOS (Oral)."}
                            {!isDFASM1 && !isDFASM2 && !isDFASM3 && isDFASM && "Mode R2C : Les 13 groupes de spécialités. Hiérarchisation Rang A / Rang B."}
                        </p>
                    </div>
                    
                    {/* Stat Cards (Decorative for now) */}
                    <div className="flex gap-4">
                        <div className={`p-4 rounded-xl border ${isDFASM && !isDFASM2 && !isDFASM3 ? 'bg-slate-50 border-slate-200' : 'bg-white/10 border-white/10'}`}>
                            <div className={`text-2xl font-bold ${isDFASM && !isDFASM2 && !isDFASM3 ? 'text-slate-800' : 'text-white'}`}>0</div>
                            <div className={`text-[10px] uppercase font-bold ${isDFASM && !isDFASM2 && !isDFASM3 ? 'text-slate-400' : 'text-slate-400'}`}>Séries terminées</div>
                        </div>
                         <div className={`p-4 rounded-xl border ${isDFASM && !isDFASM2 && !isDFASM3 ? 'bg-slate-50 border-slate-200' : 'bg-white/10 border-white/10'}`}>
                            <div className={`text-2xl font-bold ${isDFASM && !isDFASM2 && !isDFASM3 ? 'text-slate-800' : 'text-white'}`}>0%</div>
                            <div className={`text-[10px] uppercase font-bold ${isDFASM && !isDFASM2 && !isDFASM3 ? 'text-slate-400' : 'text-slate-400'}`}>Progression Global</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PEDAGOGICAL CONTENT GRID */}
            <div className="max-w-7xl mx-auto px-4 py-12">

                {/* PRODUCTIVITY & COACHING SECTION */}
                <FadeIn>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        <div className="lg:col-span-2">
                            <AICoachWidget yearId={yearId} userRank={user?.rank || 'Novice'} />
                        </div>
                        <div className="lg:col-span-1 h-full">
                            <StudyCalendar yearId={yearId} initialSessions={user?.studyPlan} />
                        </div>
                    </div>
                </FadeIn>

                {/* --- TRANSVERSAL MODULE: MEDICAL ENGLISH (ALL YEARS) --- */}
                <FadeIn delay={100}>
                    <div className="mb-12">
                         <div 
                             onClick={onLaunchEnglish}
                             className="group bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 shadow-xl relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1 border border-blue-800"
                         >
                             <div className="absolute top-0 right-0 p-6 opacity-10 text-white transform rotate-12 scale-150">
                                 <Languages className="w-32 h-32" />
                             </div>
                             <div className="relative z-10 flex items-center justify-between">
                                 <div className="flex items-center gap-6">
                                     <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                                         <Languages className="w-8 h-8 text-blue-200" />
                                     </div>
                                     <div>
                                         <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-200 transition-colors">Medical English Lab</h3>
                                         <p className="text-blue-200/70 text-sm max-w-lg">
                                            Module Transversal. Du vocabulaire (PACES) aux cas cliniques NEJM (Externat). 
                                            Entraînez-vous avec Gemini comme patient anglophone.
                                         </p>
                                     </div>
                                 </div>
                                 <div className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
                                     <ArrowRight className="w-6 h-6 text-white" />
                                 </div>
                             </div>
                         </div>
                    </div>
                </FadeIn>
                
                {/* --- DFASM LAYOUT (R2C STRUCTURED DATA MODE) --- */}
                {isDFASM && (
                    <div className="space-y-12">
                        
                        {/* FEATURED MODULES */}
                        <FadeIn delay={200}>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Star className="w-6 h-6 text-teal-500" /> Modules Prioritaires
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* LCA MODULE */}
                                    <div 
                                        onClick={onLaunchLCA}
                                        className="group relative bg-white rounded-2xl p-8 shadow-xl border-2 border-teal-100 cursor-pointer hover:border-teal-400 transition-all overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">
                                            MATIÈRE OBLIGATOIRE
                                        </div>
                                        <div className="relative z-10 flex items-start gap-6">
                                            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shrink-0">
                                                <BookOpen className="w-8 h-8" />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">
                                                    LCA Trainer : Module Expert
                                                </h4>
                                                <p className="text-slate-500 text-sm mb-4">
                                                    Analyse critique, détection des biais et EBM.
                                                    {isDFASM2 && " Focus sur les études de non-infériorité et méta-analyses."}
                                                </p>
                                                {isDFASM1 && <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded border border-indigo-200">LCA Intégrée</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* DFASM3 SPECIFIC: ECOS ENGINE */}
                                    {isDFASM3 && (
                                        <div 
                                            onClick={onLaunchECOS}
                                            className="group relative bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-100 cursor-pointer hover:border-purple-400 transition-all overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">
                                                NOUVELLE ÉPREUVE ORALE
                                            </div>
                                            <div className="relative z-10 flex items-start gap-6">
                                                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                                                    <ClipboardCheck className="w-8 h-8" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors">
                                                        Moteur ECOS & Simu
                                                    </h4>
                                                    <p className="text-slate-500 text-sm mb-4">
                                                        Générateur de stations cliniques. Chrono officiel (7 min).
                                                        <span className="block text-purple-600 font-bold mt-1">Patient Simulé par IA (Vocal).</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* DFASM2 SPECIFIC: KFP TRAINING */}
                                    {isDFASM2 && (
                                        <div className="group relative bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-100 cursor-pointer hover:border-purple-400 transition-all overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">
                                                NOUVELLE MODALITÉ
                                            </div>
                                            <div className="relative z-10 flex items-start gap-6">
                                                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                                                    <ListChecks className="w-8 h-8" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors">
                                                        KFP & TCS Laboratory
                                                    </h4>
                                                    <p className="text-slate-500 text-sm mb-4">
                                                        Entraînement aux dossiers progressifs courts et concordance de script.
                                                        <span className="block text-rose-500 font-bold mt-1">Mode Discordance Activé.</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </FadeIn>
                        
                        {/* DFASM1 SPECIFIC: PREMIER TOUR */}
                        {isDFASM1 && (
                            <FadeIn>
                                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <TargetIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-indigo-900">Objectif Premier Tour</h4>
                                            <p className="text-sm text-indigo-700">Vision globale des 13 groupes. Focus sur les Diagnostics (Rang A) et Urgences.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1 bg-white rounded border border-indigo-100 text-xs font-bold text-slate-600">70% Diagnostic</div>
                                        <div className="px-3 py-1 bg-white rounded border border-indigo-100 text-xs font-bold text-slate-600">30% Thérapeutique (Urgence)</div>
                                        <div className="px-3 py-1 bg-white rounded border border-indigo-100 text-xs font-bold text-slate-600">LCA Systématique</div>
                                    </div>
                                </div>
                            </FadeIn>
                        )}

                        {/* DFASM2 SPECIFIC: DISCORDANCE ALERT */}
                        {isDFASM2 && (
                            <FadeIn>
                                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-6 flex items-start gap-4">
                                    <div className="p-2 bg-rose-100 rounded-lg shrink-0">
                                        <Skull className="w-6 h-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-rose-900">{DISCORDANCE_RULES.title}</h4>
                                        <p className="text-sm text-rose-700 mt-1">{DISCORDANCE_RULES.desc}</p>
                                        <div className="mt-3 flex gap-2">
                                            <div className="px-3 py-1 bg-white rounded border border-rose-100 text-xs font-bold text-rose-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Zéro Tolérance</div>
                                            <div className="px-3 py-1 bg-white rounded border border-rose-100 text-xs font-bold text-rose-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> KFP 15 items</div>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        )}

                        {/* DFASM3 SPECIFIC: FLASH BLITZ */}
                        {isDFASM3 && (
                            <FadeIn>
                                <div className="bg-rose-900 border border-rose-800 rounded-2xl p-6 mb-6 flex items-start gap-4 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-800/50 via-transparent to-transparent"></div>
                                    <div className="p-2 bg-rose-800 rounded-lg shrink-0 relative z-10">
                                        <ZapIcon className="w-6 h-6 text-rose-300" />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-lg font-bold text-rose-100">Mode "Blitz" Activé</h4>
                                        <p className="text-sm text-rose-200/80 mt-1">
                                            Révision ultra-rapide des Top Items (tombables > 1 fois tous les 3 ans).
                                            Filtrage strict des détails Rang C.
                                        </p>
                                    </div>
                                </div>
                            </FadeIn>
                        )}

                        {/* R2C STRUCTURED GROUPS */}
                        <FadeIn>
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <Database className="w-6 h-6 text-slate-600" /> Programme R2C (13 Groupes)
                                    </h3>
                                    <span className="text-xs font-mono text-slate-400">HIERARCHY_VIEW: ENABLED</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {R2C_GROUPS.map((group) => (
                                        <div key={group.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-bold text-slate-400">{group.id}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                    group.weight === 'HIGH' ? 'bg-rose-100 text-rose-600' :
                                                    group.weight === 'MED' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {group.weight === 'HIGH' ? 'Majeure' : group.weight === 'MED' ? 'Intermédiaire' : 'Mineure'}
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-800 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">
                                                {group.shortTitle}
                                            </h4>
                                            <p className="text-xs text-slate-500 mb-4 line-clamp-1">{group.title}</p>
                                            
                                            <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                                                <span className="text-xs font-semibold text-slate-400">{group.itemsCount} Items</span>
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                )}

                {/* --- PACES LAYOUT --- */}
                {isPACES && (
                    <FadeIn delay={200}>
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Database className="w-6 h-6 text-slate-600" /> Structure Programme (UE)
                                </h3>
                                <span className="text-xs font-mono text-slate-400">DATA_VIEW: ENABLED</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {PACES_PROGRAM.map((ue) => (
                                    <div key={ue.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-teal-400 transition-all cursor-pointer">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-700 text-lg border border-slate-100 shrink-0">
                                                {ue.id}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-lg font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{ue.title}</h4>
                                                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 uppercase">
                                                        {getEffortIcon(ue.effortType)}
                                                        {ue.effortType}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-500">{ue.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                )}

                {/* --- DFGSM2 LAYOUT (NEW DATA ARCHITECT) --- */}
                {isDFGSM2 && (
                    <FadeIn delay={200}>
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Layers className="w-6 h-6 text-indigo-600" /> Architecture des Systèmes (UEI)
                                </h3>
                                <span className="text-xs font-mono text-slate-400">FOUNDATION_LAYER: ACTIVE</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {DFGSM2_PROGRAM.map((sys) => (
                                    <div key={sys.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all p-6 group cursor-pointer relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 leading-tight pr-4">{sys.title}</h4>
                                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{sys.id}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{sys.desc}</p>
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                        Bloc A: Sémiologie
                                                    </span>
                                                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 w-3/4"></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-cyan-700 flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                                                        Bloc B: Physiopath
                                                    </span>
                                                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-500 w-1/2"></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-purple-700 flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                        Bloc C: Explos
                                                    </span>
                                                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-purple-500 w-1/4"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                )}

                {/* --- DFGSM3 LAYOUT (DATA ARCHITECT) --- */}
                {isDFGSM3 && (
                    <FadeIn delay={200}>
                        <div className="space-y-12">
                            {/* Intro Banner for Pharmaco Priority */}
                            <div className="bg-gradient-to-r from-cyan-900 to-blue-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <FlaskConical className="w-64 h-64" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-lg text-xs font-bold uppercase tracking-wider text-cyan-300">
                                            Priorité Absolue
                                        </span>
                                        <span className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                            <Zap className="w-3 h-3 text-yellow-400" /> Coefficient Max
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-display font-bold mb-4">Pharmacologie & Thérapeutique</h3>
                                    <p className="text-cyan-100 max-w-2xl text-lg leading-relaxed mb-8">
                                        Maîtrisez les classes médicamenteuses, les mécanismes d'action et l'iatrogénie. 
                                        C'est le socle indispensable avant d'aborder la pathologie en DFASM.
                                    </p>
                                    <div className="flex gap-4">
                                        <button className="px-6 py-3 bg-white text-cyan-900 rounded-xl font-bold hover:bg-cyan-50 transition-colors flex items-center gap-2">
                                            <Pill className="w-5 h-5" /> Lancer le Quiz Pharmaco
                                        </button>
                                        <button className="px-6 py-3 bg-cyan-800/50 border border-cyan-700 text-cyan-100 rounded-xl font-bold hover:bg-cyan-800 transition-colors">
                                            Fiches Mécanismes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Categories Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {['TRANSVERSAL', 'PROCESS', 'SYNTHESIS'].map(cat => {
                                    const modules = DFGSM3_PROGRAM.filter(m => m.category === cat);
                                    const title = cat === 'TRANSVERSAL' ? 'Sciences Transversales' : cat === 'PROCESS' ? 'Processus Pathologiques' : 'Synthèse Clinique';
                                    const icon = cat === 'TRANSVERSAL' ? <Dna /> : cat === 'PROCESS' ? <ActivitySquare /> : <Brain />;
                                    
                                    return (
                                        <div key={cat} className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-200 pb-2">
                                                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5 text-slate-500" })}
                                                <h3>{title}</h3>
                                            </div>
                                            <div className="grid gap-4">
                                                {modules.map(mod => (
                                                    <div key={mod.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer group">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-cyan-50 transition-colors">
                                                                {getDfgsm3Icon(mod.icon)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">{mod.title}</h4>
                                                                <p className="text-xs text-slate-500 mt-1">{mod.desc}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </FadeIn>
                )}

            </div>
            
            {/* FLOATING SMART ASSISTANT */}
            <SmartAssistant article={null} yearId={yearId} />
        </div>
    );
};

const App: React.FC = () => {
    const [viewState, setViewState] = useState<ViewState>('LANDING');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [user, setUser] = useState<User | null>(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) setUser(currentUser);
    }, []);

    const handleYearSelect = (yearId: string) => {
        setSelectedYear(yearId);
        setViewState('LEVEL_HUB');
    };

    const handleBackToHub = () => {
        setViewState('LEVEL_HUB');
    };

    const handleBackToLanding = () => {
        setViewState('LANDING');
        setSelectedYear('');
    };

    return (
        <div className="min-h-screen bg-slate-50">
             {viewState === 'LANDING' && (
                 <LandingView onSelectYear={handleYearSelect} />
             )}

             {viewState === 'LEVEL_HUB' && (
                 <div>
                     {/* Simple Navigation for Demo */}
                     <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center text-xs">
                        <button onClick={handleBackToLanding} className="hover:text-teal-400 flex items-center gap-1">
                            <ArrowLeft className="w-3 h-3" /> Accueil
                        </button>
                        <div className="flex gap-4">
                            {!user ? (
                                <button onClick={() => setAuthModalOpen(true)} className="hover:text-teal-400 font-bold">CONNEXION</button>
                            ) : (
                                <span className="text-teal-400 font-bold">{user.username} ({user.rank})</span>
                            )}
                        </div>
                     </div>
                     <LevelHubView 
                        yearId={selectedYear} 
                        user={user}
                        onLaunchLCA={() => setViewState('LCA_MODULE')}
                        onLaunchEnglish={() => setViewState('MEDICAL_ENGLISH')}
                        onLaunchECOS={() => setViewState('ECOS_MODULE')}
                     />
                 </div>
             )}

             {viewState === 'LCA_MODULE' && (
                 <LCAModule 
                    yearId={selectedYear} 
                    user={user} 
                    setUser={setUser} 
                    onBack={handleBackToHub} 
                    setAuthModalOpen={setAuthModalOpen}
                 />
             )}

             {viewState === 'MEDICAL_ENGLISH' && (
                 <MedicalEnglishModule yearId={selectedYear} onBack={handleBackToHub} />
             )}

             {viewState === 'ECOS_MODULE' && (
                 <ECOSModule onBack={handleBackToHub} />
             )}

             <AuthModal 
                isOpen={authModalOpen} 
                onClose={() => setAuthModalOpen(false)} 
                onLogin={(u) => { setUser(u); setAuthModalOpen(false); }}
             />
        </div>
    );
};

export default App;