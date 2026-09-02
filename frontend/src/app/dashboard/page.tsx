"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

type Workspace = {
  id: string;
  name: string;
  plan_tier: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const token = await getAccessToken();
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const data = await apiFetch<Workspace[]>("/workspaces/", { token });
        setWorkspaces(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workspaces.");
      }
    }
    load();
  }, [router]);

  return (
    <div className="mx-auto max-w-[880px] px-6 py-16">
      <Link href="/" className="mb-10 flex items-center gap-2.5 text-[16px] font-semibold uppercase tracking-wide">
        <BlockMark />
        Gauge
      </Link>

      <h1 className="text-[32px] leading-[1.04] tracking-[-0.02em]">Your workspaces</h1>

      {error && (
        <p className="mt-6 text-[14px]" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}

      {workspaces === null && !error && (
        <p className="mt-6 text-[15px]" style={{ color: "var(--ink-2)" }}>
          Loading...
        </p>
      )}

      {workspaces && workspaces.length === 0 && (
        <p className="mt-6 text-[15px]" style={{ color: "var(--ink-2)" }}>
          You don&apos;t have any workspaces yet.
        </p>
      )}

      {workspaces && workspaces.length > 0 && (
        <div className="mt-8 space-y-3">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/workspaces/${ws.id}/suites`}
              className="block rounded-[10px] border px-5 py-4 transition-colors hover:border-[var(--orange)]"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="text-[16px] font-medium">{ws.name}</div>
              <div className="mt-1 text-[12.5px] uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
                {ws.plan_tier} plan
              </div>
            </Link>
          ))}
        </div>
      )}
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