import React, { useState } from 'react';
import { User, ExamResult, Article } from '../types';
import { CyberPanel, CyberButton } from './CyberUI';
import { ArticleReader } from './ArticleReader';
import { Dashboard } from './Dashboard';
import { ExamModal } from './ExamModal';
import { SubscriptionModal } from './SubscriptionModal';
import { SmartAssistant } from './SmartAssistant';
import { VideoAnalyzer } from './VideoAnalyzer';
import { PedagogicalBoard } from './PedagogicalBoard';
import { AdUnit } from './AdUnit';
import { ArrowLeft, Search, Video, SplitSquareHorizontal, Gavel, X } from 'lucide-react';
import { fetchRandomArticle, fetchByManualId } from '../services/pmcService';
import { authService } from '../services/authService';

export const LCAModule: React.FC<{ 
    yearId: string; 
    user: User | null; 
    setUser: (u: User) => void; 
    onBack: () => void; 
    setAuthModalOpen: (b: boolean) => void;
}> = ({ yearId, user, setUser, onBack, setAuthModalOpen }) => {
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(false);
    // Updated type definition for viewMode
    const [viewMode, setViewMode] = useState<'EXPLAIN' | 'MAIN_POINTS' | 'R2C_ADAPTER'>('EXPLAIN');
    const [examOpen, setExamOpen] = useState(false);
    const [boardOpen, setBoardOpen] = useState(false);
    const [videoOpen, setVideoOpen] = useState(false);
    const [subModalOpen, setSubModalOpen] = useState(false);
    const [manualId, setManualId] = useState('');

    const handleLoadArticle = async (specialty: string) => {
        if (!user) return setAuthModalOpen(true);
        if (!authService.canPerformAction(user)) return setSubModalOpen(true);

        setLoading(true);
        try {
            const newArt = await fetchRandomArticle(specialty);
            setArticle(newArt);
            const u = authService.incrementUsage(user);
            setUser(u);
            authService.addHistory(newArt.id);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualId.trim()) return;
        if (!user) return setAuthModalOpen(true);
        if (!authService.canPerformAction(user)) return setSubModalOpen(true);

        setLoading(true);
        try {
            const newArt = await fetchByManualId(manualId);
            setArticle(newArt);
            const u = authService.incrementUsage(user);
            setUser(u);
            authService.addHistory(newArt.id);
        } catch (e) {
             alert("Article non trouvé");
        } finally {
            setLoading(false);
        }
    };
    
    const handleExamComplete = (result: ExamResult) => {
        if (user) {
             const u = authService.addExamResult(result);
             if (u) setUser(u);
        }
        setExamOpen(false);
    };

    return (
        <div className="flex-grow flex flex-col h-full bg-slate-50 relative animate-fadeIn">
            {/* TOOLBAR */}
            <div className="bg-white border-b border-slate-200 sticky top-[57px] z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex gap-2">
                             {/* Specialty Quick Select */}
                             {['Cardiology', 'Neurology', 'Pneumology', 'random'].map(spec => (
                                 <button 
                                    key={spec}
                                    onClick={() => handleLoadArticle(spec)}
                                    disabled={loading}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 border border-transparent transition-all whitespace-nowrap"
                                 >
                                    {spec === 'random' ? '🎲 Random' : spec.slice(0,4)}
                                 </button>
                             ))}
                        </div>

                        <form onSubmit={handleManualSearch} className="flex items-center gap-2 ml-2">
                            <input 
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                placeholder="PMCID..." 
                                className="w-24 bg-slate-100 border-none rounded-lg py-1.5 px-3 text-xs font-mono focus:ring-2 focus:ring-teal-500"
                            />
                            <button type="submit" className="p-1.5 bg-slate-200 rounded-lg hover:bg-teal-500 hover:text-white transition-colors">
                                <Search className="w-4 h-4" />
                            </button>
                        </form>
                     </div>

                     <div className="flex items-center gap-2">
                         <CyberButton 
                            variant="primary" 
                            onClick={() => setVideoOpen(true)}
                            className="!py-1.5 !px-3 !text-xs !rounded-lg"
                            icon={<Video className="w-4 h-4" />}
                         >
                            Vidéo Analyser
                         </CyberButton>
                     </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
                 
                 {/* LEFT: READER (8 Cols) */}
                 <div className="lg:col-span-8 flex flex-col gap-6">
                     <ArticleReader 
                        article={article} 
                        loading={loading} 
                        highlightsEnabled={user?.settings.highlightsEnabled ?? true}
                        viewMode={viewMode}
                     />
                     <AdUnit format="horizontal" />
                 </div>

                 {/* RIGHT: DASHBOARD & TOOLS (4 Cols) */}
                 <div className="lg:col-span-4 flex flex-col gap-6">
                      
                      {/* Action Card */}
                      <CyberPanel className="bg-white border-slate-200">
                          <div className="p-6 grid grid-cols-2 gap-4">
                               <button 
                                  onClick={() => setExamOpen(true)}
                                  disabled={!article}
                                  className="col-span-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-4 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                   <SplitSquareHorizontal className="w-5 h-5" /> Mode Examen
                               </button>
                               <button 
                                  onClick={() => setBoardOpen(true)}
                                  disabled={!article}
                                  className="col-span-2 bg-white border-2 border-slate-100 text-slate-600 p-4 rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                   <Gavel className="w-5 h-5" /> Conseil Pédagogique
                               </button>
                          </div>
                      </CyberPanel>

                      <Dashboard 
                         article={article}
                         currentMode={viewMode}
                         onModeChange={setViewMode}
                      />

                      {/* Video Analyzer is handled via Modal for space but button is in toolbar */}
                 </div>
            </div>

            {/* MODALS & OVERLAYS */}
            {videoOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-5xl relative">
                        <button onClick={() => setVideoOpen(false)} className="absolute -top-10 right-0 text-white hover:text-rose-400 font-bold flex gap-2">
                             FERMER <X className="w-6 h-6" />
                        </button>
                        <VideoAnalyzer />
                    </div>
                </div>
            )}

            <ExamModal 
                isOpen={examOpen}
                onClose={() => setExamOpen(false)}
                article={article}
                onComplete={handleExamComplete}
                yearId={yearId}
            />

            <PedagogicalBoard 
                isOpen={boardOpen}
                onClose={() => setBoardOpen(false)}
                article={article}
            />
            
            <SubscriptionModal 
                isOpen={subModalOpen}
                onClose={() => setSubModalOpen(false)}
                user={user}
                onUpgrade={setUser}
            />

            <SmartAssistant article={article} />
        </div>
    );
};