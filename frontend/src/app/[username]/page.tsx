/**
 * [username]/page.tsx — Public profile page.
 * URL: /someuser or /@someuser (via Next.js middleware rewrite)
 */
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { BadgeRow } from "@/components/profile/BadgeRow";
import { Calendar, Users, FileText, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Params = { params: Promise<{ username: string }> };

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function fetchProfile(username: string) {
    try {
        const res = await fetch(`${API_URL}/users/${username}`, {
            next: { revalidate: 60 },
        });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
    } catch {
        return null;
    }
}

async function fetchUserPosts(username: string) {
    try {
        const res = await fetch(`${API_URL}/users/${username}/posts?limit=20`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// ─── OG / SEO Meta ────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { username } = await params;
    const profile = await fetchProfile(username);
    if (!profile) return { title: "Profile not found — YoTop10" };
    return {
        title: `${profile.display_name} (@${profile.username}) — YoTop10`,
        description: profile.bio ?? `Check out ${profile.display_name}'s profile on YoTop10.`,
        openGraph: {
            title: `${profile.display_name} (@${profile.username})`,
            description: profile.bio ?? "",
            images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
            type: "profile",
        },
        twitter: {
            card: "summary",
            title: `${profile.display_name} (@${profile.username})`,
            description: profile.bio ?? "",
            images: profile.avatar_url ? [profile.avatar_url] : [],
        },
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PrivacyGate({ profile }: { profile: { display_name: string; username: string; avatar_url?: string } }) {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
            <div className="w-24 h-24 rounded-full border-4 border-(--border-accent) overflow-hidden bg-[var(--bg-surface)] flex items-center justify-center">
                {profile.avatar_url
                    ? <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                    : <span className="text-4xl font-black text-[var(--text-muted)]">{profile.display_name[0]?.toUpperCase()}</span>}
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tight">{profile.display_name}</h1>
                <p className="text-[var(--text-muted)] font-mono text-sm mt-1">@{profile.username}</p>
            </div>
            <div className="mt-4 px-8 py-6 border border-(--border-accent) bg-[var(--bg-surface)]/50 rounded-2xl backdrop-blur-md max-w-sm">
                <p className="text-[var(--text-muted)] font-mono text-sm leading-relaxed">
                    🔒 This profile is visible to <strong>connections only</strong>.
                    Send a connection request to see their full profile.
                </p>
                <button className="mt-4 w-full bg-[var(--brand-primary)] text-white font-mono font-bold text-sm uppercase tracking-widest py-3 px-6 rounded-xl hover:opacity-90 transition-opacity">
                    Request Connection
                </button>
            </div>
        </div>
    );
}

function PostCard({ post }: { post: { id: string; title: string; post_type: string; created_at: string } }) {
    return (
        <Link
            href={`/post/${post.id}`}
            className="no-underline group flex flex-col gap-2 p-5 rounded-2xl border border-(--border-accent) bg-[var(--bg-surface)]/60 backdrop-blur-md hover:border-[var(--brand-primary)]/50 hover:bg-[var(--bg-surface)] transition-all duration-200"
        >
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--brand-primary)] opacity-80 border border-[var(--brand-primary)]/30 rounded-full px-2 py-0.5">
                    {post.post_type?.replace("_", " ")}
                </span>
                <span className="ml-auto text-xs text-[var(--text-muted)] font-mono">
                    {new Date(post.created_at).toLocaleDateString()}
                </span>
            </div>
            <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors leading-snug">
                {post.title}
            </h3>
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UserProfilePage({ params }: Params) {
    const { username } = await params;
    const [profile, posts] = await Promise.all([
        fetchProfile(username),
        fetchUserPosts(username),
    ]);

    if (!profile) notFound();

    if (profile.restricted) {
        return (
            <div className="max-w-2xl mx-auto py-8">
                <PrivacyGate profile={profile} />
            </div>
        );
    }

    const isAuthor: boolean = profile.author_tier === true;

    return (
        <div className="max-w-3xl mx-auto py-8 px-2">
            {/* ── Profile Card ── */}
            <section
                className={`relative p-8 rounded-3xl border backdrop-blur-md mb-8 overflow-hidden ${isAuthor
                    ? "border-amber-500/60 bg-amber-500/5 shadow-[0_0_40px_rgba(245,158,11,0.15)]"
                    : "border-(--border-accent) bg-[var(--bg-surface)]/60"
                    }`}
            >
                {isAuthor && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
                )}

                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className={`shrink-0 w-24 h-24 rounded-full overflow-hidden shadow-lg ${isAuthor ? "ring-4 ring-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "ring-2 ring-(--border-accent)"}`}>
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-[var(--brand-primary)] flex items-center justify-center text-white text-4xl font-black">
                                {profile.display_name[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
                                {profile.display_name}
                            </h1>
                            {isAuthor && (
                                <span className="flex items-center gap-1 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase border border-amber-400/50 rounded-full px-2 py-0.5 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                                    <ShieldCheck size={12} /> Author
                                </span>
                            )}
                        </div>
                        <p className="text-[var(--text-muted)] font-mono text-sm">@{profile.username}</p>
                        {profile.bio && (
                            <p className="text-[var(--text-primary)] text-sm leading-relaxed mt-1 max-w-lg">{profile.bio}</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-6 text-sm font-mono text-[var(--text-muted)]">
                    <span className="flex items-center gap-2">
                        <FileText size={15} className="text-[var(--brand-primary)]" />
                        <strong className="text-[var(--text-primary)]">{profile.post_count}</strong> posts
                    </span>
                    <span className="flex items-center gap-2">
                        <Users size={15} className="text-[var(--brand-primary)]" />
                        <strong className="text-[var(--text-primary)]">{profile.follower_count}</strong> followers
                    </span>
                    <span className="flex items-center gap-2">
                        <Users size={15} className="text-[var(--text-muted)]" />
                        <strong className="text-[var(--text-primary)]">{profile.following_count}</strong> following
                    </span>
                    <span className="flex items-center gap-2">
                        <Calendar size={15} />
                        Joined {new Date(profile.joined_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                </div>

                {profile.badges?.length > 0 && (
                    <div className="mt-5">
                        <BadgeRow badges={profile.badges} size="sm" />
                    </div>
                )}

                <div className="mt-6 flex gap-3 flex-wrap">
                    <button type="button" disabled className="px-6 py-2.5 rounded-full font-mono font-bold text-sm tracking-widest uppercase bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/40 text-[var(--brand-primary)] opacity-60 cursor-not-allowed">
                        Follow
                    </button>
                    <button type="button" disabled className="px-6 py-2.5 rounded-full font-mono font-bold text-sm tracking-widest uppercase bg-[var(--bg-surface)] border border-(--border-accent) text-[var(--text-muted)] opacity-60 cursor-not-allowed">
                        Connect
                    </button>
                </div>
            </section>

            {/* ── Post History ── */}
            <section>
                <h2 className="text-xl font-black tracking-tight mb-5 flex items-center gap-2 text-[var(--text-primary)]">
                    <FileText size={20} className="text-[var(--brand-primary)]" /> Posts
                </h2>
                {posts?.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {posts.map((post: { id: string; title: string; post_type: string; created_at: string }) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-[var(--text-muted)] font-mono text-sm py-12 border border-(--border-accent) rounded-2xl">
                        No posts yet.
                    </div>
                )}
            </section>
        </div>
    );
}
