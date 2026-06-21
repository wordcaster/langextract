# Content model — FIRST-PASS DRAFT (for John's review)

> Status: **draft preview.** This proposes the *types* of content the site will hold and how they relate. Each non-obvious call is flagged with the alternative I weighed so you can redirect, not rubber-stamp. Review this **first**, before the IA draft.

## The decision in one line
Adopt a **Diátaxis-style four-type model** — Tutorial, Concept, How-to, Reference — and map every page to exactly one type.

**Why this:** LangExtract's existing docs (the README + worked examples) mix "learn it," "understand it," and "look it up" in one scroll. New users get a great first 5 minutes (quickstart) but then fall off a cliff: there's no conceptual layer and no API reference. A typed model forces each gap to become its own page and keeps a reference page from drifting into a tutorial.

**Alternative considered:** a simpler **two-bucket split — "Guides" + "API"** (what most small OSS sites do). Rejected for the first pass because it re-creates the exact problem the README has: "Guides" becomes a junk drawer where concepts and step-by-step tasks blur together. If you prefer lower overhead, this is the easy fallback and I can collapse to it quickly.

---

## The four content types

### 1. Tutorial (learning-oriented)
A guided, start-to-finish path for someone who has never used the tool. One happy path, minimal choices, guaranteed to work.
- **Pages (first pass):** `Quickstart` (the 5-minute extract → visualize loop).
- **Rules:** no alternatives or edge cases; every snippet runs as written; ends with a working artifact (the HTML visualization).
- **Source basis:** README "Quick Start" (README:47-138).

### 2. Concept (understanding-oriented)
Explains *how it works* and *why*, so choices later make sense. No copy-paste task; it builds the mental model.
- **Pages (first pass):** `How extraction works` (chunk → infer → resolve → align → ground → visualize), `Prompts & examples` (why few-shot examples drive everything), `Working with results` (the `AnnotatedDocument`/`Extraction` shape, grounding via `char_interval`).
- **Rules:** diagrams/structure over runnable scripts; link out to the how-to and reference for "now do it."
- **Source basis:** README "Why LangExtract?" (README:37-45), provider README architecture, the grounding notes (README:92-94), `core/data.py`.

### 3. How-to (task-oriented)
Recipes for a specific goal by someone who already knows the basics. "How do I use OpenAI?" "How do I process a long document?"
- **Pages (deferred to a later pass, scoped here so the model is complete):** `Use OpenAI models`, `Use local models with Ollama`, `Process long documents`, `Use Vertex AI batch`, `Write a custom provider`, `Set up your API key`.
- **Rules:** assume context; one goal per page; show the minimal diff from the quickstart.
- **Source basis:** README provider sections + `docs/examples/*` + `providers/README.md`.

### 4. Reference (information-oriented)
Dry, complete, accurate. The thing you look up, not read. Generated/maintained from source.
- **Pages (first pass):** `API reference` (extract, data types, model config, providers, visualization & IO, exceptions). Later: split per module if it grows.
- **Rules:** signatures, types, defaults, raises — all traceable to `source-material/api-inventory.md` (which cites `file:line`). No tutorials hiding in here.
- **Source basis:** `source-material/api-inventory.md`.

---

## How the types relate (the cross-links that make it a system)
```
Tutorial (Quickstart) ──"now understand why"──▶ Concept pages
     │                                              │
     │ "ready for a real task"                      │ "do this specific thing"
     ▼                                              ▼
  How-to recipes ◀───────"look up exact args"──── Reference (API)
     │                                              ▲
     └──────────────"look up exact args"───────────┘
Troubleshooting (cross-cutting) ◀── linked from every type when something breaks
```
- **Quickstart** is the only page that assumes zero knowledge; everything else can link back to it as the prerequisite.
- **Concept** pages never tell you to run something — they hand off to How-to/Reference.
- **Reference** is the leaf: many pages link in, it links out to nothing except sibling reference entries.
- **Troubleshooting** is the one cross-cutting page (see IA draft) — not a fifth type, but a how-to subtype aggregating the "Common issues" scattered across source.

**Flagged call:** I'm treating **Troubleshooting** as a special how-to rather than its own content type. Alternative: make "Reference + Troubleshooting" a combined support section. I went with how-to-subtype because troubleshooting is task-shaped ("I hit error X, fix it"), not lookup-shaped.

---

## Page-type map (first-pass site)
| Page | Type | Status this session | Source |
|---|---|---|---|
| Quickstart | Tutorial | **Drafted** | README:47-138 |
| How extraction works | Concept | **Drafted** | README + provider README + core/data.py |
| Prompts & examples | Concept | **Drafted** | README:55-95, 138 |
| Working with results | Concept | **Drafted** | core/data.py, README:92-94, visualization.py |
| API reference | Reference | **Drafted** | api-inventory.md |
| Use OpenAI / Ollama / long docs / Vertex batch / custom provider / API keys | How-to | Deferred (scoped) | README + examples |
| Troubleshooting | How-to (cross-cutting) | Deferred (scoped) | provider README "Common issues" |

---

## Open questions for John
1. **Four types vs two buckets** — keep Diátaxis, or collapse to Guides + API for a leaner site?
2. **Author presence** — docs prose stays neutral/product (per brief). Do you want a single bylined "About / who built this" page (John Edgar Rojas, 17 years) separate from the neutral docs voice? Not assumed; not drafted.
3. **Depth of the Reference** — full per-provider constructor kwargs, or stop at the public `extract`/`data`/`factory` surface and link to source for provider internals? (See api-inventory §"Coverage note.")
4. **Naming** — "Concept" pages titled as nouns ("How extraction works"); fine, or prefer "Guides"/"Explanation"?
