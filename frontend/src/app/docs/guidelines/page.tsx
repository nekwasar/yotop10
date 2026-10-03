import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description:
    "YoTop10 Community Guidelines — anti-spam rules, moderation standards, anonymity policy, AI disclosure, and how to report content.",
  robots: { index: true, follow: true },
};

export default function CommunityGuidelinesPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-16 text-white">
      <nav className="mb-12 max-w-3xl mx-auto">
        <Link href="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors">
          &larr; Back to Docs
        </Link>
      </nav>

      <article className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Community Guidelines</h1>
          <p className="text-sm text-zinc-500">Last updated: October 2026</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-6 text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. What YoTop10 Is For</h2>
            <p>
              YoTop10 is a platform for ranked lists, long-form articles, and community debate.
              Content should be created by people who want to inform, compare, or persuade — not
              to game ranking systems, farm engagement, or distribute marketing material. These
              guidelines apply to every post, article, and comment on the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Anti-Spam Rules</h2>
            <p>Do not:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Post repetitive, auto-generated, or near-identical content across categories or
                accounts.
              </li>
              <li>
                Use list titles, descriptions, or comments purely for search-engine manipulation,
                keyword stuffing, or link building.
              </li>
              <li>
                Publish unsolicited promotional content, affiliate link dumps, or off-topic
                advertising.
              </li>
              <li>
                Post purely to solicit reactions — engagement-bait phrasing such as &ldquo;only true
                fans will finish this list&rdquo; is removed on sight.
              </li>
              <li>
                Create accounts or submissions at scale. Automated or bulk posting leads to
                rate limiting and account restriction.
              </li>
            </ul>
            <p>
              If a large share of your activity looks machine-generated rather than
              human-authored, it may be withheld from search indexing or limited until it is
              reviewed. This protects the quality of results for everyone else.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Moderation Rules</h2>
            <p>
              Content is moderated through a combination of community reports, automated quality
              checks, and human review. Reported items enter a moderation queue where reviewers
              decide whether to dismiss the report or take action on the content.
            </p>
            <p>Possible outcomes include:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Dismissal — the report is rejected and nothing changes.</li>
              <li>
                Removal — content that breaks these guidelines or our Terms of Use is deleted.
              </li>
              <li>
                Restriction — accounts that repeatedly break the rules lose posting privileges
                for a period.
              </li>
              <li>
                Reduced reach — borderline content can stay visible to its audience while being
                excluded from recommendation and search surfaces.
              </li>
            </ul>
            <p>
              Moderators record every action with a reason. If your content was removed in error,
              contact support with the content link and we will re-review it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Anonymity and Accountability</h2>
            <p>
              You may post under a pseudonym. Every profile, post, and article still resolves to a
              stable public profile page, so authorship is attributable even when your legal name
              is never shown. That profile carries your contribution history and tenure, which
              other readers can weigh when they judge your claims.
            </p>
            <p>
              Reporters stay confidential. The person you report never sees who filed the report —
              moderators only see the reason and any details you provide.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. AI-Assisted Content</h2>
            <p>
              Using AI tools to draft or research content is allowed as long as you take
              responsibility for it. You must mark AI-assisted content so readers know its origin,
              and you must verify facts, numbers, and sources yourself before publishing.
            </p>
            <p>
              Publishing unreviewed AI output that repeats misinformation, fabricates sources, or
              mass-produces near-duplicate lists is a violation of these guidelines. Disclose
              AI-assisted content with the AI-assisted checkbox when you submit — readers will
              see an AI-assisted badge on your post or article.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. How to Report Content</h2>
            <p>
              Every post, article, and comment has a <strong className="text-white">Report</strong>{" "}
              action. Choose the reason that fits best — spam, harassment, misinformation,
              illegal content, or something else — and add details if they help reviewers.
            </p>
            <p>
              Reports are rate limited to keep the queue usable, and you cannot report your own
              content. Duplicate reports of content you already flagged are recorded once. Most
              reports are reviewed within a short time during moderation hours.
            </p>
            <p>
              For urgent safety issues, report the content and include specifics in the details
              field — that is what reviewers read first.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Consequences of Abuse</h2>
            <p>
              First-time mistakes are usually handled with a warning or a simple removal. Repeat
              or deliberate abuse — spam networks, harassment campaigns, or fabricated content
              presented as fact — leads to restriction or permanent loss of the account.
            </p>
            <p>
              We may update these guidelines as the platform evolves. Continued use of YoTop10
              means you accept the current version. See also our{" "}
              <Link href="/docs/terms" className="text-orange-400 hover:text-orange-300 transition">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="/docs/privacy" className="text-orange-400 hover:text-orange-300 transition">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
