// ── helpers ───────────────────────────────────────────────────────────────────

export function fileId(path: string) {
  return `diff-file-${path.replace(/[^a-zA-Z0-9]/g, '-')}`;
}

export function fileName(path: string) {
  return path.split('/').pop() ?? path;
}

export const repoDisplayName = (repo: string, orgId: string) =>
  repo.startsWith(`${orgId}-`) ? repo.slice(orgId.length + 1) : repo;

export function fileDir(path: string) {
  const parts = path.split('/');
  parts.pop();
  return parts.length ? parts.join('/') + '/' : '';
}


interface ParsedLine {
  type: 'added' | 'removed' | 'context' | 'hunk';
  content: string;
  oldNum?: number;
  newNum?: number;
}

export function parseDiff(diff: string): ParsedLine[] {
  const lines = diff.split('\n');
  const result: ParsedLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const raw of lines) {
    if (raw.startsWith('@@')) {
      // Capture: @@ -old +new @@ <optional trailing context>
      const m = raw.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)/);
      if (m) {
        oldLine = parseInt(m[1]);
        newLine = parseInt(m[2]);

        // Separator row — only the "@@ -N +N @@" part
        const lastAt = raw.lastIndexOf('@@');
        result.push({ type: 'hunk', content: raw.slice(0, lastAt + 2) });

        // Trailing context (e.g. " const router = createHashRouter([")
        // rendered as a normal context line without line numbers
        const trail = m[3];
        if (trail.trim()) {
          result.push({
            type: 'context',
            content: trail.startsWith(' ') ? trail.slice(1) : trail,
          });
        }
      } else {
        // Fallback: push raw hunk line as-is
        result.push({ type: 'hunk', content: raw });
      }
    } else if (raw.startsWith('+') && !raw.startsWith('+++')) {
      result.push({ type: 'added', content: raw.slice(1), newNum: newLine++ });
    } else if (raw.startsWith('-') && !raw.startsWith('---')) {
      result.push({ type: 'removed', content: raw.slice(1), oldNum: oldLine++ });
    } else if (
      !raw.startsWith('---') &&
      !raw.startsWith('+++') &&
      !raw.startsWith('diff ') &&
      !raw.startsWith('index ')
    ) {
      if (raw !== '')
        result.push({ type: 'context', content: raw.slice(1), oldNum: oldLine++, newNum: newLine++ });
    }
  }
  return result;
}

export function statusLabel(status: string): string {
  return { modified: 'M', added: 'A', deleted: 'D', renamed: 'R' }[status] ?? '?';
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
