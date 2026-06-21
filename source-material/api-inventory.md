# API inventory — LangExtract public surface (read from source)

Read directly from package source at **v1.5.0** (commit `116c0aa`). Every entry cites `path:line` so John (and the next agent) can verify. **Nothing here is invented.** Where source behavior is subtle, the note quotes the docstring.

Conventions:
- "Public" = reachable from `import langextract as lx` per `langextract/__init__.py` `__all__` (`extraction.py` `extract`, `visualization.py` `visualize`, plus lazily-exposed submodules: `data`, `io`, `factory`, `providers`, `schema`, `inference`, `resolver`, `prompting`, `annotation`, `exceptions`, `core`, `plugins`). Ref: `langextract/__init__.py:30-48`.
- `langextract.data` and `langextract.exceptions` are **back-compat shims** re-exporting from `langextract.core.*`. Real definitions cited at their core location. Refs: `langextract/data.py:25`, `langextract/exceptions.py:24-33`.

---

## 1. `lx.extract(...)` — the main entry point
**Source:** `langextract/extraction.py:36-65` (signature), `:66-180` (docstring), `:181-387` (body).

```python
extract(
    text_or_documents: str | Iterable[data.Document],
    prompt_description: str | None = None,
    examples: typing.Sequence[typing.Any] | None = None,
    model_id: str = "gemini-3.5-flash",
    api_key: str | None = None,
    language_model_type: typing.Type[typing.Any] | None = None,   # DEPRECATED, removed v2.0.0
    format_type: typing.Any = None,                               # -> data.FormatType.JSON if None
    max_char_buffer: int = 1000,
    temperature: float | None = None,
    fence_output: bool | None = None,
    use_schema_constraints: bool = True,
    batch_length: int = 10,
    max_workers: int = 10,
    additional_context: str | None = None,
    resolver_params: dict | None = None,
    language_model_params: dict | None = None,
    debug: bool = False,
    model_url: str | None = None,
    extraction_passes: int = 1,
    context_window_chars: int | None = None,
    config: typing.Any = None,                                    # factory.ModelConfig
    model: typing.Any = None,                                     # pre-built BaseLanguageModel
    *,
    fetch_urls: bool = False,                                     # keyword-only; SSRF risk, see note
    prompt_validation_level: PromptValidationLevel = WARNING,
    prompt_validation_strict: bool = False,
    show_progress: bool = True,
    tokenizer: Tokenizer | None = None,
) -> list[data.AnnotatedDocument] | data.AnnotatedDocument
```

**Returns** (`extraction.py:65`, `:169-172`): an `AnnotatedDocument` when input is a single string/URL; a `list[AnnotatedDocument]` when input is an iterable of `Document`.

**Raises** (`extraction.py:174-179`): `ValueError` if `examples` is None/empty (`:181-185`); `ValueError` if no API key found; `requests.RequestException` if `fetch_urls=True` and download fails; `pv.PromptAlignmentError` if validation fails in ERROR mode.

**Parameter notes grounded in the docstring/body:**
- `model_id` default is **`"gemini-3.5-flash"`** (`:40`). Unknown/custom ids need explicit `config=ModelConfig(...)` (`:89-92`).
- Precedence (`:152-156`, body `:237-304`): `model` > `config` > (`model_id`/`api_key`/`language_model_type`). Passing `model` with `use_schema_constraints=True` warns it's ignored (`:241-247`).
- `max_char_buffer=1000` — chars per inference chunk (`:98`).
- `batch_length=10` / `max_workers=10` — effective parallelism is `min(batch_length, max_workers)`; a warning fires when `batch_length < max_workers` (`:112-116`, `:215-221`).
- `extraction_passes=1` — `>1` runs independent passes and merges non-overlapping results (first pass wins overlaps); reprocesses tokens → higher cost (`:141-147`).
- `context_window_chars=None` — chars of previous chunk carried as context for coreference across chunk boundaries (`:148-151`).
- `fence_output=None` — auto-decided from provider schema; `True`/`False` forces fenced / raw output (`:102-108`).
- `use_schema_constraints=True` — enables structured outputs for supported models (`:109-110`).
- `fetch_urls=False` (keyword-only) — when True, http(s) strings are fetched via `requests.get` **with no sanitization (SSRF risk)**; only enable for trusted URLs in a sandbox (`:157-161`, body `:223-228`).
- `resolver_params` (dict) keys (`:119-132`): `extraction_index_suffix`, `suppress_parse_errors` (default True in extract), and alignment keys `enable_fuzzy_alignment` (True), `fuzzy_alignment_threshold` (0.75), `fuzzy_alignment_algorithm` ("lcs"; "legacy" deprecated), `fuzzy_alignment_min_density` (1/3), `accept_match_lesser` (True). Alignment keys enumerated in `resolver.py:69-76` (`ALIGNMENT_PARAM_KEYS`).
- `language_model_params` (dict) — provider constructor kwargs, e.g. Gemini `max_retries`/`retry_delay`/`max_retry_delay`/`http_options`; also the Vertex/OpenAI `batch` config and `vertexai`/`project`/`location` (`:133-135`; README batch sections).
- **Deprecations:** `language_model_type` → use `model`/`config`/`model_id` (FutureWarning, removed v2.0.0, body `:264-270`); `gemini_schema` inside `language_model_params` is ignored with a FutureWarning (`:281-290`).

