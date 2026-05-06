// server/src/lib/validate.js
//
// Validator ringan tanpa dependency eksternal (zod/joi).
// Cukup untuk MVP — jika nanti scale, ganti ke zod.
//
// Pola pakai:
//   const v = validate(req.body, {
//     device_type:      { type: 'string',  required: true, maxLen: 50 },
//     estimated_weight: { type: 'number',  required: true, min: 0.01, max: 1000 },
//     dropbox_id:       { type: 'uuid',    required: false },
//   });
//   if (!v.ok) return res.status(400).json({ error: 'invalid_input', details: v.errors });
//   const data = v.value;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validate(input, schema) {
  const errors = {};
  const value = {};
  const obj = input ?? {};

  for (const [key, rule] of Object.entries(schema)) {
    const raw = obj[key];

    // Required check
    if (rule.required && (raw === undefined || raw === null || raw === '')) {
      errors[key] = 'required';
      continue;
    }
    if (raw === undefined || raw === null || raw === '') continue;

    // Type & coercion
    let coerced = raw;
    switch (rule.type) {
      case 'string':
        if (typeof raw !== 'string') { errors[key] = 'must_be_string'; continue; }
        if (rule.maxLen && raw.length > rule.maxLen) { errors[key] = `max_length_${rule.maxLen}`; continue; }
        if (rule.enum && !rule.enum.includes(raw)) { errors[key] = `must_be_one_of_${rule.enum.join('|')}`; continue; }
        break;
      case 'number':
        coerced = typeof raw === 'string' ? Number(raw) : raw;
        if (typeof coerced !== 'number' || Number.isNaN(coerced)) { errors[key] = 'must_be_number'; continue; }
        if (rule.min !== undefined && coerced < rule.min) { errors[key] = `min_${rule.min}`; continue; }
        if (rule.max !== undefined && coerced > rule.max) { errors[key] = `max_${rule.max}`; continue; }
        break;
      case 'uuid':
        if (typeof raw !== 'string' || !UUID_RE.test(raw)) { errors[key] = 'must_be_uuid'; continue; }
        break;
      case 'boolean':
        if (typeof raw === 'string') coerced = raw === 'true';
        else if (typeof raw !== 'boolean') { errors[key] = 'must_be_boolean'; continue; }
        break;
      default:
        // pass-through
    }
    value[key] = coerced;
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
