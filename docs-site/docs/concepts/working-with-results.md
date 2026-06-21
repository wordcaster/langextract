---
sidebar_position: 3
title: Working with results
---

# Working with results

`lx.extract` returns your data as structured objects. This page describes their
shape and the one concept that matters most when you trust the output:
**grounding**.

## What `extract` returns

- Pass a **single string or URL** → you get one `AnnotatedDocument`.
- Pass an **iterable of `Document` objects** → you get a `list[AnnotatedDocument]`.

```python
result = lx.extract(text_or_documents="...", prompt_description=prompt, examples=examples)
# result is an AnnotatedDocument

for extraction in result.extractions:
    print(extraction.extraction_class, "→", extraction.extraction_text)
```

## `AnnotatedDocument`

The result container:

- `extractions` — the list of `Extraction` objects (may be `None` if nothing
  was produced).
- `text` — the original source text.
- `document_id` — a stable id, auto-generated as `doc_<8 hex chars>` if you
  didn't set one.
- `tokenized_text` — the tokenized form, computed on demand.

## `Extraction`

Each extracted item:

| Field | Type | Meaning |
|---|---|---|
| `extraction_class` | `str` | The category you defined (e.g. `"character"`). |
| `extraction_text` | `str` | The matched text. |
| `char_interval` | `CharInterval \| None` | Where it sits in the source — `None` if it couldn't be located. |
| `alignment_status` | `AlignmentStatus \| None` | How it was matched (exact / fuzzy / …). |
| `attributes` | `dict \| None` | Extra fields you asked for. |
| `extraction_index`, `group_index` | `int \| None` | Ordering / grouping indices. |
| `description` | `str \| None` | Optional description. |

A `CharInterval` has `start_pos` (inclusive) and `end_pos` (exclusive).

## Grounding: the most important field

`char_interval` is how LangExtract tells you whether an extraction is *real*.

- **Set** → the text was found in the source, and the interval is its exact
  location. You can slice the source (`result.text[start:end]`) or highlight it.
- **`None`** → the model produced a value that does **not** appear in the source
  text. This is the signal for a likely hallucination or a value copied from
  your examples.

Filter to grounded extractions whenever correctness matters:

```python
grounded = [e for e in result.extractions if e.char_interval]
```

### Alignment status

When an extraction is grounded, `alignment_status` records how it matched, drawn
from `AlignmentStatus`:

- `MATCH_EXACT` — the extraction text matched the source exactly.
- `MATCH_FUZZY` — matched via fuzzy alignment within the configured threshold.
- `MATCH_GREATER` / `MATCH_LESSER` — matched a larger / smaller span than the
  extraction text.

Fuzzy alignment behavior (threshold, algorithm, whether lesser matches are
accepted) is tunable through `resolver_params` — see the
[API reference](../reference/api#1-lxextract).

## Saving and loading

Persist results as JSONL and read them back:

```python
# Save (defaults to a file named data.jsonl in test_output/ if you omit args).
lx.io.save_annotated_documents([result], output_name="results.jsonl", output_dir=".")

# Load back into AnnotatedDocument objects.
docs = list(lx.io.load_annotated_documents_jsonl("results.jsonl"))
```

## Visualizing

`lx.visualize` turns results into a self-contained, interactive HTML view with
every grounded extraction highlighted in context.

```python
html = lx.visualize("results.jsonl")   # or pass an AnnotatedDocument directly
```

- In a Jupyter/Colab notebook it returns an `IPython.display.HTML` object (use
  `.data` to get the string).
- In a plain script it returns the HTML string.
- Only extractions with a valid `char_interval` are rendered — another reason
  grounding matters.
- When given a JSONL path, it visualizes the **first** document in the file.

```python
with open("visualization.html", "w") as f:
    f.write(html.data if hasattr(html, "data") else html)
```

## Related

- [How extraction works](how-extraction-works) — how these objects are produced.
- [API reference](../reference/api) — full field and method listings.
