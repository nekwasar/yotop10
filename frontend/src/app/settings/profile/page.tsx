/**
 * settings/profile/page.tsx — Authenticated profile settings page.
 *
 * Three panels:
 *  1. Avatar Upload (with instant preview, progress bar, and MinIO upload)
 *  2. Profile Info (display name + bio + char counter)
 *  3. Privacy Settings (auto-saving radio group)
 */
"use client";
import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Camera, User, FileText, Globe, Lock, Users, CheckCircle2, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const MAX_BIO_CHARS = 300;
const MAX_NAME_CHARS = 50;

type PrivacyLevel = "public" | "connections_only" | "private";

const PRIVACY_OPTIONS: { value: PrivacyLevel; label: string; desc: string; Icon: typeof Globe }[] = [
    { value: "public", label: "Public", desc: "Anyone can view your full profile.", Icon: Globe },
    { value: "connections_only", label: "Connections Only", desc: "Only approved connections can see your profile.", Icon: Users },
    { value: "private", label: "Private", desc: "Only you can see your profile.", Icon: Lock },
];

// ─────────────────────────────────────────────────
// Toast helper
// ─────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
    return (
        <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl font-mono text-sm font-bold tracking-widest shadow-lg animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 ${type === "success"
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                    : "bg-red-500/20 border border-red-500/40 text-red-400"
                }`}
        >
            {type === "success" ? <CheckCircle2 size={18} /> : null}
            {msg}
        </div>
    );
}

export default function ProfileSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Redirect unauthenticated users
    useEffect(() => {
        if (status === "unauthenticated") router.push("/login?callbackUrl=/settings/profile");
    }, [status, router]);

    // ── State ────────────────────────────────────────────────────────────────
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [privacy, setPrivacy] = useState<PrivacyLevel>("public");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [initialised, setInitialised] = useState(false);

    // Load profile data (via /auth/me initially, then use session)
    useEffect(() => {
        if (status !== "authenticated" || initialised) return;
        const load = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
                });
                if (!res.ok) return;
                const user = await res.json();
                setDisplayName(user.display_name ?? "");
                setBio(user.bio ?? "");
                setPrivacy((user.profile_visibility as PrivacyLevel) ?? "public");
                setInitialised(true);
            } catch { /* silently fail — user can still edit */ }
        };
        load();
    }, [status, session, initialised]);

    // ── Avatar Handlers ───────────────────────────────────────────────────────
    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setUploading(true);
        setUploadProgress(10);
        try {
            const formData = new FormData();
            formData.append("file", avatarFile);

            // Simulate progress while waiting — real progress needs XHR
            const interval = setInterval(() => {
                setUploadProgress((p) => (p < 85 ? p + 15 : p));
            }, 300);

            const res = await fetch(`${API_URL}/users/me/avatar`, {
                method: "POST",
                headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
                body: formData,
            });

            clearInterval(interval);
            setUploadProgress(100);

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Upload failed");
            }

            showToast("Avatar updated!", "success");
            setAvatarFile(null);
        } catch (e: any) {
            showToast(e.message || "Upload failed", "error");
        } finally {
            setUploading(false);
            setTimeout(() => setUploadProgress(0), 800);
        }
    };

    // ── Profile Save ──────────────────────────────────────────────────────────
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await fetch(`${API_URL}/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${(session as any)?.accessToken}`,
                },
                body: JSON.stringify({ display_name: displayName, bio }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Save failed");
            }
            showToast("Profile saved!", "success");
        } catch (e: any) {
            showToast(e.message || "Save failed", "error");
        } finally {
            setSavingProfile(false);
        }
    };

    // ── Auto-save Privacy ─────────────────────────────────────────────────────
    const handlePrivacyChange = async (value: PrivacyLevel) => {
        setPrivacy(value);
        try {
            await fetch(`${API_URL}/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${(session as any)?.accessToken}`,
                },
                body: JSON.stringify({ privacy: value }),
            });
            showToast("Privacy setting saved.", "success");
        } catch {
            showToast("Could not save privacy setting.", "error");
        }
    };

    const showToast = (msg: string, type: "success" | "error") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (status === "loading" || status === "unauthenticated") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={32} className="animate-spin text-[var(--brand-primary)]" />
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-2xl mx-auto py-10 px-4 flex flex-col gap-8">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-[var(--text-primary)]">
                <User size={28} className="text-[var(--brand-primary)]" />
                Profile Settings
            </h1>

            {/* ── Panel 1: Avatar ───────────────────────────────────────────── */}
            <section className="p-6 rounded-2xl border border-(--border-accent) bg-[var(--bg-surface)]/60 backdrop-blur-md flex flex-col gap-5">
                <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-[var(--brand-primary)] flex items-center gap-2">
                    <Camera size={16} /> Avatar
                </h2>

                <div className="flex items-center gap-6">
                    {/* Preview */}
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-(--border-accent) bg-[var(--bg-base)] shrink-0 flex items-center justify-center">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-[var(--text-muted)]" />
                        )}
                    </div>

                    <div className="flex flex-col gap-3 flex-1">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 rounded-xl border border-(--border-accent) bg-[var(--bg-base)]/50 text-[var(--text-primary)] font-mono text-sm font-bold tracking-widest uppercase hover:border-[var(--brand-primary)] transition-colors duration-200"
                        >
                            Choose Photo
                        </button>
                        <p className="text-xs text-[var(--text-muted)] font-mono">
                            JPEG, PNG, or WebP · Max 5 MB · Resized to 400×400
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                {uploadProgress > 0 && (
                    <div className="w-full h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}

                {avatarFile && (
                    <button
                        type="button"
                        onClick={handleAvatarUpload}
                        disabled={uploading}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white font-mono font-bold text-sm tracking-widest uppercase disabled:opacity-60 hover:scale-[1.01] active:scale-95 transition-all duration-200"
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                        {uploading ? "Uploading..." : "Save Avatar"}
                    </button>
                )}
            </section>

            {/* ── Panel 2: Profile Info ─────────────────────────────────────── */}
            <section className="p-6 rounded-2xl border border-(--border-accent) bg-[var(--bg-surface)]/60 backdrop-blur-md">
                <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-[var(--brand-primary)] flex items-center gap-2 mb-5">
                    <FileText size={16} /> Profile Info
                </h2>
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                    {/* Display Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)] pl-1">
                            Display Name
                        </label>
                        <input
                            type="text"
                            maxLength={MAX_NAME_CHARS}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-[var(--bg-base)]/50 text-[var(--text-primary)] rounded-xl px-5 py-4 border border-(--border-accent) outline-none focus:border-[var(--brand-primary)] font-mono tracking-wide backdrop-blur-md transition-all duration-200"
                            placeholder="Your display name"
                        />
                        <span className="text-xs text-[var(--text-muted)] self-end font-mono">
                            {displayName.length}/{MAX_NAME_CHARS}
                        </span>
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)] pl-1">
                            Bio
                        </label>
                        <textarea
                            maxLength={MAX_BIO_CHARS}
                            rows={4}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-[var(--bg-base)]/50 text-[var(--text-primary)] rounded-xl px-5 py-4 border border-(--border-accent) outline-none focus:border-[var(--brand-primary)] font-mono tracking-wide backdrop-blur-md resize-none transition-all duration-200"
                            placeholder="Tell the grid who you are…"
                        />
                        <span className="text-xs text-[var(--text-muted)] self-end font-mono">
                            {bio.length}/{MAX_BIO_CHARS}
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={savingProfile}
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white font-mono font-bold text-sm tracking-widest uppercase disabled:opacity-60 hover:scale-[1.01] active:scale-95 transition-all duration-200"
                    >
                        {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        {savingProfile ? "Saving…" : "Save Profile"}
                    </button>
                </form>
            </section>

            {/* ── Panel 3: Privacy Settings ─────────────────────────────────── */}
            <section className="p-6 rounded-2xl border border-(--border-accent) bg-[var(--bg-surface)]/60 backdrop-blur-md">
                <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-[var(--brand-primary)] flex items-center gap-2 mb-5">
                    <Lock size={16} /> Privacy
                </h2>

                <div className="flex flex-col gap-3">
                    {PRIVACY_OPTIONS.map(({ value, label, desc, Icon }) => (
                        <label
                            key={value}
                            className={`flex items-center gap-4 cursor-pointer rounded-xl border px-5 py-4 transition-all duration-200 ${privacy === value
                                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                                    : "border-(--border-accent) hover:border-[var(--brand-primary)]/40"
                                }`}
                        >
                            <input
                                type="radio"
                                name="privacy"
                                value={value}
                                checked={privacy === value}
                                onChange={() => handlePrivacyChange(value)}
                                className="accent-[var(--brand-primary)] w-4 h-4"
                            />
                            <Icon
                                size={18}
                                className={privacy === value ? "text-[var(--brand-primary)]" : "text-[var(--text-muted)]"}
                            />
                            <div>
                                <p className="font-mono font-bold text-sm text-[var(--text-primary)]">{label}</p>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
                            </div>
                            {privacy === value && (
                                <CheckCircle2 size={18} className="ml-auto text-[var(--brand-primary)]" />
                            )}
                        </label>
                    ))}
                </div>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-4">Changes save automatically when you select an option.</p>
            </section>

            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    );
}
