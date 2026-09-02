"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

type TestSuite = {
  id: string;
  name: string;
  created_at: string;
};

export default function SuitesPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [token, setToken] = useState<string | null>(null);
  const [suites, setSuites] = useState<TestSuite[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadSuites(accessToken: string) {
    try {
      const data = await apiFetch<TestSuite[]>(`/workspaces/${workspaceId}/suites/`, {
        token: accessToken,
      });
      setSuites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load suites.");
    }
  }

  useEffect(() => {
    async function init() {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        router.push("/login");
        return;
      }
      setToken(accessToken);
      await loadSuites(accessToken);
    }
    init();
  }, [workspaceId, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      await apiFetch(`/workspaces/${workspaceId}/suites/`, {
        method: "POST",
        token,
        body: { name: newName },
      });
      setNewName("");
      await loadSuites(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create suite.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-[880px] px-6 py-16">
      <Link href="/dashboard" className="mb-10 flex items-center gap-2.5 text-[16px] font-semibold uppercase tracking-wide">
        <BlockMark />
        Gauge
      </Link>

      <h1 className="text-[32px] leading-[1.04] tracking-[-0.02em]">Test suites</h1>

      <form onSubmit={handleCreate} className="mt-8 flex gap-3">
        <input
          type="text"
          required
          placeholder="New suite name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 rounded-[7px] border px-3.5 py-3 text-[15px] outline-none focus:border-[var(--orange)]"
          style={{ borderColor: "var(--line)" }}
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-[7px] px-6 py-3 text-[13.5px] font-semibold uppercase tracking-wider text-white disabled:opacity-60"
          style={{
            background: "linear-gradient(100deg, var(--orange), var(--red))",
          }}
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-[14px]" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}

      {suites === null && !error && (
        <p className="mt-8 text-[15px]" style={{ color: "var(--ink-2)" }}>
          Loading...
        </p>
      )}

      {suites && suites.length === 0 && (
        <p className="mt-8 text-[15px]" style={{ color: "var(--ink-2)" }}>
          No test suites yet. Create one above.
        </p>
      )}

      {suites && suites.length > 0 && (
        <div className="mt-8 space-y-3">
          {suites.map((suite) => (
            <Link
              key={suite.id}
              href={`/workspaces/${workspaceId}/suites/${suite.id}`}
              className="block rounded-[10px] border px-5 py-4 transition-colors hover:border-[var(--orange)]"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="text-[16px] font-medium">{suite.name}</div>
              <div className="mt-1 text-[12.5px]" style={{ color: "var(--ink-2)" }}>
                Created {new Date(suite.created_at).toLocaleDateString()}
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