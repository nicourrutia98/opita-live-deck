export function getRoomParam(): string {
  if (typeof window === 'undefined') return "presentation";

  // 1. Try parsing from search parameters (before hash)
  let params = new URLSearchParams(window.location.search);
  let room = params.get("room");
  if (room) return room;

  // 2. Try parsing from the hash (after hash)
  const hash = window.location.hash;
  const questionMarkIndex = hash.indexOf('?');
  if (questionMarkIndex !== -1) {
    params = new URLSearchParams(hash.substring(questionMarkIndex));
    room = params.get("room");
    if (room) return room;
  }

  return "presentation";
}
