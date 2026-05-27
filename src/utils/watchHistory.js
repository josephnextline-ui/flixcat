import AsyncStorage from "@react-native-async-storage/async-storage";

const CW_KEY = "flixcat_continue_watching"; // [{id, type, title, poster_path, season, episode, watchedAt}]
const GENRE_PREFS_KEY = "flixcat_genre_prefs"; // { "genreId": count }
const MAX_HISTORY = 20;

/** Save (or update) an item in continue-watching and accumulate genre prefs */
export async function saveToWatchHistory({
  id,
  type,
  title,
  poster_path,
  backdrop_path,
  season,
  episode,
  genre_ids,
}) {
  try {
    // ── Continue watching list ──
    const raw = await AsyncStorage.getItem(CW_KEY);
    let list = raw ? JSON.parse(raw) : [];
    // Remove any existing entry for the same title so we move it to front
    list = list.filter((i) => !(i.id === id && i.type === type));
    list.unshift({
      id,
      type,
      title,
      poster_path,
      backdrop_path: backdrop_path || null,
      season: season || null,
      episode: episode || null,
      watchedAt: Date.now(),
    });
    await AsyncStorage.setItem(
      CW_KEY,
      JSON.stringify(list.slice(0, MAX_HISTORY)),
    );

    // ── Genre preferences ──
    if (genre_ids && genre_ids.length > 0) {
      const gRaw = await AsyncStorage.getItem(GENRE_PREFS_KEY);
      const prefs = gRaw ? JSON.parse(gRaw) : {};
      genre_ids.forEach((gid) => {
        prefs[String(gid)] = (prefs[String(gid)] || 0) + 1;
      });
      await AsyncStorage.setItem(GENRE_PREFS_KEY, JSON.stringify(prefs));
    }
  } catch (e) {
    console.warn("saveToWatchHistory error:", e);
  }
}

/** Get the full continue-watching list (newest first) */
export async function getContinueWatching() {
  try {
    const raw = await AsyncStorage.getItem(CW_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/** Remove one item from continue-watching (e.g. user dismisses it) */
export async function removeFromContinueWatching(id, type) {
  try {
    const raw = await AsyncStorage.getItem(CW_KEY);
    if (!raw) return;
    const list = JSON.parse(raw).filter(
      (i) => !(i.id === id && i.type === type),
    );
    await AsyncStorage.setItem(CW_KEY, JSON.stringify(list));
  } catch (e) {}
}

/** Return top N genre IDs sorted by watch frequency */
export async function getTopGenres(limit = 3) {
  try {
    const raw = await AsyncStorage.getItem(GENRE_PREFS_KEY);
    if (!raw) return [];
    return Object.entries(JSON.parse(raw))
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([gid]) => gid);
  } catch (e) {
    return [];
  }
}

/** Clear all watch history (for settings / debugging) */
export async function clearWatchHistory() {
  try {
    await AsyncStorage.multiRemove([CW_KEY, GENRE_PREFS_KEY]);
  } catch (e) {}
}
