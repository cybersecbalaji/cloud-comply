import { Info, User, Code2, Linkedin } from 'lucide-react';

export function About() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          CloudComply is a static compliance mapping dashboard — no backend, no auth, all data lives in the browser.
        </p>
      </div>

      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">About CloudComply</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          A compliance reference tool mapping Australian ISM and ISO 27001:2022 controls to AWS and Azure native services,
          helping organisations understand their cloud security posture.
        </p>
      </div>

      {/* Project note */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Project Note</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          This was built as a quick side project to explore the capabilities of{' '}
          <span className="font-medium text-slate-800 dark:text-slate-200">Claude Code</span> — Anthropic's AI-powered CLI.
          The control mappings, UI, charts, and PDF/CSV exports were all generated through an AI-assisted workflow with minimal manual coding.
        </p>
      </div>

      {/* Author */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Author</h2>
        </div>
        <p className="text-slate-800 dark:text-slate-200 font-medium">Balaji Rajasekaran</p>
        <a
          href="https://www.linkedin.com/in/cybersecbalaji/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline min-h-[44px]"
        >
          <Linkedin className="w-3.5 h-3.5" />
          linkedin.com/in/cybersecbalaji
        </a>
      </div>

      {/* Stack */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">Stack</h2>
        <div className="flex flex-wrap gap-2">
          {['React 19', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'Zustand', 'Recharts', 'jsPDF'].map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
