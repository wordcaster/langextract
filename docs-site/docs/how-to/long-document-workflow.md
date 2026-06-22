---
sidebar_position: 1
title: Extract from a long document
---

# Extract from a long document

The [Quickstart](../quickstart) extracts from a single sentence. Real inputs are
longer (articles, reports, chapters), and length is where LangExtract's
chunking, parallelism, and multi-pass options earn their place. This guide runs
one continuous scenario end to end: a multi-paragraph passage in, grounded
extractions out, and an interactive HTML visualization to review them.

## 1. Set up the task and an example

Decide what to extract and show one strong example. Here the task is to pull
characters and the emotions they express.

```python
import langextract as lx
import textwrap

prompt = textwrap.dedent("""\
    Extract characters and the emotions they express, in order of appearance.
    Use the exact text from the source. Do not paraphrase or overlap spans.""")

examples = [
    lx.data.ExampleData(
        text="Eleanor hesitated at the door, her courage wavering.",
        extractions=[
            lx.data.Extraction(
                extraction_class="character",
                extraction_text="Eleanor",
                attributes={"emotion": "hesitation"},
            ),
            lx.data.Extraction(
                extraction_class="emotion",
                extraction_text="her courage wavering",
                attributes={"felt_by": "Eleanor"},
            ),
        ],
    )
]
```

## 2. Provide the source text

For this walkthrough the source is a multi-paragraph passage held in a string.
LangExtract treats any string as literal text.

```python
source_text = textwrap.dedent("""\
    The harbor was quiet when Mara arrived, though her heart raced with worry.
    Her brother had not written in months, and every passing ship deepened her
    unease.

    On the pier she found old Tomas, who greeted her with a tired smile. He had
    seen the northern vessel days ago, he said, and the news lifted her spirits
    at once.

    By evening the fog rolled in. Mara waited at the rail, hopeful now, while
    Tomas hummed an old song and watched the dark water with quiet contentment.""")
```

For a document on the web, you can hand `lx.extract` an http(s) URL instead of a
string and let it fetch the text, but only with `fetch_urls=True`, which is off
by default.

:::caution[Fetching URLs is opt-in and unsanitized]
`fetch_urls` is `False` by default; every string is treated as literal text.
When you set it to `True`, http(s) inputs are downloaded with no sanitization,
which carries server-side request forgery (SSRF) risk. Only enable it for URLs
from a trusted source, ideally in a sandboxed environment.
:::

## 3. Run the extraction with the scaling levers

Three parameters control how LangExtract processes a long input. This example
sets each one at the point it matters:

```python
result = lx.extract(
    text_or_documents=source_text,
    prompt_description=prompt,
    examples=examples,
    model_id="gemini-3.5-flash",
    max_char_buffer=400,      # chunk size: smaller chunks, more accurate, more calls
    max_workers=4,            # chunks processed in parallel; no extra token cost
    extraction_passes=2,      # a second pass raises recall; it reprocesses tokens
)
```

- **`max_char_buffer`** (default `1000`) sets the maximum characters per chunk.
  Smaller chunks give the model less to read at once, which tends to improve
  accuracy at the cost of more API calls.
- **`max_workers`** (default `10`) caps how many chunks run concurrently. Raising
  it increases throughput without increasing token cost. Effective parallelism is
  `min(batch_length, max_workers)`, so raise `batch_length` alongside it when you
  push this higher.
- **`extraction_passes`** (default `1`) runs the whole extraction more than once
  and merges non-overlapping results, with the first pass winning any overlap.
  More passes find more entities in dense text, but each pass reprocesses the
  tokens, so `extraction_passes=3` roughly triples token cost.

A fourth lever, **`context_window_chars`**, carries characters from the previous
chunk forward so a reference that crosses a chunk boundary (a pronoun whose
antecedent was in the prior chunk) still resolves.

## 4. Keep the grounded results

Each extraction records where LangExtract found it. Filter to the grounded ones
before you trust the output:

```python
grounded = [e for e in result.extractions if e.char_interval]
print(f"{len(grounded)} grounded extractions")
```

See [Grounding](../concepts/grounding) for why a missing `char_interval` is the
signal to drop a value.

## 5. Save to JSONL

```python
lx.io.save_annotated_documents(
    [result],
    output_name="long_document_results.jsonl",
    output_dir=".",
)
```

## 6. Build the visualization

`lx.visualize` turns the saved results into a self-contained, interactive HTML
file that highlights every grounded extraction in context.

```python
html = lx.visualize("long_document_results.jsonl")

with open("long_document.html", "w") as f:
    f.write(html.data if hasattr(html, "data") else html)
```

Open `long_document.html` in a browser to step through the extractions in the
order they appear in the source: the payoff of the workflow.

## See also

- [How extraction works](../concepts/how-extraction-works): the pipeline these
  levers tune.
- [Grounding](../concepts/grounding): how to read each result.
- [Work with results](work-with-results): more on saving, loading, and
  visualizing.
