const sanitizeSQL = (value: string): string => {
  if (typeof value !== 'string') return value;

  return value
    .replace(/['";]/g, '') // Remove quotes, semicolons
    .replace(
      /\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|FROM|WHERE|OR|AND|--|#)\b/gi,
      '',
    ) // Remove SQL keywords
    .replace(/\*/g, '') // Remove wildcard characters (*)
    .trim();
};

export default sanitizeSQL;
