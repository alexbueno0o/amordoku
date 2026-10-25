/**
 * Web worker: genera o analiza un caso sin congelar la interfaz.
 */
import { refreshAnalysis, regenerateCase, type RegenerateOptions } from '../../domain/regenerate';
import type { CaseFile, Project } from '../../domain/types';

export type WorkerRequest =
  | { kind: 'generate'; project: Project; caseFile: CaseFile; opts: RegenerateOptions }
  | { kind: 'analyze'; project: Project; caseFile: CaseFile };

export type WorkerResponse = { ok: true; caseFile: CaseFile; message: string; success: boolean } | { ok: false; error: string };

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const req = e.data;
  try {
    if (req.kind === 'generate') {
      const res = regenerateCase(req.project, req.caseFile, req.opts);
      (self as unknown as Worker).postMessage({ ok: true, caseFile: res.caseFile, message: res.message, success: res.ok } satisfies WorkerResponse);
    } else {
      const c = refreshAnalysis(req.project, req.caseFile);
      (self as unknown as Worker).postMessage({ ok: true, caseFile: c, message: '', success: true } satisfies WorkerResponse);
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({ ok: false, error: String(err) } satisfies WorkerResponse);
  }
};
