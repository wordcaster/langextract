---
sidebar_position: 6
title: Supply API keys
---

# Supply API keys

Cloud providers (Gemini, OpenAI) need a credential; local models via
[Ollama](use-ollama) need none. LangExtract reads credentials from environment
variables, or you can pass one directly. This guide covers each option; the exact
per-provider precedence is listed in the
[API reference §4](../reference/api#4-providers--model-routing).

## `LANGEXTRACT_API_KEY` (any cloud provider)

The general-purpose variable. Set it and LangExtract uses it for whichever cloud
provider your `model_id` selects.

```bash
export LANGEXTRACT_API_KEY="your-api-key"
```

## Provider-specific variables

Each cloud provider also reads its own variable, which takes precedence over
`LANGEXTRACT_API_KEY`:

- **Gemini** — `GEMINI_API_KEY`, then `LANGEXTRACT_API_KEY`.
- **OpenAI** — `OPENAI_API_KEY`, then `LANGEXTRACT_API_KEY`.

Use these when you work with more than one provider and want a distinct key for
each.

## The `api_key` parameter

You can pass a key directly to `lx.extract` instead of using the environment.
This is convenient for a quick test; prefer an environment variable for anything
you share or deploy.

```python
import langextract as lx

result = lx.extract(
    text_or_documents="Tom looked nervous before the interview.",
    prompt_description="Extract each person and the emotion they feel.",
    examples=examples,
    model_id="gemini-3.5-flash",
    api_key="your-api-key",
)
```

## A `.env` file

LangExtract reads keys from the environment; it does not load a `.env` file on
its own. Keep your key in `.env`:

```
LANGEXTRACT_API_KEY=your-api-key
```

then load it into the environment before extracting, with
[python-dotenv](https://pypi.org/project/python-dotenv/):

```python
from dotenv import load_dotenv

load_dotenv()  # sets LANGEXTRACT_API_KEY in the environment

import langextract as lx
# lx.extract(...) now picks up the key as usual
```

Add `.env` to your `.gitignore` so the key is never committed.

## See also

- [Model backends](../concepts/model-backends) — which provider a `model_id`
  selects.
- [API reference §4](../reference/api#4-providers--model-routing) — the exact
  environment variables each provider reads, and their precedence.
