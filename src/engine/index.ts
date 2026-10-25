/**
 * API pública del motor lógico. La app y los scripts solo importan desde aquí.
 */
export * from './types';
export { buildBoard, cellName, colOf, rowOf, edgeCells, occupiableCells, type Board, type TypeLookup } from './board';
export { clueHolds, validatePlacement, isUnary, isBinary, cluePersons, clueSubject, unaryHolds } from './clues/semantics';
export { autoClueText, clueText, parseBold, roomRef, contract, capitalize, type TextContext } from './clues/text-es';
export { compileModel, unaryDomains, type Model } from './solver/model';
export { countSolutions, hasUniqueSolution } from './solver/exact';
export { solveHuman, difficultyLabel, TECHNIQUES, type HumanResult, type Step, type TechniqueId } from './solver/human';
export { explainSolution } from './solver/explain-es';
export { generateCase, samplePlacement, type GenerateInput, type GenerateResult, type Pin, type DifficultyTarget } from './generator/generate';
export { candidateClues, clueKey, KIND_WEIGHT } from './generator/candidates';
export { randomBoard } from './generator/randomBoard';
export { TIERS, tierById, type Tier } from './generator/tiers';
export { Rng } from './rng';
