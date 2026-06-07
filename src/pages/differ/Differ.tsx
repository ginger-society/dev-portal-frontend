import { GingerGitter } from "@/services";
import { OrgBranchCommitsResponse, OrgDiffResponse, RepoDiff } from "@/services/ginger-gitter_client";
import { Text, TextColor, TextSize, TextWeight } from "@gingersociety/ginger-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styles from './differ.module.scss';
import FileDiffBlock from "./FileDiff";
import RepoTree, { scopedFileId, scopedFileKey } from "./RepoTree";
import { repoDisplayName } from "./helpers";
import RepoBranchCommits from "./CommitsDetails";
import BranchActions from "./BranchActions";

const repoId = (repo: string) => `repo-${repo.replace(/[^a-zA-Z0-9]/g, '-')}`;

const DifferPage = () => {
  const { org_id, branch_name } = useParams();
  const [diffData, setDiffData] = useState<OrgDiffResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFile, setActiveFile] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  const [commitsData, setCommitsData] = useState<OrgBranchCommitsResponse | null>(null);

  // ── data fetchers ──────────────────────────────────────────────────────────

  const fetchDiff = useCallback(() => {
    if (!org_id || !branch_name) return Promise.resolve();
    setLoading(true);
    return GingerGitter.handleOrgDiff({
      orgDiffRequest: { branch: branch_name, orgId: org_id },
    })
      .then(r => {
        setDiffData(r);
        const firstRepo = r?.repos?.[0];
        const firstPath = firstRepo?.files?.[0]?.path;
        if (firstRepo && firstPath) {
          setActiveFile(scopedFileKey(firstRepo.repo, firstPath));
        }
      })
      .finally(() => setLoading(false));
  }, [org_id, branch_name]);

  const fetchCommits = useCallback(() => {
    if (!org_id || !branch_name) return Promise.resolve();
    return GingerGitter.handleOrgCommits({
      orgCommitsRequest: { branch: branch_name, orgId: org_id },
    }).then(r => setCommitsData(r));
  }, [org_id, branch_name]);

  useEffect(() => {
    fetchDiff();
    fetchCommits();
  }, [fetchDiff, fetchCommits]);

  // ── squash ─────────────────────────────────────────────────────────────────

  const handleSquash = useCallback(async (repo: string, message: string) => {
    if (!branch_name) return;
    await GingerGitter.handleSquashRaw({
      squashRequest: {
        repo,
        branch: branch_name,
        message,
      },
    });
    // Refresh both — the squash rewrites history so diff SHAs change too
    await Promise.all([fetchCommits(), fetchDiff()]);
  }, [branch_name, fetchCommits, fetchDiff]);

  // ── scroll tracking ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!diffData?.repos?.length) return;
    const container = contentRef.current;
    if (!container) return;

    const allFiles = diffData.repos.flatMap(r =>
      r.files.map(f => ({ ...f, repo: r.repo }))
    );

    const onScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      for (const file of [...allFiles].reverse()) {
        const el = document.getElementById(scopedFileId(file.repo, file.path));
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top - containerTop <= 80) {
          setActiveFile(scopedFileKey(file.repo, file.path));
          break;
        }
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [diffData]);

  const scrollToFile = (repo: string, path: string) => {
    const el = document.getElementById(scopedFileId(repo, path));
    const container = contentRef.current;
    if (!el || !container) return;
    setActiveFile(scopedFileKey(repo, path));
    container.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
  };

  const scrollToRepo = (repo: string) => {
    const el = document.getElementById(repoId(repo));
    const container = contentRef.current;
    if (!el || !container) return;
    container.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
  };

  // ── render ─────────────────────────────────────────────────────────────────

  const repoCommits = (repoName: string) =>
    commitsData?.repos.find(r => r.repo === repoName);

  // after scrollToRepo
  const scrollToBottom = () => {
    contentRef.current?.scrollTo({
      top: contentRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const hasUnsquashed = commitsData?.repos.some(r => (r.commits?.length ?? 0) > 1) ?? false;


  return (
    <div className={styles.page}>
      {!loading && !!diffData?.repos?.length && (
        <RepoTree
          repos={diffData.repos}
          skippedRepos={diffData.skippedRepos}
          activeFile={activeFile}
          onFileClick={scrollToFile}
          orgId={org_id ?? ''}
          onRepoClick={scrollToRepo}
          loading={loading}
          base={diffData.branch ?? ''}
        />
      )}

      <main className={styles.content} ref={contentRef}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <Text color={TextColor.Muted}>Loading diff…</Text>
          </div>
        ) : !diffData?.repos?.length ? (
          <div className={styles.emptyState}>
            <Text size={TextSize.Large} weight={TextWeight.Bold}>Branch unavailable</Text>
            <Text color={TextColor.Muted}>
              Either <strong>{branch_name}</strong> has already been merged into main, or no code has been pushed to this branch yet.
            </Text>
          </div>
        ) : (
          <>
            {diffData.repos.map((repoDiff: RepoDiff) => (
              <section
                key={repoDiff.repo}
                id={repoId(repoDiff.repo)}
                className={styles.repoSection}
              >
                <div className={styles.repoHeader}>
                  <Text size={TextSize.Large} weight={TextWeight.Bold}>
                    {repoDisplayName(repoDiff.repo, org_id ?? '')}
                  </Text>
                  {repoDiff.hasMergeConflicts && (
                    <div className={styles.conflictBanner}>
                      <span className={styles.conflictIcon}>⚠</span>
                      <Text size={TextSize.Small}>
                        Merge conflicts in {repoDiff.conflictingFiles?.length} file(s)
                      </Text>
                    </div>
                  )}
                </div>

                {repoCommits(repoDiff.repo) && (
                  <RepoBranchCommits
                    data={repoCommits(repoDiff.repo)!}
                    onSquash={handleSquash}
                  />
                )}

                {repoDiff.files.map(file => (
                  <div
                    key={scopedFileKey(repoDiff.repo, file.path)}
                    id={scopedFileId(repoDiff.repo, file.path)}
                  >
                    <FileDiffBlock
                      file={file}
                      isConflict={repoDiff.conflictingFiles?.includes(file.path)}
                      repo={repoDiff.repo}
                      branch={branch_name!}
                    />
                  </div>
                ))}
              </section>
            ))}

            <BranchActions branch={branch_name!} orgId={org_id ?? ''} hasUnsquashed={hasUnsquashed} />

          </>
        )}
      </main>

      {!loading && !!diffData?.repos?.length && (
        <button
          className={styles.goToBottom}
          onClick={scrollToBottom}
          aria-label="Go to bottom"
        >
          ↓
          <span className={styles.goToBottomTooltip}>Go to bottom</span>
        </button>
      )}
    </div>
  );
};

export default DifferPage;