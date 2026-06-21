---
sidebar_position: 2
title: Use OpenAI models
---

# Use OpenAI models

LangExtract runs on Google Gemini by default. To use an OpenAI model instead,
install the OpenAI extra, provide an OpenAI key, and pass an OpenAI `model_id`.
Your prompt, examples, and result handling stay the same.

## 1. Install the OpenAI extra

The OpenAI integration ships as an optional dependency:

```bash
pip install langextract[openai]
```

## 2. Provide your OpenAI key

For OpenAI models, LangExtract reads `OPENAI_API_KEY` (falling back to
`LANGEXTRACT_API_KEY`). See [Supply API keys](api-keys) for all the options.

```bash
export OPENAI_API_KEY="your-openai-key"
```

## 3. Run an extraction with an OpenAI model

Pass an OpenAI `model_id` such as `gpt-4o`. The provider is selected from the
model id automatically — see [Model backends](../concepts/model-backends).

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
    model_id="gpt-4o",
)
```

## Batch mode

For large jobs, the OpenAI provider can use the OpenAI Batch API. Enable it
through `language_model_params` with a `batch` configuration; the `threshold` is
the number of prompts at which batching kicks in.

```python
result = lx.extract(
    text_or_documents=documents,
    prompt_description=prompt,
    examples=examples,
    model_id="gpt-4o",
    language_model_params={"batch": {"enabled": True, "threshold": 50}},
)
```

## See also

- [Model backends](../concepts/model-backends) — how `model_id` selects OpenAI.
- [Supply API keys](api-keys) — credential options and precedence.
- [API reference §4](../reference/api#4-providers--model-routing) — the exact
  OpenAI model-id patterns.
