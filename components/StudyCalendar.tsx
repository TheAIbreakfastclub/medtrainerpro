import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { StudySession } from '../types';
import { Calendar, CheckCircle2, Circle, Plus, Sparkles, Brain, Clock, ChevronRight, Trash2, BookOpen, Target } from 'lucide-react';
import { CyberButton } from './CyberUI';

interface StudyCalendarProps {
    yearId: string;
    initialSessions?: StudySession[];
}

export const StudyCalendar: React.FC<StudyCalendarProps> = ({ yearId, initialSessions = [] }) => {
    const [sessions, setSessions] = useState<StudySession[]>(initialSessions);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Manual Form State
    const [newTopic, setNewTopic] = useState('');
    const [newFocus, setNewFocus] = useState('');
    const [newType, setNewType] = useState<'COURS' | 'EXOS' | 'ECOS' | 'FLASHCARDS'>('COURS');

    // Stats
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'DONE').length;
    const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    const generateScheduleAI = async () => {
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Agis comme un coach pédagogique expert pour un étudiant en médecine niveau ${yearId}.
            Génère un planning de révision réaliste et optimisé pour les 5 prochains jours.
            
            Règles :
            1. Aligne le contenu sur le programme officiel ${yearId} (ex: PASS = Anatomie/Biochimie, DFASM = Cas Cliniques/Cardio/Pneumo).
            2. Varie les types d'activités (Apprentissage profond le matin, QCM/Flashcards le soir).
            3. Sois précis sur le "focus" (ex: pas juste "Cardio", mais "Insuffisance Cardiaque - Traitement").
            
            Format JSON attendu : Array de { topic, focus, type (COURS|EXOS|ECOS|FLASHCARDS), duration (min) }.
            Génère 5 à 7 sessions.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                topic: { type: Type.STRING },
                                focus: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ['COURS', 'EXOS', 'ECOS', 'FLASHCARDS'] },
                                duration: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            });

            const data = JSON.parse(response.text || '[]');
            
            // Transform to StudySession objects with dates
            const newSessions: StudySession[] = data.map((item: any, index: number) => {
                const date = new Date();
                date.setDate(date.getDate() + Math.floor(index / 2)); // Spread over days roughly
                return {
                    id: Date.now().toString() + index,
                    date: date.toISOString().split('T')[0],
                    topic: item.topic,
                    focus: item.focus,
                    type: item.type,
                    duration: item.duration,
                    status: 'PENDING'
                };
            });

            setSessions(prev => [...prev, ...newSessions]);

        } catch (e) {
            console.error("Calendar AI Error", e);
        } finally {
            setLoading(false);
        }
    };

    const addManualSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopic || !newFocus) return;

        const session: StudySession = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0], // Today
            topic: newTopic,
            focus: newFocus,
            type: newType,
            duration: 60,
            status: 'PENDING'
        };

        setSessions(prev => [...prev, session]);
        setNewTopic('');
        setNewFocus('');
        setShowAddForm(false);
    };

    const toggleSession = (id: string) => {
        setSessions(prev => prev.map(s => 
            s.id === id ? { ...s, status: s.status === 'PENDING' ? 'DONE' : 'PENDING' } : s
        ));
    };

    const deleteSession = (id: string) => {
        setSessions(prev => prev.filter(s => s.id !== id));
    };

    const getTypeColor = (type: string) => {
        switch(type) {
            case 'COURS': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'EXOS': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'ECOS': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200'; // Flashcards
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
            
            {/* HEADER & PROGRESS */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Neuro-Planning</h3>
                            <p className="text-xs text-slate-500">Programme Adaptatif</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-slate-800">{progress}%</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Complété</p>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="p-4 flex gap-2 border-b border-slate-100">
                <button 
                    onClick={generateScheduleAI} 
                    disabled={loading}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    {loading ? <span className="animate-spin">⏳</span> : <Sparkles className="w-3 h-3" />}
                    Générer Semaine IA
                </button>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="py-2 px-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-3 h-3" /> Manuel
                </button>
            </div>

            {/* MANUAL ENTRY FORM */}
            {showAddForm && (
                <form onSubmit={addManualSession} className="p-4 bg-slate-50 border-b border-slate-100 animate-fadeIn">
                    <div className="space-y-3">
                        <input 
                            placeholder="Matière (ex: Cardio)" 
                            className="w-full text-xs p-2 rounded border border-slate-200"
                            value={newTopic}
                            onChange={e => setNewTopic(e.target.value)}
                        />
                        <input 
                            placeholder="Sujet précis (ex: SCA ST+)" 
                            className="w-full text-xs p-2 rounded border border-slate-200"
                            value={newFocus}
                            onChange={e => setNewFocus(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <select 
                                className="text-xs p-2 rounded border border-slate-200 flex-grow"
                                value={newType}
                                onChange={(e: any) => setNewType(e.target.value)}
                            >
                                <option value="COURS">Apprentissage</option>
                                <option value="EXOS">Entraînement</option>
                                <option value="ECOS">Simulation Oral</option>
                                <option value="FLASHCARDS">Révision Rapide</option>
                            </select>
                            <button type="submit" className="bg-slate-800 text-white text-xs font-bold px-4 rounded">OK</button>
                        </div>
                    </div>
                </form>
            )}

            {/* SESSION LIST */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scroll bg-white">
                {sessions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <Target className="w-12 h-12 mb-2" />
                        <p className="text-sm text-center px-4">Votre agenda est vide.<br/>Utilisez l'IA pour structurer votre semaine.</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div 
                            key={session.id} 
                            className={`group relative p-3 rounded-xl border transition-all ${
                                session.status === 'DONE' 
                                ? 'bg-slate-50 border-slate-100 opacity-60' 
                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <button 
                                    onClick={() => toggleSession(session.id)}
                                    className={`mt-1 shrink-0 transition-colors ${
                                        session.status === 'DONE' ? 'text-emerald-500' : 'text-slate-300 group-hover:text-indigo-400'
                                    }`}
                                >
                                    {session.status === 'DONE' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                </button>
                                
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTypeColor(session.type)}`}>
                                            {session.type}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {session.duration} min
                                        </span>
                                    </div>
                                    <h4 className={`text-sm font-bold truncate ${session.status === 'DONE' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                        {session.topic}
                                    </h4>
                                    <p className="text-xs text-slate-500 truncate">{session.focus}</p>
                                </div>

                                <button 
                                    onClick={() => deleteSession(session.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};