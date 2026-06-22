# Handoff — LangExtract docs site (Diátaxis restructure + portfolio piece)

Updated: 2026-06-22. Point-in-time handoff. The canonical, append-only record is
`PROJECT-LOG.md` (read it first, update it last).

## What this is

Independent Docusaurus documentation site for `google/langextract` (v1.5.0),
restructured along Diátaxis. Portfolio project. NOT official Google docs:
LangExtract is "not an officially supported Google product", so never frame the
site as official or affiliated.

## Where

- Repo (local): `C:\Users\jayro\Documents\GitHub\langextract-docs`
- Fork: `wordcaster/langextract` (pinned to upstream tag v1.5.0)
- Work branch: `docs-site` (HEAD `45e26ff`); site source lives here
- `main`: `fef3e7d`; clean mirror of upstream, UNTOUCHED, keep it that way
- Deployed: `gh-pages` branch (built output at root; deploy commit `72fc9f5`)
- Live URL: https://wordcaster.github.io/langextract/ (serves once Pages is enabled)
- Site dir: `docs-site/` (run npm + build/deploy from here; `node_modules` present)

## Current state (done)

- 12 docs pages, one Diátaxis type each:
  intro (Concept), quickstart (Tutorial), concepts/{how-extraction-works,
  grounding, model-backends}, how-to/{long-document-workflow, use-openai,
  use-ollama, write-prompts-and-examples, work-with-results, api-keys},
  reference/api.
- Build is strict-green: `onBrokenLinks` + `onBrokenAnchors` +
  `onBrokenMarkdownLinks` all `throw`.
- Gemini code examples are live-tested by an out-of-repo harness (16 blocks pass);
  OpenAI/Ollama/credential examples are syntax-checked and source-verified.
- Prose: Google developer style guide applied; NO em dashes in page prose
  (colon/comma/parentheses by role). Keep future pages em-dash-free.
- Scaffold chrome (config, homepage, logo, footer disclaimer) is real, not template.
- Deploy config in `docusaurus.config.js`: `url=https://wordcaster.github.io`,
  `baseUrl=/langextract/`, `organizationName=wordcaster`,
  `projectName=langextract`, `deploymentBranch=gh-pages`.
- Portfolio README at `docs-site/README.md`.

## Immediate next steps (John, manual, not done)

1. Enable GitHub Pages on the fork: Settings > Pages > Source "Deploy from a
   branch" > Branch `gh-pages` > folder `/ (root)` > Save.
2. Confirm the live site serves: open https://wordcaster.github.io/langextract/
   and check the homepage, nav, and a doc page load.

## Open / deferred

- chat-Claude: accuracy cross-check vs v1.5.0 source, Diátaxis type-purity audit,
  cross-reference and continuity review (not self-certified by Claude Code).
- John: stranger-read of the running site for prose and IA quality.
- Optional nicety: add explicit `trailingSlash` to `docusaurus.config.js`
  (Docusaurus warned; SEO/redirect nit, not required).
- Separate pass (after the URL is confirmed live): fill portfolio-site and
  profile-README links to the live site.
- Later doc passes: Troubleshooting page, custom-provider how-to, deeper
  per-area API reference. Each slots into an existing Diátaxis type, no rework.

## Rules / fixed facts

- Git identity for commits: user.name "John Rojas", user.email jay.rojas@gmail.com.
- Author/persona: John Edgar Rojas (17 yrs experience). Conductor model: agents
  draft, John approves; draft-until-approved.
- Source of truth: the v1.5.0 package source in `langextract/`. Never invent API.
- Key safety: `LANGEXTRACT_API_KEY` comes from a local `.env` in the sibling repo
  `the-argonauts` (`C:\Users\jayro\Documents\GitHub\the-argonauts\.env`). Load it
  for a run only; NEVER print, write, or commit it; harness and venvs live
  OUTSIDE the repo.
- Continuity: `PROJECT-LOG.md` (project root) is canonical; read first, update
  last. `CONTENT-MODEL.md` holds the approved content model.

## How to redeploy

`gh-pages` now exists and is non-empty, so the standard deploy works directly:

```
cd docs-site
GIT_USER=wordcaster npm run deploy
```

(PowerShell: `$env:GIT_USER='wordcaster'; npm run deploy`.) It builds from the
working tree and force-pushes the build output to `gh-pages`. If it ever fails on
AUTHENTICATION, stop; that is John's to manage.

## Commit trail (docs-site)

```
45e26ff homepage tweak (user)   <- current HEAD
3972521 docs: add deploy config and portfolio README
82985b5 Remove em dashes from docs prose
e0c46aa Apply Google developer documentation style guide to docs prose
70b408e Expand docs: how-to section, Diátaxis cleanup, admonition fix, example-tested
c31feaa Add Docusaurus documentation site for LangExtract (first slice)
```
