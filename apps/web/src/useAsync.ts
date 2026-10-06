import { useEffect, useState } from "react";

/** Minimal data-fetching hook: re-runs when deps change and ignores stale responses. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean }>({ loading: true });
  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true }));
    fn().then(
      (data) => active && setState({ data, loading: false }),
      (error: Error) => active && setState({ error, loading: false }),
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
