"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch, ApiClientError } from "@/lib/api";
import type { IncidentRecord } from "@/types/incident";

async function fetchMyIncidents(signal?: AbortSignal) {
  const data = await apiFetch<{ incidents: IncidentRecord[] }>(
    "/api/incidents/my",
    { signal }
  );

  return data.incidents;
}

export function useMyIncidents() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    void fetchMyIncidents(controller.signal)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setIncidents(data);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        setError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "Unable to load your reports."
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
      const data = await fetchMyIncidents();
      setIncidents(data);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to load your reports."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { incidents, loading, error, refresh };
}
