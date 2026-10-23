"use client";

import { useEffect, useId, useState } from "react";

// Studio's WhatsApp number (India). Enquiries are handed off via a WhatsApp
// "click to chat" link — there is no backend here, so the visitor's browser
// opens WhatsApp with the message pre-filled; they still tap Send themselves.
const WHATSAPP_NUMBER = "919363433280";

interface EnquiryFormState {
  projectType: string;
  location: string;
  phone: string;
  callTime: string;
}

const EMPTY_FORM: EnquiryFormState = {
  projectType: "",
  location: "",
  phone: "",
  callTime: "",
};

function buildWhatsAppUrl(form: EnquiryFormState): string {
  const message = [
    "New enquiry from the Aazhi Studio website:",
    "",
    `Project type: ${form.projectType}`,
    `Location: ${form.location}`,
    `Contact number: ${form.phone}`,
    `Best time to call: ${form.callTime}`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

interface EnquiryModalProps {
  triggerLabel?: string;
  triggerClassName?: string;
}

export default function EnquiryModal({
  triggerLabel = "Enquire",
  triggerClassName = "eyebrow rounded-full border border-brown px-5 py-2 text-brown transition-colors hover:bg-brown hover:text-ivory",
}: EnquiryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<EnquiryFormState>(EMPTY_FORM);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    // Lock background scroll while the dialog is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = buildWhatsAppUrl(form);
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
    setForm(EMPTY_FORM);
  };

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setIsOpen(true)}>
        {triggerLabel}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 px-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-2xl bg-ivory p-8 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-brown/60">Enquire</p>
                <h2 id={titleId} className="heading-display mt-1 text-2xl text-brown">
                  Tell us about your space.
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="text-xl leading-none text-brown/60 transition-colors hover:text-brown"
                onClick={() => setIsOpen(false)}
              >
                &times;
              </button>
            </div>

            <p className="mt-3 text-sm text-charcoal/70">
              Share a few details and we&apos;ll open WhatsApp with your message
              ready to send to our studio.
            </p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-1.5">
                <span className="eyebrow text-brown/70">Project type</span>
                <input
                  required
                  type="text"
                  placeholder="e.g. Villa interiors, apartment, office"
                  value={form.projectType}
                  onChange={(e) => setForm((f) => ({ ...f, projectType: e.target.value }))}
                  className="rounded-lg border border-brown/20 bg-ivory px-3 py-2 text-charcoal outline-none transition-colors focus:border-brown"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="eyebrow text-brown/70">Location</span>
                <input
                  required
                  type="text"
                  placeholder="City or area"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="rounded-lg border border-brown/20 bg-ivory px-3 py-2 text-charcoal outline-none transition-colors focus:border-brown"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="eyebrow text-brown/70">Contact number</span>
                <input
                  required
                  type="tel"
                  placeholder="Your phone number"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="rounded-lg border border-brown/20 bg-ivory px-3 py-2 text-charcoal outline-none transition-colors focus:border-brown"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="eyebrow text-brown/70">Best time to call</span>
                <input
                  required
                  type="text"
                  placeholder="e.g. Weekdays after 6 PM"
                  value={form.callTime}
                  onChange={(e) => setForm((f) => ({ ...f, callTime: e.target.value }))}
                  className="rounded-lg border border-brown/20 bg-ivory px-3 py-2 text-charcoal outline-none transition-colors focus:border-brown"
                />
              </label>

              <button
                type="submit"
                className="eyebrow mt-2 rounded-full bg-brown px-5 py-3 text-ivory transition-colors hover:bg-charcoal"
              >
                Send via WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
