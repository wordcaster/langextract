---
sidebar_position: 2
title: Prompts & examples
---

# Prompts & examples

The prompt and the examples are the two inputs that most determine output
quality. A good model with weak examples produces worse results than a modest
model with strong ones. This page explains how to write both.

## The two pieces

- **`prompt_description`** — plain-language instructions for *what* to extract.
- **`examples`** — a list of `ExampleData`, each pairing some `text` with the
  `Extraction`s you'd want from it. Examples demonstrate *how* the output should
  look.

```python
prompt = "Extract medication name, dosage, route, frequency, and duration in order of appearance."

examples = [
    lx.data.ExampleData(
        text="Patient took 400 mg PO Ibuprofen q4h for two days.",
        extractions=[
            lx.data.Extraction(extraction_class="medication", extraction_text="Ibuprofen"),
            lx.data.Extraction(extraction_class="dosage", extraction_text="400 mg"),
            lx.data.Extraction(extraction_class="route", extraction_text="PO"),
            lx.data.Extraction(extraction_class="frequency", extraction_text="q4h"),
            lx.data.Extraction(extraction_class="duration", extraction_text="two days"),
        ],
    )
]
```

## Examples are required

`lx.extract` raises a `ValueError` if `examples` is missing or empty. There is
no zero-shot mode — provide at least one example.

## The rules that make examples work

LangExtract aligns each extraction back to the source text. Examples that follow
the alignment rules teach the model a pattern that aligns cleanly on real input:

1. **Verbatim text.** Each `extraction_text` should be copied exactly from the
   example's `text` — no paraphrasing, no normalization.
2. **In order of appearance.** List extractions in the order they occur in the
   text.
3. **No overlaps.** Spans should not overlap each other.

When examples violate these rules, LangExtract emits **prompt-alignment
warnings**. By default these are warnings, not errors, and extraction continues —
but resolving them is one of the highest-leverage things you can do. You can
raise the strictness:

- `prompt_validation_level` — `OFF`, `WARNING` (default), or `ERROR` (raise on
  failures).
- `prompt_validation_strict` — when `True` with `ERROR`, also raises on
  non-exact (fuzzy or partial) matches.

## Attributes add structure within a class

Each `Extraction` can carry `attributes` — a dictionary of additional fields.
This is how you capture properties of an entity without inventing a new class
for every variation.

```python
lx.data.Extraction(
    extraction_class="character",
    extraction_text="ROMEO",
    attributes={"emotional_state": "wonder"},
)
```

Attributes are also where you decide how much the model should lean on its own
world knowledge versus staying strictly on the text. Asking for an attribute
like `"literary_context": "tragic heroine"` invites inference; asking only for
attributes visible in the text keeps results close to the evidence. The balance
is set entirely by your instructions and example attributes.

## Guarding against ungrounded extractions

Models can occasionally copy content from your *examples* rather than the input
text. LangExtract detects this: an extraction it can't locate in the source has
an empty `char_interval`. Filter to grounded results when that matters:

```python
grounded = [e for e in result.extractions if e.char_interval]
```

See [Working with results](working-with-results) for more on `char_interval` and
alignment status.

## Practical guidance

- **Match the example to the domain.** For complex or specialized text, richer
  and more representative examples raise robustness more than a longer prompt.
- **One strong example beats several weak ones.** Start with a single
  high-quality example and add more only to cover genuinely different cases.
- **State the format expectations in the prompt** (order, exact text, no
  overlap) — it reinforces what the examples demonstrate.
- **For non-spaced languages** (such as Japanese), pass a `UnicodeTokenizer` so
  character-based segmentation and alignment work correctly.

## Related

- [How extraction works](how-extraction-works) — where prompts and examples sit
  in the pipeline.
- [API reference: `ExampleData` and `Extraction`](../reference/api#2-data-types)
  — exact fields and types.
