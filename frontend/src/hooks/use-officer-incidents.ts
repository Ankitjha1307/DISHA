"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch, ApiClientError } from "@/lib/api";
import type { OfficerIncidentRecord } from "@/types/incident";

async function fetchOfficerIncidents(signal?: AbortSignal) {
  const data = await apiFetch<{ incidents: OfficerIncidentRecord[] }>(
    "/api/officer/incidents",
    { signal }
  );

  return data.incidents;
}

export function useOfficerIncidents() {
  const [incidents, setIncidents] = useState<OfficerIncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    void fetchOfficerIncidents(controller.signal)
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
            : "Unable to load the incident queue."
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
      const data = await fetchOfficerIncidents();
      setIncidents(data);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to load the incident queue."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { incidents, loading, error, refresh };
}
