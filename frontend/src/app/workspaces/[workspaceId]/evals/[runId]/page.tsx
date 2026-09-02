"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

type EvalRun = {
  id: string;
  model: string;
  provider: string;
  status: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
};

type EvalResult = {
  id: string;
  test_case_id: string;
  response_text: string;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  correctness_score: number | null;
  hallucination_score: number | null;
};

export default function EvalResultsPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const runId = params.runId as string;

  const [run, setRun] = useState<EvalRun | null>(null);
  const [results, setResults] = useState<EvalResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout>;

    async function poll() {
      const token = await getAccessToken();
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const runData = await apiFetch<EvalRun>(
          `/workspaces/${workspaceId}/evals/runs/${runId}`,
          { token }
        );
        if (cancelled) return;
        setRun(runData);

        const resultsData = await apiFetch<EvalResult[]>(
          `/workspaces/${workspaceId}/evals/runs/${runId}/results`,
          { token }
        );
        if (cancelled) return;
        setResults(resultsData);

        if (runData.status === "pending" || runData.status === "running") {
          pollTimer = setTimeout(poll, 2000);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load run.");
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(pollTimer);
    };
  }, [workspaceId, runId, router]);

  return (
    <div className="mx-auto max-w-[880px] px-6 py-16">
      <Link
        href={`/workspaces/${workspaceId}/suites`}
        className="mb-10 flex items-center gap-2.5 text-[16px] font-semibold uppercase tracking-wide"
      >
        <BlockMark />
        Gauge
      </Link>

      <h1 className="text-[32px] leading-[1.04] tracking-[-0.02em]">Eval run</h1>

      {error && (
        <p className="mt-4 text-[14px]" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}

      {run && (
        <div className="mt-6 flex flex-wrap gap-6 rounded-[10px] border px-5 py-4" style={{ borderColor: "var(--line)" }}>
          <StatusBadge status={run.status} />
          <div className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>
            {run.provider} · {run.model}
          </div>
        </div>
      )}

      {run && (run.status === "pending" || run.status === "running") && (
        <p className="mt-6 text-[14px]" style={{ color: "var(--ink-2)" }}>
          Running... this page updates automatically.
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((r) => (
            <div key={r.id} className="rounded-[10px] border p-5" style={{ borderColor: "var(--line)" }}>
              <div className="text-[14.5px]">{r.response_text}</div>
              <div className="mt-4 flex flex-wrap gap-6 border-t pt-4" style={{ borderColor: "var(--line)" }}>
                <Metric label="Correctness" value={r.correctness_score} />
                <Metric label="Hallucination" value={r.hallucination_score} invert />
                <div>
                  <div className="text-[13px] font-medium">{r.latency_ms}ms</div>
                  <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
                    Latency
                  </div>
                </div>
                <div>
                  <div className="text-[13px] font-medium">
                    {r.input_tokens} / {r.output_tokens}
                  </div>
                  <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
                    In / Out tokens
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "completed" ? "var(--good)" : status === "failed" ? "var(--red)" : "var(--amber)";
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-[13px] font-semibold uppercase tracking-wide">{status}</span>
    </div>
  );
}

function Metric({ label, value, invert }: { label: string; value: number | null; invert?: boolean }) {
  if (value === null) {
    return (
      <div>
        <div className="text-[13px] font-medium" style={{ color: "var(--ink-2)" }}>
          —
        </div>
        <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
          {label}
        </div>
      </div>
    );
  }
  const good = invert ? value < 0.3 : value > 0.7;
  return (
    <div>
      <div className="text-[13px] font-medium" style={{ color: good ? "var(--good)" : "var(--orange)" }}>
        {(value * 100).toFixed(0)}%
      </div>
      <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
        {label}
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