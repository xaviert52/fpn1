const extractCompanyIdFromSession = (session) => {
  const traits = session?.identity?.traits || {};
  return (
    traits.company_id ||
    traits.empresa_id ||
    traits.companyId ||
    traits.company?.id ||
    session?.identity?.organization_id ||
    session?.company_id ||
    session?.empresa_id ||
    ''
  );
};

const loginWithCredentials = async ({ email, password }) => {
  const flowResponse = await fetch(`${process.env.BASE_URL}${process.env.KRATOS_PATH}/self-service/login/api`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!flowResponse.ok) {
    throw new Error(`No se pudo crear flujo de login: ${flowResponse.status} ${flowResponse.statusText}`);
  }

  const flowData = await flowResponse.json();
  const loginResponse = await fetch(
    `${process.env.BASE_URL}${process.env.KRATOS_PATH}/self-service/login?flow=${flowData.id}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'password',
        identifier: email.toLowerCase().trim(),
        password,
      }),
    }
  );

  const loginData = await loginResponse.json();

  if (!loginResponse.ok) {
    const message = loginData?.error?.message || loginData?.error || 'Credenciales inválidas';
    throw new Error(`Login falló: ${message}`);
  }

  return {
    token: loginData.session_token,
    session: loginData.session,
  };
};

const loginAsAdminFromEnv = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD deben estar configurados en .env');
  }

  return loginWithCredentials({ email, password });
};

module.exports = {
  extractCompanyIdFromSession,
  loginWithCredentials,
  loginAsAdminFromEnv,
};
