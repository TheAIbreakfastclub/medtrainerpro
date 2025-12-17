import { LexiconTerm, PacesSubject, R2CGroup, DFGSM2System, DFGSM3Module } from './types';

export const SPECIALTIES: Record<string, string> = {
    "random": "🎲 ALÉATOIRE (SURPRISE)",
    "Allergy_Immunology": "Allergologie",
    "Anesthesiology": "Anesthésie-Réanimation",
    "Cardiology": "Cardiologie & Maladies Vasculaires",
    "Surgery": "Chirurgie (Générale)",
    "Oral_Surgery": "Chirurgie Maxillo-faciale",
    "Pediatric_Surgery": "Chirurgie Pédiatrique",
    "Plastic_Surgery": "Chirurgie Plastique",
    "Thoracic_Surgery": "Chirurgie Thoracique & CV",
    "Vascular_Surgery": "Chirurgie Vasculaire",
    "Visceral_Surgery": "Chirurgie Viscérale & Digestive",
    "Dermatology": "Dermatologie & Vénérologie",
    "Endocrinology": "Endocrinologie-Diabétologie",
    "Genetics": "Génétique Médicale",
    "Geriatrics": "Gériatrie",
    "Gynecology": "Gynécologie Médicale",
    "Obstetrics_Gynecology": "Gynécologie-Obstétrique",
    "Hematology": "Hématologie",
    "Gastroenterology": "Hépato-Gastro-Entérologie",
    "Infectious_Diseases": "Maladies Infectieuses",
    "Internal_Medicine": "Médecine Interne",
    "Legal_Medicine": "Médecine Légale",
    "Nuclear_Medicine": "Médecine Nucléaire",
    "Physical_Medicine": "Médecine Physique & Réadaptation",
    "Emergency_Medicine": "Médecine d'Urgence",
    "Occupational_Medicine": "Médecine du Travail",
    "General_Practice": "Médecine Générale",
    "Vascular_Medicine": "Médecine Vasculaire",
    "Nephrology": "Néphrologie",
    "Neurosurgery": "Neurochirurgie",
    "Neurology": "Neurologie",
    "Nutrition": "Nutrition",
    "Oncology": "Oncologie",
    "Ophthalmology": "Ophtalmologie",
    "Otolaryngology": "ORL & Chirurgie Cervico-faciale",
    "Orthopedics": "Orthopédie & Traumatologie",
    "Pediatrics": "Pédiatrie",
    "Pneumology": "Pneumologie",
    "Psychiatry": "Psychiatrie",
    "Radiology": "Radiologie & Imagerie",
    "Rheumatology": "Rhumatologie",
    "Public_Health": "Santé Publique",
    "Urology": "Urologie"
};

export const ACADEMIC_YEARS = [
    { id: 'PACES', label: 'PACES', desc: 'PASS / LAS' },
    { id: 'DFGSM2', label: 'DFGSM2', desc: 'P2 - Sciences Fondamentales' },
    { id: 'DFGSM3', label: 'DFGSM3', desc: 'D1 - Transition Clinique' },
    { id: 'DFASM1', label: 'DFASM1', desc: 'D2 - Premier Tour R2C' },
    { id: 'DFASM2', label: 'DFASM2', desc: 'D3 - Expertise & KFP' },
    { id: 'DFASM3', label: 'DFASM3', desc: 'D4 - Sprint ECOS & EDN' }
];

export const DISCORDANCE_RULES = {
    title: "⚠️ RÈGLE DE LA MORT SUBITE",
    desc: "En DFASM2, toute réponse discordante (dangereuse) entraîne l'arrêt immédiat de l'exercice et la note de 0. Soyez vigilant sur les contre-indications.",
};

