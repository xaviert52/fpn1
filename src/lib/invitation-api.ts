import { API_BASE } from '@/lib/auth-api';

export type InvitationValidateResponse = {
  success: boolean;
  valid?: boolean;
  error?: string;
  invitation?: {
    uuid: string;
    email: string;
    status: string;
    status_legend_es?: string;
  };
};

export type EnrollmentValidationError = {
  field: string;
  message: string;
};

export type EnrollmentResponse = {
  success: boolean;
  message?: string;
  error?: string;
  status?: string;
  status_legend_es?: string;
  validation_errors?: EnrollmentValidationError[];
  user?: {
    id: string;
    email: string;
    name?: {
      first?: string;
      last?: string;
    };
  };
};

export type CreateInvitationResponse = {
  success: boolean;
  message?: string;
  error?: string;
  invitation?: {
    uuid: string;
    email: string;
    verification_url: string;
  };
};

const parseJson = async (response: Response) => {
  const raw = await response.text();
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const invitationApi = {
  async requestRegistration(email: string, role = 'empleado'): Promise<CreateInvitationResponse> {
    const response = await fetch(`${API_BASE}/notifications/b2b/invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        target_email: email,
        role,
      }),
    });

    const data = await parseJson(response);
    if (!response.ok) {
      return {
        success: false,
        error: data?.error || 'No se pudo solicitar el registro',
      };
    }

    return data;
  },

  async validateUuid(uuid: string): Promise<InvitationValidateResponse> {
    const response = await fetch(`${API_BASE}/notifications/b2b/invitation/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ uuid }),
    });

    const data = await parseJson(response);
    if (!response.ok) {
      return {
        success: false,
        error: data?.error || 'No se pudo validar la invitacion',
        invitation: data?.invitation,
      };
    }

    return data;
  },

  async prevalidateEnrollment(payload: {
    uuid: string;
    first_name: string;
    last_name: string;
    telefono: string;
    dni: string;
    password: string;
  }): Promise<{ success: boolean; validation_errors?: EnrollmentValidationError[] }> {
    const response = await fetch(`${API_BASE}/notifications/b2b/invitation/enroll/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson(response);
    return data;
  },

  async enroll(payload: {
    uuid: string;
    first_name: string;
    last_name: string;
    telefono: string;
    dni: string;
    password: string;
  }): Promise<EnrollmentResponse> {
    const response = await fetch(`${API_BASE}/notifications/b2b/invitation/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson(response);
    if (!response.ok) {
      return {
        success: false,
        error: data?.error || 'No se pudo completar el enrolamiento',
        status: data?.status,
        status_legend_es: data?.status_legend_es,
        validation_errors: data?.validation_errors,
      };
    }

    return data;
  },
};
