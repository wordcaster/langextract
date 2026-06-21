---
sidebar_position: 2
title: Quickstart
---

# Quickstart

This quickstart walks you from an empty environment to a working, highlighted
visualization of extracted entities. It uses Google Gemini, the default model
backend.

## Prerequisites

- Python 3.10 or newer.
- A Gemini API key for cloud models. (Local models via Ollama don't need a key —
  see [Model backends](concepts/model-backends).)

## 1. Install

```bash
pip install langextract
```

## 2. Set your API key

LangExtract reads your key from the `LANGEXTRACT_API_KEY` environment variable.

```bash
export LANGEXTRACT_API_KEY="your-api-key-here"
```

You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
See [Supply API keys](how-to/api-keys) for the other ways to provide credentials,
including a `.env` file and provider-specific variables.

## 3. Define the task and one example

Two things drive an extraction: a **prompt** that says what to pull out, and at
least one **example** that shows the model the shape you want. Examples are
required — `extract` raises a `ValueError` without them.

```python
import langextract as lx
import textwrap

# Describe what to extract.
prompt = textwrap.dedent("""\
    Extract characters, emotions, and relationships in order of appearance.
    Use exact text for extractions. Do not paraphrase or overlap entities.
    Provide meaningful attributes for each entity to add context.""")

# Show one high-quality example.
examples = [
    lx.data.ExampleData(
        text="ROMEO. But soft! What light through yonder window breaks? It is the east, and Juliet is the sun.",
        extractions=[
            lx.data.Extraction(
                extraction_class="character",
                extraction_text="ROMEO",
                attributes={"emotional_state": "wonder"},
            ),
            lx.data.Extraction(
                extraction_class="emotion",
                extraction_text="But soft!",
                attributes={"feeling": "gentle awe"},
            ),
            lx.data.Extraction(
                extraction_class="relationship",
                extraction_text="Juliet is the sun",
                attributes={"type": "metaphor"},
            ),
        ],
    )
]
```

:::tip[Make each example verbatim]
Each `extraction_text` should be copied **exactly** from the example's `text`,
in order of appearance, with no overlaps. LangExtract checks this and emits
prompt-alignment warnings by default when examples don't follow the pattern.
Resolving those warnings meaningfully improves results.
:::

## 4. Run the extraction

```python
input_text = "Lady Juliet gazed longingly at the stars, her heart aching for Romeo"

result = lx.extract(
    text_or_documents=input_text,
    prompt_description=prompt,
    examples=examples,
    model_id="gemini-3.5-flash",
)
```

`result` is an `AnnotatedDocument`. Its `.extractions` is a list of `Extraction`
objects, each with the matched text, its character span in the source, and any
attributes the model assigned. See [Work with results](how-to/work-with-results)
for the full flow.

## 5. Save and visualize

Save the result to JSONL, then generate a self-contained interactive HTML file.

```python
# Save to JSONL.
lx.io.save_annotated_documents(
    [result],
    output_name="extraction_results.jsonl",
    output_dir=".",
)

# Build the visualization from the file.
html_content = lx.visualize("extraction_results.jsonl")

with open("visualization.html", "w") as f:
    # In a notebook, visualize() returns an HTML object with a .data attribute;
    # in a plain script it returns the HTML string directly.
    if hasattr(html_content, "data"):
        f.write(html_content.data)
    else:
        f.write(html_content)
```

Open `visualization.html` in a browser to step through every extraction
highlighted in its original context.

## What's next

- **Process a long document from a URL**, with multiple passes and parallel
  workers — see the [long-document workflow](how-to/long-document-workflow).
- **Use a different model** — [OpenAI](how-to/use-openai) or
  [a local model via Ollama](how-to/use-ollama).
- **Tune your prompt and examples** —
  [Write prompts & examples](how-to/write-prompts-and-examples).
