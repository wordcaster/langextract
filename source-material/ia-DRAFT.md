# Information architecture — FIRST-PASS DRAFT (for John's review)

> Status: **draft preview.** Navigation, sidebar, and the developer journey, built on the content model. Each non-obvious call is flagged with its alternative. Review **after** the content model.

## The developer journey this IA is built around
A developer hits the docs in one of three states. The sidebar order maps to that arc:

> **"What is this?"** → **"How do I start?"** → **"How do I do X / build for real?"** → **"What exactly does this function do?"** → **"Something broke."**

```
Understand            Start              Build                 Reference         Troubleshoot
(Concept)        (Tutorial)          (How-to)              (Reference)        (How-to/X-cut)
What is this  →  Quickstart   →   Use OpenAI / Ollama  →   API reference  →   Troubleshooting
Why use it       (5-min loop)     Long docs / batch        (look up args)     (fix the error)
How it works                      Custom provider
```

**Why this order:** it matches how people actually arrive — most land from the README/PyPI knowing nothing, want a win fast (Quickstart), then either go deep on a task or look something up. Putting **Reference near the end** keeps it out of a newcomer's way but one click from anyone who knows what they want.

**Alternative considered:** **provider-first IA** (organize the whole site by Gemini / OpenAI / Ollama). Rejected: the default path is Gemini and most users never change it; leading with provider choice front-loads a decision newcomers don't have yet. Provider differences live in How-to recipes instead.

---

## Sidebar structure (first pass)
What's bracketed `[deferred]` is scoped now but not drafted this session — shown so the shape is reviewable.

```
LangExtract docs
│
├─ Understand
│   ├─ Introduction / What is LangExtract?      (Concept)   [deferred — README intro]
│   ├─ How extraction works                      (Concept)   ✅ drafted
│   └─ Why LangExtract?                           (Concept)   [deferred — README "Why"]
│
├─ Get started
│   ├─ Quickstart                                 (Tutorial)  ✅ drafted
│   └─ Install & API keys                         (How-to)    [deferred]
│
├─ Core concepts
│   ├─ Prompts & examples                         (Concept)   ✅ drafted
│   └─ Working with results                       (Concept)   ✅ drafted
│
├─ How-to guides                                              [deferred — all scoped]
│   ├─ Use OpenAI models
│   ├─ Use local models with Ollama
│   ├─ Process long documents
│   ├─ Vertex AI batch processing
│   └─ Write a custom provider
│
├─ Reference
│   └─ API reference                              (Reference) ✅ drafted
│
└─ Troubleshooting                               (How-to/X-cut)[deferred]
```

**Flagged call — "Core concepts" split from "Understand":** I separated the *orienting* concepts (what/why/how-it-works, read before starting) from the *working* concepts (prompts, results, read while building). Alternative: one flat "Concepts" group. I split them because "Prompts & examples" and "Working with results" are things you return to mid-build, not onboarding reading — different moment, different sidebar neighborhood. Easy to merge if you find it over-engineered.

**Flagged call — Quickstart in its own "Get started," not under "Understand":** keeps the one guaranteed-to-work path visually distinct from explanatory reading. Alternative: top-level single "Quickstart" link above all groups (even more prominent). Reasonable; say the word.

---

## Top nav (navbar) — first pass
- **Docs** (the sidebar above) — primary.
- **API reference** — a second navbar link jumping straight to Reference, for returning users who skip the funnel.
- **GitHub** — link to the fork / upstream (TBD which; see open questions).
- *(Default Docusaurus "Blog" — see decision below.)*

**Alternative considered:** single "Docs" entry only. Added the direct "API reference" link because returning developers' #1 navigation is "take me to the function signature," and burying it five groups deep punishes them.

---

## Decisions on the Docusaurus scaffold defaults
- **Blog:** the scaffold ships a demo blog. **First-pass call: keep it installed but drop it from the navbar/footer** so it doesn't imply an active blog the project doesn't have. Alternative: delete the blog plugin entirely (cleaner, but irreversible-ish and the brief mentions a future article calendar — the blog may become the home for the "build log" article). I left it dormant rather than deleting, pending John's article plans. **Not yet changed in config this session — flagged for the next pass to avoid touching scaffold config before the content model is approved.**
- **Landing page:** the scaffold's `src/pages/index.js` splash is still the default. First pass leaves it; a real homepage (hero + "not an official Google product" disclaimer + jump links) is a fast follow once IA is approved.
- **Footer:** must carry the **"not an officially supported Google product"** disclaimer (fixed fact). Flagged to add when we touch config.

---

## URL / slug plan (first pass)
Docusaurus derives routes from `docs/` paths. Proposed slugs:
- `/docs/quickstart`
- `/docs/concepts/how-extraction-works`
- `/docs/concepts/prompts-and-examples`
- `/docs/concepts/working-with-results`
- `/docs/reference/api`

**Note:** this session I placed the drafted pages with explicit `sidebar_position` front-matter and a simple folder layout under `docs/` so the sidebar autogenerates in journey order. The full grouped sidebar above (with deferred pages) is the target; the current autogen sidebar is a subset reflecting only what's drafted. Swapping to a hand-authored `sidebars.js` matching the structure above is a small follow-up once the page set stabilizes.

---

## Open questions for John
1. **Group granularity:** Understand / Get started / Core concepts / How-to / Reference / Troubleshooting (6 groups) — right altitude, or too many for the current page count? Could merge to 3 (Learn / Build / Reference).
2. **Blog:** dormant (my pick), deleted, or repurposed for the build-log article series?
3. **GitHub link target:** point the navbar at `wordcaster/langextract` (the fork) or upstream `google/langextract`? (Affects how "official-adjacent" the site reads.)
4. **Autogenerated vs hand-authored sidebar:** keep autogen (simple, position-driven) or switch to explicit `sidebars.js` now to lock the grouped structure?