---

## 2. Core data types — `lx.data.*`
**Source:** `langextract/core/data.py` (re-exported via `langextract/data.py:25`). `__all__` at `core/data.py:30-40`.

### `ExampleData` — `core/data.py:260-270`
```python
@dataclass
class ExampleData:
    text: str
    extractions: list[Extraction] = field(default_factory=list)
```
A single few-shot example: input `text` + the `Extraction`s expected from it.

### `Extraction` — `core/data.py:63-126` (custom `__init__`, keyword-only after the first two positional args)
```python
Extraction(
    extraction_class: str,            # positional
    extraction_text: str,             # positional
    *,
    token_interval: TokenInterval | None = None,
    char_interval: CharInterval | None = None,
    alignment_status: AlignmentStatus | None = None,
    extraction_index: int | None = None,
    group_index: int | None = None,
    description: str | None = None,
    attributes: dict[str, str | list[str]] | None = None,
)
```
- `char_interval` is **None when the extraction could not be located in the source text** (`:74-76`) — the grounding signal. Filter grounded results with `[e for e in result.extractions if e.char_interval]` (README:94).
- `attributes` carry contextual key/values (string or list of strings).
- `token_interval` is exposed via a property (`:120-126`).

### `Document` — `core/data.py:129-202` (custom `__init__`, keyword-only extras)
```python
Document(text: str, *, document_id: str | None = None, additional_context: str | None = None)
```
- `document_id` auto-generates `doc_<8 hex>` on first access if unset (`:161-166`).
- `tokenized_text` is a lazily-computed property (`:173-177`). `with_additional_context(...)` returns a copy preserving id + cached tokenization (`:183-202`).

### `AnnotatedDocument` — `core/data.py:205-257` (keyword-only `__init__`)
```python
AnnotatedDocument(*, document_id: str | None = None,
                  extractions: list[Extraction] | None = None,
                  text: str | None = None)
```
The result object: `extractions`, `text`, lazy `tokenized_text`, auto `document_id`.

### `CharInterval` — `core/data.py:50-60`
```python
@dataclass
class CharInterval:
    start_pos: int | None = None   # inclusive
    end_pos: int | None = None     # exclusive
```

### `AlignmentStatus` (enum) — `core/data.py:43-47`
`MATCH_EXACT`, `MATCH_GREATER`, `MATCH_LESSER`, `MATCH_FUZZY`.

### `FormatType` (enum) — `core/types.py:30-34` (aliased in `core/data.py:25`)
`JSON = 'json'`, `YAML = 'yaml'`.

### Module constants — `core/data.py:27-28`
`EXTRACTIONS_KEY = "extractions"`, `ATTRIBUTE_SUFFIX = "_attributes"`.

---

## 3. Model configuration & factory — `lx.factory.*`
**Source:** `langextract/factory.py`.

### `ModelConfig` (frozen dataclass) — `factory.py:35-50`
```python
@dataclass(slots=True, frozen=True)
class ModelConfig:
    model_id: str | None = None
    provider: str | None = None          # provider name or class name, to disambiguate
    provider_kwargs: dict[str, Any] = field(default_factory=dict)
```

### `create_model(...)` — `factory.py:103-174`
```python
create_model(config: ModelConfig,
             examples: Sequence[Any] | None = None,
             use_schema_constraints: bool = False,
             fence_output: bool | None = None,
             return_fence_output: bool = False)
  -> BaseLanguageModel | tuple[BaseLanguageModel, bool]
```
Raises `ValueError` if neither `model_id` nor `provider` given (`:139-140`); wraps provider load/instantiation failures in `exceptions.InferenceConfigError` (`:150-155`, `:171-174`). Loads builtins + plugins before resolving (`:142-143`).

### `create_model_from_id(...)` — `factory.py:177-195`
```python
create_model_from_id(model_id: str | None = None, provider: str | None = None, **provider_kwargs) -> BaseLanguageModel
```
Convenience wrapper building a `ModelConfig` and calling `create_model`.

