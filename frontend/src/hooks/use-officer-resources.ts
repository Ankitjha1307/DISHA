"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch, ApiClientError } from "@/lib/api";
import type { ResourceRecord } from "@/types/incident";

async function fetchOfficerResources(signal?: AbortSignal) {
  const data = await apiFetch<{ resources: ResourceRecord[] }>(
    "/api/officer/resources",
    { signal }
  );

  return data.resources;
}

export function useOfficerResources() {
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    void fetchOfficerResources(controller.signal)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setResources(data);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        setError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "Unable to load the resource inventory."
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
      const data = await fetchOfficerResources();
      setResources(data);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to load the resource inventory."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { resources, loading, error, refresh };
}
