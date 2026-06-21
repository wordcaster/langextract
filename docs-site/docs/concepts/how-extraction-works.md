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

1. **Chunk.** LangExtract splits long input into chunks of at most
   `max_char_buffer` characters (default `1000`). Smaller chunks give the model less to read at
   once, which tends to improve accuracy, at the cost of more API calls.
2. **Infer.** LangExtract sends each chunk to a language model. It turns your
   prompt and examples into a structured prompt; on supported models, schema
   constraints derived from your examples push the model toward consistent
   output.
3. **Resolve.** LangExtract parses the model's raw text response (JSON or YAML,
   optionally inside a code fence) into candidate extractions.
4. **Align.** LangExtract locates each candidate's text in the source. It
   prefers exact matches; fuzzy alignment can accept near-matches within a
   configurable threshold.
5. **Ground.** A successful match records a character span (`char_interval`).
   When LangExtract can't locate a candidate in the source, it leaves the
   `char_interval` empty — the signal that the value wasn't actually in your text.
6. **Result.** LangExtract collects everything into an `AnnotatedDocument` (or a
   list of them, if you passed multiple documents).

[Grounding](grounding) explains stages 4 and 5 in more depth, and the
[API reference](../reference/api#2-data-types) lists the exact result objects.

## Examples are required, and they do the work

`lx.extract` raises a `ValueError` if you don't pass examples. They aren't
optional decoration — they define the output schema and demonstrate the task.
See [Write prompts & examples](../how-to/write-prompts-and-examples) for how to
write them well.

## Which model runs the inference

The "infer" stage routes to a provider based on the `model_id` you pass — Gemini
by default, with OpenAI and local Ollama models also supported. See
[Model backends](model-backends) for how that selection works.

## Why this design

These stages map directly to the project's stated goals: source grounding (the
align and ground stages), reliable structure (examples plus schema constraints),
and handling long documents (chunking, parallel processing, and multiple passes).
The parameters that tune each stage appear where you use them — see the
[long-document workflow](../how-to/long-document-workflow) for the chunking,
parallelism, and recall levers in a real scenario.

## See also

- [Grounding](grounding) — how results are tied back to the source text.
- [Model backends](model-backends) — how `model_id` picks a provider.
- [Long-document workflow](../how-to/long-document-workflow) — the scaling levers
  in practice.
