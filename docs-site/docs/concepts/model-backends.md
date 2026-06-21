---
sidebar_position: 3
title: Model backends
---

# Model backends

LangExtract does not hardcode a single model. The `model_id` you pass to
`lx.extract` selects a *provider* — the integration that talks to a model — and
different providers run on different infrastructure. This page explains how that
selection works conceptually; for step-by-step setup, see the how-to guides
linked below.

## `model_id` selects a provider by pattern

A provider registers the model-id patterns it handles, and LangExtract routes
each `model_id` to the provider whose pattern it matches:

- **Gemini (the default).** Model ids beginning with `gemini` route to Google
  Gemini. The default `model_id` is `gemini-3.5-flash`, so an extraction with no
  `model_id` runs on Gemini.
- **OpenAI.** Model ids such as `gpt-4o` route to OpenAI. The integration is an
  optional extra you install separately.
- **Ollama (local).** Model ids such as `gemma2:2b` route to Ollama, which runs
  models on your own machine with no API key.

Because routing is pattern-based rather than a fixed list, a provider can claim a
family of models without LangExtract enumerating each one.

## When a model id doesn't match

If a `model_id` matches no registered pattern, LangExtract cannot infer the
provider and raises an error. You then name the provider explicitly through a
configuration object. The exact patterns, the precedence rules, and the
environment variables each provider reads are listed in the
[API reference §4](../reference/api#4-providers--model-routing).

## Extending with plugins

Providers are pluggable: a third-party package can register new patterns through
an entry point, so support for additional models can be added without changing
LangExtract itself. The plugin mechanism is described in the
[API reference §4](../reference/api#4-providers--model-routing).

## See also

- [Use OpenAI models](../how-to/use-openai) — run an OpenAI model.
- [Use local models with Ollama](../how-to/use-ollama) — run a model on your own
  machine.
- [Supply API keys](../how-to/api-keys) — where each provider looks for
  credentials.
- [API reference §4](../reference/api#4-providers--model-routing) — exact
  patterns and environment variables.
