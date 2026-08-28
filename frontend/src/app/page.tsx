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