export const ECOS_DOMAINS = [
    { id: 'D1', label: 'Interrogatoire', weight: 20, desc: 'Recueil de données, Histoire de la maladie' },
    { id: 'D2', label: 'Examen Physique', weight: 20, desc: 'Gestes techniques, Respect pudeur, Hygiène' },
    { id: 'D3', label: 'Communication', weight: 20, desc: 'Empathie, Clarté, Annonce, Vérification' },
    { id: 'D4', label: 'Raisonnement', weight: 20, desc: 'Hypothèses diagnostiques, Examens pertinents' },
    { id: 'D5', label: 'Thérapeutique', weight: 20, desc: 'Ordonnance, Suivi, Filet de sécurité' }
];

// --- DATA ARCHITECT: PACES STRUCTURE ---
export const PACES_PROGRAM: PacesSubject[] = [
    { id: 'UE1', code: 'UE 1', title: 'Atomes, Biomolécules, Génome', effortType: 'CALCUL', desc: 'Biochimie, Chimie G, Biologie Moléculaire.' },
    { id: 'UE2', code: 'UE 2', title: 'La Cellule et les Tissus', effortType: 'VISUEL', desc: 'Bio Cell, Histologie, Embryologie.' },
    { id: 'UE3', code: 'UE 3', title: 'Organisation des appareils et systèmes', effortType: 'LOGIQUE', desc: 'Physique, Biophysique, Physiologie.' },
    { id: 'UE4', code: 'UE 4', title: 'Évaluation des méthodes d\'analyse', effortType: 'CALCUL', desc: 'Biostats, Maths.' },
    { id: 'UE5', code: 'UE 5', title: 'Anatomie', effortType: 'MEMOIRE', desc: 'Anatomie générale et fonctionnelle.' },
    { id: 'UE6', code: 'UE 6', title: 'Médicament', effortType: 'MEMOIRE', desc: 'Pharmacologie, cibles, mécanismes.' },
    { id: 'UE7', code: 'UE 7', title: 'Santé Société Humanité (SSH)', effortType: 'REDACTION', desc: 'Santé Publique, SHS, Histoire.' }
];

// --- DATA ARCHITECT: DFGSM2 STRUCTURE (SYSTEMES & PILIERS) ---
export const DFGSM2_PROGRAM: DFGSM2System[] = [
    { id: 'SYS1', title: 'Cardio-Vasculaire & Respiratoire', desc: 'Cœur, Poumons, Vaisseaux', pillars: { semio: true, physio: true, explo: true } },
    { id: 'SYS2', title: 'Neurologie & Organes des Sens', desc: 'SNC, SNP, Ophtalmo, ORL', pillars: { semio: true, physio: true, explo: true } },
    { id: 'SYS3', title: 'Hépato-Gastro-Entérologie', desc: 'Digestif, Nutrition', pillars: { semio: true, physio: true, explo: true } },
    { id: 'SYS4', title: 'Uro-Néphrologie', desc: 'Rein, Voies urinaires', pillars: { semio: true, physio: true, explo: true } },
    { id: 'SYS5', title: 'Endocrinologie & Reproduction', desc: 'Hormones, Gynéco', pillars: { semio: true, physio: true, explo: true } },
    { id: 'SYS6', title: 'Locomoteur', desc: 'Os, Articulations, Muscles, Rhumato', pillars: { semio: true, physio: true, explo: true } },
    { id: 'SYS7', title: 'Immunologie & Hématologie', desc: 'Sang, Défense immunitaire', pillars: { semio: false, physio: true, explo: true } },
    { id: 'SYS8', title: 'Revêtement Cutané', desc: 'Dermatologie', pillars: { semio: true, physio: true, explo: false } },
];

