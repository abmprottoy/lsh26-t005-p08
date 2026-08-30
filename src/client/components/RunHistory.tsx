import { Archive, Clock3, Database, ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { CaseEvaluation, CaseInput } from "../../domain/types";
import { ApiError, getRunRequest, listRunsRequest, type SavedRun } from "../lib/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";

interface RunHistoryProps {
  refreshToken: number;
  onLoadRun: (input: CaseInput, result: CaseEvaluation) => void;
}

export function RunHistory({ refreshToken, onLoadRun }: RunHistoryProps) {
  const [runs, setRuns] = useState<SavedRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRun, setLoadingRun] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRuns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listRunsRequest();
      setRuns(response.runs);
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 500
          ? "Cloud saving is ready after an administrator finishes the storage setup."
          : caught instanceof Error
            ? caught.message
            : "Could not load saved runs.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRuns();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRuns, refreshToken]);

  const openRun = async (id: string) => {
    setLoadingRun(id);
    setError(null);
    try {
      const run = await getRunRequest(id);
      onLoadRun(run.source, run.result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open this saved run.");
    } finally {
      setLoadingRun(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Database className="size-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-950">Cloud saves</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Trusted copies of the source data and verified results, stored together.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void loadRuns()} disabled={loading}>
          <RefreshCw className={"size-3.5 " + (loading ? "animate-spin" : "")} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {error && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
            <RefreshCw className="size-4 animate-spin" /> Loading saved runs…
          </div>
        ) : runs.length === 0 ? (
          <div className="py-14 text-center">
            <Archive className="mx-auto size-8 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">No saved runs yet</p>
            <p className="mt-1 text-sm text-slate-500">Verify a result set and choose “Save to cloud”.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => (
              <div
                key={run.id}
                className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Clock3 className="size-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{run.case_id}</p>
                      <Badge>{run.student_count} students</Badge>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-slate-400">
                      {new Date(run.created_at).toLocaleString()} · {run.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void openRun(run.id)}
                  disabled={loadingRun !== null}
                >
                  {loadingRun === run.id ? <RefreshCw className="size-3.5 animate-spin" /> : <ExternalLink className="size-3.5" />}
                  Open saved copy
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
