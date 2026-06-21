---
sidebar_position: 3
title: Use local models with Ollama
---

# Use local models with Ollama

[Ollama](https://ollama.com) runs language models on your own machine, so you can
extract with no API key and no text leaving your computer. LangExtract routes
local model ids to Ollama automatically.

## 1. Start Ollama and pull a model

Install and start Ollama, then pull a model to use:

```bash
ollama pull gemma2:2b
```

By default Ollama serves on `http://localhost:11434`.

## 2. Run an extraction against the local model

Pass the local `model_id` and, if your server is not at the default address, a
`model_url`:

```python
import langextract as lx

examples = [
    lx.data.ExampleData(
        text="Maria felt hopeful as she opened the letter.",
        extractions=[
            lx.data.Extraction(extraction_class="person", extraction_text="Maria"),
            lx.data.Extraction(extraction_class="emotion", extraction_text="hopeful"),
        ],
    )
]

result = lx.extract(
    text_or_documents="Tom looked nervous before the interview.",
    prompt_description="Extract each person and the emotion they feel.",
    examples=examples,
    model_id="gemma2:2b",
    model_url="http://localhost:11434",
)
```

You don't need an API key. To reach a server at a different address, pass
`model_url` explicitly; with it omitted, LangExtract uses the default
`http://localhost:11434`.

## See also

- [Model backends](../concepts/model-backends) — how `model_id` selects Ollama.
- [API reference §4](../reference/api#4-providers--model-routing) — Ollama
  model-id patterns and provider options.