### Environment-variable key resolution — `factory.py:53-100`
Auto-fills `api_key` when absent and not Vertex: Gemini ids read `GEMINI_API_KEY` then `LANGEXTRACT_API_KEY`; `gpt` ids read `OPENAI_API_KEY` then `LANGEXTRACT_API_KEY` (`:69-93`). Ollama ids default `base_url` to `OLLAMA_BASE_URL` or `http://localhost:11434` (`:95-98`).

---

## 4. Provider / router system — `lx.providers.*`
**Source:** `langextract/providers/__init__.py`, `providers/router.py`, `providers/patterns.py`, `providers/builtin_registry.py`.

### Public package surface — `providers/__init__.py:33-42`
`gemini`, `openai`, `ollama`, `router`, `registry` (back-compat alias for `router`, `:31`), `schemas`, `load_plugins_once`, `load_builtins_once`.

### Router functions — `providers/router.py`
- `register(*patterns, priority=0)` — decorator registering a provider class (`:108-135`).
- `register_lazy(*patterns, target="module:Class", priority=0)` — register by import path without importing deps (`:83-105`).
- `resolve(model_id) -> provider class` — highest-priority matching pattern wins; raises `InferenceConfigError` listing available patterns if none match (`:138-166`).
- `resolve_provider(provider_name) -> provider class` — match by exact pattern, then class-name substring (case-insensitive); raises `InferenceConfigError` if none (`:169-214`).
- `list_providers()` / `list_entries()` — debugging: patterns + priorities (`:226-244`).
- `clear()` — reset registry (testing) (`:217-223`).

### Built-in model-ID patterns — `providers/patterns.py` (all priority 10)
- **Gemini** (`patterns.py:22`): `^gemini` → `GeminiLanguageModel`.
- **OpenAI** (`patterns.py:26-31`): `^gpt-4`, `^gpt4\.`, `^gpt-5`, `^gpt5\.` → `OpenAILanguageModel` (requires `pip install langextract[openai]`).
- **Ollama** (`patterns.py:35-63`): `^gemma`, `^llama`, `^mistral`, `^mixtral`, `^phi`, `^qwen`, `^deepseek`, `^command-r`, `^starcoder`, `^codellama`, `^codegemma`, `^tinyllama`, `^wizardcoder`, `^gpt-oss`, plus HuggingFace-style prefixes (`^meta-llama/[Ll]lama`, `^google/gemma`, `^Qwen/`, `^deepseek-ai/`, etc.) → `OllamaLanguageModel`.
- Built-in registration table: `providers/builtin_registry.py:35-51`. Entry points also declared in `pyproject.toml:94-97`.

### Plugin loading — `providers/__init__.py`
- `load_builtins_once()` (`:49-71`) — idempotent registration of built-ins.
- `load_plugins_once()` (`:74-142`) — discovers third-party providers via the `langextract.providers` entry-point group; disabled by `LANGEXTRACT_DISABLE_PLUGINS=1` (`:84-91`). Default plugin priority 20 (`:124-128`).

### Provider environment variables (from `providers/README.md:540-544`, confirmed in `factory.py`)
| Provider | Env vars (priority order) |
|---|---|
| Gemini | `GEMINI_API_KEY`, `LANGEXTRACT_API_KEY` |
| OpenAI | `OPENAI_API_KEY`, `LANGEXTRACT_API_KEY` |
| Ollama | `OLLAMA_BASE_URL` (default `http://localhost:11434`) |

---

## 5. Visualization — `lx.visualize(...)`
**Source:** `langextract/visualization.py:554-629`.
```python
visualize(data_source: AnnotatedDocument | str | pathlib.Path,
          *,
          animation_speed: float = 1.0,
          show_legend: bool = True,
          gif_optimized: bool = True) -> IPython.display.HTML | str
```
- Accepts an `AnnotatedDocument` or a path to a JSONL file (loads the **first** document, `:576-585`).
- Returns an `IPython.display.HTML` object in Jupyter, else the raw HTML **string** (`:627-629`). Self-contained HTML (inline CSS+JS) with animated, navigable entity highlights and a class-color legend.
- Raises `FileNotFoundError` (missing file `:578-579`), `ValueError` (no docs / no text / no extractions `:582-593`).
- Only extractions with a valid `char_interval` are rendered (`:596`, `_filter_valid_extractions` `:196-208`).

---

## 6. Input / output — `lx.io.*`
**Source:** `langextract/io.py`.

