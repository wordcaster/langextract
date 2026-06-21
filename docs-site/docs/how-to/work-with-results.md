---
sidebar_position: 5
title: Work with results
---

# Work with results

`lx.extract` returns structured objects. This guide covers the common tasks you
run on them: confirming a result is grounded, saving and loading it, and turning
it into an interactive visualization. For the exact fields on each object, see
[API reference §2](../reference/api#2-data-types); for what grounding means, see
[Grounding](../concepts/grounding).

## Start from a result

These recipes assume you already have a `result` from `lx.extract`. Here is a
minimal one to follow along with:

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
    model_id="gemini-3.5-flash",
)
```

## What you get back

- Pass a **single string or URL** → one `AnnotatedDocument`.
- Pass an **iterable of `Document` objects** → a `list[AnnotatedDocument]`.

An `AnnotatedDocument` holds the original `text` and a list of `extractions`. The
field-by-field shape is in the [API reference](../reference/api#2-data-types).

```python
for extraction in result.extractions:
    print(extraction.extraction_class, "->", extraction.extraction_text)
```

## Filter to grounded results

A `None` `char_interval` means LangExtract couldn't locate the extraction in the
source. Filter those out whenever correctness matters:

```python
grounded = [e for e in result.extractions if e.char_interval]
```

See [Grounding](../concepts/grounding) for why this is the key check.

## Save and load JSONL

Persist results as JSONL and read them back:

```python
# Save to JSONL.
lx.io.save_annotated_documents([result], output_name="results.jsonl", output_dir=".")

# Load back into AnnotatedDocument objects.
docs = list(lx.io.load_annotated_documents_jsonl("results.jsonl"))
```

## Visualize

`lx.visualize` turns results into a self-contained, interactive HTML view with
every grounded extraction highlighted in context.

```python
html = lx.visualize("results.jsonl")   # or pass an AnnotatedDocument directly

with open("visualization.html", "w") as f:
    f.write(html.data if hasattr(html, "data") else html)
```

- In a Jupyter or Colab notebook, `visualize` returns an `IPython.display.HTML`
  object (use `.data` to get the string); in a plain script it returns the HTML
  string.
- LangExtract renders only extractions with a valid `char_interval`.
- Given a JSONL path, it visualizes the **first** document in the file.

## See also

- [Grounding](../concepts/grounding) — what `char_interval` and alignment status
  mean.
- [Quickstart](../quickstart) — the end-to-end version of this flow.
- [API reference §2](../reference/api#2-data-types) — `AnnotatedDocument`,
  `Extraction`, and `CharInterval` fields.
