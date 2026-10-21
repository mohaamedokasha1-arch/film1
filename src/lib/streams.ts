/**
 * Playback helpers shared by the server (watch page) and the browser (player).
 * Kept free of `server-only` so the client bundle can use them too.
 */

/** Replaces `{id}`, `{tmdb}`, `{season}` and `{episode}` placeholders in admin links. */
export function fillStreamTemplate(
  template: string,
  values: { id?: number | string; season?: number; episode?: number },
) {
  return template
    .replaceAll("{id}", String(values.id ?? ""))
    .replaceAll("{tmdb}", String(values.id ?? ""))
    .replaceAll("{season}", String(values.season ?? 1))
    .replaceAll("{episode}", String(values.episode ?? 1));
}

const DIRECT_EXTENSIONS = /\.(mp4|m4v|webm|ogg|ogv|mov)(?:[?#]|$)/i;

/** True for a plain video file that can play inside a native <video> element. */
export function isDirectVideoUrl(url: string) {
  return DIRECT_EXTENSIONS.test(url.split("?")[0] ?? url);
}

/** True for an HLS playlist (.m3u8) — needs hls.js outside Safari. */
export function isHlsUrl(url: string) {
  return /\.m3u8(?:[?#]|$)/i.test(url);
}

export function isNativePlayable(url: string) {
  return isDirectVideoUrl(url) || isHlsUrl(url);
}
