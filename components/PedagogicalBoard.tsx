import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CyberPanel, CyberButton } from './CyberUI';
import { Article } from '../types';
import { Gavel, Microscope, Stethoscope, Award, Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface PedagogicalBoardProps {
    article: Article | null;
    isOpen: boolean;
    onClose: () => void;
}

interface ExpertOpinion {
    role: string;
    name: string;
    verdict: 'VALID' | 'WEAK' | 'CRITICAL';
    score: number; // 0 to 10
    analysis: string;
    keyPoints: string[];
}

export const PedagogicalBoard: React.FC<PedagogicalBoardProps> = ({ article, isOpen, onClose }) => {
    const [opinions, setOpinions] = useState<ExpertOpinion[]>([]);
    const [loading, setLoading] = useState(false);
    const [consensus, setConsensus] = useState<string>("");

    useEffect(() => {
        if (isOpen && article && opinions.length === 0) {
            consultExperts();
        }
    }, [isOpen, article]);

    const consultExperts = async () => {
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Tu es le "Conseil Pédagogique Médical", un panel de 3 experts mondiaux chargés d'évaluer la valeur pédagogique d'un article pour un étudiant en médecine passant les ECN/EDN.
            
            Article: "${article?.title}"
            Abstract: "${article?.abstractText}"

            Génère une critique structurée selon ces 3 personas (JSON) :
            1. "Le Méthodologiste" (Intransigeant, focus validité interne, biais, p-value).
            2. "Le Clinicien Senior" (Pragmatique, focus impact pratique, balance bénéfice/risque).
            3. "Le Major de Promo" (Stratège, focus tombabilité, mots-clés, pièges QCM).

            Pour chaque expert : un score /10, un verdict (VALID, WEAK, ou CRITICAL), une analyse courte et incisive, et 2 points clés.
            Ajoute une phrase de "Consensus" final.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            experts: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        role: { type: Type.STRING },
                                        name: { type: Type.STRING },
                                        verdict: { type: Type.STRING, enum: ["VALID", "WEAK", "CRITICAL"] },
                                        score: { type: Type.NUMBER },
                                        analysis: { type: Type.STRING },
                                        keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    }
                                }
                            },
                            consensus: { type: Type.STRING }
                        }
                    }
                }
            });

            const data = JSON.parse(response.text || "{}");
            if (data.experts) {
                setOpinions(data.experts);
                setConsensus(data.consensus);
            }

        } catch (error) {
            console.error("Board Error", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-6xl h-[90vh] flex flex-col relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white hover:text-rose-400 font-bold flex items-center gap-2 transition-colors"
                >
                    FERMER LE CONSEIL <XCircle className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="glass-panel p-6 rounded-t-3xl border-b-0 bg-slate-900/90 text-white flex justify-between items-center shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-500/20 rounded-xl border border-teal-500/50">
                            <Gavel className="w-8 h-8 text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold tracking-wide text-white">CONSEIL PÉDAGOGIQUE</h2>
                            <p className="text-slate-400 text-sm">Audit Expert Multi-Disciplinaire • Gemini 2.5</p>
                        </div>
                    </div>
                    {consensus && (
                        <div className="hidden md:block bg-white/10 px-6 py-3 rounded-xl border border-white/10 max-w-md">
                            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Consensus des Sages</span>
                            <p className="text-sm font-medium italic text-slate-200">"{consensus}"</p>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-grow bg-slate-100 p-6 md:p-8 overflow-y-auto rounded-b-3xl grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    
                    {loading ? (
                        <div className="col-span-3 flex flex-col items-center justify-center h-full min-h-[400px]">
                            <Loader2 className="w-16 h-16 text-teal-600 animate-spin mb-6" />
                            <h3 className="text-xl font-bold text-slate-700 animate-pulse">Délibération du Jury en cours...</h3>
                            <p className="text-slate-500 mt-2">Analyse critique des biais et de la pertinence clinique</p>
                        </div>
                    ) : (
                        opinions.map((expert, idx) => {
                            const isHigh = expert.score >= 8;
                            const isLow = expert.score < 5;
                            const statusColor = expert.verdict === 'VALID' ? 'text-teal-600' : expert.verdict === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600';
                            const bgGradient = expert.verdict === 'VALID' ? 'from-teal-50 to-white' : expert.verdict === 'CRITICAL' ? 'from-rose-50 to-white' : 'from-amber-50 to-white';
                            
                            const Icon = idx === 0 ? Microscope : idx === 1 ? Stethoscope : Award;

                            return (
                                <div key={idx} className={`bg-gradient-to-b ${bgGradient} rounded-2xl p-6 border border-slate-200 shadow-xl flex flex-col hover:scale-[1.02] transition-transform duration-300`}>
                                    
                                    {/* Expert Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl bg-white shadow-sm border border-slate-100`}>
                                                <Icon className={`w-6 h-6 ${statusColor}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg leading-tight">{expert.name}</h3>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{expert.role}</span>
                                            </div>
                                        </div>
                                        <div className={`text-2xl font-display font-bold ${isHigh ? 'text-teal-500' : isLow ? 'text-rose-500' : 'text-amber-500'}`}>
                                            {expert.score}<span className="text-sm text-slate-300">/10</span>
                                        </div>
                                    </div>

                                    {/* Verdict Badge */}
                                    <div className="mb-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                            expert.verdict === 'VALID' ? 'bg-teal-100 border-teal-200 text-teal-700' :
                                            expert.verdict === 'CRITICAL' ? 'bg-rose-100 border-rose-200 text-rose-700' :
                                            'bg-amber-100 border-amber-200 text-amber-700'
                                        }`}>
                                            VERDICT : {expert.verdict}
                                        </span>
                                    </div>

                                    {/* Analysis */}
                                    <div className="mb-6 flex-grow">
                                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                            "{expert.analysis}"
                                        </p>
                                    </div>

                                    {/* Key Points */}
                                    <div className="bg-white/80 rounded-xl p-4 border border-slate-100 shadow-inner">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">POINTS CLÉS</h4>
                                        <ul className="space-y-2">
                                            {expert.keyPoints.map((point, k) => (
                                                <li key={k} className="flex items-start gap-2 text-xs text-slate-700">
                                                    {expert.verdict === 'VALID' ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />}
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};