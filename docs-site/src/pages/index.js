import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/quickstart">
            Get started — Quickstart
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/intro"
            style={{marginLeft: '0.75rem'}}>
            What is LangExtract?
          </Link>
        </div>
      </div>
    </header>
  );
}

function Disclaimer() {
  return (
    <section className={styles.disclaimer}>
      <div className="container">
        <p>
          LangExtract is open source under the Apache 2.0 license and is{' '}
          <strong>not an officially supported Google product</strong>. This is an
          independent documentation site and is not official Google
          documentation.
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Documentation for LangExtract: LLM-powered structured extraction from text, grounded to the source.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <Disclaimer />
      </main>
    </Layout>
  );
}
