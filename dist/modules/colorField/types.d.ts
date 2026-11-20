/**
 * The user's own colours as "#rrggbb" strings.
 * Transported by the host handlers `loadCustomColors` (response of the read endpoint)
 * and `saveCustomColors` (request body and response of the write endpoint: the list as stored).
 */
export type CustomColorsResponse = string[];
