# LangExtract documentation (Diátaxis restructure)

An independent restructure of the documentation for [LangExtract](https://github.com/google/langextract), Google's open-source LLM structured-extraction library, rebuilt as a Docusaurus site organized along [Diátaxis](https://diataxis.fr) lines.

This is a portfolio project. It is not an official or affiliated Google product; LangExtract is "not an officially supported Google product" per its own README, and this documentation is a separate, unofficial effort.

Live site: https://wordcaster.github.io/langextract

## What it is

Upstream, LangExtract's documentation is a single long README. This project reorganizes it into a navigable site with a clear separation of concerns:

- Tutorial: a quickstart from install to a first grounded extraction.
- Concepts: how extraction works, grounding, and model backends.
- How-to guides: task-focused recipes, including a flagship long-document workflow, OpenAI and Ollama backends, writing prompts and examples, working with results, and supplying API keys.
- Reference: the API surface, verified against the v1.5.0 package source.

## Run it locally

```
cd docs-site
npm install
npm run start
```

The site opens at http://localhost:3000/langextract/.

## How it was built

The site came out of an orchestrated, verified AI-assisted workflow: the information architecture and content model designed first, content drafted under direction, and a verification layer with mechanical link and anchor checks, an example harness that runs every code sample live, a guard proving the prose passes never touched code, and an independent accuracy and structure review. A full writeup is in progress.
