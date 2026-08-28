"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="mb-10 flex items-center gap-2.5 text-[16px] font-semibold uppercase tracking-wide">
          <BlockMark />
          Gauge
        </Link>

        <h1 className="text-[32px] leading-[1.04] tracking-[-0.02em]">Reset your password</h1>
        <p className="mt-3 text-[15px]" style={{ color: "var(--ink-2)" }}>
          We&apos;ll email you a reset link.
        </p>

        {submitted ? (
          <p className="mt-8 rounded-[7px] border px-3.5 py-3 text-[14px]" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
            If that email exists, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[7px] border px-3.5 py-3 text-[15px] outline-none focus:border-[var(--orange)]"
                style={{ borderColor: "var(--line)" }}
              />
            </div>

            {error && (
              <p className="text-[13.5px]" style={{ color: "var(--red)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[7px] px-6 py-3.5 text-[13.5px] font-semibold uppercase tracking-wider text-white disabled:opacity-60"
              style={{
                background: "linear-gradient(100deg, var(--orange), var(--red))",
                boxShadow: "0 10px 26px -12px rgba(250,82,15,0.55)",
              }}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[14px]" style={{ color: "var(--ink-2)" }}>
          <Link href="/login" className="font-medium underline" style={{ color: "var(--ink)" }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

function BlockMark() {
  return (
    <span className="grid h-[18px] w-[18px] shrink-0 grid-cols-2 gap-[2px]">
      <span style={{ background: "var(--yellow)" }} />
      <span style={{ background: "var(--amber)" }} />
      <span style={{ background: "var(--orange)" }} />
      <span style={{ background: "var(--red)" }} />
    </span>
  );
}