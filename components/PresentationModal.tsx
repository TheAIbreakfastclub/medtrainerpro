import React from 'react';
import { X, CheckCircle2, BrainCircuit, Target, ArrowRight } from 'lucide-react';

interface PresentationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCtaClick: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({ isOpen, onClose, onCtaClick }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            {/* Container principal avec style carte blanche et ombre portée */}
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative custom-scroll">
                
                {/* Bouton Fermer */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-500 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 md:p-12 text-slate-700 font-sans leading-relaxed">
                    
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mb-4">
                            En médecine, le problème n’est presque jamais le manque de travail.<br/>
                            <span className="text-blue-600">C’est le manque de structure.</span>
                        </h2>
                    </div>

                    {/* Intro */}
                    <p className="text-lg text-justify text-slate-600 mb-8 max-w-3xl mx-auto">
                        De <strong className="text-slate-900">PASS/LAS à la DFASM3</strong>, les étudiants accumulent les heures, les ressources et la fatigue, sans toujours savoir quoi réviser, quand, ni comment s’entraîner efficacement. Les connaissances s’empilent, mais la mémorisation ne suit pas. Les QCM stagnent. Le stress augmente.
                    </p>

                    <hr className="border-0 border-t border-slate-200 my-8 max-w-xl mx-auto" />

                    {/* Proposition de valeur */}
                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">
                            MedtrainerPro : L'Assistant de révision pour le cursus médical
                        </h3>
                        <p className="text-slate-500">
                            Il transforme un programme dense et anxiogène en un <strong className="text-blue-600">plan clair, priorisé et réaliste</strong>.
                        </p>
                    </div>

                    {/* Liste des bénéfices */}
                    <div className="grid gap-4 mb-10 max-w-2xl mx-auto">
                        <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-blue-500 flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <strong className="block text-slate-900">Guidage quotidien</strong>
                                <span className="text-sm">L'assistant organise vos révisions dans le temps.</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-indigo-500 flex items-start gap-4">
                            <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
                                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <strong className="block text-slate-900">Mémorisation Active</strong>
                                <span className="text-sm">Il renforce vos connaissances durablement.</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-teal-500 flex items-start gap-4">
                            <div className="bg-teal-100 p-2 rounded-lg shrink-0">
                                <Target className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <strong className="block text-slate-900">Entraînement Ciblé</strong>
                                <span className="text-sm">QCM et cas cliniques adaptés à votre niveau.</span>
                            </div>
                        </div>
                    </div>

                    {/* Conclusion */}
                    <p className="text-center font-medium text-slate-800 mb-8 text-lg">
                        Résultat : moins de dispersion, une meilleure rétention, des progrès visibles.<br/>
                        <span className="text-slate-500 text-base font-normal">De la survie en PASS à la performance en DFASM, apprenez à <em className="text-blue-600 not-italic font-semibold">travailler mieux, pas simplement plus.</em></span>
                    </p>

                    {/* CTA */}
                    <div className="text-center">
                        <button 
                            onClick={onCtaClick}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            Démarrer mon plan structuré <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="text-xs text-slate-400 mt-3 uppercase tracking-wide">Accès immédiat sur navigateur</p>
                    </div>

                </div>
            </div>
        </div>
    );
};