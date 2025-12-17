import React, { useState, useEffect } from 'react';
import { CyberPanel, CyberButton } from './CyberUI';
import { SmartAssistant } from './SmartAssistant';
import { ECOSStation } from '../types';
import { SPECIALTIES, ECOS_DOMAINS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";
import { ArrowLeft, Clock, Mic, Users, ClipboardCheck, Play, RotateCcw, AlertCircle, Loader2, Sparkles, User, FileText, CheckSquare, Eye } from 'lucide-react';

interface ECOSModuleProps {
    onBack: () => void;
}

export const ECOSModule: React.FC<ECOSModuleProps> = ({ onBack }) => {
    // State
    const [station, setStation] = useState<ECOSStation | null>(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'CANDIDATE' | 'EXAMINER'>('CANDIDATE');
    const [timer, setTimer] = useState(420); // 7 minutes in seconds
    const [timerActive, setTimerActive] = useState(false);
    const [simulationActive, setSimulationActive] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<string>('random');

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (timerActive && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0) {
            setTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, timer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const generateStation = async () => {
        setLoading(true);
        setStation(null);
        setTimer(420);
        setTimerActive(false);
        setViewMode('CANDIDATE');
        setSimulationActive(false);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Génère une station ECOS (Examen Clinique Objectif Structuré) pour un étudiant en fin d'externat (DFASM3).
            Domaine: ${selectedDomain === 'random' ? 'Aléatoire (Cardio, Pneumo, Psy, Gynéco ou Pédiatrie)' : selectedDomain}.
            
            Structure requise (JSON):
            1. Contexte & Consigne (Visible par le candidat).
            2. Script Patient (Caché: Nom, Âge, Histoire, Personnalité/Émotion, Info cachée à ne révéler que si demandée).
            3. Grille de correction (5 domaines ECOS).
            
            Types possibles: Annonce de mauvaise nouvelle, Interrogatoire difficile, Urgence vitale, Prévention.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['ANNONCE', 'DIAGNOSTIC', 'URGENCE', 'PREVENTION'] },
                            context: { type: Type.STRING },
                            instruction: { type: Type.STRING },
                            patientScript: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    age: { type: Type.NUMBER },
                                    history: { type: Type.STRING },
                                    personality: { type: Type.STRING },
                                    openingLine: { type: Type.STRING },
                                    hiddenInfo: { type: Type.STRING }
                                }
                            },
                            grid: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        category: { type: Type.STRING },
                                        points: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const data = JSON.parse(response.text || "{}");
            if (data.title) {
                setStation(data);
            }
        } catch (error) {
            console.error("ECOS Gen Error", error);
        } finally {
            setLoading(false);
        }
    };

    const startSimulation = () => {
        setTimerActive(true);
        setSimulationActive(true);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative animate-fadeIn min-h-screen">
            
            {/* Header */}
            <div className="bg-purple-900 text-white sticky top-[57px] z-40 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-sm font-bold text-purple-300 uppercase tracking-widest flex items-center gap-2">
                                <ClipboardCheck className="w-4 h-4" /> STATION ECOS
                            </h2>
                            <p className="text-xs text-slate-300">DFASM3 • Entraînement Clinique Oral</p>
                        </div>
                    </div>
                    
                    {/* Timer Display */}
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl font-mono text-xl font-bold border transition-all ${
                        timer < 60 ? 'bg-rose-500 border-rose-600 text-white animate-pulse' : 'bg-slate-800 border-slate-700 text-purple-400'
                    }`}>
                        <Clock className="w-5 h-5" />
                        {formatTime(timer)}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white border-b border-slate-200 p-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select 
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 w-full md:w-64"
                        >
                            <option value="random">🎲 Aléatoire</option>
                            {Object.entries(SPECIALTIES).filter(([k]) => k !== 'random').map(([k, v]) => (
                                <option key={k} value={v}>{v}</option>
                            ))}
                        </select>
                        <CyberButton onClick={generateStation} disabled={loading} variant="primary" className="!py-2 !px-4 !text-sm">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Générer Station'}
                        </CyberButton>
                    </div>

                    {station && (
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setViewMode('CANDIDATE')}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                                    viewMode === 'CANDIDATE' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <User className="w-4 h-4" /> Candidat
                            </button>
                            <button 
                                onClick={() => setViewMode('EXAMINER')}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                                    viewMode === 'EXAMINER' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Eye className="w-4 h-4" /> Examinateur
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
                {!station ? (
                    <div className="flex flex-col items-center justify-center h-[500px] text-center opacity-60">
                        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                            <Users className="w-10 h-10 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-2">Générateur de Stations ECOS</h3>
                        <p className="text-slate-500 max-w-md">Sélectionnez une matière ou laissez le hasard décider. Préparez-vous à jouer le rôle du médecin pendant 7 minutes.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* LEFT: CANDIDATE CARD */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Station Info Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                        station.type === 'ANNONCE' ? 'bg-amber-100 text-amber-700' : 
                                        station.type === 'URGENCE' ? 'bg-rose-100 text-rose-700' : 
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {station.type}
                                    </span>
                                    <h1 className="text-2xl font-display font-bold text-slate-800 mt-2">{station.title}</h1>
                                </div>
                            </div>

                            {/* Candidate View (Always Visible or Primary) */}
                            <div className={`bg-white p-8 rounded-2xl border-2 shadow-lg transition-all ${viewMode === 'CANDIDATE' ? 'border-purple-500 shadow-purple-500/10' : 'border-slate-200 opacity-50 grayscale'}`}>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Fiche Candidat
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">Contexte</h4>
                                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            {station.context}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-2">Consigne</h4>
                                        <p className="text-lg font-medium text-purple-900 leading-relaxed">
                                            {station.instruction}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
                                    <button 
                                        onClick={startSimulation}
                                        disabled={simulationActive}
                                        className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {simulationActive ? 'Simulation en cours...' : <><Play className="w-5 h-5" /> Lancer Chrono & IA</>}
                                    </button>
                                    <button 
                                        onClick={() => { setTimer(420); setTimerActive(false); setSimulationActive(false); }}
                                        className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Examiner View (Hidden unless toggled) */}
                            {viewMode === 'EXAMINER' && (
                                <div className="bg-slate-50 p-8 rounded-2xl border-2 border-rose-200 shadow-lg animate-fadeIn">
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                            <Eye className="w-4 h-4" /> Fiche Patient / Examinateur
                                        </h3>
                                        <div className="bg-rose-100 text-rose-700 px-3 py-1 rounded text-xs font-bold">CONFIDENTIEL</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                                            <span className="text-xs text-slate-400 font-bold uppercase">Identité</span>
                                            <p className="font-bold text-slate-800">{station.patientScript.name}, {station.patientScript.age} ans</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                                            <span className="text-xs text-slate-400 font-bold uppercase">Personnalité</span>
                                            <p className="font-bold text-rose-600">{station.patientScript.personality}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-2">Phrase d'ouverture</h4>
                                            <p className="italic text-slate-600">"{station.patientScript.openingLine}"</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-2">Histoire de la maladie (Script)</h4>
                                            <p className="text-sm text-slate-600">{station.patientScript.history}</p>
                                        </div>
                                        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                                            <h4 className="font-bold text-rose-800 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Info Cachée</h4>
                                            <p className="text-sm text-rose-700">Ne révéler que si question précise : {station.patientScript.hiddenInfo}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: CHECKLIST */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
                                <div className="p-4 bg-slate-50 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4 text-purple-500" /> Grille de Notation
                                    </h3>
                                </div>
                                <div className="p-4 h-[calc(100vh-250px)] overflow-y-auto custom-scroll">
                                    <div className="space-y-6">
                                        {station.grid.map((section, idx) => (
                                            <div key={idx}>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">
                                                    {section.category}
                                                </h4>
                                                <ul className="space-y-3">
                                                    {section.points.map((pt, k) => (
                                                        <li key={k} className="flex items-start gap-3 group cursor-pointer">
                                                            <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center shrink-0 group-hover:border-purple-400 transition-colors">
                                                                <input type="checkbox" className="w-3 h-3 accent-purple-600 cursor-pointer" />
                                                            </div>
                                                            <span className="text-sm text-slate-600 group-hover:text-slate-900 leading-tight">{pt}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>

            {/* Smart Assistant Overlay for Roleplay */}
            <SmartAssistant 
                triggerOpen={simulationActive}
                customSystemInstruction={station ? `Tu es un patient simulé pour un examen ECOS.
                Ton nom : ${station.patientScript.name}, ${station.patientScript.age} ans.
                Ton caractère : ${station.patientScript.personality}.
                Ton histoire : ${station.patientScript.history}.
                Info cachée (ne le dis que si on te pose une question spécifique dessus) : ${station.patientScript.hiddenInfo}.
                Première phrase à dire : "${station.patientScript.openingLine}".
                Reste dans ton personnage. Sois bref.` : undefined}
            />
        </div>
    );
};