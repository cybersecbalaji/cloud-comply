import { useState, useRef, useEffect } from 'react';
import { X, MessageSquarePlus, Send, CheckCircle2, AlertCircle } from 'lucide-react';

type State = 'idle' | 'submitting' | 'success' | 'error';

function validate(name: string, email: string, message: string) {
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = 'Name is required.';
  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!message.trim()) errors.message = 'Feedback cannot be empty.';
  return errors;
}

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<State>('idle');
  const panelRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Focus first input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [open]);

  // Reset form when closed (after success animation)
  useEffect(() => {
    if (!open && state === 'success') {
      setTimeout(() => {
        setName(''); setEmail(''); setMessage('');
        setErrors({}); setState('idle');
      }, 300);
    }
  }, [open, state]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(name, email, message);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setState('submitting');
    try {
      const data = new FormData();
      data.append('name', name);
      data.append('email', email);
      data.append('message', message);
      const res = await fetch('https://formspree.io/f/xzdkjwlb', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      setState(res.ok ? 'success' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <>
      {/* Floating tab — right edge, vertically centred */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open feedback form"
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1.5 px-2.5 py-3 rounded-l-lg text-xs font-semibold shadow-lg transition-all duration-200
          ${open
            ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        <MessageSquarePlus className="w-4 h-4 shrink-0" style={{ transform: 'rotate(90deg)' }} />
        Feedback
      </button>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Feedback form"
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 w-[min(360px,calc(100vw-2rem))]
          bg-white dark:bg-slate-800 rounded-l-2xl shadow-2xl border border-r-0 border-slate-200 dark:border-slate-700
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Share Feedback</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close feedback form"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {state === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Thanks for your feedback!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">We'll review it and get back to you if needed.</p>
              <button
                onClick={() => setOpen(false)}
                className="mt-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {state === 'error' && (
                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Something went wrong. Please try again.
                </div>
              )}

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="fb-name" className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Name
                </label>
                <input
                  ref={firstInputRef}
                  id="fb-name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: '' })); }}
                  placeholder="Your name"
                  className={`text-sm rounded-lg border px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${errors.name ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}`}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label htmlFor="fb-email" className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Email
                </label>
                <input
                  id="fb-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: '' })); }}
                  placeholder="you@example.com"
                  className={`text-sm rounded-lg border px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${errors.email ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label htmlFor="fb-message" className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Feedback
                </label>
                <textarea
                  id="fb-message"
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setErrors((prev) => ({ ...prev, message: '' })); }}
                  placeholder="Tell us what you think..."
                  rows={4}
                  className={`text-sm rounded-lg border px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors
                    ${errors.message ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}`}
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={state === 'submitting'}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {state === 'submitting' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Feedback
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
