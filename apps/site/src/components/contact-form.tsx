"use client";

import { Mail, X } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

export function ContactForm({ triggerLabel = "Say hello" }: { triggerLabel?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setNotice("");
    setFailed(false);
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"),
          email: values.get("email"),
          subject: values.get("subject"),
          message: values.get("message"),
          _gotcha: values.get("_gotcha"),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || result.message || "Could not send your message.");
      setNotice("Your message has been sent. Thanks for getting in touch.");
      form.reset();
    } catch (error) {
      setFailed(true);
      setNotice(error instanceof Error ? error.message : "Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setNotice(""); setFailed(false); dialogRef.current?.showModal(); }}
        className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background transition-opacity hover:opacity-85"
      >
        <Mail className="size-3.5" /> {triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="contact-dialog-title"
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(620px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/10 bg-[#090909] p-0 text-white shadow-2xl backdrop:bg-black/75"
        onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}
      >
        <div className="relative p-6 sm:p-7">
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close contact form" className="absolute right-4 top-4 rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
            <X className="size-4" />
          </button>
          <h2 id="contact-dialog-title" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Mail className="size-5" /> Contact Me
          </h2>
          <p className="mt-1.5 text-sm text-white/60">Fill out the form below to get in touch.</p>

          {notice && <p role="status" className={`mt-4 rounded-lg border px-3 py-2 text-sm ${failed ? "border-red-400/30 bg-red-500/10 text-red-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"}`}>{notice}</p>}

          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <input name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/60">
                Name
                <input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Your Name" className="h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/45 focus:border-white/30 focus:ring-2 focus:ring-white/10" />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/60">
                Email
                <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" className="h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/45 focus:border-white/30 focus:ring-2 focus:ring-white/10" />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/60">
              Subject
              <input name="subject" required minLength={3} maxLength={200} placeholder="What is this about?" className="h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/45 focus:border-white/30 focus:ring-2 focus:ring-white/10" />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/60">
              Message
              <textarea name="message" required minLength={10} maxLength={5000} rows={4} placeholder="Your Message..." className="min-h-24 resize-y rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/45 focus:border-white/30 focus:ring-2 focus:ring-white/10" />
            </label>
            <button type="submit" disabled={sending} className="mt-1 h-11 rounded-lg bg-white px-4 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
              {sending ? "Sending…" : "Send Message"}
            </button>
            <p className="-mt-2 text-center text-xs text-white/50">Your details are kept private and used only to respond to your inquiry.</p>
          </form>
        </div>
      </dialog>
    </>
  );
}
