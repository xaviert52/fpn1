const translations = require('../i18n/kratos-errors.es.json');

const translateKratosMessage = ({ id, text }) => {
  if (id && translations[String(id)]) {
    return translations[String(id)];
  }

  const source = String(text || '').toLowerCase();

  if (source.includes('exists already')) {
    return translations['4000007'];
  }

  if (source.includes('password') && source.includes('too short')) {
    return 'La contrasena es demasiado corta para la politica de seguridad.';
  }

  if (source.includes('password') && source.includes('breach')) {
    return 'La contrasena aparece en filtraciones conocidas. Usa otra diferente.';
  }

  return translations.default;
};

module.exports = {
  translateKratosMessage,
};
