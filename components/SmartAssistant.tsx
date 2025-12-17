import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { MessageSquare, Mic, Send, Minimize2, Sparkles, Radio, Zap, Brain, ShieldCheck, AlertTriangle, BookOpen } from 'lucide-react';
import { Article } from '../types';

interface SmartAssistantProps {
    article?: Article | null;
    customSystemInstruction?: string;
    triggerOpen?: boolean;
    yearId?: string; // Academic Context
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isEvidenceBased?: boolean;
}

// --- AUDIO UTILS ---
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = Math.max(-1, Math.min(1, data[i])) * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

// --- ADAPTIVE "OPEN EVIDENCE" CONFIG ---
// Defines strict personas to prevent hallucination and ensure level-appropriate answers.
const LEVEL_CONFIGS: Record<string, { role: string; guardrails: string; suggestions: string[] }> = {
    'PACES': {
        role: "Tuteur Bienveillant (PASS/LAS).",
        guardrails: "Simplifie au maximum. Utilise des analogies (ex: le cœur est une pompe). Ne cite pas d'études complexes. Focalise sur les mots-clés du cours.",
        suggestions: ["Moyen mnémotechnique ?", "Analogie simple ?", "Quiz de base"]
    },
    'DFGSM2': {
        role: "Moniteur de Sémiologie (P2/UEI).",
        guardrails: "CONTEXTE DFGSM2 STRICT. Tes priorités sont : 1. SÉMIOLOGIE (Reconnaissance des signes). 2. PHYSIOPATHOLOGIE (Mécanismes). 3. EXPLORATIONS (Normes). INTERDICTION DE TRAITER LA THÉRAPEUTIQUE COMPLEXE (réservée DFASM). Fais toujours le lien Anatomie-Clinique.",
        suggestions: ["Trépied sémiologique ?", "Mécanisme physio ?", "Valeurs normales ?"]
    },
    'DFGSM3': {
        role: "Externe Junior (D1) - Transition Clinique.",
        guardrails: "CONTEXTE DFGSM3 STRICT. Tu es le maillon entre la théorie (P2) et la clinique (D2). Tes piliers : 1. PHARMACOLOGIE (Mécanismes, CI, Iatrogénie). 2. PROCESSUS (Infectieux, Tumoral, Inflammatoire). 3. SYNTHÈSE (Syndromes). INTERDICTION : Traitements de 3ème ligne ou détails de spécialiste. TÂCHE : Explique toujours le mécanisme physiopathologique sous-jacent.",
        suggestions: ["Quiz Pharmaco Express ?", "Mécanisme d'action ?", "Syndrome associé ?"]
    },
    'DFASM1': {
        role: "Assistant R2C (D2).",
        guardrails: "STRICT R2C. Sépare Rang A (Indispensable) et Rang B (Avancé). Cite les Collèges des Enseignants.",
        suggestions: ["C'est Rang A ou B ?", "Diagnostics différentiels ?", "Examens complémentaires"]
    },
    'DFASM3': {
        role: "Professeur Expert (EDN/ECOS).",
        guardrails: "Niveau Expert. Cite les recos HAS/ESC. Cherche la 'Discordance' (le piège mortel). Aucune tolérance pour l'imprécision. Si tu ne sais pas, dis 'Consultez le référentiel'.",
        suggestions: ["Piège à éviter ?", "Reco HAS récente ?", "Contre-indication formelle"]
    },
    'DEFAULT': {
        role: "Expert Médical Pédagogique.",
        guardrails: "Reste factuel. Base-toi sur la science établie. Pas d'invention.",
        suggestions: ["Résumé clé", "Explique ce concept", "Quiz express"]
    }
};

