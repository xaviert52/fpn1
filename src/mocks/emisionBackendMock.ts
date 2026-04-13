import { EMISION_MAX_STEP } from '@/stores/useEmisionStore';

const STORAGE_KEY = 'prime.mock.emisiones.v1';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type EmisionRecord = {
  currentStep: number;
  updatedAt: string;
};

type EmisionDb = Record<string, EmisionRecord>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function clampStep(step: number) {
  return Math.min(Math.max(Math.round(step), 1), EMISION_MAX_STEP);
}

function normalizeUuid(value?: string | null) {
  if (!value) return null;
  const candidate = value.trim().toLowerCase();
  return UUID_REGEX.test(candidate) ? candidate : null;
}

function createUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

function readDb(): EmisionDb {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as EmisionDb;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeDb(db: EmisionDb) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export async function mockCreateOrResumeEmission(emisionUuid?: string) {
  await wait(180);
  const db = readDb();
  const uuid = normalizeUuid(emisionUuid) ?? createUuid();
  const existing = db[uuid];
  const currentStep = existing ? clampStep(existing.currentStep) : 1;
  db[uuid] = { currentStep, updatedAt: new Date().toISOString() };
  writeDb(db);

  return {
    ok: true,
    payload: {
      process_uuid: uuid,
      current_step: currentStep,
    },
  };
}

export async function mockAdvanceEmissionStep(params: { emisionUuid: string; nextStep: number }) {
  await wait(240);
  const db = readDb();
  const uuid = normalizeUuid(params.emisionUuid) ?? createUuid();
  const nextStep = clampStep(params.nextStep);
  db[uuid] = { currentStep: nextStep, updatedAt: new Date().toISOString() };
  writeDb(db);

  return {
    ok: true,
    result: {
      process_uuid: uuid,
      next_step: nextStep,
    },
  };
}

export async function mockGetEmissionStatus(emisionUuid: string) {
  await wait(140);
  const db = readDb();
  const uuid = normalizeUuid(emisionUuid);
  if (!uuid || !db[uuid]) {
    return {
      ok: false,
      data: null,
    };
  }

  return {
    ok: true,
    data: {
      emisionUuid: uuid,
      currentStep: clampStep(db[uuid].currentStep),
      updatedAt: db[uuid].updatedAt,
    },
  };
}

export function mockResetEmisiones() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
