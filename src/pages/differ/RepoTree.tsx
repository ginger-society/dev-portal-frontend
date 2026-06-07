import { Text, TextColor, TextSize, TextWeight } from "@gingersociety/ginger-ui";
import { useState } from "react";
import { RepoDiff } from "@/services/ginger-gitter_client";
import styles from "./RepoTree.module.scss";
import { capitalize, fileDir, fileName, repoDisplayName, statusLabel } from "./helpers";

// ── helpers ───────────────────────────────────────────────────────────────────

export const scopedFileId = (repo: string, path: string) =>
  `file-${repo}-${path}`.replace(/[^a-zA-Z0-9]/g, '-');

export const scopedFileKey = (repo: string, path: string) => `${repo}::${path}`;

// ── icons ─────────────────────────────────────────────────────────────────────

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 4.5L6 7.5L9 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RepoIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 13 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.repoIcon}
  >
    <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4 4.5h5M4 6.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const FileIcon = () => (
  <svg
    width="11"
    height="12"
    viewBox="0 0 11 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.fileIcon}
  >
    <path
      d="M2 1h5l3 3v7a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z"
      stroke="currentColor"
      strokeWidth="1.1"
    />
    <path d="M7 1v3h3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
  </svg>
);

// ── props ─────────────────────────────────────────────────────────────────────

interface RepoTreeProps {
  repos: RepoDiff[];
  skippedRepos?: string[];
  activeFile: string; // composite "repo::path"
  onFileClick: (repo: string, path: string) => void;
  orgId: string;
  onRepoClick: (repo: string) => void;
  loading?: boolean;
  base?: string;
}

// ── RepoTree ──────────────────────────────────────────────────────────────────

const RepoTree = ({
  repos,
  skippedRepos,
  activeFile,
  onFileClick,
  orgId,
  onRepoClick,
  loading = false,
  base = '',
}: RepoTreeProps) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleRepo = (repo: string) => {
    setCollapsed(prev => ({ ...prev, [repo]: !prev[repo] }));
  };

  const totalFiles = repos.reduce((sum, r) => sum + r.files.length, 0);
  const totalConflicts = repos.filter(r => r.hasMergeConflicts).length;

  return (
    <aside className={styles.sidebar}>
      {/* header */}
      <Text size={TextSize.Small} color={TextColor.Muted}>
        {base}
      </Text>
      <div className={styles.sidebarHeader}>

        <Text size={TextSize.Small} color={TextColor.Muted} weight={TextWeight.Bold}>
          CHANGED FILES
        </Text>
        {!loading && <span className={styles.fileCount}>{totalFiles}</span>}
      </div>

      {/* banners */}
      {totalConflicts > 0 && (
        <div className={styles.conflictBanner}>
          <span className={styles.conflictIcon}>⚠</span>
          <Text size={TextSize.Small}>
            Merge conflicts in {totalConflicts} repo(s)
          </Text>
        </div>
      )}

      {/* tree */}
      <nav className={styles.tree}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={styles.skeletonItem}
              style={{ width: `${50 + i * 7}%`, marginLeft: i % 3 !== 0 ? 20 : 0 }}
            />
          ))
          : repos.map(repoDiff => {
            const isOpen = !collapsed[repoDiff.repo];
            return (
              <div key={repoDiff.repo} className={styles.repoNode}>
                {/* ── repo row ── */}
                <div className={styles.repoRow}>
                  <button
                    className={styles.collapseBtn}
                    onClick={() => toggleRepo(repoDiff.repo)}
                    aria-label={isOpen ? "Collapse" : "Expand"}
                    title={isOpen ? "Collapse" : "Expand"}
                  >
                    <ChevronIcon open={isOpen} />
                  </button>

                  <button
                    className={styles.repoLabel}
                    onClick={() => onRepoClick(repoDiff.repo)}
                    title={repoDiff.repo}
                  >
                    <RepoIcon />
                    <span className={styles.repoName}>{repoDisplayName(repoDiff.repo, orgId)}</span>
                    <span className={styles.repoFileCount}>{repoDiff.files.length}</span>
                    {repoDiff.hasMergeConflicts && (
                      <span className={styles.conflictDot} title="Has merge conflicts">!</span>
                    )}
                  </button>
                </div>

                {/* ── file rows ── */}
                {isOpen && (
                  <ul className={styles.fileList}>
                    <div className={styles.treeLine} />

                    {repoDiff.files.map((file, idx) => {
                      const isConflict = repoDiff.conflictingFiles?.includes(file.path);
                      const isActive = activeFile === scopedFileKey(repoDiff.repo, file.path);
                      const isLast = idx === repoDiff.files.length - 1;

                      return (
                        <li
                          key={scopedFileKey(repoDiff.repo, file.path)}
                          className={`${styles.fileNode} ${isLast ? styles.fileNodeLast : ""}`}
                        >
                          <span className={styles.treeElbow} />

                          <button
                            className={`${styles.fileRow} ${isActive ? styles.fileRowActive : ""}`}
                            onClick={() => onFileClick(repoDiff.repo, file.path)}
                            title={file.path}
                          >
                            <FileIcon />
                            <span className={styles.fileLabel}>
                              <span className={styles.fileDirPart}>{fileDir(file.path)}</span>
                              <span className={styles.fileNamePart}>{fileName(file.path)}</span>
                            </span>
                            <span
                              className={`${styles.badge} ${styles["badge" + capitalize(file.status)]}`}
                            >
                              {statusLabel(file.status)}
                            </span>
                            {isConflict && (
                              <span className={styles.conflictDot} title="Merge conflict">!</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
      </nav>
    </aside>
  );
};

export default RepoTree;