export const SmartAssistant: React.FC<SmartAssistantProps> = ({ article, customSystemInstruction, triggerOpen, yearId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'CHAT' | 'VOICE'>('CHAT');
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Voice State
    const [isLiveConnected, setIsLiveConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false); 
    
    // Refs
    const chatEndRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sessionRef = useRef<any>(null);

    // Context Loading
    const levelConfig = yearId && LEVEL_CONFIGS[yearId] ? LEVEL_CONFIGS[yearId] : LEVEL_CONFIGS['DEFAULT'];

    useEffect(() => {
        if (triggerOpen) setIsOpen(true);
    }, [triggerOpen]);

    useEffect(() => {
        if (customSystemInstruction) setMode('VOICE');
    }, [customSystemInstruction]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
        return () => disconnectLiveSession();
    }, []);

    // --- CHAT LOGIC ---
    const handleSendMessage = async (textOverride?: string) => {
        const textToSend = textOverride || inputValue;
        if (!textToSend.trim()) return;
        
        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        setInputValue('');
        setIsTyping(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // SECURITY LAYER: OPEN EVIDENCE STYLE
            const securityProtocol = `
            PROTOCOLE DE VÉRACITÉ (OPEN EVIDENCE STYLE):
            1. Tu es ${levelConfig.role}.
            2. ${levelConfig.guardrails}
            3. INTERDICTION D'INVENTER : Si tu ne connais pas la réponse médicale exacte, dis "Je ne trouve pas cette info dans les référentiels standards".
            4. SOURCING : Pour les niveaux DFASM, cite si possible la source (ex: "Selon la HAS 2023...").
            5. FORMAT : Sois concis, utilise des listes à puces.
            `;

            let systemInstruction = customSystemInstruction || securityProtocol;
            
            if (article && !customSystemInstruction) {
                systemInstruction += `\n\nSOURCE DE VÉRITÉ (Article): Titre: ${article.title}. Abstract: ${article.abstractText}. Base tes réponses UNIQUEMENT sur cet abstract si la question porte dessus.`;
            }

            const chat = ai.chats.create({
                model: 'gemini-2.5-flash', // Fast & Smart
                config: { systemInstruction },
                history: messages.map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }))
            });

            const result = await chat.sendMessage({ message: textToSend });
            const responseText = result.text;

            setMessages(prev => [...prev, { role: 'model', text: responseText, isEvidenceBased: true }]);
        } catch (error) {
            console.error("Chat Error", error);
            setMessages(prev => [...prev, { role: 'model', text: "Désolé, connexion au serveur de connaissances interrompue." }]);
        } finally {
            setIsTyping(false);
        }
    };

    // --- LIVE AUDIO LOGIC ---
    const connectLiveSession = async () => {
        try {
            setIsLiveConnected(true);
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const inputCtx = new AudioContextClass({ sampleRate: 16000 });
            const outputCtx = new AudioContextClass({ sampleRate: 24000 });
            inputAudioContextRef.current = inputCtx;
            audioContextRef.current = outputCtx;
            nextStartTimeRef.current = 0;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let systemInstruction = customSystemInstruction || `${levelConfig.role}. ${levelConfig.guardrails}. Tu interagis à l'oral. Sois bref et percutant.`;
            if (article && !customSystemInstruction) systemInstruction += ` Interroge l'étudiant sur: ${article.title}.`;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: systemInstruction,
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                },
                callbacks: {
                    onopen: () => {
                        const source = inputCtx.createMediaStreamSource(stream);
                        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(processor);
                        processor.connect(inputCtx.destination);
                        processorRef.current = processor;
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio) {
                            setIsSpeaking(true);
                            setTimeout(() => setIsSpeaking(false), 500);
                            const ctx = audioContextRef.current;
                            if (ctx) {
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                                const source = ctx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(ctx.destination);
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                            }
                        }
                    },
                    onclose: () => disconnectLiveSession(),
                    onerror: () => disconnectLiveSession()
                }
            });
            sessionRef.current = sessionPromise;
        } catch (error) {
            console.error("Live Session Error", error);
            disconnectLiveSession();
        }
    };

    const disconnectLiveSession = () => {
        setIsLiveConnected(false);
        setIsSpeaking(false);
        if (processorRef.current) { processorRef.current.disconnect(); processorRef.current.onaudioprocess = null; processorRef.current = null; }
        if (inputAudioContextRef.current) { inputAudioContextRef.current.close(); inputAudioContextRef.current = null; }
        if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(track => track.stop()); mediaStreamRef.current = null; }
        if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-teal-600 hover:bg-teal-500 text-white rounded-full p-4 shadow-xl shadow-teal-600/30 transition-all hover:scale-110 active:scale-95 group"
            >
                <Sparkles className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] flex flex-col glass-panel bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-teal-200 overflow-hidden animate-fadeIn">
            {/* HEADER */}
            <div className={`p-4 flex justify-between items-center text-white shadow-md transition-colors ${customSystemInstruction ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-teal-600 to-cyan-600'}`}>
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-white/20 rounded">
                        <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <span className="font-display font-bold tracking-wide text-sm block leading-none">
                            {customSystemInstruction ? 'SIMULATION' : `MED-TRAINER AI`}
                        </span>
                        <span className="text-[10px] opacity-80 font-mono">
                            {yearId ? yearId : 'ADAPTIVE MODE'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setMode('CHAT')} className={`p-1.5 rounded-lg transition-colors ${mode === 'CHAT' ? 'bg-white/20 text-white' : 'text-teal-100 hover:bg-white/10'}`}>
                        <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setMode('VOICE')} className={`p-1.5 rounded-lg transition-colors ${mode === 'VOICE' ? 'bg-white/20 text-white' : 'text-teal-100 hover:bg-white/10'}`}>
                        <Mic className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-teal-100 ml-2">
                        <Minimize2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-grow flex flex-col overflow-hidden bg-slate-50 relative">
                
                {mode === 'CHAT' ? (
                    <>
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scroll">
                            {messages.length === 0 && (
                                <div className="text-center text-slate-400 mt-8 px-4">
                                    <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100">
                                        <ShieldCheck className="w-8 h-8 text-teal-500" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">
                                        Assistant Pédagogique Sécurisé
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-[250px] mx-auto leading-relaxed">
                                        Je réponds uniquement sur la base des consensus médicaux (HAS, ESC). Pas d'invention.
                                    </p>
                                    
                                    {/* ADAPTIVE SUGGESTIONS CHIPS */}
                                    {!customSystemInstruction && (
                                        <div className="flex flex-wrap gap-2 justify-center mt-6">
                                            {levelConfig.suggestions.map((suggestion, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSendMessage(suggestion)}
                                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all shadow-sm flex items-center gap-1"
                                                >
                                                    <Zap className="w-3 h-3 text-amber-400" /> {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm relative ${
                                        msg.role === 'user' 
                                            ? 'bg-teal-600 text-white rounded-br-none' 
                                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                    }`}>
                                        {msg.text}
                                        {msg.role === 'model' && msg.isEvidenceBased && (
                                            <div className="absolute -bottom-2 -right-2 bg-teal-50 border border-teal-100 text-teal-700 text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                                <ShieldCheck className="w-2.5 h-2.5" /> Vérifié
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-3 bg-white border-t border-slate-200">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                className="flex gap-2 items-center"
                            >
                                <input 
                                    type="text" 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={customSystemInstruction ? "Répondez au patient..." : "Posez votre question..."}
                                    className="flex-grow bg-slate-100 border-transparent focus:border-teal-400 focus:ring-0 rounded-xl px-4 py-2.5 text-sm transition-all"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!inputValue.trim() || isTyping}
                                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col h-full items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-800 text-white relative overflow-hidden">
                        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${customSystemInstruction ? 'from-purple-900/40' : 'from-teal-900/40'} via-transparent to-transparent opacity-50`}></div>
                        
                        {isLiveConnected ? (
                            <>
                                <div className="relative mb-8">
                                    <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isSpeaking ? 'border-teal-400 bg-teal-500/20 scale-110 shadow-[0_0_30px_rgba(45,212,191,0.5)]' : 'border-slate-600 bg-slate-800'}`}>
                                        <Radio className={`w-12 h-12 ${isSpeaking ? 'text-teal-400' : 'text-slate-400'}`} />
                                    </div>
                                    <div className={`absolute inset-0 rounded-full border-2 border-teal-500/30 ${isSpeaking ? 'animate-ping' : 'hidden'}`}></div>
                                </div>
                                <h3 className="text-2xl font-display font-bold mb-2">Session Active</h3>
                                <p className="text-teal-200/60 text-sm mb-8 max-w-[200px]">
                                    {customSystemInstruction ? "Le patient vous écoute..." : "Je vous écoute."}
                                </p>
                                <button onClick={disconnectLiveSession} className="flex items-center gap-3 px-8 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/50 text-rose-400 rounded-full transition-all group">
                                    <span className="font-bold">Terminer</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-8 shadow-inner"><Mic className="w-12 h-12 text-slate-500" /></div>
                                <h3 className="text-2xl font-display font-bold mb-2">Mode Vocal</h3>
                                <p className="text-slate-400 text-sm mb-8 max-w-[240px]">
                                    Dialogue naturel via Gemini Live. Idéal pour l'entraînement oral.
                                </p>
                                <button onClick={connectLiveSession} className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-full shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 active:scale-95">
                                    <Mic className="w-5 h-5" /> <span className="font-bold">Démarrer</span>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};