// Recursively convert Sequelize instances to plain objects and expose an `_id`
// field mirroring the numeric `id`, so the existing frontend (written against
// MongoDB's `_id`) keeps working unchanged.
export const serialize = (data) => {
  if (data === null || data === undefined) return data;
  if (data instanceof Date) return data;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(serialize);

  // Sequelize model instance → plain object (with nested includes as plain)
  const plain = typeof data.get === 'function' ? data.get({ plain: true }) : data;

  const out = {};
  for (const key of Object.keys(plain)) out[key] = serialize(plain[key]);
  if (out.id !== undefined && out._id === undefined) out._id = out.id;
  return out;
};

// Express middleware: wrap res.json so every response body is serialized.
export const serializeResponses = (req, res, next) => {
  const original = res.json.bind(res);
  res.json = (body) => original(serialize(body));
  next();
};
