import React, { useState, useRef, useEffect } from 'react';
import { CyberPanel, CyberButton } from './CyberUI';
import { ArrowLeft, BookOpen, MessageSquare, GraduationCap, Languages, Sparkles, Send, Mic, Volume2, Loader2, Brain, Image as ImageIcon, Stethoscope, User, UserCheck, Radio, StopCircle } from 'lucide-react';
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { ACADEMIC_YEARS } from '../constants';

interface MedicalEnglishModuleProps {
    yearId: string;
    onBack: () => void;
}

type TabType = 'VOCAB' | 'ROLEPLAY' | 'CASE_STUDY';

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

export const MedicalEnglishModule: React.FC<MedicalEnglishModuleProps> = ({ yearId, onBack }) => {
    const [activeTab, setActiveTab] = useState<TabType>('VOCAB');
    
    const isLevel1 = ['PACES', 'DFGSM2'].includes(yearId);
    const isLevel2 = ['DFGSM3', 'DFASM1'].includes(yearId);
    const isLevel3 = ['DFASM2', 'DFASM3'].includes(yearId);

    useEffect(() => {
        if (isLevel1) setActiveTab('VOCAB');
        else if (isLevel2) setActiveTab('ROLEPLAY');
        else if (isLevel3) setActiveTab('CASE_STUDY');
    }, [yearId]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 animate-fadeIn">
            {/* Header */}
            <div className="bg-blue-900 text-white sticky top-[57px] z-40 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-sm font-bold text-blue-300 uppercase tracking-widest flex items-center gap-2">
                                <Languages className="w-4 h-4" /> MEDICAL ENGLISH LAB
                            </h2>
                            <p className="text-xs text-slate-300">
                                Level: {ACADEMIC_YEARS.find(y => y.id === yearId)?.label} • 
                                {isLevel1 ? ' Foundations' : isLevel2 ? ' Clinical Skills' : ' Advanced Research'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-8 overflow-x-auto">
                        <TabButton 
                            active={activeTab === 'VOCAB'} 
                            onClick={() => setActiveTab('VOCAB')} 
                            label="Visual Vocabulary" 
                            sub="Nano Banana Pro & TTS"
                            icon={<BookOpen className="w-4 h-4" />}
                        />
                        <TabButton 
                            active={activeTab === 'ROLEPLAY'} 
                            onClick={() => setActiveTab('ROLEPLAY')} 
                            label="The London ER" 
                            sub="Live Audio Patient"
                            icon={<Mic className="w-4 h-4" />}
                        />
                        <TabButton 
                            active={activeTab === 'CASE_STUDY'} 
                            onClick={() => setActiveTab('CASE_STUDY')} 
                            label="NEJM Case Records" 
                            sub="Gemini 2.5 Flash Bot"
                            icon={<GraduationCap className="w-4 h-4" />}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                {activeTab === 'VOCAB' && <VocabSection />}
                {activeTab === 'ROLEPLAY' && <RoleplaySection />}
                {activeTab === 'CASE_STUDY' && <CaseStudySection />}
            </main>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const TabButton = ({ active, onClick, label, sub, icon }: any) => (
    <button 
        onClick={onClick}
        className={`py-4 px-2 border-b-2 flex items-center gap-3 transition-all shrink-0 ${
            active 
            ? 'border-blue-600 text-blue-900' 
            : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
        }`}
    >
        <div className={`p-2 rounded-lg ${active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100'}`}>
            {icon}
        </div>
        <div className="text-left">
            <div className={`text-sm font-bold ${active ? 'text-blue-900' : 'text-slate-600'}`}>{label}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">{sub}</div>
        </div>
    </button>
);

const VocabSection = () => {
    const [topic, setTopic] = useState('Cardiology');
    const [vocabList, setVocabList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
    const [imgLoading, setImgLoading] = useState<string | null>(null);
    const [ttsLoading, setTtsLoading] = useState<string | null>(null);

    const generateVocab = async () => {
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Generate a list of 4 foundational medical English terms related to ${topic} (Anatomy or Equipment). 
            For each term: provide the English term, French translation, and a short definition.
            Format JSON: [{ term, fr, def }]`;

            // FAST: Use Standard Flash
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                term: { type: Type.STRING },
                                fr: { type: Type.STRING },
                                def: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            const data = JSON.parse(response.text || '[]');
            setVocabList(data);
            setGeneratedImages({});
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const generateImage = async (term: string) => {
        setImgLoading(term);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // IMAGE: Use Nano Banana Pro (gemini-3-pro-image-preview)
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [{ text: `A clean, professional medical illustration of: ${term}. White background, anatomical style.` }]
                },
                config: {
                    imageConfig: { aspectRatio: "1:1" }
                }
            });

            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64 = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        setGeneratedImages(prev => ({ ...prev, [term]: `data:${mimeType};base64,${base64}` }));
                    }
                }
            }
        } catch (e) {
            console.error("Image Gen Error", e);
        } finally {
            setImgLoading(null);
        }
    };

    const playPronunciation = async (term: string) => {
        setTtsLoading(term);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // SPEECH: Use Gemini TTS
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text: term }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                },
            });
            
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                const ctx = new AudioContextClass();
                const audioData = decode(base64Audio);
                const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.start();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setTtsLoading(null);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn h-full">
            <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-grow w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Select Topic</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium text-slate-700"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        >
                            <option>Cardiology (Heart Anatomy)</option>
                            <option>Neurology (Brain Anatomy)</option>
                            <option>Pneumology (Lungs)</option>
                            <option>Orthopedics (Bones)</option>
                            <option>Surgery Instruments</option>
                            <option>ER Equipment</option>
                        </select>
                    </div>
                    <CyberButton onClick={generateVocab} variant="primary" disabled={loading}>
                        {loading ? 'Generating...' : 'Load Flashcards'}
                    </CyberButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vocabList.map((item, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                             <div className="flex justify-between items-start mb-2 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-800">{item.term}</h3>
                                        <button 
                                            onClick={() => playPronunciation(item.term)}
                                            disabled={ttsLoading === item.term}
                                            className="p-1 text-blue-500 hover:bg-blue-50 rounded-full"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">{item.fr}</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 italic mb-4 relative z-10 min-h-[40px]">{item.def}</p>
                            
                            <div className="w-full h-40 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 relative z-10">
                                {generatedImages[item.term] ? (
                                    <img src={generatedImages[item.term]} alt={item.term} className="w-full h-full object-contain" />
                                ) : (
                                    <button 
                                        onClick={() => generateImage(item.term)}
                                        disabled={imgLoading === item.term}
                                        className="flex flex-col items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors"
                                    >
                                        {imgLoading === item.term ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                                        <span className="text-xs font-bold">Generate Visual</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-1 h-full min-h-[500px]">
                <SimpleChatBot 
                    title="Study Buddy" 
                    subtitle="Vocab Quiz Bot"
                    systemInstruction={`You are a helpful medical student peer. 
                    Ask the user to define simple medical terms related to ${topic} in English. 
                    Keep it short and fun. Correct their grammar slightly if needed.`}
                    initialMessage={`Hi! Ready to review some ${topic} vocabulary?`}
                />
            </div>
        </div>
    );
};

const RoleplaySection = () => {
    // LIVE API PATIENT
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sessionRef = useRef<any>(null);
    const nextStartTimeRef = useRef<number>(0);

    const connectLive = async () => {
        try {
            setIsConnected(true);
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const inputCtx = new AudioContextClass({ sampleRate: 16000 });
            const outputCtx = new AudioContextClass({ sampleRate: 24000 });
            inputAudioContextRef.current = inputCtx;
            audioContextRef.current = outputCtx;
            nextStartTimeRef.current = 0;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: `You are a patient in a London Emergency Room simulation.
                    
                    1. **Persona**: Adopt a specific acute medical condition (e.g., Appendicitis, MI, Pneumothorax). Describe symptoms naturally and vividly in English. Do not reveal the diagnosis immediately.
                    2. **Interactive Feedback**: You are also a tutor. If the student makes a mistake (grammar or medical approach), briefly break character to provide concise real-time feedback, then resume the patient role.
                    3. **Engagement**: If the student is quiet, prompt them with follow-up questions like "Doctor, is it serious?" or "What are you checking for?".`,
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
                    },
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
                            setTimeout(() => setIsSpeaking(false), 300);
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
                    onclose: () => disconnectLive(),
                    onerror: () => disconnectLive()
                }
            });
            sessionRef.current = sessionPromise;

        } catch (error) {
            console.error(error);
            disconnectLive();
        }
    };

    const disconnectLive = () => {
        setIsConnected(false);
        processorRef.current?.disconnect();
        inputAudioContextRef.current?.close();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        audioContextRef.current?.close();
    };

    useEffect(() => {
        return () => disconnectLive();
    }, []);

    return (
        <div className="h-[700px] flex flex-col bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-fadeIn relative text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent opacity-50"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-6 shadow-inner relative">
                    {isConnected ? (
                        <div className={`w-16 h-16 rounded-full ${isSpeaking ? 'bg-teal-400 animate-pulse' : 'bg-teal-600'} flex items-center justify-center transition-colors`}>
                            <Radio className="w-8 h-8 text-white" />
                        </div>
                    ) : (
                         <User className="w-8 h-8 text-slate-500" />
                    )}
                    {isConnected && <div className={`absolute -inset-4 rounded-full border-2 border-teal-500/30 ${isSpeaking ? 'animate-ping' : ''}`}></div>}
                </div>

                <h2 className="text-3xl font-display font-bold mb-2">The London ER</h2>
                <p className="text-slate-400 max-w-md mb-12">
                    Simulate a patient interview in real-time using Gemini Live. 
                    Practice your history taking skills (Anamnesis) orally with real-time feedback.
                </p>

                {!isConnected ? (
                    <button 
                        onClick={connectLive}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white rounded-full shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Mic className="w-5 h-5" />
                        <span className="font-bold">Start Simulation (Live API)</span>
                    </button>
                ) : (
                    <button 
                        onClick={disconnectLive}
                        className="flex items-center gap-3 px-8 py-4 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-400 rounded-full transition-all group"
                    >
                        <StopCircle className="w-5 h-5 group-hover:scale-110" />
                        <span className="font-bold">End Session</span>
                    </button>
                )}
                
                <div className="mt-8 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                    Gemini 2.5 Native Audio Preview
                </div>
            </div>
        </div>
    );
};

const CaseStudySection = () => {
    const [caseStudy, setCaseStudy] = useState<{ title: string, body: string, questions: string[] } | null>(null);
    const [loading, setLoading] = useState(false);

    const generateCase = async () => {
        setLoading(true);
        setCaseStudy(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Generate a detailed clinical case study styled after the "New England Journal of Medicine".
            Target Audience: Advanced Medical Students.
            Language: High-level Medical English.
            Structure: Title, Case Presentation, HPI, Physical Exam, Labs. DO NOT reveal diagnosis.
            Format JSON: { title, body }`;

            // FAST: Use Standard Flash
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            body: { type: Type.STRING }
                        }
                    }
                }
            });
            setCaseStudy(JSON.parse(response.text || '{}'));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn h-[calc(100vh-200px)] min-h-[600px]">
            <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-hidden">
                {!caseStudy ? (
                    <div className="flex-grow flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <GraduationCap className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">NEJM Case Records</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            Generate a high-fidelity clinical case to practice differential diagnosis.
                        </p>
                        <CyberButton variant="primary" onClick={generateCase} disabled={loading}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Case (Gemini Flash)'}
                        </CyberButton>
                    </div>
                ) : (
                    <div className="flex-grow bg-white p-8 rounded-3xl shadow-sm border border-slate-200 overflow-y-auto custom-scroll relative">
                        <div className="sticky top-0 bg-white/95 backdrop-blur pb-4 mb-4 border-b border-slate-100 z-10 flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case Record • MGH Simulator</span>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">{caseStudy.title}</h2>
                            </div>
                            <CyberButton variant="ghost" onClick={generateCase} className="!p-2">New</CyberButton>
                        </div>
                        <div className="prose prose-slate prose-lg font-serif text-slate-700 leading-loose">
                            {caseStudy.body.split('\n').map((para, i) => (
                                <p key={i} className="mb-4">{para}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="lg:col-span-5 h-full">
                <SimpleChatBot 
                    title="Senior Consultant"
                    subtitle="Diagnostic Partner"
                    systemInstruction={`You are a Senior Consultant. Discuss the differential diagnosis based on the case provided below. Be professional and Socratic. ${caseStudy ? `CONTEXT: ${caseStudy.body}` : ''}`}
                    initialMessage={caseStudy ? "Interesting case. What is your primary differential diagnosis?" : "Waiting for case generation..."}
                    fullHeight
                    disabled={!caseStudy}
                    model="gemini-2.5-flash"
                />
            </div>
        </div>
    );
};

interface SimpleChatBotProps {
    title: string;
    subtitle: string;
    systemInstruction: string;
    initialMessage: string;
    fullHeight?: boolean;
    disabled?: boolean;
    model?: string;
}

const SimpleChatBot: React.FC<SimpleChatBotProps> = ({ title, subtitle, systemInstruction, initialMessage, fullHeight, disabled, model = 'gemini-2.5-flash' }) => {
    const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
    const [input, setInput] = useState('');
    const chatRef = useRef<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (disabled) return;
        const initChat = async () => {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const chat = ai.chats.create({
                model: model,
                config: { systemInstruction }
            });
            chatRef.current = chat;
            setMessages([{ role: 'model', text: initialMessage }]);
        };
        initChat();
    }, [systemInstruction, initialMessage, disabled, model]);

    const sendMsg = async () => {
        if (!input.trim() || !chatRef.current) return;
        const msg = input;
        setMessages(prev => [...prev, { role: 'user', text: msg }]);
        setInput('');
        setLoading(true);
        try {
            const res = await chatRef.current.sendMessage({ message: msg });
            setMessages(prev => [...prev, { role: 'model', text: res.text }]);
        } catch (e) { 
            console.error(e);
            setMessages(prev => [...prev, { role: 'model', text: "Connection error." }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    if (disabled) {
         return (
            <div className={`flex flex-col bg-slate-100 rounded-2xl border border-slate-200 shadow-inner items-center justify-center text-slate-400 h-full p-8 text-center`}>
                <UserCheck className="w-12 h-12 mb-4 opacity-20" />
                <p>Bot inactive. Please load context first.</p>
            </div>
         );
    }

    return (
        <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${fullHeight ? 'h-full' : 'h-[500px]'}`}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{title}</h3>
                        <p className="text-xs text-slate-500">{subtitle}</p>
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scroll">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            m.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                        }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && (
                     <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>
            <div className="p-3 bg-white border-t border-slate-200">
                <form onSubmit={(e) => { e.preventDefault(); sendMsg(); }} className="flex gap-2">
                    <input 
                        className="flex-grow bg-slate-100 border-transparent focus:border-blue-400 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Type message..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || loading}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};