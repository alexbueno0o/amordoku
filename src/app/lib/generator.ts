/**
 * Puente entre la interfaz y el web worker del generador.
 */
import type { RegenerateOptions } from '../../domain/regenerate';
import type { CaseFile, Project } from '../../domain/types';
import type { WorkerRequest, WorkerResponse } from '../workers/generate.worker';

/** Solo se envía al worker lo que el caso necesita (más rápido). */
function slim(project: Project, c: CaseFile): Project {
  const ids = new Set(c.people.map((p) => p.characterId));
  return {
    ...project,
    characters: project.characters.filter((ch) => ids.has(ch.id)),
    scenarios: project.scenarios.filter((s) => s.id === c.scenarioId),
    cases: [],
  };
}

function run(req: WorkerRequest): Promise<WorkerResponse> {
  return new Promise((resolve) => {
    const w = new Worker(new URL('../workers/generate.worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (e: MessageEvent<WorkerResponse>) => {
      resolve(e.data);
      w.terminate();
    };
    w.onerror = (e) => {
      resolve({ ok: false, error: e.message || 'Error en el generador' });
      w.terminate();
    };
    w.postMessage(req);
  });
}

export function generateInWorker(project: Project, caseFile: CaseFile, opts: RegenerateOptions) {
  return run({ kind: 'generate', project: slim(project, caseFile), caseFile, opts });
}

export function analyzeInWorker(project: Project, caseFile: CaseFile) {
  return run({ kind: 'analyze', project: slim(project, caseFile), caseFile });
}
