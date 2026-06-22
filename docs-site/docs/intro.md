---
sidebar_position: 1
title: Introduction
---

# LangExtract

LangExtract is a Python library that uses large language models to extract
structured information from unstructured text, following instructions you
write. You describe what to pull out and show a few examples; LangExtract runs
the model, maps every extraction back to its exact location in the source text,
and can render the results as an interactive, highlighted HTML view.

It is built for text that doesn't fit a fixed schema up front (clinical notes,
reports, long-form documents), where you want structured output *and* a way to
trace each value back to where it came from.

## What it gives you

- **Source grounding.** Every extraction is tied to a character span in the
  original text. Extractions the model could not locate in the source are
  flagged (their character interval is empty), so you can filter out
  hallucinated values.
- **Structured output from examples.** You don't define a schema by hand. A few
  high-quality examples shape the output, and on supported models LangExtract
  applies schema constraints to keep results consistent.
- **Built for long documents.** LangExtract chunks long input, processes the
  chunks in parallel, and can make multiple passes to improve recall on large
  inputs.
- **Interactive visualization.** Results export to JSONL and render as a
  self-contained HTML file that highlights every entity in context.
- **Multiple model backends.** Google Gemini (the default), OpenAI, and local
  models via Ollama are built in, with a plugin system for adding others.

## Where to go next

- **[Quickstart](quickstart)**: extract and visualize your first results in a
  few minutes.
- **[How extraction works](concepts/how-extraction-works)**: the pipeline from
  raw text to grounded results.
- **[Grounding](concepts/grounding)**: how each value is tied back to the
  source, and how to tell a real extraction from a hallucination.
- **[Model backends](concepts/model-backends)**: how `model_id` selects Gemini,
  OpenAI, or a local model.
- **[How-to guides](how-to/long-document-workflow)**: task recipes for long
  documents, switching models, writing prompts, and supplying credentials.
- **[API reference](reference/api)**: signatures, parameters, and types.

:::note[Project status]
LangExtract is open-source under the Apache 2.0 license. As stated in the
project's own README, **it is not an officially supported Google product.**
This documentation site is an independent documentation effort and is not
official Google documentation.
:::