// --- DATA ARCHITECT: DFGSM3 STRUCTURE (TRANSVERSAL & PROCESSUS) ---
export const DFGSM3_PROGRAM: DFGSM3Module[] = [
    // Category 1: Transversal
    { id: 'TRA1', title: 'Pharmacologie Générale', category: 'TRANSVERSAL', desc: 'PK/PD, Iatrogénie, Interactions.', icon: 'PILL' },
    { id: 'TRA2', title: 'Lecture Critique (LCA)', category: 'TRANSVERSAL', desc: 'Structure IMRaD, Biais, PICO.', icon: 'BOOK' },
    { id: 'TRA3', title: 'Génétique & Immunologie', category: 'TRANSVERSAL', desc: 'Mécanismes fondamentaux.', icon: 'DNA' },
    { id: 'TRA4', title: 'Biopathologie (Anapath)', category: 'TRANSVERSAL', desc: 'Lésions, Inflammation, Cancer.', icon: 'MICROSCOPE' },
    
    // Category 2: Processes
    { id: 'PRO1', title: 'Processus Infectieux', category: 'PROCESS', desc: 'Bactério, Viro, Parasito.', icon: 'BUG' },
    { id: 'PRO2', title: 'Processus Tumoral', category: 'PROCESS', desc: 'Cancérologie fondamentale.', icon: 'ACTIVITY' },
    { id: 'PRO3', title: 'Processus Inflammatoire', category: 'PROCESS', desc: 'Auto-immunité & Inflammation.', icon: 'FLAME' },
    
    // Category 3: Synthesis
    { id: 'SYN1', title: 'Synthèse Clinique', category: 'SYNTHESIS', desc: 'Des signes aux syndromes.', icon: 'BRAIN' },
];

// --- DATA ARCHITECT: R2C STRUCTURE (EDN) ---
export const R2C_GROUPS: R2CGroup[] = [
    { id: 'GRP1', title: 'Médecine aiguë', shortTitle: 'Réa / Urg / Anesth', itemsCount: 25, weight: 'HIGH' },
    { id: 'GRP2', title: 'Médecine péri-opératoire', shortTitle: 'Douleur / Anesth', itemsCount: 15, weight: 'MED' },
    { id: 'GRP3', title: 'Maladies chroniques & Transversales', shortTitle: 'Médecine Interne', itemsCount: 40, weight: 'HIGH' },
    { id: 'GRP4', title: 'Abdomen & Digestif', shortTitle: 'HGE / Viscérale', itemsCount: 30, weight: 'HIGH' },
    { id: 'GRP5', title: 'Cardio-Vasculaire & Thoracique', shortTitle: 'Cardio / Pneumo', itemsCount: 35, weight: 'HIGH' },
    { id: 'GRP6', title: 'Locomoteur & Rhumato', shortTitle: 'Ortho / Rhumato', itemsCount: 20, weight: 'MED' },
    { id: 'GRP7', title: 'Neuro-Sensoriel & Psy', shortTitle: 'Neuro / ORL / Ophtalmo', itemsCount: 45, weight: 'HIGH' },
    { id: 'GRP8', title: 'Onco-Hémato', shortTitle: 'Cancéro / Hémato', itemsCount: 25, weight: 'HIGH' },
    { id: 'GRP9', title: 'Femme, Mère, Enfant', shortTitle: 'Pédia / Gynéco', itemsCount: 40, weight: 'HIGH' },
    { id: 'GRP10', title: 'Santé Publique & Légale', shortTitle: 'SP / Légale / Travail', itemsCount: 15, weight: 'MED' },
    { id: 'GRP11', title: 'Biologie Médicale & Pathologie', shortTitle: 'Bio Med / Anapath', itemsCount: 10, weight: 'LOW' },
    { id: 'GRP12', title: 'Radiologie & Imagerie', shortTitle: 'Imagerie Transversale', itemsCount: 10, weight: 'MED' },
    { id: 'GRP13', title: 'Médecine Générale', shortTitle: 'Soins Premiers', itemsCount: 20, weight: 'HIGH' },
];

// --- DATA ARCHITECT: DFASM1 LCA SNIPPETS ---
export const LCA_SNIPPETS = [
    { t: "Dans ce contexte, une Valeur Prédictive Négative (VPN) de 99% signifie...", r: "A", c: true, e: "Qu'un test négatif permet d'éliminer le diagnostic avec quasi-certitude (Rule-out)." },
    { t: "Ce traitement a un Risque Relatif (RR) de 0.5. Cela signifie...", r: "A", c: true, e: "Qu'il réduit le risque d'événement de 50% par rapport au groupe contrôle." },
    { t: "Une étude de cohorte permet de calculer...", r: "A", c: true, e: "Le Risque Relatif (RR), contrairement aux cas-témoins (Odds Ratio)." },
    { t: "Un biais de confusion est...", r: "A", c: true, e: "Une variable liée à la fois à l'exposition et à la maladie, faussant l'association." },
    { t: "Le Nombre de Sujets à Traiter (NNT) est...", r: "B", c: true, e: "L'inverse de la Réduction Absolue du Risque (1/RAR)." }
];

