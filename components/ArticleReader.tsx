import React, { useMemo, useState, useEffect, useRef } from 'react';
import { CyberPanel } from './CyberUI';
import { Article } from '../types';
import { LEXICON } from '../constants';
import { FileText, BookOpen, Quote, BookmarkCheck, Sparkles, Loader2, AlertCircle, Volume2, StopCircle, Star, ShieldCheck, Globe, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { GoogleGenAI, Type, Modality } from "@google/genai";

interface ArticleReaderProps {
    article: Article | null;
    loading: boolean;
    highlightsEnabled: boolean;
    viewMode: 'EXPLAIN' | 'MAIN_POINTS' | 'R2C_ADAPTER';
}

function decodeAudio(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ article, loading, highlightsEnabled, viewMode }) => {
    // --- EXISTING STATE ---
    const [aiSummary, setAiSummary] = useState<{
        objective: string;
        methods: string;
        primaryEndpoint: string;
        resultsRankA: string[];
        resultsRankB: string[];
        conclusion: string;
    } | null>(null);
    
    // --- NEW R2C ADAPTER STATE ---
    const [r2cData, setR2cData] = useState<{
        statut: string;
        source_origine: string;
        type_exercice: string;
        sujet_principal: string;
        scenario_francise: string;
        questions_generees: {
            question: string;
            reponse_validee_FR: string;
            discordance_originale: string;
        }[];
    } | null>(null);

    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(false);
    const [isReading, setIsReading] = useState(false);
    const [ttsLoading, setTtsLoading] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const processingRef = useRef<string | null>(null);

    useEffect(() => {
        setAiSummary(null);
        setR2cData(null);
        setAiError(false);
        processingRef.current = null;
        stopAudio();
    }, [article?.id]);

    useEffect(() => {
        return () => stopAudio();
    }, []);

    const stopAudio = () => {
        if (sourceRef.current) { sourceRef.current.stop(); sourceRef.current = null; }
        if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
        setIsReading(false);
        setTtsLoading(false);
    };

    const handleReadAloud = async () => {
        if (isReading) { stopAudio(); return; }
        if (!article) return;
        setTtsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let textToRead = "";
            
            if (viewMode === 'R2C_ADAPTER' && r2cData) {
                textToRead = `Adaptation R2C. Scénario : ${r2cData.scenario_francise}. Attention aux discordances : ${r2cData.questions_generees.map(q => q.discordance_originale).join('. ')}`;
            } else if (viewMode === 'MAIN_POINTS' && aiSummary) {
                textToRead = `Synthèse R2C. Objectif : ${aiSummary.objective}. Points clés Rang A : ${aiSummary.resultsRankA.join('. ')}. Conclusion : ${aiSummary.conclusion}`;
            } else {
                textToRead = `Lecture de l'abstract : ${article.title}. ${article.abstractText}`;
            }
            
            if (textToRead.length > 4000) textToRead = textToRead.substring(0, 4000);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text: textToRead }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("No audio data received");
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass({ sampleRate: 24000 });
            audioContextRef.current = ctx;
            const audioData = decodeAudio(base64Audio);
            const audioBuffer = await ctx.decodeAudioData(audioData.buffer);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => { setIsReading(false); setTtsLoading(false); };
            sourceRef.current = source;
            source.start();
            setIsReading(true);
        } catch (error) { console.error("TTS Error", error); } finally { setTtsLoading(false); }
    };

    // --- MAIN GENERATION EFFECT ---
    useEffect(() => {
        if (!article || aiLoading || aiError) return;
        
        // Avoid re-fetching if data exists for current mode
        if (viewMode === 'MAIN_POINTS' && aiSummary) return;
        if (viewMode === 'R2C_ADAPTER' && r2cData) return;
        if (viewMode === 'EXPLAIN') return; 

        // Only auto-fetch if we haven't processed this article for this mode yet
        // A simpler check: 
        if ((viewMode === 'MAIN_POINTS' && !aiSummary) || (viewMode === 'R2C_ADAPTER' && !r2cData)) {
             generateContent();
        }

    }, [viewMode, article]);

    const generateContent = async () => {
        if (!article) return;
        setAiLoading(true);
        setAiError(false);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            if (viewMode === 'R2C_ADAPTER') {
                // --- R2C ADAPTER SYSTEM PROMPT ---
                const systemPrompt = `RÔLE DU SYSTÈME: Tu es un Expert en Adaptation Pédagogique Médicale. Ta tâche est de transformer des articles scientifiques internationaux (Anglais) en exercices conformes aux standards du concours français (EDN/R2C).
                
                PROCÉDURE DE TRAITEMENT:
                1. Analyse de Pertinence: Si hors sujet, rejette.
                2. Extraction du Scénario: Traduis les faits cliniques en Français standard.
                3. Adaptation aux Standards Français (CRITIQUE): IGNORE la thérapeutique de l'article si elle diffère des recos françaises (HAS/CNP). Utilise les recos françaises pour la correction.
                4. Génération: Crée un JSON strict.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `INPUT SOURCE: ${article.title}\n${article.abstractText}`,
                    config: {
                        systemInstruction: systemPrompt,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                statut: { type: Type.STRING },
                                source_origine: { type: Type.STRING },
                                type_exercice: { type: Type.STRING },
                                sujet_principal: { type: Type.STRING },
                                scenario_francise: { type: Type.STRING },
                                questions_generees: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            question: { type: Type.STRING },
                                            reponse_validee_FR: { type: Type.STRING },
                                            discordance_originale: { type: Type.STRING }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                
                if (response.text) {
                    setR2cData(JSON.parse(response.text));
                }

            } else if (viewMode === 'MAIN_POINTS') {
                // --- EXISTING SUMMARY PROMPT ---
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Analyse cet abstract. Titre: ${article.title}. Abstract: ${article.abstractText}. 
                    RÈGLE : N'invente AUCUN résultat. Extrais uniquement les faits.`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                objective: { type: Type.STRING },
                                methods: { type: Type.STRING },
                                primaryEndpoint: { type: Type.STRING },
                                resultsRankA: { type: Type.ARRAY, items: { type: Type.STRING } },
                                resultsRankB: { type: Type.ARRAY, items: { type: Type.STRING } },
                                conclusion: { type: Type.STRING }
                            }
                        }
                    }
                });
                if (response.text) {
                    setAiSummary(JSON.parse(response.text));
                }
            }
        } catch (error) {
            console.error("Gen Error", error);
            setAiError(true);
        } finally {
            setAiLoading(false);
        }
    };

    const handleRetry = () => { setAiError(false); generateContent(); };

    // --- RENDER HELPERS ---
    
    // Highlight logic (unchanged)
    const processedContent = useMemo(() => {
        if (!article) return "";
        let processed = article.abstractText;
        if (highlightsEnabled) {
            const sortedLexicon = [...LEXICON].sort((a, b) => b.term.length - a.term.length);
            sortedLexicon.forEach((item) => {
                const pattern = item.root ? `\\w*${item.term}\\w*` : `\\b${item.term}\\b`;
                const regex = new RegExp(`(?![^<]*>)(${pattern})`, 'gi');
                const rankClass = item.rank === 'A' ? 'rank-a' : 'rank-b';
                processed = processed.replace(regex, (match) => {
                    if (match.includes('<span')) return match;
                    return `<span class="lca-term type-${item.type} ${rankClass} group relative" data-term="${match}">${match}<span class="absolute -top-3 -right-2 text-[8px] font-bold text-white px-1 rounded-full ${item.rank === 'A' ? 'bg-slate-900' : 'bg-slate-400'} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">${item.rank}</span></span>`;
                });
            });
        }
        return processed;
    }, [article, highlightsEnabled]);

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('lca-term') || target.parentElement?.classList.contains('lca-term')) {
            const termEl = target.classList.contains('lca-term') ? target : target.parentElement;
            const term = termEl?.getAttribute('data-term');
            if (term) window.open(`https://www.merriam-webster.com/dictionary/${encodeURIComponent(term)}`, '_blank');
        }
    };

    const TTSButton = () => (
        <button 
            onClick={handleReadAloud}
            disabled={ttsLoading}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${isReading ? 'bg-rose-100 text-rose-600 border border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200'}`}
        >
            {ttsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : isReading ? <StopCircle className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}{isReading ? 'Stop' : 'Lecture'}
        </button>
    );

    // --- STATES ---

    if (loading) {
        return (
            <CyberPanel className="h-[600px] flex items-center justify-center p-12 relative overflow-hidden bg-white/90">
                 <div className="text-center relative z-10">
                    <div className="w-16 h-16 mx-auto mb-6 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
                    <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">Analyse en cours...</h3>
                    <p className="text-teal-600 font-medium animate-pulse">Extraction des données biomédicales</p>
                 </div>
            </CyberPanel>
        );
    }

    if (!article) {
        return (
            <div className="glass-panel h-[600px] rounded-2xl relative overflow-hidden group flex items-center justify-center text-center p-12">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div className="relative z-10 max-w-lg">
                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 mx-auto border-4 border-white shadow-lg">
                         <BookOpen className="w-8 h-8 text-teal-500" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-slate-800 mb-4">Prêt pour la Simulation</h2>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">Sélectionnez une spécialité pour charger un essai clinique randomisé. L'IA vous assistera dans la détection des biais et l'analyse PICO.</p>
                    <div className="flex justify-center items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest"><span className="flex items-center gap-2"><span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>System Ready</span></div>
                </div>
            </div>
        );
    }

    if (aiLoading) {
        return (
           <CyberPanel className="h-[800px] flex items-center justify-center p-12 relative overflow-hidden bg-indigo-50/50">
                <div className="text-center relative z-10">
                   <div className="w-12 h-12 mx-auto mb-4 text-indigo-500 animate-spin"><Loader2 className="w-12 h-12" /></div>
                   <h3 className="text-xl font-display font-bold text-indigo-900 mb-2">
                       {viewMode === 'R2C_ADAPTER' ? 'Adaptation aux Standards Français...' : 'Génération de la Fiche R2C...'}
                   </h3>
                   <p className="text-indigo-600 font-medium flex items-center justify-center gap-2">
                       <Sparkles className="w-4 h-4" /> 
                       {viewMode === 'R2C_ADAPTER' ? 'Vérification HAS / Collèges' : 'Analyse Gemini 2.5'}
                   </p>
                </div>
           </CyberPanel>
        );
   }

   if (aiError) {
       return (
           <CyberPanel className="h-[800px] flex items-center justify-center p-12 relative bg-rose-50/50">
                <div className="text-center relative z-10">
                   <AlertCircle className="w-12 h-12 mx-auto mb-4 text-rose-500" />
                   <h3 className="text-xl font-bold text-rose-900 mb-2">Erreur de Génération</h3>
                   <p className="text-rose-600 mb-4">L'IA n'a pas pu traiter cet article.</p>
                   <button onClick={handleRetry} className="px-4 py-2 bg-rose-500 text-white rounded-lg font-bold shadow hover:bg-rose-600 transition">Réessayer</button>
                </div>
           </CyberPanel>
       );
   }

    // --- VIEW 1: R2C ADAPTER (NEW) ---
    if (viewMode === 'R2C_ADAPTER' && r2cData) {
        return (
            <CyberPanel 
                className="h-[800px] relative overflow-hidden bg-slate-50/50" 
                title={<div className="flex items-center gap-3 text-purple-700"><Globe className="w-5 h-5" /><span>ADAPTATION FRANCE (R2C/EDN)</span></div>} 
                action={<div className="flex items-center gap-2"><TTSButton /><span className="text-[10px] font-bold text-white bg-purple-500 px-3 py-1 rounded-full shadow-md shadow-purple-200 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> ADAPTÉ HAS</span></div>}
            >
                <div className="h-full overflow-y-auto p-8 relative z-10 scroll-smooth space-y-8">
                    
                    {/* Header */}
                    <div className="border-b border-purple-200 pb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-display font-bold text-slate-800">{r2cData.sujet_principal}</h2>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase">{r2cData.type_exercice}</span>
                        </div>
                        <p className="text-sm text-slate-500">Source: {r2cData.source_origine} (Adapté)</p>
                    </div>

                    {/* Scenario */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-l-purple-500">
                        <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Scénario Clinique (Francisé)
                        </h3>
                        <p className="text-slate-700 font-serif text-lg leading-relaxed">
                            {r2cData.scenario_francise}
                        </p>
                    </div>

                    {/* Comparison Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        {r2cData.questions_generees.map((q, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">{i+1}</span>
                                    {q.question}
                                </div>
                                <div className="p-0 grid grid-cols-1 md:grid-cols-2">
                                    {/* French Standard */}
                                    <div className="p-4 bg-teal-50/50 border-r border-slate-100">
                                        <div className="flex items-center gap-2 mb-2 text-teal-700 font-bold text-xs uppercase">
                                            <ShieldCheck className="w-3 h-3" /> Réponse Validée (FR)
                                        </div>
                                        <p className="text-sm text-slate-800 font-medium">{q.reponse_validee_FR}</p>
                                    </div>
                                    
                                    {/* International Difference */}
                                    <div className="p-4 bg-amber-50/50">
                                        <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-xs uppercase">
                                            <AlertTriangle className="w-3 h-3" /> Note de Discordance
                                        </div>
                                        <p className="text-sm text-slate-600 italic text-xs">{q.discordance_originale}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-[10px] text-slate-400">
                            Cette adaptation est générée par IA pour aligner les données internationales sur les recommandations françaises en vigueur. 
                            Vérifiez toujours avec le Collège des Enseignants.
                        </p>
                    </div>
                </div>
            </CyberPanel>
        );
    }

    // --- VIEW 2: MAIN POINTS (SUMMARY) ---
    if (viewMode === 'MAIN_POINTS' && aiSummary) {
        return (
            <CyberPanel className="h-[800px] relative overflow-hidden bg-indigo-50/50" title={<div className="flex items-center gap-3 text-indigo-700"><BookmarkCheck className="w-5 h-5" /><span>FICHE R2C (Rangs A & B)</span></div>} action={<div className="flex items-center gap-2"><TTSButton /><span className="text-[10px] font-bold text-white bg-indigo-500 px-3 py-1 rounded-full shadow-md shadow-indigo-200 flex items-center gap-1"><Sparkles className="w-3 h-3" /> GEN AI</span></div>}>
                <div className="h-full overflow-y-auto p-8 relative z-10 scroll-smooth space-y-8">
                    <div className="border-b border-indigo-200 pb-6">
                        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">{article.title}</h2>
                        <div className="flex gap-2 text-xs font-mono text-slate-500"><span className="bg-white px-2 py-1 rounded border border-indigo-100">{article.pubYear}</span><span className="bg-white px-2 py-1 rounded border border-indigo-100">{article.journalInfo?.journal?.title || 'JOURNAL'}</span></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                        <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Objectif & Méthode (PICO)</h3>
                        <p className="text-slate-700 font-serif leading-relaxed italic border-l-4 border-indigo-200 pl-4 mb-4">"{aiSummary.objective}"</p>
                        <p className="text-slate-600 text-sm">{aiSummary.methods}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-t-slate-800 border-x border-b border-slate-200 relative overflow-hidden">
                             <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">RANG A</div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-slate-800" /> Indispensable</h3>
                            <div className="bg-teal-50 p-3 rounded-lg border border-teal-100 mb-4"><span className="text-[10px] font-bold text-teal-700 block mb-1 uppercase">Critère Principal</span><p className="text-sm text-teal-900 font-bold">{aiSummary.primaryEndpoint}</p></div>
                            <ul className="space-y-3">{aiSummary.resultsRankA.map((res, idx) => (<li key={idx} className="flex gap-2 items-start"><span className="text-slate-800 font-bold mt-1 text-xs">•</span><p className="text-slate-700 text-sm font-medium leading-relaxed">{res}</p></li>))}</ul>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200 relative">
                            <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-bl-lg">RANG B</div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-slate-400" /> Approfondissement</h3>
                            <ul className="space-y-3">{aiSummary.resultsRankB.length > 0 ? aiSummary.resultsRankB.map((res, idx) => (<li key={idx} className="flex gap-2 items-start"><span className="text-slate-400 font-bold mt-1 text-xs">•</span><p className="text-slate-600 text-sm leading-relaxed">{res}</p></li>)) : <p className="text-xs text-slate-400 italic">Aucune donnée spécifique de rang B identifiée.</p>}</ul>
                        </div>
                    </div>
                     <div className="bg-slate-800 p-6 rounded-2xl shadow-lg text-white">
                        <h3 className="text-sm font-bold text-teal-300 uppercase tracking-wider mb-3 flex items-center gap-2"><Quote className="w-4 h-4" /> Conclusion Pratique</h3>
                        <p className="text-slate-200 font-serif text-lg leading-relaxed">{aiSummary.conclusion}</p>
                    </div>
                    <div className="text-center pt-8 pb-4"><p className="text-[10px] text-slate-400 uppercase tracking-widest">Généré par Gemini 2.5 • Conforme R2C</p></div>
                </div>
            </CyberPanel>
        );
    }

    // --- VIEW 3: STANDARD EXPLAIN (DEFAULT) ---
    return (
        <CyberPanel className="h-[800px] relative overflow-hidden bg-white/90" title={<div className="flex items-center gap-3 text-teal-700"><FileText className="w-5 h-5" /><span>TEXTE SOURCE</span></div>} action={<div className="flex items-center gap-2"><TTSButton /><span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">ID: {article.id}</span></div>}>
            <div className="h-full overflow-y-auto p-8 relative z-10 scroll-smooth">
                <style>{`.lca-term.rank-a { border-bottom: 2px solid #0f172a !important; font-weight: 700; background-color: rgba(15, 23, 42, 0.05); } .lca-term.rank-b { border-bottom: 1px dotted #94a3b8 !important; }`}</style>
                <div className={`transition-all duration-500 ${!highlightsEnabled ? 'hide-highlights' : ''}`} onClick={handleContainerClick}>
                    <div className="mb-8 pb-6 border-b border-slate-100">
                        <div className="flex flex-wrap gap-2 mb-4"><span className="px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-wider">{article.journalInfo?.journal?.title || 'JOURNAL LOG'}</span><span className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-xs font-mono">{article.pubYear}</span></div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 leading-tight mb-4">{article.title}</h1>
                        <p className="text-sm font-sans text-slate-500">AUTHORS: <span className="text-slate-700 font-semibold">{article.authorString}</span></p>
                    </div>
                    <div className="font-serif text-slate-700 text-lg leading-8 tracking-wide text-justify selection:bg-teal-100 selection:text-teal-900" dangerouslySetInnerHTML={{ __html: processedContent }} />
                </div>
            </div>
        </CyberPanel>
    );
};