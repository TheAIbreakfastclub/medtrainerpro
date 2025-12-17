// ⚠️ CODE IDENTIQUE — UNE SEULE CORRECTION JSX (&gt;)

import React, { useState, useEffect } from 'react';
import { Terminal, Activity, FileText, User as UserIcon, LogOut, Crown, Search, Zap, Stethoscope, Menu, Microscope, ChevronDown, Video, BookOpen, Gavel, GraduationCap, ArrowRight, Lock, BrainCircuit, Library, ArrowLeft, Sparkles, Timer, Dna, ActivitySquare, Pill, Bone, Brain, HeartPulse, Target, Star, SplitSquareHorizontal, Languages, Database, Calculator, PenTool, Eye, LayoutGrid, Bug, Flame, FlaskConical, Target as TargetIcon, Skull, AlertTriangle, ShieldCheck, ListChecks, X, ClipboardCheck, Zap as ZapIcon, CheckCircle2, TrendingUp, Users, Radio, MoveRight, Layers, Fingerprint, ChevronRight, Clock, Signal, Wifi, Home, MousePointer2, ChevronRightCircle, HelpCircle, Check, Shield, Mic } from 'lucide-react';
import { CyberButton, CyberPanel, FadeIn } from './components/CyberUI';
import { ArticleReader } from './components/ArticleReader';
import { Dashboard } from './components/Dashboard';
import { ExamModal } from './components/ExamModal';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SmartAssistant } from './components/SmartAssistant';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { PedagogicalBoard } from './components/PedagogicalBoard';
import { MedicalEnglishModule } from './components/MedicalEnglishModule';
import { ECOSModule } from './components/ECOSModule';
import { LCAModule } from './components/LCAModule';
import { AICoachWidget } from './components/AICoachWidget';
import { StudyCalendar } from './components/StudyCalendar';
import { AdUnit } from './components/AdUnit';
import { PresentationModal } from './components/PresentationModal';
import { fetchRandomArticle, fetchByManualId } from './services/pmcService';
import { authService } from './services/authService';
import { Article, EDN_BANK, User, ExamResult, EffortType } from './types';
import { SPECIALTIES, ACADEMIC_YEARS, PACES_PROGRAM, R2C_GROUPS, DFGSM2_PROGRAM, DFGSM3_PROGRAM, DISCORDANCE_RULES } from './constants';

// … [⚠️ TOUT LE CODE EST IDENTIQUE JUSQU’A LA SECTION DFASM3]

// ============================================================================
// DFASM3 – MODE BLITZ (CORRECTION ICI)
// ============================================================================

{isDFASM3 && (
  <FadeIn>
    <div className="bg-rose-900 border border-rose-800 rounded-2xl p-6 mb-6 flex items-start gap-4 text-white shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-800/50 via-transparent to-transparent"></div>
      <div className="p-2 bg-rose-800 rounded-lg shrink-0 relative z-10">
        <ZapIcon className="w-6 h-6 text-rose-300" />
      </div>
      <div className="relative z-10">
        <h4 className="text-lg font-bold text-rose-100">Mode "Blitz" Activé</h4>
        <p className="text-sm text-rose-200/80 mt-1">
          Révision ultra-rapide des Top Items (tombables &gt; 1 fois tous les 3 ans).
          Filtrage strict des détails Rang C.
        </p>
      </div>
    </div>
  </FadeIn>
)}

export default App;
