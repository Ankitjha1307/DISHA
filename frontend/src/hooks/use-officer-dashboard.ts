"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch, ApiClientError } from "@/lib/api";
import type { OfficerDashboardData } from "@/types/incident";

async function fetchOfficerDashboard(signal?: AbortSignal) {
  return apiFetch<OfficerDashboardData>("/api/officer/dashboard", { signal });
}

export function useOfficerDashboard() {
  const [data, setData] = useState<OfficerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    void fetchOfficerDashboard(controller.signal)
      .then((dashboard) => {
        if (cancelled) {
          return;
        }

        setData(dashboard);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        setError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "Unable to load the officer dashboard."
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
      const dashboard = await fetchOfficerDashboard();
      setData(dashboard);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to load the officer dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refresh };
}
