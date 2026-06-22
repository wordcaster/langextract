---
sidebar_position: 1
title: API reference
---

# API reference

The public API reachable from `import langextract as lx`. Signatures, types,
and defaults below are drawn from the LangExtract source at version **1.5.0**.

The top level exposes two convenience functions (`lx.extract` and
`lx.visualize`) plus submodules accessed lazily: `lx.data`, `lx.io`,
`lx.factory`, `lx.providers`, `lx.exceptions`, and others.

---

## 1. lx.extract

The main entry point.

```python
lx.extract(
    text_or_documents,            # str | Iterable[Document]
    prompt_description=None,      # str | None
    examples=None,                # Sequence[ExampleData] | None  (REQUIRED in practice)
    model_id="gemini-3.5-flash",  # str
    api_key=None,                 # str | None
    language_model_type=None,     # DEPRECATED — removed in v2.0.0
    format_type=None,             # FormatType; defaults to FormatType.JSON
    max_char_buffer=1000,         # int
    temperature=None,             # float | None
    fence_output=None,            # bool | None
    use_schema_constraints=True,  # bool
    batch_length=10,              # int
    max_workers=10,               # int
    additional_context=None,      # str | None
    resolver_params=None,         # dict | None
    language_model_params=None,   # dict | None
    debug=False,                  # bool
    model_url=None,               # str | None
    extraction_passes=1,          # int
    context_window_chars=None,    # int | None
    config=None,                  # factory.ModelConfig | None
    model=None,                   # a pre-built language model instance
    *,
    fetch_urls=False,             # bool (keyword-only)
    prompt_validation_level=PromptValidationLevel.WARNING,
    prompt_validation_strict=False,
    show_progress=True,
    tokenizer=None,               # Tokenizer | None
)
```

**Returns:** an `AnnotatedDocument` when `text_or_documents` is a string or URL;
a `list[AnnotatedDocument]` when it is an iterable of `Document`.

**Raises:**

- `ValueError`: if `examples` is `None` or empty.
- `ValueError`: if no API key is provided or found in the environment.
- `requests.RequestException`: if `fetch_urls=True` and the download fails.
- `PromptAlignmentError`: if prompt validation fails in `ERROR` mode.

### Key parameters

