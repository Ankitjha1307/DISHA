"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch, ApiClientError } from "@/lib/api";
import type { OfficerDeploymentRecord } from "@/types/incident";

async function fetchOfficerDeployments(signal?: AbortSignal) {
  const data = await apiFetch<{ deployments: OfficerDeploymentRecord[] }>(
    "/api/officer/deployments",
    { signal }
  );

  return data.deployments;
}

export function useOfficerDeployments() {
  const [deployments, setDeployments] = useState<OfficerDeploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    void fetchOfficerDeployments(controller.signal)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setDeployments(data);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        setError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "Unable to load deployments."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchOfficerDeployments();
      setDeployments(data);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to load deployments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { deployments, loading, error, refresh };
}
