import { useEffect, useRef, useState } from "react";
import type { DragEvent, FormEvent } from "react";
import {
  MESSAGE_MAX,
  compressImage,
  formatBytes,
  isValidEmail,
  validateImageFile,
} from "../../utils/lithophaneImage";

type Status =
  | "idle"
  | "compressing"
  | "ready"
  | "submitting"
  | "sent"
  | "error";

type Photo = {
  blob: Blob;
  previewUrl: string;
  name: string;
  originalSize: number;
};

const CONTACT_EMAIL = "info@forgerealm.co.uk";
const apiBase =
  import.meta.env.PUBLIC_API_URL_LOCAL || import.meta.env.PUBLIC_API_URL || "";

// Matches the landing page: glass fields, Jost labels, amber focus ring
const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1020]";
const inputClass = `block w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[15px] text-white placeholder:text-stone-500 transition-colors hover:border-white/20 aria-[invalid=true]:border-rose-400/70 ${focusRing}`;
const labelClass =
  "mb-1.5 block font-['Jost'] text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400";

// Full class strings (not built from pieces) so Tailwind can see them
const CTA = {
  default:
    "bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
  festive:
    "bg-gradient-to-r from-red-600 via-red-500 to-rose-400 shadow-lg shadow-red-500/25 hover:shadow-red-500/40",
};

