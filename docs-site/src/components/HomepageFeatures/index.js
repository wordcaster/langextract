import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Source grounding',
    description: (
      <>
        Every extraction is mapped back to its exact character span in the
        original text. Values the model can&apos;t locate are flagged, so
        hallucinations are easy to filter out.
      </>
    ),
  },
  {
    title: 'Structured output from examples',
    description: (
      <>
        You don&apos;t hand-write a schema. A few high-quality examples shape the
        output, and on supported models LangExtract applies schema constraints
        for consistency.
      </>
    ),
  },
  {
    title: 'Built for long documents',
    description: (
      <>
        Text is chunked, processed in parallel, and can run over multiple passes
        to improve recall on large inputs — books, reports, clinical notes.
      </>
    ),
  },
  {
    title: 'Interactive visualization',
    description: (
      <>
        Results export to JSONL and render as a self-contained HTML file that
        highlights every extracted entity in its original context.
      </>
    ),
  },
  {
    title: 'Multiple model backends',
    description: (
      <>
        Google Gemini (the default), OpenAI, and local models via Ollama work out
        of the box, with a plugin system for adding more providers.
      </>
    ),
  },
  {
    title: 'Open source',
    description: (
      <>
        Released under the Apache 2.0 license. Read the source, file issues, or
        extend it with your own providers on{' '}
        <Link to="https://github.com/google/langextract">GitHub</Link>.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.feature}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
