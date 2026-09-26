export const links = {
  email: 'anirudhgupta281@gmail.com',
  phone: '+91 98137 24305',
  phoneHref: 'tel:+919813724305',
  whatsapp: 'https://wa.me/919813724305',
  // Paste the Google Drive share link here; the Resume buttons appear once it is set.
  resume: '',
  linkedin: 'https://www.linkedin.com/in/anirudhgupta00',
  github: 'https://github.com/AnirudhGupta007',
}

export const stats = [
  { prefix: '', value: 300, decimals: 0, suffix: '', label: 'services an agent can act in' },
  { prefix: '', value: 88.7, decimals: 1, suffix: '%', label: 'action success rate in production' },
  { prefix: '', value: 8, decimals: 0, suffix: '', label: 'specialist agents running in parallel' },
  { prefix: '<', value: 400, decimals: 0, suffix: 'ms', label: 'long-term memory recall' },
]

export const work = [
  {
    company: 'Tipstat',
    role: 'AI Engineer',
    period: 'Sep 2025 — Present',
    place: 'Bengaluru',
    products: [
      {
        name: 'Ozyn',
        tagline: 'Multi-agent AI assistant for business apps',
        url: 'https://ozyn.ai/',
        points: [
          'An assistant that sends emails, updates the CRM and files tickets by picking the right action across 300 connected services, with an 88.7% success rate.',
          'A planner that breaks one plain-English request into an ordered task list run by 8 specialist agents in parallel, with human approval where it matters.',
          'Long-term memory on Neo4j/Graphiti and Qdrant/Mem0: 4-way hybrid search with re-ranking in under 400ms, and memories that fade over 30 days.',
          'A scheduler for recurring and event-triggered jobs that starts tasks in a median 0.3s and never runs a task twice.',
          'A deep-research agent that plans, queries 4 search providers with failover and writes one cited answer; won 6 of 8 head-to-head quality tests.',
        ],
      },
      {
        name: 'Alvoff',
        tagline: 'AI B2B sourcing engine',
        url: 'https://alvoff.ai/',
        points: [
          'Query understanding that decides when to ask a clarifying question instead of guessing: a strict-JSON CLARIFY/CONTINUE gate on every search.',
          'An event-discovery workflow that finds upcoming trade shows across 4 sources, extracts structured records with an LLM, then verifies dates, venue and organizer.',
        ],
      },
      {
        name: 'Heyvision',
        tagline: 'AI email and meeting automation',
        points: [
          'An email agent for 1,000+ users: a 5-stage LangGraph pipeline over a 62-tool Gmail/Outlook MCP, P50 2s, 96% tool-selection accuracy.',
          'Meeting intelligence over 500+ meetings a month (Recall.ai, Deepgram Nova-3, 17-tool MCP) producing action items, sentiment and next steps.',
        ],
      },
    ],
  },
  {
    company: 'iTech Mission',
    role: 'AI/ML Engineer Intern',
    period: 'Mar 2025 — Aug 2025',
    place: 'New Delhi',
    points: [
      'Multi-stage generative pipeline (GPT + Leonardo AI) that cut story-and-image latency from 25s to 8s.',
      'GPU MusicGen-Large service on RunPod behind an async FastAPI backend for 200+ concurrent users, plus a pgvector RAG index over 35,000 tracks.',
    ],
  },
  {
    company: 'Prodigal AI',
    role: 'ML Engineer Intern',
    period: 'Sep 2024 — Dec 2024',
    place: 'Remote',
    points: [
      'Multi-tenant RAG backend on FastAPI and pgvector with sub-second retrieval across 1K+ documents.',
      'Fine-tuned a QLoRA Q4-quantized TinyLlama 1B with Sentence Transformers retrieval.',
    ],
  },
]

export const projects = [
  {
    name: 'Lumen',
    kind: 'Deep research agent',
    blurb:
      'An autonomous research agent that plans, calls 8 tools and returns cited answers in a median 29s at about $0.004 per query. A 3-provider search waterfall, per-tool Redis caching and prompt caching keep it fast and cheap.',
    stack: ['LangGraph', 'Deep Agents', 'FastAPI', 'Redis', 'AWS', 'GitHub Actions'],
    live: 'https://dhpnx11ivp2cy.cloudfront.net/',
    code: 'https://github.com/AnirudhGupta007/deep-research-platform',
  },
  {
    name: 'AutoClip',
    kind: 'Agentic video clipper',
    blurb:
      'Turns long videos into short clips. A LangGraph map-reduce analyzes 2-minute chunks in parallel with Gemini, merges moments, then a deep-agent orchestrator retrieves them from a pgvector index and renders clips with ffmpeg in 18–56s.',
    stack: ['LangGraph', 'Gemini 2.5', 'pgvector', 'BGE-M3', 'ffmpeg', 'AWS'],
    live: 'https://15.206.112.113',
    code: 'https://github.com/AnirudhGupta007/autoclip-ai',
  },
  {
    name: 'DawaSaathi',
    kind: 'Prescription assistant',
    blurb:
      'Photograph a prescription and get a Hindi explanation of every medicine, with audio, plus cheaper generic alternatives from Jan Aushadhi stores. Prescription data stays on the device.',
    stack: ['Vision LLM', 'Hindi TTS', 'React', 'Vercel'],
    live: 'https://dawa-saathi.vercel.app',
  },
  {
    name: 'GeoTimeline',
    kind: 'AI history explorer',
    blurb:
      'Search any historical figure and watch their life play out on an interactive map and timeline, backed by a 3-tier cache of bundled data, Upstash Redis and an LLM.',
    stack: ['React 19', 'Leaflet', 'Motion', 'Upstash Redis', 'Vercel'],
    live: 'https://geotimeline.vercel.app',
    code: 'https://github.com/AnirudhGupta007/MAp',
  },
]

export const stack = [
  { group: 'Agents & LLMs', items: ['LangGraph', 'LangChain', 'LlamaIndex', 'MCP / FastMCP', 'Multi-agent systems', 'ReAct', 'Agentic RAG', 'Evals', 'Guardrails', 'Human-in-the-loop', 'LiteLLM', 'OpenRouter', 'LangSmith'] },
  { group: 'Memory & Retrieval', items: ['Qdrant', 'pgvector', 'FAISS', 'Neo4j', 'Graphiti', 'Mem0', 'Embeddings', 'Semantic search'] },
  { group: 'Backend & Cloud', items: ['Python', 'FastAPI', 'SQL', 'PostgreSQL', 'Redis', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'GCP Vertex AI', 'Kafka', 'NATS', 'OpenTelemetry'] },
  { group: 'ML', items: ['PyTorch', 'HuggingFace', 'Fine-tuning', 'QLoRA', 'Quantization', 'Multimodal'] },
]