export default function LithophaneForm({
  festive = false,
}: {
  festive?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropButtonRef = useRef<HTMLButtonElement>(null);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);
  // Ignore a slow compression if the user has picked another photo since
  const compressionId = useRef(0);

  const emailValid = isValidEmail(email);
  const detailsValid = name.trim().length > 0 && emailValid;
  const photoReady =
    photo !== null && (status === "ready" || status === "error");
  const canSubmit = photoReady && detailsValid;
  const showEmailError = emailTouched && email.trim() !== "" && !emailValid;
  const cta = festive ? CTA.festive : CTA.default;

  // Release the preview's object URL when it's replaced or the form unmounts
  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo.previewUrl);
    };
  }, [photo]);

  useEffect(() => {
    if (status === "sent") sentHeadingRef.current?.focus();
  }, [status]);

  const openPicker = () => fileInputRef.current?.click();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setSubmitError(null);

    const problem = validateImageFile(file);
    if (problem) {
      setFileError(problem);
      setAnnouncement(problem);
      return;
    }

    const id = ++compressionId.current;
    setFileError(null);
    setStatus("compressing");
    setAnnouncement("Shrinking your photo");

    try {
      const blob = await compressImage(file);
      if (id !== compressionId.current) return;
      setPhoto({
        blob,
        previewUrl: URL.createObjectURL(blob),
        name: file.name,
        originalSize: file.size,
      });
      setStatus("ready");
      setAnnouncement(
        `Photo ready, ${formatBytes(file.size)} down to ${formatBytes(blob.size)}. Now hit send.`,
      );
    } catch (err) {
      if (id !== compressionId.current) return;
      const text =
        err instanceof Error ? err.message : "We couldn't read that photo.";
      setFileError(text);
      setAnnouncement(text);
      // Keep any photo that was already attached before this failed replace
      setStatus(photo ? "ready" : "idle");
    }
  }

  function removePhoto() {
    compressionId.current++;
    setPhoto(null);
    setStatus("idle");
    setFileError(null);
    setAnnouncement("Photo removed");
    // The dropzone button re-renders in place of the preview; focus it after paint
    requestAnimationFrame(() => dropButtonRef.current?.focus());
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (status === "compressing" || status === "submitting") return;
    void handleFile(e.dataTransfer.files?.[0]);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || !photo) return;

    const form = new FormData();
    form.append("name", name.trim());
    form.append("email", email.trim());
    form.append("phone", phone.trim());
    form.append("message", message.trim());
    form.append(
      "website",
      (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)
        ?.value ?? "",
    );
    form.append("originalName", photo.name);
    form.append("originalSize", String(photo.originalSize));
    form.append("photo", photo.blob, "photo.jpg");

    setStatus("submitting");
    setSubmitError(null);
    setAnnouncement("Sending your request");

    try {
      const res = await fetch(`${apiBase}/api/lithophane`, {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        setStatus("sent");
        setAnnouncement("Request sent");
        return;
      }
      const data = await res.json().catch(() => ({}));
      const text =
        typeof data.error === "string"
          ? data.error
          : `Something went wrong sending your request. Please email your photo to ${CONTACT_EMAIL}.`;
      setSubmitError(text);
      setAnnouncement(text);
    } catch {
      const text = `We couldn't reach our server. Please check your connection, or email your photo to ${CONTACT_EMAIL}.`;
      setSubmitError(text);
      setAnnouncement(text);
    }
    setStatus("error");
  }

  function reset() {
    setPhoto(null);
    setName("");
    setEmail("");
    setEmailTouched(false);
    setPhone("");
    setMessage("");
    setSubmitError(null);
    setFileError(null);
    setStatus("idle");
    setAnnouncement("");
  }

  const live = (
    <p className="sr-only" aria-live="polite" role="status">
      {announcement}
    </p>
  );

  if (status === "sent") {
    return (
      <div className="py-6 text-center">
        {live}
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full border border-emerald-400/40 bg-emerald-400/10">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-7 w-7 text-emerald-300"
          >
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2
          ref={sentHeadingRef}
          tabIndex={-1}
          className="font-['Cinzel'] text-2xl font-bold text-white focus:outline-none"
        >
          Request sent
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-stone-400">
          Thanks, {name.trim().split(" ")[0]}. Your photo is with us. We'll
          reply to <span className="text-white">{email.trim()}</span> within 24
          hours on working days.
        </p>
        <button
          type="button"
          onClick={reset}
          className={`mt-6 rounded-full border border-white/25 bg-white/[0.05] px-6 py-2.5 font-['Cinzel'] text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/50 hover:text-white ${focusRing}`}
        >
          Send another photo
        </button>
      </div>
    );
  }

  const busy = status === "compressing" || status === "submitting";
  const readyText = detailsValid
    ? "Photo ready — now hit send"
    : "Photo ready — add your name and email, then hit send";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-3.5 [@media(max-height:800px)]:gap-2.5"
      aria-busy={busy}
    >
      {live}

      {/* Photo */}
      <div>
        <span id="photo-label" className={labelClass}>
          Your photo
        </span>
        <input
          ref={fileInputRef}
          id="photo"
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = ""; // allow choosing the same file again
          }}
        />
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {photo && status !== "compressing" ? (
            <div className="flex min-w-0 max-w-full items-center gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-400/[0.06] p-2.5">
              <img
                src={photo.previewUrl}
                alt="Preview of your photo"
                className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-[72px] sm:w-[72px]"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[14px] font-medium text-emerald-300">
                  <span
                    aria-hidden="true"
                    className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-400 text-[#0c1020]"
                  >
                    <svg viewBox="0 0 16 16" className="h-3 w-3">
                      <path
                        d="M3.5 8.5l3 3 6-6.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  {readyText}
                </p>
                <p
                  className="truncate text-[13px] text-white/90"
                  title={photo.name}
                >
                  {photo.name}
                </p>
                <p className="text-[12px] text-stone-400">
                  {`${formatBytes(photo.originalSize)} → ${formatBytes(photo.blob.size)}`}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={openPicker}
                  disabled={busy}
                  className={`rounded-md px-1.5 text-[13px] font-medium text-amber-200 underline underline-offset-2 hover:text-amber-100 ${focusRing}`}
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={removePhoto}
                  disabled={busy}
                  className={`rounded-md px-1.5 text-[13px] font-medium text-stone-400 underline underline-offset-2 hover:text-white ${focusRing}`}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              ref={dropButtonRef}
              type="button"
              onClick={openPicker}
              disabled={status === "compressing"}
              aria-labelledby="photo-label photo-hint"
              aria-describedby={fileError ? "photo-error" : undefined}
              className={`flex w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-center transition-colors sm:py-7 [@media(max-height:800px)]:py-3.5 ${focusRing} ${
                dragOver
                  ? "border-amber-300 bg-amber-300/10"
                  : fileError
                    ? "border-rose-400/70 bg-white/[0.02]"
                    : "border-white/20 bg-white/[0.02] hover:border-amber-300/50 hover:bg-white/[0.04]"
              }`}
            >
              <span id="photo-hint" className="block">
                {status === "compressing" ? (
                  <span className="text-[15px] font-medium text-white">
                    Shrinking your photo…
                  </span>
                ) : (
                  <>
                    <span className="block text-[15px] font-medium text-white">
                      <span className="hidden sm:inline">
                        Drop a photo here or click to choose
                      </span>
                      <span className="sm:hidden">Tap to choose a photo</span>
                    </span>
                    <span className="mt-1 block text-[12px] text-stone-500">
                      One image, up to 25 MB
                    </span>
                  </>
                )}
              </span>
            </button>
          )}
        </div>
        {fileError && (
          <p id="photo-error" className="mt-1.5 text-[13px] text-rose-300">
            {fileError}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="litho-name" className={labelClass}>
            Name
          </label>
          <input
            id="litho-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="litho-phone" className={labelClass}>
            Phone
            <span className="ml-1 normal-case tracking-normal text-stone-500">
              (optional)
            </span>
          </label>
          <input
            id="litho-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="litho-email" className={labelClass}>
          Email
        </label>
        <input
          id="litho-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          aria-invalid={showEmailError}
          aria-describedby={showEmailError ? "litho-email-error" : undefined}
          className={inputClass}
        />
        {showEmailError && (
          <p id="litho-email-error" className="mt-1 text-[13px] text-rose-300">
            Enter an email like name@example.com
          </p>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="litho-message" className={labelClass}>
            Message
            <span className="ml-1 normal-case tracking-normal text-stone-500">
              (optional)
            </span>
          </label>
          <span
            id="litho-message-count"
            className={`text-[11px] tabular-nums ${message.length >= MESSAGE_MAX ? "text-rose-300" : "text-stone-500"}`}
          >
            {`${message.length}/${MESSAGE_MAX}`}
          </span>
        </div>
        <textarea
          id="litho-message"
          name="message"
          rows={2}
          maxLength={MESSAGE_MAX}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-describedby="litho-message-count"
          placeholder="Size, frame, who it's for, anything we should know"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Honeypot: hidden from people and screen readers, irresistible to bots */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="litho-website">Website</label>
        <input
          id="litho-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {submitError && (
        <p className="rounded-xl border border-rose-400/40 bg-rose-400/[0.08] px-3.5 py-2.5 text-[13px] text-rose-200">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || busy}
        className={`mt-1 h-12 w-full rounded-full border font-['Cinzel'] text-[12px] font-semibold uppercase tracking-[0.16em] transition-all ${focusRing} ${
          status === "submitting"
            ? `cursor-wait border-white/30 text-white ${cta}`
            : canSubmit
              ? `border-white/30 text-white hover:-translate-y-0.5 ${cta}`
              : "cursor-not-allowed border-white/10 bg-white/[0.05] text-white/35"
        }`}
      >
        {status === "submitting" ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
