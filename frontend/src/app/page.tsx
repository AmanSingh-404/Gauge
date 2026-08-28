export default function Home() {
  return (
    <>
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b" style={{ borderColor: "var(--line)", background: "rgba(251,251,248,0.86)", backdropFilter: "blur(12px)" }}>
        <nav className="mx-auto flex h-[76px] max-w-[1220px] items-center justify-between px-8">
          <div className="flex items-center gap-2.5 text-[16px] font-semibold uppercase tracking-wide">
            <BlockMark />
            Gauge
          </div>
          <div className="hidden gap-9 text-[13px] font-medium uppercase tracking-wider md:flex" style={{ color: "var(--ink-2)" }}>
            <a href="#method" className="hover:opacity-70">Method</a>
            <a href="#ci" className="hover:opacity-70">CI Integration</a>
            <a href="#stats" className="hover:opacity-70">Numbers</a>
          </div>
          <a href="#" className="rounded-[7px] border px-6 py-3.5 text-[13.5px] font-semibold uppercase tracking-wider" style={{ borderColor: "var(--line)" }}>
            Get Started
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden pt-26 pb-15">
        <div
          className="pointer-events-none absolute -right-20 top-5 -z-10 h-[380px] w-[380px] rounded-[20px] opacity-40 blur-[100px]"
          style={{
            background:
              "conic-gradient(from 200deg, var(--yellow), var(--amber), var(--orange), var(--red), var(--yellow))",
          }}
        />
        <div className="mx-auto max-w-[1220px] px-8">
          <div className="max-w-[760px]">
            <div className="mb-5 flex items-center gap-2.5 text-[12.5px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink-2)" }}>
              <BlockMark />
              Prompt Evaluation
            </div>
            <h1 className="text-[42px] leading-[0.98] tracking-[-0.03em] sm:text-[64px] lg:text-[92px]">
              <span className="block">Know it works.</span>
              <span className="block">
                Before it{" "}
                <span
                  style={{
                    background: "linear-gradient(100deg, var(--orange), var(--red))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  ships.
                </span>
              </span>
            </h1>
            <p className="mt-8 max-w-[46ch] text-[18px]" style={{ color: "var(--ink-2)" }}>
              Gauge tests every prompt and model change against the same suite, scores accuracy, hallucination and cost, and shows the difference before it reaches production.
            </p>
            <div className="mt-9 flex flex-wrap gap-3.5">
              
              <a href="#"
                className="rounded-[7px] px-6 py-3.5 text-[13.5px] font-semibold uppercase tracking-wider text-white"
                style={{
                  background: "linear-gradient(100deg, var(--orange), var(--red))",
                  boxShadow: "0 10px 26px -12px rgba(250,82,15,0.55)",
                }}
              >
                Run an Eval
              </a>
              
              <a href="#ci"
                className="rounded-[7px] border px-6 py-3.5 text-[13.5px] font-semibold uppercase tracking-wider"
                style={{ borderColor: "var(--line)" }}
              >
                Read the Docs
              </a>
            </div>
            <div className="mt-4 text-[12.5px]" style={{ color: "var(--ink-2)" }}>
              Free to start · no credit card
            </div>
          </div>
        </div>
                  <div className="relative mt-19 pb-12">
            {/* Floating badges */}
            <div className="absolute left-[4%] top-[6%] hidden -rotate-6 items-center gap-2 rounded-[10px] border bg-white px-3.5 py-2.5 text-[11.5px] font-medium shadow-[0_16px_30px_-14px_rgba(31,20,10,0.24)] sm:flex" style={{ borderColor: "var(--line)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--good)" }} />
              Correctness +3.1%
            </div>
            <div className="absolute right-[4%] top-0 hidden rotate-5 items-center gap-2 rounded-[10px] border bg-white px-3.5 py-2.5 text-[11.5px] font-medium shadow-[0_16px_30px_-14px_rgba(31,20,10,0.24)] sm:flex" style={{ borderColor: "var(--line)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--orange)" }} />
              Hallucination flagged
            </div>
            <div className="absolute bottom-[2%] left-[8%] hidden rotate-4 items-center gap-2 rounded-[10px] border bg-white px-3.5 py-2.5 text-[11.5px] font-medium shadow-[0_16px_30px_-14px_rgba(31,20,10,0.24)] sm:flex" style={{ borderColor: "var(--line)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--amber)" }} />
              3 models compared
            </div>

            {/* Eval report card */}
            <div
              className="mx-auto max-w-[540px] -rotate-[1.2deg] rounded-[14px] border bg-white px-6 pb-5 pt-6 shadow-[0_40px_80px_-34px_rgba(31,20,10,0.28)]"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: "var(--line)" }} />
                  <span className="h-2 w-2 rounded-full" style={{ background: "var(--line)" }} />
                  <span className="h-2 w-2 rounded-full" style={{ background: "var(--line)" }} />
                </div>
                <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
                  support-agent-v4
                </div>
              </div>
              <div className="mb-3.5 text-[16.5px] font-semibold">Eval Report</div>

              <ReportRow label="Correctness" value="91% → 94%" good />
              <ReportRow label="Hallucination" value="2% → 5%" warn />
              <ReportRow label="Latency" value="820ms → 780ms" good />

              <div className="mt-3 border-t pt-3 text-[12.5px] font-semibold" style={{ borderColor: "var(--line)", color: "var(--good)" }}>
                ✓ Below threshold — merge allowed
              </div>
            </div>
          </div>
      </section>
            {/* LOGO STRIP */}
      <div className="border-y" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex max-w-[1220px] flex-wrap items-center gap-11 px-8 py-10 text-[13.5px] font-medium uppercase tracking-wide" style={{ color: "var(--ink-2)" }}>
          <span>Benchmarks</span>
          <span>Claude</span>
          <span>GPT</span>
          <span>Gemini</span>
          <span>+ any OpenAI-compatible model</span>
        </div>
      </div>

      {/* METHOD */}
      <section id="method" className="py-27">
        <div className="mx-auto max-w-[1220px] px-8">
          <div className="mb-13 max-w-[56ch]">
            <div className="mb-4.5 flex items-center gap-2.5 text-[12.5px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink-2)" }}>
              <BlockMark />
              The Method
            </div>
            <h2 className="mt-4.5 text-[32px] leading-[1.04] tracking-[-0.02em] sm:text-[46px]">
              Six checks. Every run.
            </h2>
            <p className="mt-4 max-w-[48ch] text-[16.5px]" style={{ color: "var(--ink-2)" }}>
              No dashboards to babysit — every response is scored the same way, automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              tint="#FFF7D6"
              iconColor="#B58A00"
              title="Multi-model benchmarking"
              desc="Run the same suite against Claude, GPT, and Gemini at once, ranked on one leaderboard."
            />
            <Feature
              tint="#FFEFDD"
              iconColor="var(--amber)"
              title="Regression diffing"
              desc="Compare prompt versions side by side and see exactly what got better or worse."
            />
            <Feature
              tint="#FFE7DC"
              iconColor="var(--orange)"
              title="Hallucination scoring"
              desc="A second model checks every claim against the source context, not just the wording."
            />
            <Feature
              tint="#FCE3E5"
              iconColor="var(--red)"
              title="RAG-aware evaluation"
              desc="Retrieval and generation are scored separately, so failures point to the right stage."
            />
            <Feature
              tint="#FFF7D6"
              iconColor="#B58A00"
              title="CI-gated merges"
              desc="A GitHub App runs your suite on every pull request and comments the results directly."
            />
            <Feature
              tint="#FFEFDD"
              iconColor="var(--amber)"
              title="Human review queue"
              desc="Low-confidence scores route to a person, and their labels sharpen the next run."
            />
          </div>
        </div>
      </section>
    </>
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
function ReportRow({
  label,
  value,
  good,
  warn,
}: {
  label: string;
  value: string;
  good?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-dashed py-2.5 text-[13.5px] last:border-b-0" style={{ borderColor: "var(--line)" }}>
      <span className="flex items-center gap-2" style={{ color: "var(--ink-2)" }}>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: good ? "var(--good)" : warn ? "var(--orange)" : "var(--line)" }}
        />
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
function Feature({
  tint,
  iconColor,
  title,
  desc,
}: {
  tint: string;
  iconColor: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="rounded-[14px] border bg-white p-6.5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-22px_rgba(31,20,10,0.25)]"
      style={{ borderColor: "var(--line)" }}
    >
      <div
        className="mb-4 flex h-9.5 w-9.5 items-center justify-center rounded-[9px]"
        style={{ background: tint, color: iconColor }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
          <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="mb-2 text-[16.5px] font-semibold">{title}</h3>
      <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        {desc}
      </p>
    </div>
  );
}