"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveRefreshToken } from "@/lib/auth";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSignedUp = searchParams.get("verified") === "pending";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<TokenResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      saveRefreshToken(data.refresh_token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
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

        <h1 className="text-[32px] leading-[1.04] tracking-[-0.02em]">Log in</h1>
        <p className="mt-3 text-[15px]" style={{ color: "var(--ink-2)" }}>
          Welcome back.
        </p>

        {justSignedUp && (
          <p className="mt-4 rounded-[7px] border px-3.5 py-3 text-[13.5px]" style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}>
            Check your email to verify your account before logging in.
          </p>
        )}

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
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[12.5px] font-medium uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
                Password
              </label>
              <Link href="/forgot-password" className="text-[12.5px] underline" style={{ color: "var(--ink-2)" }}>
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px]" style={{ color: "var(--ink-2)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium underline" style={{ color: "var(--ink)" }}>
            Sign up
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