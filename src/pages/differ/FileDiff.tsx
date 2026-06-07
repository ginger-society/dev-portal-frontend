import { useState, useEffect, useRef, useMemo } from 'react';
import styles from './fileDiff.module.scss';
import { capitalize, fileDir, fileName, statusLabel } from './helpers';
import { FileDiff, HighlightedLine } from '@/services/ginger-gitter_client';
import { GingerGitter } from '@/services';

// ── Theme hook ────────────────────────────────────────────────────────────────

const isDark = () =>
  document.documentElement.getAttribute('data-theme') === 'dark';

const useIsDark = () => {
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDark()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);
  return dark;
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconFile = () => (
  <svg
    width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

// ── Unified merge helpers ─────────────────────────────────────────────────────
//
// We merge the full-file lines with the diff lines to produce a single list
// where every line has a role: 'context' | 'added' | 'removed'.
//
// Strategy:
//  1. Build a map: newLineno → diff line (for '+' and ' ' lines).
//  2. Build a map: newLineno → list of removed lines that precede it
//     (removed lines have no newLineno, so we anchor them to the next
//      context/added line using the diff ordering).
//  3. Walk fullFileLines in order. Before each line, inject any removed lines
//     anchored to that line's lineno. Then emit the line itself, tagged as
//     'added' if the diff says so, or 'context' otherwise.

type MergedRole = 'context' | 'added' | 'removed';

interface MergedLine {
  role: MergedRole;
  oldLineno: number | null;  // shown in left gutter
  newLineno: number | null;  // shown in right gutter
  highlighted: string;       // syntax-highlighted HTML
  content: string;
}

function buildMergedLines(
  fullFileLines: HighlightedLine[],
  diffLines: FileDiff['lines'],
  dark: boolean,
): MergedLine[] {
  const lines = diffLines ?? [];

  // Map newLineno → diff role for lines present in the new file
  const newLineRole = new Map<number, MergedRole>();
  for (const l of lines) {
    if (l.newLineno != null) {
      newLineRole.set(l.newLineno, l.origin === '+' ? 'added' : 'context');
    }
  }

  // Anchor removed lines: for each '-' line, find the very next line in the
  // diff sequence that has a newLineno, and register the removed line there.
  // We preserve the order of consecutive removed lines.
  const removedBefore = new Map<number, typeof lines>();

  let pendingRemoved: typeof lines = [];
  for (const l of lines) {
    if (l.origin === '-') {
      pendingRemoved.push(l);
    } else if (l.newLineno != null) {
      if (pendingRemoved.length > 0) {
        const existing = removedBefore.get(l.newLineno) ?? [];
        removedBefore.set(l.newLineno, [...existing, ...pendingRemoved]);
        pendingRemoved = [];
      }
    }
  }
  // Any trailing removed lines (file ends with deletions) anchor to a
  // sentinel key of Infinity — we'll append them at the end.
  const trailingRemoved = pendingRemoved;

  const merged: MergedLine[] = [];

  for (const fullLine of fullFileLines) {
    const lineno = fullLine.lineno;

    // Inject removed lines anchored before this line
    const removedHere = removedBefore.get(lineno) ?? [];
    for (const r of removedHere) {
      merged.push({
        role: 'removed',
        oldLineno: r.oldLineno ?? null,
        newLineno: null,
        highlighted: (dark ? r.highlightedDark : r.highlightedLight) ?? '',
        content: r.content ?? '',
      });
    }

    const role = newLineRole.get(lineno) ?? 'context';
    merged.push({
      role,
      oldLineno: role === 'added' ? null : lineno,   // old col blank for pure additions
      newLineno: lineno,
      highlighted: (dark ? fullLine.highlightedDark : fullLine.highlightedLight) ?? '',
      content: fullLine.content ?? '',
    });
  }

  // Append any trailing removed lines
  for (const r of trailingRemoved) {
    merged.push({
      role: 'removed',
      oldLineno: r.oldLineno ?? null,
      newLineno: null,
      highlighted: (dark ? r.highlightedDark : r.highlightedLight) ?? '',
      content: r.content ?? '',
    });
  }

  return merged;
}

// ── Unified file overlay ──────────────────────────────────────────────────────

interface UnifiedFileOverlayProps {
  fullFileLines: HighlightedLine[];
  diffLines: FileDiff['lines'];
  dark: boolean;
  onClose: () => void;
}

const UnifiedFileOverlay = ({
  fullFileLines,
  diffLines,
  dark,
  onClose,
}: UnifiedFileOverlayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const merged = useMemo(
    () => buildMergedLines(fullFileLines, diffLines, dark),
    [fullFileLines, diffLines, dark],
  );

  // Scroll to first changed line on open
  useEffect(() => {
    if (!scrollRef.current) return;
    const firstChange = merged.findIndex(l => l.role !== 'context');
    if (firstChange < 0) return;
    const LINE_HEIGHT = 22;
    scrollRef.current.scrollTop = Math.max(0, firstChange * LINE_HEIGHT - 80);
  }, [merged]);

  return (
    <div className={styles.fullFileOverlay}>
      <div className={styles.fullFileToolbar}>
        <span className={styles.fullFileLabel}>Full file</span>
        <button className={styles.fullFileClose} onClick={onClose}>
          ✕ Close
        </button>
      </div>

      <div className={styles.fullFileScroll} ref={scrollRef}>
        {merged.map((line, i) => {
          const rowClass =
            line.role === 'added'
              ? styles.added
              : line.role === 'removed'
                ? styles.removed
                : '';

          return (
            <div key={i} className={`${styles.fullFileLine} ${rowClass}`}>
              {/* Old line-number gutter */}
              <span className={styles.fullFileLineNum}>
                {line.oldLineno ?? ''}
              </span>
              {/* New line-number gutter */}
              <span className={styles.fullFileLineNum}>
                {line.newLineno ?? ''}
              </span>
              {/* +/- sign */}
              <span className={styles.lineSign}>
                {line.role === 'added' ? '+' : line.role === 'removed' ? '-' : ' '}
              </span>
              <pre
                className={styles.fullFileLineContent}
                dangerouslySetInnerHTML={{
                  __html: line.highlighted || line.content || ' ',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Overlay states ────────────────────────────────────────────────────────────

const LoadingOverlay = () => (
  <div className={styles.fullFileOverlay}>
    <div className={styles.fullFileLoading}>
      <span className={styles.miniSpinner} />
      Loading full file…
    </div>
  </div>
);

const ErrorOverlay = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className={styles.fullFileOverlay}>
    <div className={styles.fullFileToolbar}>
      <span className={styles.fullFileLabel}>Full file</span>
      <button className={styles.fullFileClose} onClick={onClose}>✕ Close</button>
    </div>
    <div className={styles.fullFileError}>{message}</div>
  </div>
);

// ── FileDiffBlock ─────────────────────────────────────────────────────────────

export interface FileDiffBlockProps {
  file: FileDiff;
  isConflict?: boolean;
  repo: string;
  branch: string;
}

const FileDiffBlock = ({ file, isConflict, repo, branch }: FileDiffBlockProps) => {
  const dark = useIsDark();
  const [open, setOpen] = useState(true);
  const [showFullFile, setShowFullFile] = useState(false);
  const [fullFileLines, setFullFileLines] = useState<HighlightedLine[] | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const lines = file.lines ?? [];
  const added = lines.filter(l => l.origin === '+').length;
  const removed = lines.filter(l => l.origin === '-').length;

  const openFullFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showFullFile) {
      setShowFullFile(false);
      return;
    }
    setShowFullFile(true);
    if (fullFileLines) return;

    setLoadingFile(true);
    setFileError(null);

    GingerGitter.handleFileContentRaw({
      fileContentRequest: { repo, branch, path: file.path, highlight: true },
    })
      .then(r => r.value())
      .then(r => setFullFileLines(r.lines ?? []))
      .catch(err => setFileError(err?.message ?? 'Failed to load file'))
      .finally(() => setLoadingFile(false));
  };



  return (
    <div className={styles.diffBlock}>

      {/* ── Header ── */}
      <div className={styles.diffHeader} onClick={() => setOpen(o => !o)}>
        <div className={styles.diffHeaderLeft}>
          <IconChevron open={open} />
          <span className={`${styles.badge} ${styles['badge' + capitalize(file.status)]}`}>
            {statusLabel(file.status)}
          </span>
          <span className={styles.diffPath}>
            <span className={styles.diffDir}>{fileDir(file.path)}</span>
            <span className={styles.diffFile}>{fileName(file.path)}</span>
          </span>
        </div>

        <div className={styles.headerControls}>
          {isConflict && (
            <span className={styles.conflictHeaderBadge} title="Merge conflict">
              ⚠ conflict
            </span>
          )}
          <span className={styles.diffStats}>
            <span className={styles.statAdded}>+{added}</span>
            <span className={styles.statRemoved}>-{removed}</span>
          </span>
          <button
            className={`${styles.viewFileBtn} ${showFullFile ? styles.viewFileBtnActive : ''}`}
            onClick={openFullFile}
            title={showFullFile ? 'Hide full file' : 'View full file'}
          >
            <IconFile />
            {showFullFile ? 'Hide file' : 'View file'}
          </button>
        </div>
      </div>

      {/* ── Body (collapsible) ── */}
      {open && (
        <div className={styles.diffBody}>

          {/* ── Normal diff view (shown when full file is hidden) ── */}
          {!showFullFile && (
            <div className={styles.diffTable}>
              {lines.map((line, i) => {
                const rowClass =
                  line.origin === '+' ? styles.added
                    : line.origin === '-' ? styles.removed
                      : styles.context;
                const highlighted = dark ? line.highlightedDark : line.highlightedLight;

                return (
                  <div key={i} className={`${styles.diffRow} ${rowClass}`}>
                    <span className={styles.lineNum}>
                      {line.origin !== '+' ? (line.oldLineno ?? '') : ''}
                    </span>
                    <span className={styles.lineNum}>
                      {line.origin !== '-' ? (line.newLineno ?? '') : ''}
                    </span>
                    <span className={styles.lineSign}>
                      {line.origin === '+' ? '+' : line.origin === '-' ? '-' : ' '}
                    </span>
                    <pre
                      className={styles.lineContent}
                      dangerouslySetInnerHTML={{ __html: highlighted || line.content || ' ' }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Unified full-file overlay (replaces diff table when active) ── */}
          {showFullFile && (
            loadingFile ? (
              <LoadingOverlay />
            ) : fileError ? (
              <ErrorOverlay message={fileError} onClose={() => setShowFullFile(false)} />
            ) : fullFileLines ? (
              <UnifiedFileOverlay
                fullFileLines={fullFileLines}
                diffLines={file.lines}
                dark={dark}
                onClose={() => setShowFullFile(false)}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default FileDiffBlock;