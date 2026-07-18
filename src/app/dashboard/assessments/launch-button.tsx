"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LaunchButton({
  assessmentId,
  assessmentTitle,
}: {
  assessmentId: string;
  assessmentTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"internal" | "external">("internal");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLink, setMagicLink] = useState("");
  const router = useRouter();

  async function handleLaunch() {
    if (!customerName.trim()) return;
    setLoading(true);

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessmentDefinitionId: assessmentId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        mode,
      }),
    });

    if (!res.ok) {
      alert("Failed to launch assessment");
      setLoading(false);
      return;
    }

    const data = await res.json();

    if (mode === "internal") {
      router.push(`/dashboard/assessments/fill/${data.submission.id}`);
    } else {
      setMagicLink(data.publicUrl);
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(magicLink);
    alert("Link copied to clipboard!");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-primary-700 hover:to-primary-600"
      >
        Launch
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold">
              Launch: {assessmentTitle}
            </h2>

            {/* Mode selector */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setMode("internal")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === "internal"
                    ? "bg-blue-600 text-white"
                    : "border bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Internal (On-Behalf)
              </button>
              <button
                onClick={() => setMode("external")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === "external"
                    ? "bg-blue-600 text-white"
                    : "border bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                External (Magic Link)
              </button>
            </div>

            {!magicLink ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Customer Name
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {mode === "external" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@acme.com"
                      className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLaunch}
                    disabled={loading || !customerName.trim()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading
                      ? "Creating..."
                      : mode === "internal"
                        ? "Start Assessment"
                        : "Generate Link"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-green-600">
                  ✅ Magic link generated!
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={magicLink}
                    className="flex-1 rounded-lg border bg-gray-50 px-3 py-2 text-xs"
                  />
                  <button
                    onClick={copyLink}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setOpen(false);
                      setMagicLink("");
                      setCustomerName("");
                      setCustomerEmail("");
                    }}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
