---
sidebar_position: 4
title: Write prompts & examples
---

# Write prompts & examples

The prompt and the examples are the two inputs that most determine output
quality. A good model with weak examples produces worse results than a modest
model with strong ones. This guide covers how to write both.

## The two pieces

- **`prompt_description`**: plain-language instructions for *what* to extract.
- **`examples`**: a list of `ExampleData`, each pairing some `text` with the
  `Extraction`s you'd want from it. Examples demonstrate *how* the output should
  look.

```python
import langextract as lx

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
no zero-shot mode. Provide at least one example.

## Follow the alignment rules

LangExtract aligns each extraction back to the source text. Examples that follow
these rules teach the model a pattern that aligns cleanly on real input:

1. **Verbatim text.** Copy each `extraction_text` exactly from the example's
   `text` (no paraphrasing, no normalization).
2. **In order of appearance.** List extractions in the order they occur in the
   text.
3. **No overlaps.** Don't let spans overlap each other.

When examples violate these rules, LangExtract emits **prompt-alignment
warnings**. By default these are warnings, not errors, and extraction continues,
but resolving them is one of the highest-leverage things you can do.

## Raise the strictness when you need to

Two parameters control how prompt validation behaves:

- `prompt_validation_level`: `OFF`, `WARNING` (default), or `ERROR` (raise on
  failures).
- `prompt_validation_strict`: when `True` with `ERROR`, also raises on non-exact
  (fuzzy or partial) matches.

## Use attributes to add structure within a class

Each `Extraction` can carry `attributes`, a dictionary of additional fields.
This is how you capture properties of an entity without inventing a new class for
every variation.

```python
import langextract as lx

extraction = lx.data.Extraction(
    extraction_class="character",
    extraction_text="ROMEO",
    attributes={"emotional_state": "wonder"},
)
```

Attributes are also where you decide how much the model should lean on its own
world knowledge versus staying strictly on the text. Asking for an attribute like
`"literary_context": "tragic heroine"` invites inference; asking only for
attributes visible in the text keeps results close to the evidence.

## Practical guidance

- **Match the example to the domain.** For complex or specialized text, richer
  and more representative examples raise robustness more than a longer prompt.
- **One strong example beats several weak ones.** Start with a single
  high-quality example and add more only to cover genuinely different cases.
- **State the format expectations in the prompt** (order, exact text, no
  overlap). It reinforces what the examples demonstrate.
- **For non-spaced languages** (such as Japanese), pass a `UnicodeTokenizer` so
  character-based segmentation and alignment work correctly.

## See also

- [How extraction works](../concepts/how-extraction-works): where prompts and
  examples sit in the pipeline.
- [Grounding](../concepts/grounding): why verbatim, in-order examples align
  cleanly.
- [API reference §2](../reference/api#2-data-types): exact `ExampleData` and
  `Extraction` fields and types.
