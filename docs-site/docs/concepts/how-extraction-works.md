---
sidebar_position: 1
title: How extraction works
---

# How extraction works

This page builds the mental model behind `lx.extract`. You don't need it to run
the [Quickstart](../quickstart), but understanding the pipeline explains why the
parameters exist and what each one trades off.

## The pipeline

When you call `lx.extract(...)`, your text moves through these stages:

```
text ──▶ chunk ──▶ infer (LLM) ──▶ resolve (parse) ──▶ align ──▶ ground ──▶ AnnotatedDocument
          │          │               │                   │          │
   max_char_buffer  provider      JSON/YAML out      fuzzy match  char_interval
                    routing                          to source    set or None
```

1. **Chunk.** Long input is split into chunks of at most `max_char_buffer`
   characters (default `1000`). Smaller chunks give the model less to read at
   once, which tends to improve accuracy, at the cost of more API calls.
2. **Infer.** Each chunk is sent to a language model. Your prompt and examples
   are turned into a structured prompt; on supported models, schema constraints
   derived from your examples push the model toward consistent output.
3. **Resolve.** The model's raw text response (JSON or YAML, optionally inside a
   code fence) is parsed into candidate extractions.
4. **Align.** Each candidate's text is located in the source. Exact matches are
   preferred; fuzzy alignment can accept near-matches within a configurable
   threshold.
5. **Ground.** A successful match records a character span (`char_interval`).
   When a candidate can't be located in the source, its `char_interval` is left
   empty — the signal that the value wasn't actually in your text.
6. **Result.** Everything is collected into an `AnnotatedDocument` (or a list of
   them, if you passed multiple documents).

See [Working with results](working-with-results) for the objects this produces.

## Examples are required, and they do the work

`lx.extract` raises a `ValueError` if you don't pass examples. They aren't
optional decoration — they define the output schema and demonstrate the task.
This is covered in depth in [Prompts & examples](prompts-and-examples).

## Parallelism: `batch_length` and `max_workers`

Chunks are processed concurrently. Two parameters govern throughput:

- `max_workers` (default `10`) — the maximum number of concurrent workers.
- `batch_length` (default `10`) — how many chunks are processed per batch.

Effective parallelism is `min(batch_length, max_workers)`. If you raise
`max_workers` above `batch_length`, only `batch_length` workers are actually
used, and LangExtract warns you. To scale up, raise both. Higher `max_workers`
increases speed without increasing token cost — it's the cheap lever.

## Recall: `extraction_passes`

`extraction_passes` (default `1`) runs the whole extraction more than once and
merges non-overlapping results, with the first pass winning any overlap. More
passes find more entities in large or dense documents — but each pass
**reprocesses the tokens**, so `extraction_passes=3` roughly triples token cost.
Use it when recall matters more than spend.

## Context across chunks: `context_window_chars`

By default, chunks are processed independently. Set `context_window_chars` to
carry that many characters of the previous chunk forward as context, which helps
resolve references that cross a chunk boundary (for example, a pronoun whose
antecedent was in the prior chunk).

## Scaling to long documents

For large inputs, combine the levers above. You can also pass a URL directly;
LangExtract will fetch it when `fetch_urls=True`.

```python
result = lx.extract(
    text_or_documents="https://www.gutenberg.org/files/1513/1513-0.txt",
    prompt_description=prompt,
    examples=examples,
    model_id="gemini-3.5-flash",
    extraction_passes=3,    # higher recall (and ~3x token cost)
    max_workers=20,         # more parallelism, no extra token cost
    max_char_buffer=1000,   # smaller chunks, better accuracy
)
```

:::caution Fetching URLs is opt-in and unsanitized
`fetch_urls` is `False` by default; every string is treated as literal text.
When you set it to `True`, http(s) inputs are downloaded with no sanitization,
which carries server-side request forgery (SSRF) risk. Only enable it for URLs
from a trusted source, ideally in a sandboxed environment.
:::

## Model backends

The `model_id` you pass selects a provider automatically by pattern-matching:

| Model ID looks like | Provider | Notes |
|---|---|---|
| `gemini-...` | Gemini (default) | Built in. `gemini-3.5-flash` is the default `model_id`. |
| `gpt-4...`, `gpt-5...` | OpenAI | Requires `pip install langextract[openai]`. |
| `gemma...`, `llama...`, `mistral...`, `qwen...`, and more | Ollama (local) | No API key; set `model_url` to your Ollama server. |

If your model ID doesn't match a known pattern, pass an explicit configuration
with `config=lx.factory.ModelConfig(model_id=..., provider=...)`. The full list
of routing patterns and the provider plugin system are in the
[API reference](../reference/api#4-providers--model-routing).

```python
# OpenAI — the key is read from OPENAI_API_KEY automatically.
result = lx.extract(..., model_id="gpt-4o")

# Local model via Ollama.
result = lx.extract(..., model_id="gemma2:2b", model_url="http://localhost:11434")
```

## Why this design

These stages map directly to the project's stated goals: source grounding (the
align + ground stages), reliable structure (examples + schema constraints), and
handling long documents (chunking, parallelism, multiple passes). Each parameter
above is a knob on one of those goals.
