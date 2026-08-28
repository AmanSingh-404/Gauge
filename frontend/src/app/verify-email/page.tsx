"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    apiFetch<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: { token },
    })
      .then((data) => {
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed.");
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[400px] text-center">
        <Link href="/" className="mb-10 inline-flex items-center gap-2.5 text-[16px] font-semibold uppercase tracking-wide">
          <BlockMark />
          Gauge
        </Link>

        {status === "loading" && (
          <p className="text-[16px]" style={{ color: "var(--ink-2)" }}>
            Verifying your email...
          </p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-[28px] leading-[1.1] tracking-[-0.02em]">Email verified</h1>
            <p className="mt-3 text-[15px]" style={{ color: "var(--ink-2)" }}>
              {message}
            </p>
            <Link
              href="/login"
              className="mt-7 inline-flex rounded-[7px] px-6 py-3.5 text-[13.5px] font-semibold uppercase tracking-wider text-white"
              style={{
                background: "linear-gradient(100deg, var(--orange), var(--red))",
                boxShadow: "0 10px 26px -12px rgba(250,82,15,0.55)",
              }}
            >
              Log in
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-[28px] leading-[1.1] tracking-[-0.02em]">Verification failed</h1>
            <p className="mt-3 text-[15px]" style={{ color: "var(--red)" }}>
              {message}
            </p>
          </>
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