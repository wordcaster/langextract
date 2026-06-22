---
sidebar_position: 2
title: Grounding
---

# Grounding

Grounding ties every extraction back to the exact span of source text it came
from. It is what lets you trust (and verify) what the model produced, rather
than taking a JSON blob on faith. This page explains the concept; to act on it
(filtering, slicing, highlighting), see
[Work with results](../how-to/work-with-results).

## `char_interval`: where an extraction lives

Each `Extraction` carries a `char_interval` that records where LangExtract found
its text in the source. The interval is half-open: `start_pos` is inclusive and
`end_pos` is exclusive, so `source_text[start_pos:end_pos]` returns the matched
substring.

## A set interval means grounded; `None` means ungrounded

The most important thing `char_interval` tells you is whether an extraction is
*real*:

- **Set**: LangExtract located the text in the source, and the interval is its
  exact position.
- **`None`**: the model produced a value that does not appear in the source.
  This is the signal for a likely hallucination, or for content the model copied
  from your examples rather than the input.

Treating a `None` interval as "unverified" is the core safety habit when working
with extractions.

## Exact and fuzzy alignment

When an extraction *is* grounded, `alignment_status` records how LangExtract
matched its text to the source:

- **`MATCH_EXACT`**: the extraction text matched the source character for
  character.
- **`MATCH_FUZZY`**: it matched approximately, within a configurable similarity
  threshold, which absorbs small differences such as whitespace or punctuation.
- **`MATCH_GREATER` / `MATCH_LESSER`**: it matched a span larger or smaller than
  the extraction text.

LangExtract prefers exact matching; fuzzy alignment lets grounding survive the
minor reformatting a model sometimes applies. The thresholds and algorithm that
govern fuzzy matching are tuning parameters, documented in the
[API reference](../reference/api#1-lxextract).

## See also

- [How extraction works](how-extraction-works): where the align and ground
  stages sit in the pipeline.
- [Work with results](../how-to/work-with-results): filter to grounded results
  and highlight them in context.
- [API reference §2](../reference/api#2-data-types): the exact `Extraction` and
  `CharInterval` fields and types.
