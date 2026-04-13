/**
 * Shared authentication middleware.
 * Supports Bearer tokens for API clients and cookies for browser flows.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const sessionResponse = await fetch(
        `${process.env.BASE_URL}${process.env.KRATOS_PATH}/sessions/whoami`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (sessionResponse.ok) {
        req.session = await sessionResponse.json();
        req.authType = 'bearer';
        return next();
      }
    } catch (error) {
      console.error('Bearer auth error:', error);
    }
  }

  try {
    const sessionResponse = await fetch(
      `${process.env.BASE_URL}${process.env.KRATOS_PATH}/sessions/whoami`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Cookie: req.headers.cookie || '',
        },
      }
    );

    if (sessionResponse.ok) {
      req.session = await sessionResponse.json();
      req.authType = 'browser';
      return next();
    }
  } catch (error) {
    console.error('Browser auth error:', error);
  }

  return res.status(401).json({ error: 'Unauthorized: No valid session or token' });
};

module.exports = authenticate;
