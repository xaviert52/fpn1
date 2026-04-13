import { create } from 'zustand';

export type PersonType = 'natural' | 'juridica' | null;
export type PlanId = 'plan-3m' | 'plan-6m' | 'plan-1y' | 'plan-2y' | 'plan-3y' | null;
export const EMISION_MAX_STEP = 9;

const STEP_KEYS = ['step', 'currentStep', 'nextStep', 'paso', 'current_step', 'next_step'] as const;
const UUID_KEYS = ['emisionUuid', 'emissionUuid', 'uuid', 'emision_id', 'emission_id', 'process_uuid'] as const;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toValidStep(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    if (value >= 1 && value <= EMISION_MAX_STEP) return value;
    return null;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= EMISION_MAX_STEP) return parsed;
  }

  return null;
}

function extractStepFromResponse(payload: unknown): number | null {
  const directStep = toValidStep(payload);
  if (directStep !== null) return directStep;

  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;

  for (const key of STEP_KEYS) {
    const step = toValidStep(record[key]);
    if (step !== null) return step;
  }

  const nestedContainers = ['data', 'payload', 'result'] as const;
  for (const container of nestedContainers) {
    const nestedStep = extractStepFromResponse(record[container]);
    if (nestedStep !== null) return nestedStep;
  }

  return null;
}

function normalizeUuid(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const candidate = value.trim().toLowerCase();
  if (!UUID_REGEX.test(candidate)) return null;
  return candidate;
}

function extractUuidFromResponse(payload: unknown): string | null {
  const directUuid = normalizeUuid(payload);
  if (directUuid) return directUuid;

  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;

  for (const key of UUID_KEYS) {
    const uuid = normalizeUuid(record[key]);
    if (uuid) return uuid;
  }

  const nestedContainers = ['data', 'payload', 'result'] as const;
  for (const container of nestedContainers) {
    const nestedUuid = extractUuidFromResponse(record[container]);
    if (nestedUuid) return nestedUuid;
  }

  return null;
}

function normalizeStep(step: number) {
  return Math.min(Math.max(Math.round(step), 1), EMISION_MAX_STEP);
}

function createLocalEmissionUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

interface EmisionState {
  currentStep: number;
  activeEmissionUuid: string | null;
  emissionSteps: Record<string, number>;
  personType: PersonType;
  selectedPlan: PlanId;
  paymentCompleted: boolean;
  formData: Record<string, string>;
  otpVerified: boolean;
  biometricVerified: boolean;
  certificateKeySet: boolean;
  startEmission: (uuid?: string) => string;
  setActiveEmission: (uuid: string) => void;
  setStep: (step: number) => void;
  setStepFromBackend: (response: unknown, fallbackStep?: number, fallbackUuid?: string) => void;
  setPersonType: (type: PersonType) => void;
  setSelectedPlan: (plan: PlanId) => void;
  setPaymentCompleted: (v: boolean) => void;
  setFormField: (key: string, value: string) => void;
  setOtpVerified: (v: boolean) => void;
  setBiometricVerified: (v: boolean) => void;
  setCertificateKeySet: (v: boolean) => void;
  reset: () => void;
}

export const useEmisionStore = create<EmisionState>((set, get) => ({
  currentStep: 1,
  activeEmissionUuid: null,
  emissionSteps: {},
  personType: null,
  selectedPlan: null,
  paymentCompleted: false,
  formData: {},
  otpVerified: false,
  biometricVerified: false,
  certificateKeySet: false,
  startEmission: (uuid) => {
    const normalizedUuid = normalizeUuid(uuid) ?? createLocalEmissionUuid();
    const step = get().emissionSteps[normalizedUuid] ?? 1;
    set((state) => ({
      activeEmissionUuid: normalizedUuid,
      currentStep: step,
      emissionSteps: { ...state.emissionSteps, [normalizedUuid]: step },
    }));
    return normalizedUuid;
  },
  setActiveEmission: (uuid) => {
    const normalizedUuid = normalizeUuid(uuid);
    if (!normalizedUuid) return;
    const step = get().emissionSteps[normalizedUuid] ?? 1;
    set((state) => ({
      activeEmissionUuid: normalizedUuid,
      currentStep: step,
      emissionSteps: { ...state.emissionSteps, [normalizedUuid]: step },
    }));
  },
  setStep: (step) => {
    const normalizedStep = normalizeStep(step);
    set((state) => ({
      currentStep: normalizedStep,
      emissionSteps: state.activeEmissionUuid
        ? { ...state.emissionSteps, [state.activeEmissionUuid]: normalizedStep }
        : state.emissionSteps,
    }));
  },
  setStepFromBackend: (response, fallbackStep, fallbackUuid) => {
    const backendStep = extractStepFromResponse(response);
    const step = backendStep ?? (typeof fallbackStep === 'number' ? normalizeStep(fallbackStep) : null);
    if (step === null) return;
    const backendUuid = extractUuidFromResponse(response);
    const uuid = backendUuid ?? normalizeUuid(fallbackUuid) ?? get().activeEmissionUuid;
    set((state) => ({
      activeEmissionUuid: uuid ?? state.activeEmissionUuid,
      currentStep: step,
      emissionSteps: uuid ? { ...state.emissionSteps, [uuid]: step } : state.emissionSteps,
    }));
  },
  setPersonType: (type) => set({ personType: type }),
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setPaymentCompleted: (v) => set({ paymentCompleted: v }),
  setFormField: (key, value) => set((s) => ({ formData: { ...s.formData, [key]: value } })),
  setOtpVerified: (v) => set({ otpVerified: v }),
  setBiometricVerified: (v) => set({ biometricVerified: v }),
  setCertificateKeySet: (v) => set({ certificateKeySet: v }),
  reset: () =>
    set({
      currentStep: 1,
      activeEmissionUuid: null,
      emissionSteps: {},
      personType: null,
      selectedPlan: null,
      paymentCompleted: false,
      formData: {},
      otpVerified: false,
      biometricVerified: false,
      certificateKeySet: false,
    }),
}));
