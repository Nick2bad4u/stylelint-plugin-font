import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import GitHubStats from "../components/GitHubStats";
import { docsCatalogStats } from "../data/docsCatalog";
import styles from "./index.module.css";

type HeroBadge = {
    readonly description: string;
    readonly icon: string;
    readonly label: string;
};

type HeroStat = {
    readonly description: string;
    readonly headline: string;
};

type HomeCard = {
    readonly description: string;
    readonly icon: string;
    readonly title: string;
    readonly to: string;
};

const heroBadges = [
    {
        description:
            "Built around Stylelint's native plugin-pack model and ESM config authoring.",
        icon: "\uf013",
        label: "Stylelint-native",
    },
    {
        description:
            "Focused on font management, like validation of `@font-face` rules and `font-weight` descriptors.",
        icon: "\uf5fd",
        label: "Font-focused",
    },
    {
        description:
            "Prioritizes developer experience with clear error messages, helpful documentation, and intuitive configuration.",
        icon: "\uf0ad",
        label: "DX-first",
    },
] as const satisfies readonly HeroBadge[];

const heroStats = [
    {
        description:
            "Rules based around common font management pitfalls and best practices.",
        headline: `\uf0ca ${String(docsCatalogStats.publicRuleCount)} Public Rule${docsCatalogStats.publicRuleCount === 1 ? "" : "s"}`,
    },
    {
        description:
            "Start with a conservative default or opt into the full stable catalog later.",
        headline: `\ue690 ${String(docsCatalogStats.shareableConfigCount)} Shareable Config${docsCatalogStats.shareableConfigCount === 1 ? "" : "s"}`,
    },
    {
        description:
            "Designed for a smooth onboarding experience and iterative improvement based on user feedback.",
        headline: "\udb80\udc68 DX-first Design",
    },
] as const satisfies readonly HeroStat[];

const overviewButtonIcon = "\udb81\udf1d";
const compareConfigsButtonIcon = "\udb85\udc92";
const heroKickerIcon = "\uf0ad";
const heroKickerIcon2 = "\uf135";
const homepageDescription =
    "Explore stylelint-plugin-font documentation, configs, and template guidance for Docusaurus-focused CSS linting.";
const homepageKeywords =
    "stylelint-plugin-font, stylelint, docusaurus, infima, css linting, postcss, docs tooling";
const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    codeRepository: "https://github.com/Nick2bad4u/stylelint-plugin-font",
    description: homepageDescription,
    image: "https://nick2bad4u.github.io/stylelint-plugin-font/img/logo.png",
    license:
        "https://github.com/Nick2bad4u/stylelint-plugin-font/blob/main/LICENSE",
    name: "stylelint-plugin-font",
    programmingLanguage: "TypeScript",
    runtimePlatform: "Node.js",
    url: "https://nick2bad4u.github.io/stylelint-plugin-font/",
} as const;
const homepageSocialImageUrl =
    "https://nick2bad4u.github.io/stylelint-plugin-font/img/logo.png";

const homeCards = [
    {
        description:
            "Install the package, enable a shareable config, and understand the plugin-pack export shape.",
        icon: "\uf135",
        title: "Get Started",
        to: "/docs/rules/getting-started",
    },
    {
        description:
            "Compare the exported configs and understand why `recommended` stays conservative while `all` adds stricter opt-in rules.",
        icon: "\ue690",
        title: "Configs",
        to: "/docs/rules/configs",
    },
    {
        description:
            "Track the current development status, ongoing improvements, and upcoming features.",
        icon: "\uf02d",
        title: "Current Status",
        to: "/docs/rules/guides/current-status",
    },
] as const satisfies readonly HomeCard[];

/** Render the Docusaurus landing page for the documentation site. */
export default function Home() {
    const logoSrc = useBaseUrl("/img/logo.svg");

    return (
        <Layout
            description={homepageDescription}
            title="Stylelint rules for Docusaurus styles"
        >
            <Head>
                <meta content={homepageKeywords} name="keywords" />
                <meta content={homepageSocialImageUrl} property="og:image" />
                <meta content="summary_large_image" name="twitter:card" />
                <meta content={homepageSocialImageUrl} name="twitter:image" />
                <script type="application/ld+json">
                    {JSON.stringify(homepageStructuredData)}
                </script>
            </Head>
            <header className={styles.heroBanner}>
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroGrid}>
                        <div>
                            <p className={styles.heroKicker}>
                                {`${heroKickerIcon} Stylelint template for Docusaurus teams ${heroKickerIcon2}`}
                            </p>
                            <Heading as="h1" className={styles.heroTitle}>
                                stylelint-plugin-font
                            </Heading>
                            <p className={styles.heroSubtitle}>
                                A Stylelint plugin for font management, start
                                with{" "}
                                <Link
                                    className={`${styles.heroInlineLink} ${styles.heroInlineLinkStylelint}`}
                                    to="/docs/rules/overview"
                                >
                                    Rule Overview
                                </Link>{" "}
                                and{" "}
                                <Link
                                    className={`${styles.heroInlineLink} ${styles.heroInlineLinkDocusaurus}`}
                                    to="/docs/rules/getting-started"
                                >
                                    Getting Started
                                </Link>
                                .
                            </p>

                            <div className={styles.heroBadgeRow}>
                                {heroBadges.map((badge) => (
                                    <article
                                        key={badge.label}
                                        className={styles.heroBadge}
                                    >
                                        <p className={styles.heroBadgeLabel}>
                                            <span
                                                aria-hidden="true"
                                                className={styles.heroBadgeIcon}
                                            >
                                                {badge.icon}
                                            </span>
                                            {badge.label}
                                        </p>
                                        <p
                                            className={
                                                styles.heroBadgeDescription
                                            }
                                        >
                                            {badge.description}
                                        </p>
                                    </article>
                                ))}
                            </div>

                            <div className={styles.heroActions}>
                                <Link
                                    className={`button button--lg ${styles.heroActionButton} ${styles.heroActionPrimary}`}
                                    to="/docs/rules/overview"
                                >
                                    {overviewButtonIcon} Start with Overview
                                </Link>
                                <Link
                                    className={`button button--lg ${styles.heroActionButton} ${styles.heroActionSecondary}`}
                                    to="/docs/rules/configs"
                                >
                                    {compareConfigsButtonIcon} Explore Configs
                                </Link>
                            </div>
                        </div>

                        <aside className={styles.heroPanel}>
                            <img
                                alt="stylelint-plugin-font logo"
                                className={styles.heroPanelLogo}
                                decoding="async"
                                height="240"
                                loading="eager"
                                src={logoSrc}
                                width="240"
                            />
                        </aside>
                    </div>

                    <GitHubStats className={styles.heroLiveBadges} />

                    <div className={styles.heroStats}>
                        {heroStats.map((stat) => (
                            <article
                                key={stat.headline}
                                className={styles.heroStatCard}
                            >
                                <p className={styles.heroStatHeading}>
                                    {stat.headline}
                                </p>
                                <p className={styles.heroStatDescription}>
                                    {stat.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <section className="container">
                    <div className={styles.cardGrid}>
                        {homeCards.map((card) => (
                            <article key={card.title} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <p className={styles.cardIcon}>
                                        {card.icon}
                                    </p>
                                    <Heading
                                        as="h2"
                                        className={styles.cardTitle}
                                    >
                                        {card.title}
                                    </Heading>
                                </div>
                                <p className={styles.cardDescription}>
                                    {card.description}
                                </p>
                                <Link className={styles.cardLink} to={card.to}>
                                    Open section →
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </Layout>
    );
}
