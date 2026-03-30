import { X, Copy, ExternalLink, Check, Wrench } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { ServiceChip } from '@/components/ServiceChip';
import {
  COVERAGE_COLOURS,
  ISO_THEME_COLOURS,
  RESPONSIBILITY_COLOURS,
  SERVICE_COLOURS,
} from '@/lib/utils';

export function ControlDetailPanel() {
  const { selectedControl, setSelectedControl } = useStore();
  const [copied, setCopied] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedControl(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setSelectedControl]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    // Swipe right-to-left → close (delta < -60px)
    if (delta > 60) setSelectedControl(null);
    touchStartX.current = null;
  }

  if (!selectedControl) return null;

  const c = selectedControl;

  function handleCopy() {
    navigator.clipboard.writeText(c.control_id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {
      // Clipboard API unavailable (non-HTTPS or permission denied) — no-op
    });
  }

  // Only allow https:// URLs to prevent javascript: or data: injection
  const safeSourceUrl = c.source_url.startsWith('https://') ? c.source_url : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={() => setSelectedControl(null)}
      />
      {/* Panel */}
      <aside
        className="slide-panel fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 z-50 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-mono text-sm">
              {c.control_id}
            </Badge>
            <Badge className={COVERAGE_COLOURS[c.coverage_status]}>{c.coverage_status}</Badge>
          </div>
          <button
            onClick={() => setSelectedControl(null)}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* ISM hierarchy */}
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
              ISM Guideline
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{c.ism_guideline}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.ism_section}</p>
            {c.ism_topic && c.ism_topic !== 'General' && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">{c.ism_topic}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
              Control Description
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {c.ism_description}
            </p>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            <Badge className={ISO_THEME_COLOURS[c.iso_theme]}>{c.iso_theme}</Badge>
            <Badge className={SERVICE_COLOURS[c.service_category] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}>{c.service_category}</Badge>
            <Badge className={RESPONSIBILITY_COLOURS[c.responsibility]}>{c.responsibility}</Badge>
          </div>

          {/* Classification levels */}
          {c.classification_levels && c.classification_levels.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                Classification Levels
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.classification_levels.map((level) => (
                  <span
                    key={level}
                    className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  >
                    {level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ISO Control */}
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
              ISO 27001 Control
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {c.iso_control_id} — {c.iso_control_name}
            </p>
          </div>

          {/* AWS Services */}
          {c.aws_services.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                AWS Services
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.aws_services.map((s) => (
                  <ServiceChip key={s} name={s} category={c.service_category} />
                ))}
              </div>
            </div>
          )}

          {/* Azure Services */}
          {c.azure_services.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                Azure Services
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.azure_services.map((s) => (
                  <ServiceChip key={s} name={s} category={c.service_category} />
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
              Implementation Notes
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              {c.notes}
            </p>
          </div>

          {/* Third-party tools — only for Partial / Gap controls */}
          {(c.coverage_status === 'Partial' || c.coverage_status === 'Gap') &&
            c.third_party_tools && c.third_party_tools.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Wrench className="w-3.5 h-3.5 text-violet-500" />
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Recommended Third-Party Tools
                </p>
              </div>
              <div className="space-y-2">
                {c.third_party_tools.map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-violet-700 dark:group-hover:text-violet-300">
                          {tool.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                          {tool.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                        {tool.purpose}
                      </p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-violet-400 shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Control ID'}
            </button>
            {safeSourceUrl && (
              <a
                href={safeSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Source
              </a>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
