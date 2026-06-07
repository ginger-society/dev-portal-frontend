import { useEffect, useRef, useState } from 'react';
import { BranchCommit, RepoBranchCommits as RepoBranchCommitsType } from '@/services/ginger-gitter_client';
import styles from './commitDetails.module.scss';

// ── helpers ───────────────────────────────────────────────────────────────────

/** Format a unix timestamp (seconds) into a short relative label */
const formatTimestamp = (ts: number): string => {
  const d = new Date(ts * 1000);
  if (isNaN(d.getTime())) return '';
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── icons (inline SVG, no external dep) ──────────────────────────────────────

const IconCommit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <line x1="3" y1="12" x2="9" y2="12" />
    <line x1="15" y1="12" x2="21" y2="12" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconSquash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

// ── sub-components ────────────────────────────────────────────────────────────

interface CommitRowProps {
  commit: BranchCommit;
  isLast: boolean;
}

const CommitRow = ({ commit }: CommitRowProps) => (
  <li className={styles.commitItem}>
    <div className={styles.dot} />
    <div className={styles.commitBody}>
      <div className={styles.commitMeta}>
        <span className={styles.hash}>{commit.shortSha}</span>
        <span className={styles.author}>{commit.author}</span>
        {commit.authorEmail && (
          <span className={styles.date}>{'<'}{commit.authorEmail}{'>'}</span>
        )}
        {commit.timestamp > 0 && (
          <>
            <span className={styles.separator}>·</span>
            <span className={styles.date}>{formatTimestamp(commit.timestamp)}</span>
          </>
        )}
      </div>
      <p className={styles.message}>{commit.subject}</p>
      {commit.body && (
        <p className={styles.body}>{commit.body}</p>
      )}
    </div>
  </li>
);

// ── main component ────────────────────────────────────────────────────────────

export interface RepoBranchCommitsProps {
  /** Commits data for a single repo */
  data: RepoBranchCommitsType;
  /** Called when the user confirms a squash */
  onSquash?: (repo: string, message: string) => Promise<void> | void;
}

const RepoBranchCommits = ({ data, onSquash }: RepoBranchCommitsProps) => {
  const { commits, suggestedMessage } = data;
  const [open, setOpen] = useState(true);
  const [squashMsg, setSquashMsg] = useState(suggestedMessage ?? '');
  const [squashing, setSquashing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const multiCommit = commits.length > 1;

  // keep squashMsg in sync if the prop changes (e.g. data refresh)
  useEffect(() => {
    setSquashMsg(suggestedMessage ?? '');
  }, [suggestedMessage]);

  const handleSquash = async () => {
    if (!squashMsg.trim() || !onSquash) return;
    setSquashing(true);
    try {
      await onSquash(data.repo, squashMsg.trim());
    } finally {
      setSquashing(false);
    }
  };

  if (!commits.length) return null;

  return (
    <div className={styles.commits}>
      {/* ── header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.toggleBtn}
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Collapse commits' : 'Expand commits'}
          >
            <IconChevron open={open} />
          </button>
          <div className={styles.titleRow}>
            <span className={styles.icon}><IconCommit /></span>
            <span className={styles.title}>
              {multiCommit ? 'Commits on this branch' : 'Commit on this branch'}
            </span>
          </div>
        </div>
        <span className={styles.countBadge}>{commits.length}</span>
      </div>

      {/* ── body ── */}
      {open && (
        <>
          <ul className={styles.list}>
            <div className={styles.spine} aria-hidden="true" />
            {commits.map((c, i) => (
              <CommitRow
                key={c.sha}
                commit={c}
                isLast={i === commits.length - 1}
              />
            ))}
          </ul>

          {/* ── squash panel (only when >1 commit) ── */}
          {multiCommit && (
            <div className={styles.squashPanel}>
              <span className={styles.squashLabel}>
                <span className={styles.squashLabelIcon}><IconSquash /></span>
                Squash into 1 commit
              </span>

              <textarea
                ref={textareaRef}
                className={styles.squashInput}
                value={squashMsg}
                onChange={e => setSquashMsg(e.target.value)}
                placeholder="Enter a combined commit message…"
                rows={3}
                disabled={squashing}
              />

              <div className={styles.squashFooter}>
                <span className={styles.squashHint}>
                  {commits.length} commits will be combined into one.
                </span>
                <button
                  className={styles.squashBtn}
                  onClick={handleSquash}
                  disabled={squashing || !squashMsg.trim() || !onSquash}
                >
                  {squashing ? (
                    <>
                      <span className={styles.spinner} />
                      Squashing…
                    </>
                  ) : (
                    <>
                      <span className={styles.squashBtnIcon}><IconSquash /></span>
                      Squash into 1 commit
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RepoBranchCommits;