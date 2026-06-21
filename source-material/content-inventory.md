# Content inventory — existing LangExtract docs (read-only)

Snapshot of every doc section that already exists in the upstream repo at **v1.5.0** (commit `116c0aa`). One line each on what it covers. This is reference for the docs build — it is NOT shipped in the site. Paths are relative to repo root.

> Source of truth. If a drafted page makes a claim, it should trace back to one of these (or to the API source in `api-inventory.md`). Never invent behavior not present here.

## Top-level README.md (the de-facto current documentation)
The README is the only "real" prose documentation upstream; everything below supplements it. Its sections:

- **Introduction** — one-paragraph definition: a Python library using LLMs to extract structured info from unstructured text per user instructions, with source grounding.
- **Why LangExtract?** — 7 selling points: precise source grounding, reliable structured outputs (schema from few-shot examples), optimized for long documents (chunking + parallelism + multiple passes), interactive visualization, flexible LLM support (Gemini/OpenAI/Ollama), adaptable to any domain via few-shot, leverages LLM world knowledge.
- **Quick Start** — 3 steps: (1) define prompt + one high-quality example, (2) run `lx.extract(...)`, (3) save to JSONL + `lx.visualize(...)` to HTML. Includes the Romeo & Juliet example and notes on grounding (`char_interval=None` for ungrounded extractions).
- **Quick Start › Scaling to Longer Documents** — process full text from a URL with `extraction_passes=3`, `max_workers=20`, `max_char_buffer=1000`.
- **Quick Start › Vertex AI Batch Processing** — one-liner enabling Vertex batch via `language_model_params={"vertexai": True, "batch": {"enabled": True}}`.
- **Installation** — PyPI (`pip install langextract`), venv, from source (`pip install -e ".[dev]"` / `.[test]"`), Docker build/run.
- **API Key Setup for Cloud Models** — sources (AI Studio, Vertex, OpenAI); four setup options: env var `LANGEXTRACT_API_KEY`, `.env` file (recommended), direct `api_key=` arg, Vertex AI service accounts via `language_model_params`.
- **Adding Custom Model Providers** — overview of the plugin system; points to the provider README.
- **Using OpenAI Models** — `pip install langextract[openai]`, `model_id="gpt-4o"`, JSON mode, OpenAI Batch API via `language_model_params`, and `ModelConfig` for OpenAI-compatible endpoints.
- **Using Local LLMs with Ollama** — `model_id="gemma2:2b"`, `model_url="http://localhost:11434"`, quick setup (pull/serve).
- **More Examples** — links: Romeo & Juliet full text, Medication extraction (with medical disclaimer), RadExtract HuggingFace demo.
- **Community Providers** — links to COMMUNITY_PROVIDERS.md and the custom provider example.
- **Contributing / Testing / Development** — CLA requirement, `pytest tests`, `tox`, Ollama integration tests, autoformat (isort + pyink), pre-commit, pylint.
- **Disclaimer** — *"This is not an officially supported Google product."* Apache 2.0; Health AI Developer Foundations terms for health use. **(Fixed fact — must be reflected in the site; never frame as official Google docs.)**

## docs/examples/ (long-form worked examples, Markdown)
- **longer_text_example.md** — full *Romeo and Juliet* from Project Gutenberg (~147k chars / ~44k tokens); parallel processing, sequential passes, performance tuning; cost/quota warnings.
- **medication_examples.md** — clinical text extraction: basic medication NER (name/dosage/route/frequency/duration) and relationship extraction; cites the ML4H 2023 paper (arXiv:2312.02296); medical disclaimer.
- **japanese_extraction.md** — extracting Person/Location/Organization from Japanese; emphasizes `UnicodeTokenizer` for non-spaced languages (character-based segmentation + alignment).
- **batch_api_example.md** — Vertex AI Batch API end-to-end on Shakespeare; ~50% cost savings, small `max_char_buffer=500` to trigger batching; auto-routing, caching, fault tolerance.

