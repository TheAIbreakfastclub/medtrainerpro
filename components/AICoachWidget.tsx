import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, RefreshCw, Lightbulb, GraduationCap, Target } from 'lucide-react';

interface AICoachWidgetProps {
    yearId: string;
    userRank: string;
}

export const AICoachWidget: React.FC<AICoachWidgetProps> = ({ yearId, userRank }) => {
    const [tip, setTip] = useState<{ title: string; content: string; type: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const generateTip = async () => {
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Génère un "Conseil du Jour" court, percutant et ultra-spécifique pour un étudiant en médecine niveau ${yearId}.
            Le conseil doit être pédagogique et utile immédiatement.
            
            Types de conseils possibles (choisis au hasard) :
            1. Un moyen mnémotechnique difficile.
            2. Une "Discordance" (Piège classique) aux EDN.
            3. Un chiffre clé de santé publique ou une constante bio.
            4. Une astuce de méthodologie de travail.
            
            Format JSON: { "title": "Titre court", "content": "Le conseil en 2 phrases max", "type": "MNEMO" | "TRAP" | "DATA" | "METHOD" }`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', // Correction: Utilisation du modèle standard fiable
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            const data = JSON.parse(response.text || '{}');
            if (data.title) setTip(data);

        } catch (e) {
            console.error("Coach Error", e);
            setTip({ title: "Astuce Méthodo", content: "La régularité bat l'intensité. Faites des QCMs tous les jours.", type: "METHOD" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateTip();
    }, [yearId]);

    if (!tip && !loading) return null;

    const getIcon = () => {
        switch(tip?.type) {
            case 'MNEMO': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
            case 'TRAP': return <Target className="w-5 h-5 text-rose-500" />;
            case 'DATA': return <GraduationCap className="w-5 h-5 text-blue-500" />;
            default: return <Sparkles className="w-5 h-5 text-teal-500" />;
        }
    };

    return (
        <div className="mb-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-indigo-500/10 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                
                {/* AI Avatar / Icon */}
                <div className="shrink-0 relative">
                    <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-white shadow-md flex items-center justify-center">
                        {loading ? <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" /> : getIcon()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white">
                        AI
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow text-center md:text-left">
                    {loading ? (
                        <div className="space-y-2 animate-pulse">
                            <div className="h-4 w-32 bg-slate-200 rounded mx-auto md:mx-0"></div>
                            <div className="h-3 w-64 bg-slate-100 rounded mx-auto md:mx-0"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <h3 className="font-bold text-slate-800">{tip?.title}</h3>
                                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{tip?.type}</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {tip?.content}
                            </p>
                        </>
                    )}
                </div>

                {/* Action */}
                <button 
                    onClick={generateTip}
                    disabled={loading}
                    className="shrink-0 p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-50 rounded-full transition-colors"
                    title="Nouveau conseil"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
    );
};