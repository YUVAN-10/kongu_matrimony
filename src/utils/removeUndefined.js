/**
 * Recursively strips `undefined` values from an object/array tree before
 * writing to Firestore. The Firestore SDK throws "Unsupported field value:
 * undefined" for any undefined leaf, anywhere in the document — and with a
 * ~80-field profile form where almost everything is optional, `getValues()`
 * naturally produces undefined for every field the admin never touched.
 *
 * Firestore-native values (Timestamp instances, and the sentinel objects
 * returned by serverTimestamp()/increment()/arrayUnion()/etc., plus Date)
 * are class instances, not plain `{}` object literals — `constructor ===
 * Object` is false for all of them — so they're returned as-is instead of
 * being (incorrectly) recursed into via Object.entries() and rebuilt as a
 * plain object, which would silently corrupt them (their real state often
 * isn't in enumerable own properties, so the rebuild can collapse them to
 * `{}` and break Firestore's ability to recognize them as special values).
 */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && value.constructor === Object
}

export function removeUndefined(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined).map((item) => removeUndefined(item))
  }

  if (isPlainObject(value)) {
    const result = {}
    for (const [key, entryValue] of Object.entries(value)) {
      if (entryValue === undefined) continue
      result[key] = removeUndefined(entryValue)
    }
    return result
  }

  // Primitives (string, number, boolean, null) and opaque instances
  // (Timestamp, Date, FieldValue sentinels) pass through unchanged.
  return value
}