## docs/_static/ (assets)
- **logo.svg** — LangExtract logo.
- **romeo_juliet_basic.gif**, **romeo_juliet_full.gif** — visualization animations for the R&J examples.
- **medication_entity.gif**, **medication_entity_re.gif** — visualization animations for medication NER / relationship extraction.

## langextract/providers/README.md (provider system guide)
- **Architecture overview** — router pattern (`router.py`) + factory (`factory.py`) + providers implementing `BaseLanguageModel`.
- **Provider resolution flow** — ASCII diagram: `lx.extract(model_id=...)` → `factory.create_model()` → `router.resolve()` → pattern match → provider class.
- **Explicit provider selection** — three methods via `ModelConfig` (model_id+provider, provider only, auto-detect); name forms (full class name / partial / case-insensitive).
- **Provider types** — (1) core always-available (Gemini, Ollama), (2) built-in with optional deps (OpenAI, needs `[openai]`), (3) external plugins (separate pip packages, entry-point auto-discovery).
- **How provider selection works** + pattern registration example (`@router.register(r'^gemini', ...)`).
- **Passing parameters to providers** — common params handled by `extract` vs provider-specific `**kwargs`.
- **Using the factory for advanced control / direct provider usage.**
- **Creating a new provider** — full checklist: package structure, entry point in `pyproject.toml`, implement `infer()` returning `ScoredOutput`, optional schema support (`from_examples`/`to_provider_config`/`requires_raw_output`), testing, distribution, community submission.
- **Option 1 External plugin (recommended) / Option 2 Built-in (needs core-team approval).**
- **Adding schema support** — schema class + provider wiring example.
- **Environment variables table** — Gemini (`GEMINI_API_KEY`, `LANGEXTRACT_API_KEY`), OpenAI (`OPENAI_API_KEY`, `LANGEXTRACT_API_KEY`), Ollama (`OLLAMA_BASE_URL`).
- **Design principles & Common issues** — provider-not-found, plugin-not-loading, missing deps, schema-not-working, pattern conflicts (each with a solution).

## COMMUNITY_PROVIDERS.md
- **Plugin registry table** — community providers: AWS Bedrock (`langextract-bedrock`), LiteLLM (`langextract-litellm`), Llama.cpp (`langextract-llamacpp`), Outlines (`langextract-outlines`), vLLM (`langextract-vllm`) — each with PyPI name, maintainer, repo, description, tracking issue.
- **How to add your plugin** — PR checklist + row template.
- **Documentation** link + **Safety disclaimer** — community plugins are independently maintained; review code, check feedback, test in isolation.

## examples/ (runnable code, not prose docs)
- **custom_provider_plugin/** — fully-working plugin template: `pyproject.toml` (entry point), `provider.py`, `schema.py` (optional), `test_example_provider.py`. README explains structure; not installed with the package.
- **ollama/** — local-inference examples: `demo_ollama.py`, `docker-compose.yml`, `Dockerfile`, `.dockerignore`; README has run-locally and run-with-Docker quick refs.
- **notebooks/romeo_juliet_extraction.ipynb** — Jupyter notebook walkthrough of the R&J extraction.

## Other root docs (process, not product)
- **CONTRIBUTING.md** — dev setup, testing, PR process, CLA requirement.
- **CITATION.cff** — citation metadata (Zenodo DOI 10.5281/zenodo.17015089).
- **LICENSE** — Apache 2.0.
- **Dockerfile / tox.ini / pyproject.toml / .pre-commit-config.yaml / .pylintrc / autoformat.sh** — build/test/lint tooling.

## Gaps observed (candidate net-new pages for the site — not present upstream)
- No standalone **conceptual** page explaining *how* extraction works end-to-end (chunking → inference → resolve → align → visualize). Currently implied across README + examples.
- No unified **API reference** (signatures live only in source docstrings).
- No **troubleshooting** page (errors are scattered through the provider README's "Common issues" + inline notes).
- No guidance page on **prompt + example design** as a first-class topic (it's the single biggest determinant of output quality, per the README notes).