export const CONTENT_GENERATION_RULES = `
MATRICE DE PONDÉRATION (ALGORITHME):
1. Fréquence (Annales 10 ans):
   - >5 fois: "High Yield" (Priorité Absolue)
   - 2-5 fois: "Standard"
   - 0 fois: "Low Yield"
2. Gravité:
   - Urgence Vitale (ex: ACR, Choc) -> Priorité MAXIMALE.

TYPES DE CONTENU PAR RANG:
- RANG A: Questions binaires (Vrai/Faux) ou QCM simples. Erreur interdite.
- RANG B: DP (Dossiers Progressifs) complexes, analyses d'examens.
- Urgence: KFP (Key Feature Problem) focalisée Thérapeutique.
- Imagerie: Zone à pointer.
`;

export const CHECKLISTS = {
    'RCT': { 
        name: 'RCT PROTOCOL', 
        items: ["Randomization described?", "Allocation concealed?", "Blinding maintained?", "ITT analysis?", "Flow diagram?"] 
    },
    'OBS': { 
        name: 'OBS PROTOCOL', 
        items: ["Design appropriate?", "Selection criteria?", "Biases discussed?", "Confounders adjusted?", "Follow-up adequate?"] 
    }
};

export const LEXICON: LexiconTerm[] = [
    { term: "p-value", type: "stat", def: "Probabilité", root: false, rank: 'A' },
    { term: "confidence interval", type: "stat", def: "IC 95%", root: false, rank: 'A' },
    { term: "odds ratio", type: "stat", def: "Odds Ratio", root: false, rank: 'A' },
    { term: "hazard ratio", type: "stat", def: "Hazard Ratio", root: false, rank: 'B' },
    { term: "randomized", type: "method", def: "Randomisé", root: false, rank: 'A' },
    { term: "double-blind", type: "method", def: "Double insu", root: false, rank: 'A' },
    { term: "cohort", type: "method", def: "Cohorte", root: false, rank: 'A' },
    { term: "cross-sectional", type: "method", def: "Transversale", root: false, rank: 'B' },
    { term: "bias", type: "warn", def: "Biais", root: false, rank: 'A' },
    { term: "confounding", type: "warn", def: "Confusion", root: false, rank: 'A' },
    { term: "interaction", type: "stat", def: "Interaction", root: false, rank: 'B' },
    { term: "non-inferiority", type: "method", def: "Non-infériorité", root: false, rank: 'B' },
    { term: "cardio", type: "root", def: "Cœur", root: true, rank: 'A' },
    { term: "neuro", type: "root", def: "Nerf", root: true, rank: 'A' },
    { term: "pneumo", type: "root", def: "Poumon", root: true, rank: 'A' },
    { term: "hepa", type: "root", def: "Foie", root: true, rank: 'A' }
];

export const BACKUP_LIBRARY = [
    { 
        id: "CARDIO_RCT", 
        title: "Efficacy of Endovascular Thrombectomy in Ischemic Stroke", 
        journalInfo: { journal: { title: "NEJM" } }, 
        authorString: "Smith et al.", 
        pubYear: "2023", 
        abstractText: "Background: We conducted a randomized, double-blind, placebo-controlled trial to assess efficacy. Methods: Patients with acute ischemic stroke were assigned to thrombectomy or standard care. The primary outcome was functional independence at 90 days. Results: 500 patients were randomized. The odds ratio for functional independence was 2.5 (95% confidence interval, 1.8 to 3.5; P<0.001). Mortality was similar in both groups. There was no evidence of selection bias. Conclusion: Thrombectomy improved outcomes." 
    }
];