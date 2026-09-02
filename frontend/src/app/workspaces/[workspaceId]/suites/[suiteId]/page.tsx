"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

type TestCase = {
  id: string;
  input: string;
  expected_output: string | null;
  rubric: string | null;
};

type Prompt = {
  id: string;
  name: string;
};

type PromptVersion = {
  id: string;
  version_num: number;
};

export default function SuiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const suiteId = params.suiteId as string;

  const [token, setToken] = useState<string | null>(null);
  const [cases, setCases] = useState<TestCase[] | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [caseInput, setCaseInput] = useState("");
  const [caseExpected, setCaseExpected] = useState("");
  const [addingCase, setAddingCase] = useState(false);

  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);

  async function loadCases(accessToken: string) {
    const data = await apiFetch<TestCase[]>(
      `/workspaces/${workspaceId}/suites/${suiteId}/cases`,
      { token: accessToken }
    );
    setCases(data);
  }

  useEffect(() => {
    async function init() {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        router.push("/login");
        return;
      }
      setToken(accessToken);
      try {
        await loadCases(accessToken);
        const promptList = await apiFetch<Prompt[]>(`/workspaces/${workspaceId}/prompts/`, {
          token: accessToken,
        });
        setPrompts(promptList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load suite.");
      }
    }
    init();
  }, [workspaceId, suiteId, router]);

  async function handlePromptSelect(promptId: string) {
    setSelectedPromptId(promptId);
    setSelectedVersionId("");
    if (!token || !promptId) return;
    const versionList = await apiFetch<PromptVersion[]>(
      `/workspaces/${workspaceId}/prompts/${promptId}/versions`,
      { token }
    );
    setVersions(versionList);
  }

  async function handleAddCase(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setAddingCase(true);
    setError(null);
    try {
      await apiFetch(`/workspaces/${workspaceId}/suites/${suiteId}/cases`, {
        method: "POST",
        token,
        body: { input: caseInput, expected_output: caseExpected || null },
      });
      setCaseInput("");
      setCaseExpected("");
      await loadCases(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add test case.");
    } finally {
      setAddingCase(false);
    }
  }

  async function handleRunEval() {
    if (!token || !selectedVersionId) return;
    setRunning(true);
    setError(null);
    setRunId(null);
    try {
      const run = await apiFetch<{ id: string }>(`/workspaces/${workspaceId}/evals/run`, {
        method: "POST",
        token,
        body: {
          suite_id: suiteId,
          prompt_version_id: selectedVersionId,
          model: "mistral-small-latest",
          provider: "mistral",
        },
      });
      setRunId(run.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start eval run.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-[880px] px-6 py-16">
      <Link
        href={`/workspaces/${workspaceId}/suites`}
        className="mb-10 flex items-center gap-2.5 text-[16px] font-semibold uppercase tracking-wide"
      >
        <BlockMark />
        Gauge
      </Link>

      <h1 className="text-[32px] leading-[1.04] tracking-[-0.02em]">Test cases</h1>

      {error && (
        <p className="mt-4 text-[14px]" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}

      {/* Add test case */}
      <form onSubmit={handleAddCase} className="mt-8 space-y-3 rounded-[10px] border p-5" style={{ borderColor: "var(--line)" }}>
        <div className="text-[12.5px] font-medium uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
          Add test case
        </div>
        <textarea
          required
          placeholder="Input (e.g. a user question)"
          value={caseInput}
          onChange={(e) => setCaseInput(e.target.value)}
          rows={2}
          className="w-full rounded-[7px] border px-3.5 py-3 text-[15px] outline-none focus:border-[var(--orange)]"
          style={{ borderColor: "var(--line)" }}
        />
        <textarea
          placeholder="Expected output (optional)"
          value={caseExpected}
          onChange={(e) => setCaseExpected(e.target.value)}
          rows={2}
          className="w-full rounded-[7px] border px-3.5 py-3 text-[15px] outline-none focus:border-[var(--orange)]"
          style={{ borderColor: "var(--line)" }}
        />
        <button
          type="submit"
          disabled={addingCase}
          className="rounded-[7px] px-5 py-2.5 text-[13px] font-semibold uppercase tracking-wider text-white disabled:opacity-60"
          style={{ background: "linear-gradient(100deg, var(--orange), var(--red))" }}
        >
          {addingCase ? "Adding..." : "Add case"}
        </button>
      </form>

      {/* Test case list */}
      {cases && cases.length > 0 && (
        <div className="mt-6 space-y-3">
          {cases.map((c) => (
            <div key={c.id} className="rounded-[10px] border px-5 py-4" style={{ borderColor: "var(--line)" }}>
              <div className="text-[14.5px] font-medium">{c.input}</div>
              {c.expected_output && (
                <div className="mt-1.5 text-[13px]" style={{ color: "var(--ink-2)" }}>
                  Expected: {c.expected_output}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Run eval */}
      <div className="mt-10 rounded-[10px] border p-5" style={{ borderColor: "var(--line)" }}>
        <div className="mb-4 text-[12.5px] font-medium uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
          Run evaluation
        </div>

        <select
          value={selectedPromptId}
          onChange={(e) => handlePromptSelect(e.target.value)}
          className="w-full rounded-[7px] border px-3.5 py-3 text-[15px] outline-none"
          style={{ borderColor: "var(--line)" }}
        >
          <option value="">Select a prompt</option>
          {prompts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {versions.length > 0 && (
          <select
            value={selectedVersionId}
            onChange={(e) => setSelectedVersionId(e.target.value)}
            className="mt-3 w-full rounded-[7px] border px-3.5 py-3 text-[15px] outline-none"
            style={{ borderColor: "var(--line)" }}
          >
            <option value="">Select a version</option>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                Version {v.version_num}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleRunEval}
          disabled={!selectedVersionId || running}
          className="mt-4 w-full rounded-[7px] px-6 py-3.5 text-[13.5px] font-semibold uppercase tracking-wider text-white disabled:opacity-50"
          style={{ background: "linear-gradient(100deg, var(--orange), var(--red))" }}
        >
          {running ? "Starting..." : "Run Eval"}
        </button>

        {runId && (
          <div className="mt-4 rounded-[7px] border px-3.5 py-3 text-[14px]" style={{ borderColor: "var(--line)" }}>
            Run started.{" "}
            <Link
              href={`/workspaces/${workspaceId}/evals/${runId}`}
              className="font-medium underline"
              style={{ color: "var(--orange)" }}
            >
              View results →
            </Link>
          </div>
        )}
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