- `save_annotated_documents(annotated_documents, output_dir=None, output_name='data.jsonl', show_progress=True)` — writes JSONL; defaults dir to `test_output/`; raises `InvalidDatasetError` if nothing written (`io.py:85-141`). `output_name` is **not** path-sanitized — validate untrusted input (`:97-100`).
- `load_annotated_documents_jsonl(jsonl_path, show_progress=True) -> Iterator[AnnotatedDocument]` — reads JSONL back (`io.py:144-192`).
- `download_text_from_url(url, timeout=30, show_progress=True, chunk_size=8192) -> str` — streamed download with decode fallbacks; raises `requests.RequestException` / `ValueError` (`io.py:265-353`).
- `is_url(text) -> bool` — http(s) URL validation (`io.py:226-262`).
- `Dataset` (frozen ABC dataclass) + `.load(delimiter=',')` — CSV → `Document` iterator (`io.py:42-82`).
- `InvalidDatasetError(LangExtractError)` (`io.py:38-39`).
- `DEFAULT_TIMEOUT_SECONDS = 30` (`io.py:35`).

---

## 7. Exceptions — `lx.exceptions.*`
**Source:** `langextract/core/exceptions.py` (re-exported via `langextract/exceptions.py`). Core `__all__`: `core/exceptions.py:23-35`.

Hierarchy (all inherit `LangExtractError`, the base for catch-all handling, `:38-44`):
- `LangExtractError` — base.
  - `InferenceError` (`:47-48`)
    - `InferenceConfigError` (`:51-56`) — missing API keys, invalid model ids, provider instantiation/config failures.
    - `InferenceRuntimeError` (`:59-83`) — API/network failures during inference; carries `.original` + `.provider`.
  - `InferenceOutputError` (`:85-90`) — no scored outputs from the model; carries `.message`.
  - `InvalidDocumentError` (`:93-97`) — duplicate ids / malformed documents.
  - `InternalError` (`:100-104`) — LangExtract-internal invariant violation (a bug in the library).
  - `ProviderError` (`:107-108`) — provider/backend-specific error.
  - `SchemaError` (`:111-112`) — schema validation/serialization error.
  - `FormatError` (`:115-116`) → `FormatParseError` (`:119-128`) — fence/JSON/YAML/wrapper parse failures.

> Note: the back-compat `langextract.exceptions` shim re-exports a subset (`LangExtractError`, `InferenceError`, `InferenceConfigError`, `InferenceRuntimeError`, `InferenceOutputError`, `ProviderError`, `SchemaError`; `exceptions.py:35-43`). `InternalError`, `InvalidDocumentError`, `FormatError`, `FormatParseError` are in `core.exceptions` only.

---

## 8. Inference output type — `ScoredOutput`
**Source:** `langextract/core/types.py:54-66`.
```python
@dataclass(frozen=True)
class ScoredOutput:
    score: float | None = None
    output: str | None = None
```
What a provider's `infer()` yields per prompt (lists of `ScoredOutput`). Also in `core/types.py`: `Constraint` (`:43-51`), `ConstraintType` enum (`:37-40`, only `NONE`).

---

## 9. Package metadata (`pyproject.toml`)
- Version **1.5.0** (`pyproject.toml:22`); `requires-python = ">=3.10"` (`:25`); Apache-2.0 (`:26`); author Akshay Goel (`:27-29`).
- Core deps include `google-genai>=1.39.0`, `pandas`, `pydantic`, `requests`, `tqdm`, `PyYAML`, `numpy`, `absl-py`, `python-dotenv` (`:30-48`).
- Optional extras (`:58-78`): `openai` / `all` (`openai>=1.50.0`), `dev`, `test`, `notebook` (`ipython`, `notebook`).
- Provider entry points (`:94-97`): `gemini`, `ollama`, `openai`.

---

## Coverage / completeness note for John
**Documented above (first pass):** the high-traffic public surface — `extract`, `visualize`, all `data` types, `io`, `factory`/`ModelConfig`, the provider/router system + patterns, exceptions, `ScoredOutput`.
**Read from source but only summarized (candidates for deeper reference pages):** `core/schema.py` / `core/format_handler.py` (schema + fence internals), `resolver.py` (alignment algorithm), `chunking.py`, `tokenizer.py` / `UnicodeTokenizer` (used in the Japanese example), `prompting.py`, `annotation.py` (the `Annotator` that `extract` drives), `prompt_validation.py` (`PromptValidationLevel`, `AlignmentPolicy`). Per-provider constructor kwargs (`providers/gemini.py`, `openai.py`, `ollama.py`) not yet enumerated — flag for John whether the reference should go that deep or link to provider source.