| Parameter | Default | Notes |
|---|---|---|
| `text_or_documents` | (required) | A string, an http(s) URL (fetched only if `fetch_urls=True`), or an iterable of `Document`. |
| `prompt_description` | `None` | Instructions for what to extract. |
| `examples` | `None` | List of `ExampleData`. Required: extraction raises without at least one. |
| `model_id` | `"gemini-3.5-flash"` | Selects the provider by pattern (see [§4](#4-providers--model-routing)). |
| `api_key` | `None` | Falls back to environment variables (see [§4](#4-providers--model-routing)). |
| `format_type` | `JSON` | `FormatType.JSON` or `FormatType.YAML`. |
| `max_char_buffer` | `1000` | Max characters per chunk sent to the model. |
| `temperature` | `None` | Sampling temperature; `None` uses the model default. |
| `fence_output` | `None` | `None` auto-decides based on the provider schema; `True`/`False` forces fenced / raw output. |
| `use_schema_constraints` | `True` | Enable structured-output constraints on supported models. |
| `batch_length` | `10` | Chunks per batch. |
| `max_workers` | `10` | Max concurrent workers. Effective parallelism is `min(batch_length, max_workers)`. |
| `extraction_passes` | `1` | `>1` runs multiple passes and merges non-overlapping results (first pass wins overlaps); multiplies token cost. |
| `context_window_chars` | `None` | Characters of the previous chunk carried forward for cross-chunk references. |
| `config` | `None` | A `ModelConfig`; takes precedence over `model_id`/`api_key`/`language_model_type`. |
| `model` | `None` | A pre-built model instance; takes precedence over everything, including `config`. |
| `fetch_urls` | `False` | **Keyword-only.** When `True`, http(s) strings are downloaded with no sanitization (SSRF risk). |
| `prompt_validation_level` | `WARNING` | `OFF`, `WARNING`, or `ERROR`. |
| `show_progress` | `True` | Show a progress bar. |

**Precedence of model selection:** `model` > `config` > (`model_id` / `api_key` /
`language_model_type`). Passing `model` together with `use_schema_constraints=True`
emits a warning that the flag is ignored.

### `resolver_params` keys

A dict that tunes how raw model output is parsed and aligned:

| Key | Default | Meaning |
|---|---|---|
| `extraction_index_suffix` | `None` | Suffix for extraction-ordering keys. |
| `suppress_parse_errors` | `True` (in `extract`) | Don't fail the whole document on one bad chunk. |
| `enable_fuzzy_alignment` | `True` | Allow fuzzy matching to the source. |
| `fuzzy_alignment_threshold` | `0.75` | Minimum similarity for a fuzzy match. |
| `fuzzy_alignment_algorithm` | `"lcs"` | Alignment algorithm (`"legacy"` is deprecated). |
| `fuzzy_alignment_min_density` | `1/3` | Minimum match density. |
| `accept_match_lesser` | `True` | Accept matches to a smaller span. |

### `language_model_params`

Provider-specific constructor kwargs. Examples seen in the project docs:

- Gemini retry settings: `max_retries`, `retry_delay`, `max_retry_delay`,
  `http_options`.
- Vertex AI: `{"vertexai": True, "project": "...", "location": "global"}`, and
  batch mode via `{"vertexai": True, "batch": {"enabled": True}}`.
- OpenAI batch mode: `{"batch": {"enabled": True, "threshold": 50, "poll_interval": 10}}`.

### Deprecations

- `language_model_type`: emits a `FutureWarning`; use `model`, `config`, or
  `model_id`. Slated for removal in v2.0.0.
- `gemini_schema` (inside `language_model_params`): ignored with a
  `FutureWarning`; schema constraints are handled automatically.

---

## 2. Data types

From `lx.data` (re-exported from `langextract.core.data`).

### `ExampleData`

```python
lx.data.ExampleData(
    text: str,
    extractions: list[Extraction] = [],
)
```

A single few-shot example: input `text` and the extractions expected from it.

### `Extraction`

```python
lx.data.Extraction(
    extraction_class: str,        # positional
    extraction_text: str,         # positional
    *,                            # everything below is keyword-only
    char_interval=None,           # CharInterval | None
    alignment_status=None,        # AlignmentStatus | None
    extraction_index=None,        # int | None
    group_index=None,             # int | None
    description=None,             # str | None
    attributes=None,              # dict[str, str | list[str]] | None
    token_interval=None,          # TokenInterval | None
)
```

`char_interval` is `None` when the extraction couldn't be located in the source
text: the grounding signal. See [Grounding](../concepts/grounding).

### `Document`

```python
lx.data.Document(
    text: str,
    *,
    document_id=None,             # str | None — auto-generated if unset
    additional_context=None,      # str | None
)
```

Input wrapper for batch extraction. `document_id` auto-generates as
`doc_<8 hex>` on first access. `with_additional_context(ctx)` returns a copy.

### `AnnotatedDocument`

```python
lx.data.AnnotatedDocument(
    *,
    document_id=None,             # str | None
    extractions=None,             # list[Extraction] | None
    text=None,                    # str | None
)
```

The result object. Also exposes a lazily computed `tokenized_text`.

### `CharInterval`

```python
lx.data.CharInterval(start_pos=None, end_pos=None)   # start inclusive, end exclusive
```

### `AlignmentStatus` (enum)

`MATCH_EXACT`, `MATCH_GREATER`, `MATCH_LESSER`, `MATCH_FUZZY`.

### `FormatType` (enum)

`FormatType.JSON` (`"json"`), `FormatType.YAML` (`"yaml"`).

---

## 3. Model configuration: `lx.factory`

### `ModelConfig`

A frozen dataclass describing how to build a provider.

```python
lx.factory.ModelConfig(
    model_id=None,        # str | None
    provider=None,        # str | None — provider name or class name, to disambiguate
    provider_kwargs={},   # dict[str, Any]
)
```

### `create_model`

```python
lx.factory.create_model(
    config: ModelConfig,
    examples=None,                  # Sequence[ExampleData] | None
    use_schema_constraints=False,   # bool
    fence_output=None,              # bool | None
    return_fence_output=False,      # bool
)
```

Returns a language model instance (or, with `return_fence_output=True`, a
`(model, fence_output)` tuple). Raises `ValueError` if neither `model_id` nor
`provider` is set; wraps provider load/instantiation failures in
`InferenceConfigError`.

### `create_model_from_id`

```python
lx.factory.create_model_from_id(model_id=None, provider=None, **provider_kwargs)
```

Convenience wrapper that builds a `ModelConfig` and calls `create_model`.

---

## 4. Providers & model routing

LangExtract picks a provider by matching `model_id` against registered regex
patterns. Built-in patterns (all registered at priority 10):

| Provider | Patterns (prefix-matched on `model_id`) | Availability |
|---|---|---|
| **Gemini** | `^gemini` | Built in (default). |
| **OpenAI** | `^gpt-4`, `^gpt4.`, `^gpt-5`, `^gpt5.` | Built in; needs `pip install langextract[openai]`. |
| **Ollama** | `^gemma`, `^llama`, `^mistral`, `^mixtral`, `^phi`, `^qwen`, `^deepseek`, `^command-r`, `^starcoder`, `^codellama`, `^codegemma`, `^tinyllama`, `^wizardcoder`, `^gpt-oss`, plus HuggingFace-style prefixes (`^meta-llama/Llama`, `^google/gemma`, `^Qwen/`, `^deepseek-ai/`, …) | Built in (local). |

If a `model_id` matches no pattern, `resolve` raises `InferenceConfigError`
listing the available patterns. Pass an explicit `config=ModelConfig(model_id=...,
provider=...)` to force a provider.

### Environment variables

The factory auto-resolves credentials when `api_key` isn't passed:

| Provider | Environment variables (in priority order) |
|---|---|
| Gemini | `GEMINI_API_KEY`, then `LANGEXTRACT_API_KEY` |
| OpenAI | `OPENAI_API_KEY`, then `LANGEXTRACT_API_KEY` |
| Ollama | `OLLAMA_BASE_URL` (default `http://localhost:11434`) |

### Router functions: `lx.providers.router`

- `register(*patterns, priority=0)`: decorator registering a provider class.
- `register_lazy(*patterns, target="module:Class", priority=0)`: register by
  import path without importing dependencies.
- `resolve(model_id)`: return the provider class for a model id (highest
  matching priority wins).
- `resolve_provider(provider_name)`: return the provider class by name or class
  name (case-insensitive).
- `list_providers()` / `list_entries()`: inspect registered patterns and
  priorities.

### Plugin loading: `lx.providers`

- `load_builtins_once()`: register the built-in providers (idempotent).
- `load_plugins_once()`: discover third-party providers via the
  `langextract.providers` entry-point group. Set `LANGEXTRACT_DISABLE_PLUGINS=1`
  to skip. Default plugin priority is 20.

---

## 5. Visualization: `lx.visualize`

```python
lx.visualize(
    data_source,            # AnnotatedDocument | str | pathlib.Path
    *,
    animation_speed=1.0,    # float — seconds between entities
    show_legend=True,       # bool
    gif_optimized=True,     # bool — larger fonts/contrast for capture
)
```

Builds a self-contained, interactive HTML view of grounded extractions.

- Accepts an `AnnotatedDocument` or a path to a JSONL file (visualizes the
  **first** document in the file).
- Returns an `IPython.display.HTML` object in a notebook, otherwise the HTML
  **string**.
- Renders only extractions with a valid `char_interval`.
- **Raises:** `FileNotFoundError` (missing file); `ValueError` (no documents, or
  the document has no text / no extractions).

---

## 6. Input / output: `lx.io`

```python
lx.io.save_annotated_documents(
    annotated_documents,        # Iterator[AnnotatedDocument]
    output_dir=None,            # defaults to "test_output/"
    output_name="data.jsonl",
    show_progress=True,
)

lx.io.load_annotated_documents_jsonl(
    jsonl_path,                 # pathlib.Path
    show_progress=True,
)  # -> Iterator[AnnotatedDocument]

lx.io.download_text_from_url(
    url,
    timeout=30,
    show_progress=True,
    chunk_size=8192,
)  # -> str

lx.io.is_url(text)  # -> bool
```

- `save_annotated_documents` raises `InvalidDatasetError` if nothing is written.
  `output_name` is **not** path-sanitized. Validate untrusted input before
  using it.
- `lx.io.Dataset` is a frozen abstract dataclass whose `.load(delimiter=",")`
  reads a CSV into `Document` objects.

---

## 7. Exceptions: `lx.exceptions`

All inherit from `LangExtractError`, so a single `except LangExtractError`
catches any library error.

```
LangExtractError
├─ InferenceError
│  ├─ InferenceConfigError      # missing keys, invalid model ids, provider build failures
│  └─ InferenceRuntimeError     # API/network failures (carries .original, .provider)
├─ InferenceOutputError         # no scored outputs from the model
├─ InvalidDocumentError         # duplicate ids / malformed documents
├─ InternalError                # a bug inside LangExtract
├─ ProviderError                # provider/backend-specific error
├─ SchemaError                  # schema validation/serialization error
└─ FormatError
   └─ FormatParseError          # fence / JSON / YAML / wrapper parse failures
```

:::note
The `lx.exceptions` shim re-exports a subset for backward compatibility
(`LangExtractError`, `InferenceError`, `InferenceConfigError`,
`InferenceRuntimeError`, `InferenceOutputError`, `ProviderError`, `SchemaError`).
`InternalError`, `InvalidDocumentError`, `FormatError`, and `FormatParseError`
are available from `langextract.core.exceptions`.
:::

---

## 8. Inference output: `ScoredOutput`

What a provider's `infer()` yields per prompt, from `langextract.core.types`:

```python
ScoredOutput(score=None, output=None)   # score: float | None, output: str | None
```

---

## Not yet documented

This first pass covers the high-traffic public surface. Deeper reference for the
following exists in source but isn't expanded here yet: per-provider constructor
kwargs (`gemini.py`, `openai.py`, `ollama.py`), the schema and format-handler
internals, the resolver's alignment algorithm, chunking, the tokenizers
(including `UnicodeTokenizer`), prompt construction, and the `Annotator`.
