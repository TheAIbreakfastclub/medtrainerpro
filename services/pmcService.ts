import { Article } from '../types';
import { BACKUP_LIBRARY, SPECIALTIES } from '../constants';

export async function fetchRandomArticle(specialty: string): Promise<Article> {
    let querySpecialty = specialty;
    
    // Fallback if specific key not found or random selected
    if (specialty === "random") {
        const keys = Object.keys(SPECIALTIES).filter(k => k !== "random");
        querySpecialty = keys[Math.floor(Math.random() * keys.length)];
    }

    // Convert internal key (e.g., "Infectious_Diseases") to readable search terms
    const searchTerms = querySpecialty.replace(/_/g, " ");
    
    // Core Medical Search Query optimized for quality results
    const finalQuery = `(${searchTerms} AND (review OR "randomized controlled trial" OR cohort)) AND HAS_ABSTRACT:y AND OPEN_ACCESS:y`;

    return loadArticleFromAPI(finalQuery);
}

export async function fetchByManualId(id: string): Promise<Article> {
    let cleanId = id.trim();
    if (/^\d+$/.test(cleanId)) cleanId = "PMC" + cleanId;
    return loadArticleFromAPI(`ext_id:${cleanId}`);
}

async function loadArticleFromAPI(query: string): Promise<Article> {
    try {
        const res = await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${query}%20src:med&format=json&resultType=core&pageSize=25&sort_date=y`);
        const data = await res.json();
        if (data.resultList && data.resultList.result.length > 0) {
            const rnd = Math.floor(Math.random() * data.resultList.result.length);
            const item = data.resultList.result[rnd];
            // Sanitize text roughly
            const cleanText = (item.abstractText || "Data corrupted or missing.").replace(/<[^>]*>?/gm, '');
            return { ...item, abstractText: cleanText };
        } else {
            throw new Error("No Data Found");
        }
    } catch (e) {
        console.error("Link Failure. Engaging Backup.", e);
        return {
            ...BACKUP_LIBRARY[0],
            title: "[OFFLINE_MODE] " + BACKUP_LIBRARY[0].title
        };
    }
}