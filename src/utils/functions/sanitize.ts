const sanitize = (value: string): string => {
  if (typeof value !== 'string') return value;

  return value
    .replace(/<[^>]*>?/gm, '')
    .replace(/['"();{}]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/document\.|window\.|alert\(/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/&#\d+;/g, '') // Remove encoded characters
    .trim();
};

export default sanitize;
