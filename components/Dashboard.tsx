import React, { useState, useEffect } from 'react';
import { CyberPanel } from './CyberUI';
import { Article } from '../types';
import { CHECKLISTS } from '../constants';
import { CheckCircle2, BrainCircuit, ListChecks, Globe } from 'lucide-react';

interface DashboardProps {
    article: Article | null;
    currentMode: 'EXPLAIN' | 'MAIN_POINTS' | 'R2C_ADAPTER';
    onModeChange: (mode: 'EXPLAIN' | 'MAIN_POINTS' | 'R2C_ADAPTER') => void;
}

type PicoCategory = 'pop' | 'int' | 'out';

export const Dashboard: React.FC<DashboardProps> = ({ article, currentMode, onModeChange }) => {
    // Typed state for PICO
    const [picoState, setPicoState] = useState<Record<PicoCategory, string>>({ pop: '', int: '', out: '' });
    const [checklistState, setChecklistState] = useState<Record<string, string | null>>({});

    useEffect(() => {
        setPicoState({ pop: '', int: '', out: '' });
        setChecklistState({});
    }, [article]);

    const checklistType = article 
        ? (article.abstractText.toLowerCase().includes('randomized') ? 'RCT' : 'OBS') 
        : null;
    
    const checklistData = checklistType ? CHECKLISTS[checklistType] : null;

    const picoCategories: PicoCategory[] = ['pop', 'int', 'out'];

    const picoOptions: Record<PicoCategory, string[]> = {
        pop: ['General Adults', 'Pediatrics', 'Geriatrics', 'Specific Disease'],
        int: ['Medication', 'Surgery', 'Lifestyle', 'Observation'],
        out: ['Mortality', 'Morbidity', 'Quality of Life', 'Patient-Reported Outcomes']
    };

    return (
        <div className="flex flex-col gap-6">
            
            {/* 1. PEDAGOGICAL MODE SELECTOR */}
            <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                <div className="grid grid-cols-3 gap-2">
                     <button 
                        onClick={() => onModeChange('EXPLAIN')}
                        disabled={currentMode === 'EXPLAIN'}
                        className={`relative rounded-xl p-2 flex flex-col items-center gap-1.5 transition-all duration-300 ${
                            currentMode === 'EXPLAIN' 
                            ? 'bg-white shadow-sm ring-1 ring-slate-200 cursor-default' 
                            : 'hover:bg-white/60 text-slate-500 hover:text-teal-600 cursor-pointer active:scale-95'
                        }`}
                     >
                         <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                             currentMode === 'EXPLAIN' ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-400'
                         }`}>
                            <BrainCircuit className="w-4 h-4" />
                         </div>
                         <div className="text-center">
                            <span className={`text-[10px] font-bold block ${currentMode === 'EXPLAIN' ? 'text-slate-800' : 'text-slate-500'}`}>Analyse</span>
                         </div>
                     </button>

                     <button 
                        onClick={() => onModeChange('MAIN_POINTS')}
                        disabled={currentMode === 'MAIN_POINTS'}
                        className={`relative rounded-xl p-2 flex flex-col items-center gap-1.5 transition-all duration-300 ${
                            currentMode === 'MAIN_POINTS' 
                            ? 'bg-white shadow-sm ring-1 ring-slate-200 cursor-default' 
                            : 'hover:bg-white/60 text-slate-500 hover:text-indigo-600 cursor-pointer active:scale-95'
                        }`}
                     >
                         <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                             currentMode === 'MAIN_POINTS' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'
                         }`}>
                            <ListChecks className="w-4 h-4" />
                         </div>
                         <div className="text-center">
                            <span className={`text-[10px] font-bold block ${currentMode === 'MAIN_POINTS' ? 'text-slate-800' : 'text-slate-500'}`}>Synthèse</span>
                         </div>
                     </button>

                     <button 
                        onClick={() => onModeChange('R2C_ADAPTER')}
                        disabled={currentMode === 'R2C_ADAPTER'}
                        className={`relative rounded-xl p-2 flex flex-col items-center gap-1.5 transition-all duration-300 ${
                            currentMode === 'R2C_ADAPTER' 
                            ? 'bg-white shadow-sm ring-1 ring-slate-200 cursor-default' 
                            : 'hover:bg-white/60 text-slate-500 hover:text-purple-600 cursor-pointer active:scale-95'
                        }`}
                     >
                         <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                             currentMode === 'R2C_ADAPTER' ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-400'
                         }`}>
                            <Globe className="w-4 h-4" />
                         </div>
                         <div className="text-center">
                            <span className={`text-[10px] font-bold block ${currentMode === 'R2C_ADAPTER' ? 'text-slate-800' : 'text-slate-500'}`}>Adaptateur</span>
                         </div>
                     </button>
                </div>
            </div>

            {/* 2. PICO ANALYZER */}
            <CyberPanel title="Classification PICO" className="border-teal-100/50">
                <div className="p-6 space-y-6">
                    {picoCategories.map((group) => (
                        <div key={group} className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span>{group === 'pop' ? 'Population' : group === 'int' ? 'Intervention' : 'Outcome'}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {picoOptions[group].map((opt) => (
                                    <button 
                                        key={opt}
                                        onClick={() => setPicoState(prev => ({...prev, [group]: opt}))}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border-2 active:scale-95 cursor-pointer hover:shadow-md ${
                                            picoState[group] === opt 
                                            ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm' 
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-teal-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CyberPanel>

            {/* 3. CHECKLIST */}
            {checklistData && (
                <CyberPanel title={checklistData.name} className="border-teal-200/50 bg-teal-50/30">
                    <div className="p-3">
                        {checklistData.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border-b border-teal-100/50 last:border-0 hover:bg-white/50 rounded-xl transition-colors cursor-pointer active:bg-white/80 group"
                                 onClick={() => setChecklistState(p => ({...p, [i]: p[i] === 'Y' ? null : 'Y'}))}>
                                <span className="text-sm text-slate-700 font-medium leading-tight max-w-[80%] select-none group-hover:text-teal-700 transition-colors">{item}</span>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all border-2 ${checklistState[i] === 'Y' ? 'bg-teal-500 border-teal-500 text-white scale-110' : 'bg-transparent border-slate-300 text-transparent group-hover:border-teal-300'}`}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CyberPanel>
            )}
        </div>
    );
};