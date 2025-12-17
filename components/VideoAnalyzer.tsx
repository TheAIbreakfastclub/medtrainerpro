import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CyberPanel, CyberButton } from './CyberUI';
import { Upload, Play, Film, Loader2, FileVideo, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const VideoAnalyzer: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAnalysis(null);
            setError(null);
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the Data URL prefix (e.g., "data:video/mp4;base64,")
                const base64Data = result.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleAnalyze = async () => {
        if (!videoFile) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const base64Data = await convertFileToBase64(videoFile);
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Note: Gemini 3 Pro supports video input via inlineData for smaller files.
            // For larger files in production, File API (File Manager) should be used.
            // Here we assume client-side handling for demo clips (< 20MB typically).
            
            const videoPart = {
                inlineData: {
                    mimeType: videoFile.type,
                    data: base64Data
                }
            };

            const prompt = `Analyse cette vidéo médicale ou clinique. 
            Identifie :
            1. Le type de procédure ou d'examen.
            2. Les structures anatomiques visibles.
            3. Les gestes techniques clés ou signes cliniques observés.
            
            Réponds sous forme de liste structurée en Français.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: { parts: [videoPart, { text: prompt }] },
            });

            setAnalysis(response.text || "Aucune analyse générée.");

        } catch (err: any) {
            console.error("Video Analysis Error", err);
            setError("Erreur lors de l'analyse. Vérifiez la taille du fichier (Max ~20MB pour la démo) ou la connexion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CyberPanel 
            className="min-h-[600px] relative overflow-hidden bg-slate-900/5"
            title={
                <div className="flex items-center gap-3 text-indigo-700">
                    <Film className="w-5 h-5" />
                    <span>ANALYSE VIDÉO CLINIQUE</span>
                </div>
            }
            action={
                <span className="text-[10px] font-bold text-white bg-indigo-500 px-3 py-1 rounded-full shadow-md shadow-indigo-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> GEMINI 3 PRO
                </span>
            }
        >
            <div className="p-8 h-full flex flex-col lg:flex-row gap-8">
                
                {/* LEFT: UPLOAD & PLAYER */}
                <div className="lg:w-1/2 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        {!previewUrl ? (
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <p className="mb-2 text-sm text-slate-600 font-bold">Cliquez pour uploader une vidéo</p>
                                    <p className="text-xs text-slate-400">MP4, WEBM (Max 20MB)</p>
                                </div>
                                <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                            </label>
                        ) : (
                            <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-lg">
                                <video src={previewUrl} controls className="w-full h-auto max-h-[400px]" />
                                <button 
                                    onClick={() => { setVideoFile(null); setPreviewUrl(null); setAnalysis(null); }}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-rose-500 transition-colors"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <CyberButton 
                        onClick={handleAnalyze} 
                        disabled={!videoFile || loading}
                        variant="primary"
                        className="w-full py-4 text-lg shadow-xl shadow-indigo-500/20 !bg-gradient-to-r !from-indigo-500 !to-purple-600"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Analyse en cours...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" /> Analyser avec Gemini Pro
                            </>
                        )}
                    </CyberButton>
                </div>

                {/* RIGHT: RESULTS */}
                <div className="lg:w-1/2 flex flex-col">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-grow flex flex-col overflow-hidden h-full min-h-[400px]">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <FileVideo className="w-4 h-4 text-indigo-500" /> Rapport d'Analyse
                            </h3>
                            {analysis && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">TERMINÉ</span>}
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-grow bg-slate-50/30">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                                    <div className="w-16 h-16 mb-6 relative">
                                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                                        <Sparkles className="absolute inset-0 m-auto text-indigo-500 w-6 h-6 animate-pulse" />
                                    </div>
                                    <p className="text-slate-600 font-medium">Vision par ordinateur active...</p>
                                    <p className="text-xs text-slate-400 mt-2">Gemini observe les frames vidéo</p>
                                </div>
                            ) : error ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-rose-500">
                                    <AlertCircle className="w-12 h-12 mb-4" />
                                    <p className="font-bold">{error}</p>
                                </div>
                            ) : analysis ? (
                                <div className="prose prose-sm max-w-none text-slate-700 font-body leading-relaxed">
                                    <div className="whitespace-pre-wrap">{analysis}</div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                                    <Film className="w-12 h-12 mb-4 opacity-20" />
                                    <p>En attente de vidéo...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </CyberPanel>
    );
};