import { useState } from 'react';
import { GingerGitter } from '@/services';
import styles from './branchActions.module.scss';

interface BranchActionsProps {
  branch: string;
  orgId: string;
  hasUnsquashed: boolean;
}

const BranchActions = ({ branch, orgId, hasUnsquashed }: BranchActionsProps) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await GingerGitter.handleMergeQueueRaw({
        mergeQueueRequest: { branch, orgId },
      });
      const data = await res.value();
      setResponse(data?.mergeRequestId ?? 'Submitted successfully');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={loading || hasUnsquashed}
      >
        {loading ? <span className={styles.spinner} /> : null}
        {loading ? 'Submitting…' : 'Submit to merge queue'}
      </button>

      {hasUnsquashed && (
        <div className={styles.warning}>
          Some repos have unsquashed commits — please squash them before submitting.
        </div>
      )}

      {response && (
        <div className={styles.success}>
          Queued — request ID: <code>{response}</code>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
};

export default BranchActions;