import { create } from 'zustand';

export type PersonType = 'natural' | 'juridica' | null;
export type PlanId = 'plan-3m' | 'plan-6m' | 'plan-1y' | 'plan-2y' | 'plan-3y' | null;

interface EmisionState {
  currentStep: number;
  personType: PersonType;
  selectedPlan: PlanId;
  paymentCompleted: boolean;
  formData: Record<string, string>;
  otpVerified: boolean;
  biometricVerified: boolean;
  certificateKeySet: boolean;
  setStep: (step: number) => void;
  setPersonType: (type: PersonType) => void;
  setSelectedPlan: (plan: PlanId) => void;
  setPaymentCompleted: (v: boolean) => void;
  setFormField: (key: string, value: string) => void;
  setOtpVerified: (v: boolean) => void;
  setBiometricVerified: (v: boolean) => void;
  setCertificateKeySet: (v: boolean) => void;
  reset: () => void;
}

export const useEmisionStore = create<EmisionState>((set) => ({
  currentStep: 1,
  personType: null,
  selectedPlan: null,
  paymentCompleted: false,
  formData: {},
  otpVerified: false,
  biometricVerified: false,
  certificateKeySet: false,
  setStep: (step) => set({ currentStep: step }),
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
      personType: null,
      selectedPlan: null,
      paymentCompleted: false,
      formData: {},
      otpVerified: false,
      biometricVerified: false,
      certificateKeySet: false,
    }),
}));
