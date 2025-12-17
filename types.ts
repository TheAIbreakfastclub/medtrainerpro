export interface Article {
    id: string;
    title: string;
    abstractText: string;
    authorString: string;
    pubYear: string;
    journalInfo?: {
        journal?: {
            title?: string;
        };
    };
}

export interface QuizOption {
    id: string;
    text: string;
    status: 'CORRECT' | 'NEUTRAL' | 'DISCORDANCE';
}

export interface QuizQuestion {
    t: string; // text
    r: 'A' | 'B'; // rank A or B
    c?: boolean; // correct answer (true/false) for TF
    e: string; // explanation
    type?: 'TF' | 'KFP'; // Type of question
    options?: QuizOption[]; // Options for KFP
}

export interface ECOSStation {
    id: string;
    title: string;
    type: 'ANNONCE' | 'DIAGNOSTIC' | 'URGENCE' | 'PREVENTION';
    context: string; // For Candidate
    instruction: string; // For Candidate
    patientScript: {
        name: string;
        age: number;
        history: string;
        personality: string;
        openingLine: string;
        hiddenInfo: string;
    };
    grid: {
        category: string;
        points: string[];
    }[];
}

export interface LexiconTerm {
    term: string;
    type: 'stat' | 'method' | 'connector' | 'warn' | 'root';
    def: string;
    root: boolean;
    rank: 'A' | 'B'; // New: Educational Rank
}

export interface ExamResult {
    id: string;
    date: string;
    score: number;
    total: number;
}

export interface StudySession {
    id: string;
    date: string; // ISO Date String YYYY-MM-DD
    topic: string; // ex: "Cardiologie"
    focus: string; // ex: "Insuffisance Cardiaque"
    type: 'COURS' | 'EXOS' | 'ECOS' | 'FLASHCARDS';
    duration: number; // minutes
    status: 'PENDING' | 'DONE';
}

export interface User {
    username: string;
    rank: string;
    exp: number;
    history: string[]; 
    examResults: ExamResult[];
    studyPlan: StudySession[]; // New: Calendar data
    subscriptionStatus: 'FREE' | 'PREMIUM';
    usageCount: number;      // Current usage this month
    lastResetDate: string;   // Date when usage was last reset
    settings: {
        highlightsEnabled: boolean;
    };
}

// --- DATA ARCHITECT STRUCTURES ---

export type EffortType = 'CALCUL' | 'VISUEL' | 'LOGIQUE' | 'MEMOIRE' | 'REDACTION';

export interface PacesSubject {
    id: string;
    code: string; // UE1, UE2...
    title: string;
    effortType: EffortType;
    desc: string;
}

export interface DFGSM2System {
    id: string;
    title: string;
    desc: string;
    pillars: {
        semio: boolean; // Bloc A: Semiology (Priority)
        physio: boolean; // Bloc B: Physiopath
        explo: boolean; // Bloc C: Explorations
    };
}

export interface DFGSM3Module {
    id: string;
    title: string;
    category: 'TRANSVERSAL' | 'PROCESS' | 'SYNTHESIS';
    desc: string;
    icon: 'PILL' | 'BOOK' | 'DNA' | 'MICROSCOPE' | 'BUG' | 'ACTIVITY' | 'FLAME' | 'BRAIN';
}

export interface R2CGroup {
    id: string;
    title: string;
    shortTitle: string;
    itemsCount: number; // Placeholder for number of items
    weight: 'HIGH' | 'MED' | 'LOW'; // Abstract weight for UI
}

export const EDN_BANK: QuizQuestion[] = [
    { t: "Internal validity assesses methodological quality.", r: "A", c: true, e: "Prerequisite for external validity." },
    { t: "ITT analysis preserves randomization benefits.", r: "A", c: true, e: "Avoids attrition bias." },
    { t: "A p-value < 0.05 proves the null hypothesis is false.", r: "B", c: false, e: "It only indicates data is unlikely under null hypothesis." },
    { t: "Confidence intervals provide information on precision.", r: "A", c: true, e: "Narrower intervals indicate higher precision." },
    { t: "Relative Risk Reduction is constant across baseline risks.", r: "A", c: true, e: "Unlike Absolute Risk Reduction which varies." }
];