"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("No reset token found in the link.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: { token, new_password: newPassword },
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
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

        <h1 className="text-[32px] leading-[1.04] tracking-[-0.02em]">Set a new password</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
              New password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
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