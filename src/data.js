export const availability = 'Open to AI Engineer roles · Remote or on-site'

export const links = {
  email: 'anirudhgupta281@gmail.com',
  phone: '+91 98137 24305',
  phoneHref: 'tel:+919813724305',
  whatsapp: 'https://wa.me/919813724305',
  // Paste the Google Drive share link here; the Resume buttons appear once it is set.
  resume: 'https://drive.google.com/uc?export=download&id=1dP-wODlYYSpsmZu4krWdMZvFB3ZLDbov',
  linkedin: 'https://www.linkedin.com/in/anirudhgupta00',
  github: 'https://github.com/AnirudhGupta007',
}

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
        intro:
          'Sole AI engineer on a 3-person team. I built the layers that take a plain-English request and turn it into finished work across business apps, with the user approving risky steps.',
        points: [
          'Receptionist and context layer: an LLM triages every message into the fast, deep or multi-step path and builds the turn\'s context in one batched memory call instead of 4 (−75%). Fast-lane search runs 80–95% faster.',
          'Planner: splits a big request into steps, runs up to 3 independent steps at once and waits on the ones that depend on others. Cheap GLM Flash plans routine work; the heavier GLM handles only the hard cases.',
          'Executor (LangChain + Jev): replaced LLM-based tool picking with Jev, a typed decision model. Model calls fell 43%, latency 35%, cost ~45% and tool-schema prompt size 48–71%, while correct-tool rate rose from 89% to 100%.',
          'MCP server (FastMCP): 599 tools across 16 native apps and 222 Composio apps, with JWT auth, tenant isolation, rate limiting, audit logging, idempotency and human approval on every write.',
          'Browser agent (Anchor): Jev picks page elements, GLM plans, an OpenAI model reads screenshots and capped Holo3 vision is the fallback. Passed 80% of 15 hard real-site tasks (shopping, travel, payments) against 60–73% baselines, with 0% safety violations.',
          'Deep research (Deep Agents + Monid.ai): fixed a framework overhead that consumed ~50% of tool calls, so that budget now goes to searching and reading. Blind-judged answer quality 74.5%, 9% above the next-best model.',
          'Memory (Neo4j/Graphiti + Qdrant/Mem0): one batched recall replaced four per-turn lookups, a 75% cut in memory calls.',
        ],
      },
      {
        name: 'Alvoff',
        tagline: 'AI B2B sourcing engine',
        url: 'https://alvoff.ai/',
        points: [
          'Jev, the query router: a fine-tuned router that classifies every buyer query across 25 intents and returns a strict-JSON CLARIFY/CONTINUE decision before search, cutting routing cost from $3,450 to $79 per 1M calls.',
          'Conversation memory and flow: summarises older turns to keep prompts bounded, persists buyer preferences across sessions and resolves follow-ups like "cheaper ones" against earlier results.',
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

// Case studies, each framed around its goal. Every number is measured, not estimated.
export const projects = [
  {
    name: 'AutoClip',
    kind: 'Agentic video clipper',
    media: { poster: '/demos/autoclip.jpg', video: '/demos/autoclip.webm' },
    goal: 'Turn a long video into the short clips a human editor would actually pick, and prove it with an eval instead of a demo.',
    how: 'You chat with the video: "4 funny clips under 30 seconds, 9:16". A deep-agent orchestrator splits the video into 2-minute chunks analysed in parallel, indexes every moment in pgvector so it can search by meaning, then cuts, reframes and captions the clips with ffmpeg.',
    hard: 'Knowing whether the clips are any good. I hand-labelled the best moments in a 98-minute film and a conference talk, then fixed the pipeline against those labels instead of trusting how the output looked.',
    result: [
      'Moments found in the film: 37% → 83%',
      'Transcript coverage: 3% → 96%',
      "Clips matching a human's top 3: 0/6 → 2/6",
      'Full analysis of a 98-minute film: about $0.59',
    ],
    stack: ['LangGraph', 'Deep Agents', 'LlamaIndex', 'pgvector', 'Gemini 2.5', 'ffmpeg', 'AWS'],
    live: 'https://15.206.112.113',
    code: 'https://github.com/AnirudhGupta007/autoclip-ai',
  },
  {
    name: 'Proofwork',
    kind: 'AI hiring assessments',
    media: { poster: '/demos/proofwork.jpg' },
    goal: 'Replace trivia-heavy coding interviews with real work trials, and give reviewers evidence instead of a gut feeling.',
    how: 'Paste a job description and an LLM generates a role-specific work trial. The candidate gets an invite link and works in a hosted dev workspace with an AI coding agent and a live app preview. On submit, the diff, tests, commit history and logs are evaluated into a scored PDF report.',
    hard: 'Judging how someone works with an AI agent, not just the final code: capturing commit checkpoints, test runs and agent activity as evidence, keeping hidden evals out of the candidate repo, and letting a human override the score.',
    result: [
      'Full loop: job description → work trial → workspace → scored report',
      'Candidate comparison table and custom scoring rubrics',
      'Human review and override on every report',
    ],
    stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Daytona', 'OpenCode', 'GPT', 'DeepSeek'],
    code: 'https://github.com/AnirudhGupta007/proofwork',
  },
  {
    name: 'Lumen',
    kind: 'Deep research agent',
    media: { poster: '/demos/lumen.jpg', video: '/demos/lumen.webm' },
    goal: 'Answer research questions with current facts and show exactly where each one came from, cheaply enough to run every day.',
    how: 'A LangGraph deep agent plans the question, calls 8 tools through a 3-provider search waterfall and writes one answer with citations.',
    hard: 'Speed and cost on a multi-step agent: per-tool Redis caching, prompt caching and provider failover, deployed on AWS through GitHub Actions.',
    result: ['Median 29 seconds per answer', 'About $0.004 per query'],
    stack: ['LangGraph', 'Deep Agents', 'FastAPI', 'Redis', 'AWS', 'GitHub Actions'],
    code: 'https://github.com/AnirudhGupta007/deep-research-platform',
  },
  {
    name: 'DawaSaathi',
    kind: 'Prescription assistant',
    media: { poster: '/demos/dawasaathi.jpg', video: '/demos/dawasaathi.webm' },
    goal: 'Help patients understand their prescription in their own language, and spend less on it.',
    how: 'Photograph a prescription. A vision LLM reads it and explains every medicine in Hindi, with audio, alongside cheaper generic alternatives from Jan Aushadhi stores.',
    hard: 'Keeping medical data private: the prescription stays on the device.',
    result: ['Live on Vercel', 'Prescription data stays on the device'],
    stack: ['Vision LLM', 'Hindi TTS', 'React', 'Vercel'],
    live: 'https://dawa-saathi.vercel.app',
  },
  {
    name: 'GeoTimeline',
    kind: 'AI history explorer',
    media: { poster: '/demos/geotimeline.jpg', video: '/demos/geotimeline.webm' },
    goal: "Make a historical figure's life easy to follow by showing it on a map instead of a list of dates.",
    how: 'Search a name and watch where that person lived, travelled and worked play out on an interactive map and timeline.',
    hard: 'Answering fast without calling the LLM every time: a 3-tier cache of bundled data, Upstash Redis, then the LLM.',
    result: ['Live on Vercel'],
    stack: ['React 19', 'Leaflet', 'Motion', 'Upstash Redis', 'Vercel'],
    live: 'https://geotimeline.vercel.app',
    code: 'https://github.com/AnirudhGupta007/MAp',
  },
]

// Three quick facts under the intro.
export const facts = [
  { value: '599', label: 'tools across 238 apps on the MCP server I built' },
  { value: '89% → 100%', label: 'correct-tool rate after replacing LLM tool picking' },
  { value: '4', label: 'side projects shipped end to end' },
]

export const stack = [
  { group: 'AI & Agents', items: ['LangGraph', 'LangChain', 'LlamaIndex', 'MCP', 'Multi-agent systems', 'RAG', 'Evals & guardrails'] },
  { group: 'Memory & Search', items: ['Qdrant', 'pgvector', 'FAISS', 'Neo4j', 'Mem0', 'Embeddings'] },
  { group: 'Backend & Cloud', items: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP'] },
  { group: 'ML', items: ['PyTorch', 'HuggingFace', 'Fine-tuning', 'QLoRA', 'Quantization'] },
]
