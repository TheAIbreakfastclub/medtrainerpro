import React, { useState, useEffect } from 'react';
import { QuizQuestion, ExamResult, Article, QuizOption } from '../types';
import { CyberButton } from './CyberUI';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import { Loader2, FileText, ListChecks, SplitSquareHorizontal, X, AlertCircle, CheckCircle2, XCircle, Shield, Star, BookOpen, AlertTriangle, Skull, Sparkles, BookCheck } from 'lucide-react';

interface ExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    article: Article | null;
    onComplete: (result: ExamResult) => void;
    yearId?: string;
}

export const ExamModal: React.FC<ExamModalProps> = ({ isOpen, onClose, article, onComplete, yearId }) => {
    // Core State
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Answers State
    const [answers, setAnswers] = useState<Record<number, boolean | string[] | null>>({});
    
    const [submitted, setSubmitted] = useState(false);
    const [fatalError, setFatalError] = useState<boolean>(false); 

    // View State
    const [showDocs, setShowDocs] = useState(false);
    const [docView, setDocView] = useState<'TEXT' | 'SUMMARY'>('TEXT');
    const [summary, setSummary] = useState<string>(""); 
    
    // AI Explanation State
    const [explanationLoading, setExplanationLoading] = useState<number | null>(null);
    const [aiExplanations, setAiExplanations] = useState<Record<number, string>>({});

    useEffect(() => {
        if (isOpen) {
            setAnswers({});
            setSubmitted(false);
            setFatalError(false);
            setShowDocs(false);
            setQuestions([]);
            setAiExplanations({});
            if (article) {
                generateExam(article);
            }
        }
    }, [isOpen, article]);

    const generateExam = async (art: Article) => {
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const isDFASM1 = yearId === 'DFASM1';
            const isDFASM2 = yearId === 'DFASM2';
            
            let prompt = "";
            let responseSchema = {};

            if (isDFASM2) {
                prompt = `Génère 3 questions cliniques de type KFP (Key Feature Problem) basées sur cet article.
                Contexte: Étudiant 5ème année (Expertise). Profil Patient Complexe (Comorbidités).
                Titre: ${art.title}
                Abstract: ${art.abstractText}
                Format JSON: Array de { t, r: 'B', type: 'KFP', e, options: [{id, text, status: 'CORRECT'|'DISCORDANCE'|'NEUTRAL'}] }
                IMPORTANT : Les réponses doivent être strictement exactes sur le plan médical.`;

                responseSchema = {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    t: { type: Type.STRING },
                                    r: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ["KFP"] },
                                    e: { type: Type.STRING },
                                    options: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                id: { type: Type.STRING },
                                                text: { type: Type.STRING },
                                                status: { type: Type.STRING, enum: ["CORRECT", "NEUTRAL", "DISCORDANCE"] }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        summary: { type: Type.STRING }
                    }
                };

            } else {
                prompt = `Génère 5 questions de type Vrai/Faux pour le concours EDN basées sur cet article.
                Titre: ${art.title}
                Abstract: ${art.abstractText}
                Format JSON attendu: Array de { t, r: 'A' ou 'B', c: boolean, e: explanation, type: 'TF' }`;

                responseSchema = {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    t: { type: Type.STRING },
                                    r: { type: Type.STRING, enum: ["A", "B"] },
                                    c: { type: Type.BOOLEAN },
                                    e: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ["TF"] }
                                }
                            }
                        },
                        summary: { type: Type.STRING }
                    }
                };
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema
                }
            });

            const data = JSON.parse(response.text || "{}");
            if (data.questions) {
                const processedQs = data.questions.map((q: any) => ({...q, type: q.type || 'TF'}));
                setQuestions(processedQs);
                setSummary(data.summary || "Synthèse non disponible.");
            } else {
                throw new Error("Format invalid");
            }
        } catch (error) {
            console.error("Exam Gen Error", error);
        } finally {
            setLoading(false);
        }
    };

    const requestAiExplanation = async (index: number, question: QuizQuestion) => {
        setExplanationLoading(index);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // SECURITY PROMPT FOR EXPLANATION
            const prompt = `Agis comme un professeur de médecine expert (PU-PH).
            Ton objectif : Expliquer la réponse à cette question pour un étudiant niveau ${yearId || 'Externe'}.
            
            RÈGLES STRICTES :
            1. Ne base ton explication QUE sur les données médicales établies (Consensus, Physiopathologie).
            2. N'invente RIEN. Si la question porte sur l'article, réfère-toi à l'abstract fourni ci-dessous.
            3. Sois pédagogique mais précis.
            
            Question : "${question.t}"
            Réponse attendue : ${question.c ? 'VRAI' : 'FAUX'} (ou Options correctes pour KFP)
            Correction courte fournie : "${question.e}"
            Contexte Article : "${article?.abstractText?.substring(0, 1000)}..."
            
            Génère une explication claire en 3 points max.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setAiExplanations(prev => ({...prev, [index]: response.text || "Pas d'explication disponible."}));
        } catch (e) {
            console.error(e);
        } finally {
            setExplanationLoading(null);
        }
    };

    if (!isOpen) return null;

    const handleAnswerTF = (index: number, choice: boolean) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [index]: choice }));
    };

    const handleAnswerKFP = (index: number, optionId: string) => {
        if (submitted) return;
        setAnswers(prev => {
            const currentSelected = (prev[index] as string[]) || [];
            if (currentSelected.includes(optionId)) {
                return { ...prev, [index]: currentSelected.filter(id => id !== optionId) };
            } else {
                return { ...prev, [index]: [...currentSelected, optionId] };
            }
        });
    };

    const handleSubmit = () => {
        setSubmitted(true);
        let correctCount = 0;
        let isFatal = false;

        questions.forEach((q, i) => {
            if (q.type === 'KFP' && q.options) {
                const selectedIds = (answers[i] as string[]) || [];
                const hasDiscordance = q.options.some(opt => selectedIds.includes(opt.id) && opt.status === 'DISCORDANCE');
                if (hasDiscordance) isFatal = true;
                else {
                    const correctIds = q.options.filter(o => o.status === 'CORRECT').map(o => o.id);
                    if (correctIds.every(id => selectedIds.includes(id)) && selectedIds.every(id => correctIds.includes(id))) correctCount++;
                }
            } else {
                if (answers[i] === q.c) correctCount++;
            }
        });

        if (isFatal) { setFatalError(true); correctCount = 0; }
        
        const result: ExamResult = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            score: correctCount,
            total: questions.length
        };
        onComplete(result);
    };

    const percentage = questions.length > 0 ? Math.round(( (fatalError ? 0 : calculateScore()) / questions.length) * 100) : 0;

    function calculateScore() {
        let s = 0;
        questions.forEach((q, i) => {
            if (q.type === 'KFP') {
                 const selectedIds = (answers[i] as string[]) || [];
                 const correctIds = q.options?.filter(o => o.status === 'CORRECT').map(o => o.id) || [];
                 if (correctIds.length > 0 && correctIds.every(id => selectedIds.includes(id)) && selectedIds.every(id => correctIds.includes(id))) s++;
            } else {
                if (answers[i] === q.c) s++;
            }
        });
        return s;
    }

    const chartData = [
        { name: 'Score', value: fatalError ? 0 : calculateScore() },
        { name: 'Lost', value: questions.length - (fatalError ? 0 : calculateScore()) }
    ];
    const COLORS = ['#14b8a6', '#f43f5e'];

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white w-full max-w-[1400px] h-[95vh] rounded-2xl flex relative shadow-2xl overflow-hidden animate-fadeIn">
                
                <div className={`flex flex-col h-full transition-all duration-300 ${showDocs ? 'w-full lg:w-3/5' : 'w-full'}`}>
                    
                    <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white z-10">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-display font-bold text-slate-800 tracking-wide flex items-center gap-2">
                                <SplitSquareHorizontal className="w-6 h-6 text-teal-500" />
                                MODULE EXAMEN 
                                {yearId === 'DFASM1' && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full ml-2">PREMIER TOUR</span>}
                                {yearId === 'DFASM2' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">EXPERTISE (KFP)</span>}
                            </h2>
                            {!submitted && !loading && (
                                <button 
                                    onClick={() => setShowDocs(!showDocs)}
                                    className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                        showDocs 
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                                    }`}
                                >
                                    {showDocs ? 'Masquer Documents' : 'Consulter Documents'}
                                </button>
                            )}
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="flex-grow overflow-hidden flex flex-col bg-slate-50 relative">
                        {loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                                <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
                                <h3 className="text-lg font-bold text-slate-700">Génération du Sujet...</h3>
                                <p className="text-sm text-slate-500">Gemini analyse l'article pour créer les questions</p>
                            </div>
                        ) : !submitted ? (
                            <>
                                <div className="p-4 sm:p-8 space-y-6 overflow-y-auto custom-scroll flex-grow">
                                    {yearId === 'DFASM2' && (
                                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center gap-3 mb-4">
                                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                                            <p className="text-xs text-rose-700 font-bold">ATTENTION : Règle de Discordance Active.</p>
                                        </div>
                                    )}

                                    {questions.map((q, i) => (
                                        <div key={i} className={`bg-white border p-6 rounded-xl relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow ${q.type === 'KFP' ? 'border-purple-200' : 'border-slate-200'}`}>
                                            <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl font-display font-bold text-slate-400 select-none">{i + 1}</div>
                                            <div className="flex justify-between items-center mb-4">
                                                {q.r === 'A' ? <span className="text-[10px] font-bold text-white bg-slate-800 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1"><Shield className="w-3 h-3" /> Rang A</span> : <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1"><Star className="w-3 h-3" /> Rang B</span>}
                                                {q.type === 'KFP' && <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-md uppercase ml-2">KFP</span>}
                                            </div>
                                            <p className="text-base font-body text-slate-700 mb-6 font-medium pr-12">{q.t}</p>
                                            
                                            {q.type === 'KFP' && q.options ? (
                                                <div className="flex flex-col gap-2">
                                                    {q.options.map((opt) => {
                                                        const isSelected = ((answers[i] as string[]) || []).includes(opt.id);
                                                        return (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => handleAnswerKFP(i, opt.id)}
                                                                className={`p-3 text-sm text-left rounded-lg border-2 transition-all flex items-center gap-3 ${isSelected ? 'bg-purple-50 border-purple-500 text-purple-900' : 'bg-white border-slate-100 hover:border-purple-200 text-slate-600'}`}
                                                            >
                                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-300'}`}>
                                                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                                </div>
                                                                {opt.text}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button onClick={() => handleAnswerTF(i, true)} className={`p-4 text-sm font-bold rounded-lg border-2 ${answers[i] === true ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>VRAI</button>
                                                    <button onClick={() => handleAnswerTF(i, false)} className={`p-4 text-sm font-bold rounded-lg border-2 ${answers[i] === false ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>FAUX</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 border-t border-slate-200 bg-white">
                                    <CyberButton variant="primary" className="w-full py-4 text-lg rounded-xl shadow-lg" onClick={handleSubmit}>Terminer & Valider</CyberButton>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col h-full overflow-y-auto custom-scroll p-4 sm:p-8 bg-white items-center">
                                <div className="w-full max-w-4xl mx-auto text-center">
                                    
                                    {fatalError ? (
                                        <div className="mb-12 bg-rose-950 text-white p-12 rounded-3xl shadow-2xl border-4 border-rose-600 animate-pulse">
                                            <Skull className="w-24 h-24 mx-auto mb-6 text-rose-500" />
                                            <h2 className="text-5xl font-display font-black mb-4 uppercase tracking-widest text-rose-500">Patient Décédé</h2>
                                            <p className="text-xl text-rose-200 font-bold mb-2">DISCORDANCE DÉTECTÉE</p>
                                            <div className="mt-8 text-4xl font-bold text-white bg-rose-600 inline-block px-6 py-2 rounded-xl">NOTE : 0/100</div>
                                        </div>
                                    ) : (
                                        <div className="mb-8 flex justify-center">
                                             <div className="w-48 h-48 relative">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={chartData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                                    <span className={`text-3xl font-bold font-display ${percentage < 50 ? 'text-rose-500' : 'text-teal-500'}`}>{percentage}%</span>
                                                </div>
                                             </div>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-6 text-left w-full mt-8">
                                        {questions.map((q, i) => {
                                            let isCorrect = false;
                                            if (q.type === 'KFP') {
                                                const selectedIds = (answers[i] as string[]) || [];
                                                const correctIds = q.options?.filter(o => o.status === 'CORRECT').map(o => o.id) || [];
                                                isCorrect = correctIds.length > 0 && correctIds.every(id => selectedIds.includes(id)) && selectedIds.every(id => correctIds.includes(id));
                                            } else {
                                                isCorrect = answers[i] === q.c;
                                            }

                                            return (
                                                <div key={i} className={`p-6 rounded-xl border-l-4 shadow-sm bg-slate-50 ${isCorrect && !fatalError ? 'border-l-teal-500' : 'border-l-rose-500'}`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="text-xs font-bold text-slate-400 uppercase">Question {i+1}</span>
                                                        {!fatalError && isCorrect && <span className="flex items-center gap-1 text-teal-600 text-xs font-bold"><CheckCircle2 className="w-4 h-4" /> VALIDE</span>}
                                                        {(!isCorrect || fatalError) && <span className="flex items-center gap-1 text-rose-600 text-xs font-bold"><XCircle className="w-4 h-4" /> ERREUR</span>}
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800 mb-4">{q.t}</p>
                                                    
                                                    {q.type === 'KFP' && q.options && (
                                                        <div className="grid gap-2 mb-4">
                                                            {q.options.map(opt => {
                                                                const selected = ((answers[i] as string[]) || []).includes(opt.id);
                                                                let style = "bg-white border-slate-100 text-slate-400 opacity-50";
                                                                let icon = null;
                                                                if (opt.status === 'CORRECT') { style = "bg-teal-50 border-teal-200 text-teal-800 font-bold"; if (selected) icon = <CheckCircle2 className="w-4 h-4 text-teal-600" />; } 
                                                                else if (opt.status === 'DISCORDANCE') { style = selected ? "bg-rose-900 border-rose-600 text-white font-bold animate-pulse" : "bg-rose-50 border-rose-100 text-rose-800"; if (selected) icon = <Skull className="w-4 h-4 text-white" />; } 
                                                                else if (selected) { style = "bg-slate-100 border-slate-300 text-slate-600"; }
                                                                return <div key={opt.id} className={`p-2 rounded text-xs border flex items-center justify-between ${style}`}><span>{opt.text}</span>{icon}</div>;
                                                            })}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col gap-3">
                                                        <div className="p-3 rounded-lg text-sm bg-slate-100 border border-slate-200 text-slate-700">
                                                            <span className="font-bold mr-2 text-slate-900">Correction:</span>{q.e}
                                                        </div>
                                                        
                                                        {/* AI DEEP DIVE BUTTON */}
                                                        {!aiExplanations[i] ? (
                                                            <button 
                                                                onClick={() => requestAiExplanation(i, q)}
                                                                disabled={explanationLoading === i}
                                                                className="self-start px-3 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                                                            >
                                                                {explanationLoading === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookCheck className="w-3 h-3" />}
                                                                Explication Profonde (OpenEvidence Style)
                                                            </button>
                                                        ) : (
                                                            <div className="mt-2 p-4 bg-gradient-to-r from-indigo-50 to-white border-l-4 border-indigo-500 rounded-r-lg text-xs text-indigo-900 shadow-sm animate-fadeIn">
                                                                <div className="flex items-center gap-2 mb-2 font-bold text-indigo-700">
                                                                    <Sparkles className="w-3 h-3" /> Analyse AI (Validée)
                                                                </div>
                                                                <div className="leading-relaxed whitespace-pre-line">{aiExplanations[i]}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-8 pb-8"><CyberButton className="px-8 py-3 rounded-full" onClick={onClose}>Retour au Tableau de Bord</CyberButton></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {showDocs && (
                    <div className="hidden lg:flex flex-col w-2/5 border-l border-slate-200 bg-slate-50 h-full animate-fadeIn">
                        <div className="flex p-2 gap-2 border-b border-slate-200 bg-white">
                            <button onClick={() => setDocView('TEXT')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${docView === 'TEXT' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><FileText className="w-4 h-4" /> TEXTE (EXPLAIN)</button>
                            <button onClick={() => setDocView('SUMMARY')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${docView === 'SUMMARY' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}><ListChecks className="w-4 h-4" /> SYNTHÈSE (POINTS)</button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-6 font-serif leading-loose text-slate-700 text-sm">
                            {docView === 'TEXT' ? (<div><h3 className="font-sans font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Abstract Original</h3>{article ? article.abstractText : "Aucun texte disponible."}</div>) : (<div><h3 className="font-sans font-bold text-indigo-900 mb-4 border-b border-indigo-200 pb-2">Points Clés (IA)</h3><div className="whitespace-pre-line text-indigo-900 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">{summary}</div></div>)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};