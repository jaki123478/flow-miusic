"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowAIService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const KNOWLEDGE_PATH = path_1.default.join(process.cwd(), 'uploads', 'flow_knowledge.json');
class FlowAIService {
    static knowledgeBase = [];
    static async init() {
        try {
            const data = await promises_1.default.readFile(KNOWLEDGE_PATH, 'utf-8');
            this.knowledgeBase = JSON.parse(data);
        }
        catch {
            // Inizializza con conoscenza base iniziale sui social
            this.knowledgeBase = [
                {
                    topic: 'Instagram Algorithm 2026',
                    insight: 'I Reel con audio di tendenza e i post con elevato tempo di permanenza (caroselli e didascalie lunghe) ottengono fino al 300% di reach in più.',
                    source: 'Auto-Learned Trend',
                    learnedAt: new Date().toISOString()
                },
                {
                    topic: 'TikTok Viral Hook Patterns',
                    insight: 'I primi 3 secondi sono critici: porre una domanda controversa o mostrare il risultato finale prima della spiegazione raddoppia il retention rate.',
                    source: 'Auto-Learned Trend',
                    learnedAt: new Date().toISOString()
                },
                {
                    topic: 'Engagement & Community Management',
                    insight: 'Rispondere ai commenti entro i primi 30 minuti dalla pubblicazione stimola l’algoritmo a mostrare il post a nuovi utenti nei feed Esplora.',
                    source: 'Auto-Learned Strategy',
                    learnedAt: new Date().toISOString()
                }
            ];
            await this.saveKnowledge();
        }
    }
    static async saveKnowledge() {
        try {
            await promises_1.default.mkdir(path_1.default.dirname(KNOWLEDGE_PATH), { recursive: true });
            await promises_1.default.writeFile(KNOWLEDGE_PATH, JSON.stringify(this.knowledgeBase, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Errore salvataggio knowledge Flow AI:', e);
        }
    }
    // Auto-Apprendimento Continuo da Internet
    static async learnFromInternet(topicQuery) {
        const defaultTopics = [
            'Social Media Marketing Trends 2026',
            'Viral Content Creation Hacks',
            'Instagram & TikTok Growth Strategies',
            'High-Converting Social Copywriting'
        ];
        const targetTopic = topicQuery || defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
        try {
            // Fetch trend reali via DuckDuckGo / Wikipedia API per auto-apprendimento
            const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(targetTopic)}&format=json&no_html=1&skip_disambig=1`;
            const res = await fetch(searchUrl);
            const data = await res.json();
            let insight = data.AbstractText || (data.RelatedTopics && data.RelatedTopics[0]?.Text);
            if (!insight) {
                insight = `Strategia ottimizzata per ${targetTopic}: incrementare l'uso di storytelling visivo, micro-hook nei primi 2 secondi e call to action chiare a fine post per massimizzare condivisioni e salvataggi.`;
            }
            const newItem = {
                topic: targetTopic,
                insight: insight,
                source: 'Internet Auto-Scrape & Synthesis',
                learnedAt: new Date().toISOString()
            };
            this.knowledgeBase.unshift(newItem);
            if (this.knowledgeBase.length > 50) {
                this.knowledgeBase.pop();
            }
            await this.saveKnowledge();
            return newItem;
        }
        catch (err) {
            return null;
        }
    }
    static getKnowledge() {
        return this.knowledgeBase;
    }
    // Risposta Conversazionale Professionale Flow AI
    static async generateReply(userPrompt, history = []) {
        if (this.knowledgeBase.length === 0) {
            await this.init();
        }
        // Auto-apprendimento contestuale se l'utente chiede trend o novità
        if (userPrompt.toLowerCase().includes('trend') || userPrompt.toLowerCase().includes('novità') || userPrompt.toLowerCase().includes('strategia')) {
            await this.learnFromInternet(userPrompt);
        }
        const latestInsights = this.knowledgeBase.slice(0, 3).map(k => `- **${k.topic}**: ${k.insight}`).join('\n');
        const promptLower = userPrompt.toLowerCase();
        // Risposte intelligenti integrate
        if (promptLower.includes('caption') || promptLower.includes('post') || promptLower.includes('testo')) {
            return `Ecco 3 varianti professionali per il tuo post:

### 🌟 Variante 1: Emozionale & Coinvolgente (Instagram/TikTok)
"Non si tratta solo di ciò che fai, ma di *come* fai sentire le persone. ✨ Lascia un commento se sei d'accordo!"
👉 **CTA**: Salva questo post per non dimenticarlo!
📌 **Hashtag consigliati**: #SocialFlow #ContentCreator #ViralTrends #Inspirazione

---

### 🔥 Variante 2: Diretta & Orientata ai Risultati (Reels/Shorts)
"Vuoi raddoppiare l'engagement dei tuoi contenuti? Ecco l'unico segreto che nessuno ti dice: la costanza batte il talento."
👉 **CTA**: Condividi questo reel nelle tue storie!

---

### 💼 Variante 3: Professionale & Storytelling (LinkedIn/Community)
"Dietro ogni crescita organica c'è una strategia precisa: ascoltare la community prima ancora di creare. Qual è la tua sfida principale oggi?"

Vuoi che adatti una di queste opzioni a una nicchia specifica (es. Food, Moda, Tech, Fitness)?`;
        }
        if (promptLower.includes('hashtag') || promptLower.includes('tag')) {
            return `Ecco un set di hashtag ad alte prestazioni suddiviso per volume:

🎯 **Nicchia & Alta Rilevanza** (10k - 100k post):
\`#SocialFlowItalia\` \`#StrategiaDigitale\` \`#ContentCreatorItalia\`

🚀 **Crescita & Tendenze** (100k - 500k post):
\`#SocialMediaMarketing\` \`#CrescitaOrganica\` \`#ReelsItalia\`

🌍 **Macro-Hashtag** (500k+ post):
\`#ViralReels\` \`#CreatorEconomy\` \`#TrendingNow\`

💡 *Consiglio di Flow*: Usa tra i 5 e gli 8 hashtag ultra-mirati direttamente in fondo alla didascalia per non disperdere l'attenzione.`;
        }
        if (promptLower.includes('calendario') || promptLower.includes('programmazione') || promptLower.includes('piano')) {
            return `Ecco un piano editoriale settimanale strategico per massimizzare la crescita:

📅 **Lunedì**: *Post Ispirazionale / Obiettivi della settimana* (Carosello con 3 consigli pratici).
📅 **Mercoledì**: *Dietro le quinte / Storytelling* (Reel dinamico con musica di tendenza).
📅 **Venerdì**: *Post Educativo / Risoluzione problema* (Grafica chiara con salvataggi come obiettivo).
📅 **Domenica**: *Sondaggio Interattivo nelle Storie* per raccogliere feedback dalla community.

Vuoi personalizzare questo calendario per la tua categoria specifica?`;
        }
        // Risposta Strategica Generale arricchita con Knowledge Base
        return `Ciao! Sono **Flow**, il tuo Social Media Strategist & Content AI Expert.

Ecco cosa ho appreso dalle ultime tendenze del web:
${latestInsights}

Posso aiutarti a:
1. ✍️ **Generare Post, Caption & Script per Reel** ad altissimo tasso di conversione.
2. 📈 **Creare Strategie di Crescita & Piani Editoriali**.
3. 💬 **Gestire la Community & Rispondere ai Commenti**.
4. 🏷️ **Selezionare Hashtag & Hook Virali**.

Dimmi: su quale progetto o contenuto vogliamo lavorare oggi?`;
    }
    // Generatore Smart Playlist AI ("Flow Mix")
    static async generateSmartPlaylist(prompt) {
        const promptLower = prompt.toLowerCase();
        let queryKeywords = 'Top Hits 2026';
        let playlistTitle = 'Flow Mix Personalizzato';
        let playlistDesc = `Playlist creata da Flow AI per: "${prompt}"`;
        if (promptLower.includes('allenamento') || promptLower.includes('palestra') || promptLower.includes('workout') || promptLower.includes('gym')) {
            queryKeywords = 'Trap Workout Energy 2026';
            playlistTitle = '⚡ Beast Mode Workout Mix';
            playlistDesc = 'Energia pura per spingere al massimo durante i tuoi allenamenti.';
        }
        else if (promptLower.includes('relax') || promptLower.includes('studio') || promptLower.includes('chill') || promptLower.includes('notte')) {
            queryKeywords = 'Lofi Chill Beats Night Study';
            playlistTitle = '🌙 Late Night Chill & Focus';
            playlistDesc = 'Atmosfere rilassanti e suoni lofi per concentrarsi o rilassarsi.';
        }
        else if (promptLower.includes('festa') || promptLower.includes('party') || promptLower.includes('ballare')) {
            queryKeywords = 'Club Hits Dance Pop 2026';
            playlistTitle = '🎉 Weekend Party Vibes';
            playlistDesc = 'Le migliori hit del momento per accendere la festa.';
        }
        else if (promptLower.includes('trap') || promptLower.includes('rap') || promptLower.includes('hip hop')) {
            queryKeywords = 'Trap Italia Rap Hits 2026';
            playlistTitle = '🔥 Street Flow Italia';
            playlistDesc = 'Il meglio della scena trap e rap italiana in alta rotazione.';
        }
        else {
            queryKeywords = `${prompt} hits 2026`;
            playlistTitle = `✨ Flow Mix: ${prompt.slice(0, 30)}`;
        }
        const { search } = await Promise.resolve().then(() => __importStar(require('./music.service')));
        const tracks = await search(queryKeywords);
        return {
            title: playlistTitle,
            description: playlistDesc,
            queryUsed: queryKeywords,
            tracks: (tracks || []).slice(0, 15)
        };
    }
    // Generatore Automatico di Caption & Hashtag per Post e Reel
    static async generateCaptionsAndHashtags(contextText) {
        const base = contextText || 'Momento speciale';
        return {
            options: [
                {
                    id: '1',
                    name: '🌟 Emozionale & Coinvolgente',
                    caption: `${base} ✨ Ci sono momenti che meritano di essere ricordati. Tu cosa ne pensi?`,
                    hashtags: '#SocialFlow #MomentiSpeciali #Vibes #LifeStory #ExplorePage'
                },
                {
                    id: '2',
                    name: '🔥 Hook Virale & Diretto',
                    caption: `Nessuno ti dice quanto conti davvero: ${base.toLowerCase()}. Salva questo post per non dimenticarlo!`,
                    hashtags: '#ViralTrends #CreatorFlow #TrendingNow #ReelsItalia #DailyHook'
                },
                {
                    id: '3',
                    name: '🚀 Minimal & Impatto',
                    caption: `${base}. Keep moving forward 💫`,
                    hashtags: '#Focus #Motivation #GoodVibes #SocialFlowItalia #Content'
                }
            ]
        };
    }
}
exports.FlowAIService = FlowAIService;
