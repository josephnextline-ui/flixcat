import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Play,
  Plus,
  Flame,
  Clapperboard,
  Tv,
  Globe,
  Swords,
  Star,
  Heart,
  Info,
  ChevronRight,
  History,
  Sparkles,
  X,
  Bell,
} from "lucide-react-native";
import { addToWatchlist } from "@/utils/watchlist";
import {
  getContinueWatching,
  getTopGenres,
  removeFromContinueWatching,
} from "@/utils/watchHistory";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = 116;
const CARD_HEIGHT = 174;
const CW_CARD_W = 160;
const CW_CARD_H = 95; // 16:9-ish landscape card

// ── Continue Watching Row ──────────────────────────────────────────────────
function ContinueWatchingRow({ items, onPress, onRemove }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={{ marginBottom: 36 }}>
      {/* Heading */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 18,
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <View
            style={{
              width: 3,
              height: 18,
              borderRadius: 2,
              backgroundColor: "#E50914",
            }}
          />
          <Text
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: "#fff",
              letterSpacing: -0.4,
            }}
          >
            Continue Watching
          </Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 18, gap: 12 }}
      >
        {items.map((item) => {
          const posterUrl = item.backdrop_path
            ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
            : item.poster_path
              ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
              : null;
          return (
            <TouchableOpacity
              key={`${item.type}-${item.id}`}
              onPress={() => onPress(item)}
              activeOpacity={0.82}
            >
              <View
                style={{
                  width: 172,
                  height: 100,
                  borderRadius: 12,
                  overflow: "hidden",
                  backgroundColor: "#111",
                }}
              >
                {posterUrl ? (
                  <Image
                    source={{ uri: posterUrl }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Clapperboard size={28} color="#2a2a2a" />
                  </View>
                )}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.88)"]}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 65,
                    justifyContent: "flex-end",
                    padding: 9,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: "700",
                      lineHeight: 14,
                    }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {item.season && (
                    <Text
                      style={{ color: "#9ca3af", fontSize: 9, marginTop: 2 }}
                    >
                      S{item.season} · E{item.episode}
                    </Text>
                  )}
                </LinearGradient>
                {/* Play icon overlay */}
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: "rgba(229,9,20,0.9)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Play size={14} color="#fff" fill="#fff" />
                  </View>
                </View>
                {/* Remove button */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onRemove(item.id, item.type);
                  }}
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 7,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: "rgba(0,0,0,0.65)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <X size={11} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ContentRow({
  label,
  icon: Icon,
  iconColor = "#E50914",
  items,
  onPress,
}) {
  if (!items || items.length === 0) return null;
  return (
    <View style={{ marginBottom: 36 }}>
      {/* Heading with accent bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 18,
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <View
            style={{
              width: 3,
              height: 18,
              borderRadius: 2,
              backgroundColor: iconColor,
            }}
          />
          <Text
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: "#fff",
              letterSpacing: -0.4,
            }}
          >
            {label}
          </Text>
        </View>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
        >
          <Text style={{ color: "#3a3a3a", fontSize: 12, fontWeight: "600" }}>
            See all
          </Text>
          <ChevronRight size={13} color="#3a3a3a" />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 18, gap: 12 }}
      >
        {items.map((item) => {
          const posterUrl = item.poster_path
            ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
            : null;
          const type = item.media_type || (item.title ? "movie" : "tv");
          const rating =
            item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onPress(item)}
              activeOpacity={0.82}
            >
              <View
                style={{
                  width: 120,
                  height: 180,
                  borderRadius: 12,
                  overflow: "hidden",
                  backgroundColor: "#111",
                }}
              >
                {posterUrl ? (
                  <Image
                    source={{ uri: posterUrl }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Clapperboard size={32} color="#2a2a2a" />
                  </View>
                )}
                {/* Rating badge */}
                {rating && (
                  <View
                    style={{
                      position: "absolute",
                      top: 7,
                      right: 7,
                      paddingHorizontal: 5,
                      paddingVertical: 2,
                      borderRadius: 5,
                      backgroundColor: "rgba(0,0,0,0.72)",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Star size={7} color="#fbbf24" fill="#fbbf24" />
                    <Text
                      style={{ color: "#fff", fontSize: 8, fontWeight: "700" }}
                    >
                      {rating}
                    </Text>
                  </View>
                )}
                {/* Title gradient */}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.88)"]}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 65,
                    justifyContent: "flex-end",
                    padding: 9,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "600",
                      lineHeight: 14,
                    }}
                    numberOfLines={2}
                  >
                    {item.title || item.name}
                  </Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData] = useState({
    trending: [],
    movies: [],
    tv: [],
    korean: [],
    fantasy: [],
    drama: [],
  });
  const [heroPool, setHeroPool] = useState([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  // Continue Watching + Recommendations
  const [continueWatching, setContinueWatching] = useState([]);
  const [recommended, setRecommended] = useState([]);

  // Reload local data every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadLocalData();
    }, []),
  );

  const loadLocalData = async () => {
    const cw = await getContinueWatching();
    setContinueWatching(cw);
    const topGenres = await getTopGenres(3);
    if (topGenres.length > 0) {
      try {
        const genre = topGenres[0];
        // Alternate movie/tv based on second genre
        const type =
          topGenres.length > 1 && parseInt(topGenres[1]) % 2 === 0
            ? "tv"
            : "movie";
        const res = await fetch(
          `/api/tmdb/discover?type=${type}&genre=${genre}&sort=vote_average.desc&min_votes=100&page=1`,
        );
        if (res.ok) {
          const d = await res.json();
          // Filter out items already in continue watching
          const cwIds = new Set(cw.map((i) => i.id));
          setRecommended(
            (d.results || [])
              .filter((r) => r.poster_path && !cwIds.has(r.id))
              .slice(0, 15),
          );
        }
      } catch (e) {
        console.warn("recommendations error:", e);
      }
    }
  };

  const handleRemoveCW = async (id, type) => {
    await removeFromContinueWatching(id, type);
    setContinueWatching((prev) =>
      prev.filter((i) => !(i.id === id && i.type === type)),
    );
  };

  const handleCWPress = (item) => {
    if (item.type === "tv" && item.season) {
      router.push(
        `/watch/${item.type}/${item.id}?season=${item.season}&episode=${item.episode || 1}`,
      );
    } else {
      router.push(`/watch/${item.type}/${item.id}`);
    }
  };

  useEffect(() => {
    fetchContent();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (heroPool.length > 1) {
      timerRef.current = setInterval(
        () => setHeroIdx((i) => (i + 1) % Math.min(heroPool.length, 8)),
        8000,
      );
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [heroPool]);

  const fetchContent = async () => {
    try {
      const discover = (type, params = "") =>
        fetch(`/api/tmdb/discover?type=${type}${params}`)
          .then((r) => r.json())
          .then((d) => (d.results || []).filter((x) => x.poster_path));

      const [trendRes, movRes, tvRes, koreanTV, koreanMov, fantasyTV, dramaTV] =
        await Promise.all([
          fetch("/api/tmdb/trending?media_type=all&time_window=week").then(
            (r) => r.json(),
          ),
          fetch("/api/tmdb/movies/popular").then((r) => r.json()),
          fetch("/api/tmdb/tv/popular").then((r) => r.json()),
          discover("tv", "&language=ko&min_votes=20"),
          discover("movie", "&language=ko&min_votes=20"),
          discover("tv", "&genre=14&min_votes=30"),
          discover("tv", "&genre=18&sort=vote_average.desc&min_votes=100"),
        ]);

      const pool = (trendRes.results || []).filter((r) => r.backdrop_path);
      setHeroPool(pool);
      setData({
        trending: trendRes.results || [],
        movies: (movRes.results || []).filter((x) => x.poster_path),
        tv: (tvRes.results || []).filter((x) => x.poster_path),
        korean: [...koreanTV.slice(0, 10), ...koreanMov.slice(0, 10)],
        fantasy: fantasyTV,
        drama: dramaTV,
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleItemPress = (item) => {
    const type = item.media_type || (item.title ? "movie" : "tv");
    router.push(`/details/${type}/${item.id}`);
  };

  const handleHeroPlay = () => {
    const hero = heroPool[heroIdx];
    if (!hero) return;
    const type = hero.media_type || (hero.title ? "movie" : "tv");
    router.push(`/watch/${type}/${hero.id}`);
  };

  const handleHeroList = async () => {
    const hero = heroPool[heroIdx];
    if (!hero) return;
    const type = hero.media_type || (hero.title ? "movie" : "tv");
    await addToWatchlist({
      content_id: hero.id,
      content_type: type,
      title: hero.title || hero.name,
      poster_path: hero.poster_path,
    });
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={{ color: "#6B6B6B", marginTop: 12, fontSize: 14 }}>
          Loading FlixCat...
        </Text>
      </View>
    );
  }

  const hero = heroPool[heroIdx];
  const backdropUrl = hero?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${hero.backdrop_path}`
    : null;
  const heroTitle = hero?.title || hero?.name || "";
  const heroRating = hero?.vote_average ? hero.vote_average.toFixed(1) : null;
  const heroType = hero?.media_type || (hero?.title ? "movie" : "tv");

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ── Hero ── */}
        {hero && (
          <View style={{ height: 560, position: "relative" }}>
            {backdropUrl && (
              <Image
                source={{ uri: backdropUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={400}
              />
            )}
            {/* Main vertical gradient */}
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.3)",
                "transparent",
                "rgba(0,0,0,0.65)",
                "#000",
              ]}
              locations={[0, 0.3, 0.72, 1]}
              style={StyleSheet.absoluteFill}
            />
            {/* Side vignette */}
            <LinearGradient
              colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.5)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Top bar with logo + bell */}
            <View
              style={{
                position: "absolute",
                top: insets.top + 10,
                left: 18,
                right: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: "#E50914",
                  fontSize: 26,
                  fontWeight: "900",
                  letterSpacing: -1.2,
                }}
              >
                FlixCat
              </Text>
              <TouchableOpacity
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                }}
              >
                <Bell size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Hero bottom info */}
            <View
              style={{ position: "absolute", bottom: 28, left: 18, right: 18 }}
            >
              {/* Type + rating */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 9,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor:
                      heroType === "movie"
                        ? "rgba(29,78,216,0.85)"
                        : "rgba(124,58,237,0.85)",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {heroType === "movie" ? (
                    <Clapperboard size={10} color="#fff" />
                  ) : (
                    <Tv size={10} color="#fff" />
                  )}
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "800",
                      letterSpacing: 0.3,
                    }}
                  >
                    {heroType === "movie" ? "MOVIE" : "TV SHOW"}
                  </Text>
                </View>
                {heroRating && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Star size={12} color="#fbbf24" fill="#fbbf24" />
                    <Text
                      style={{
                        color: "#fbbf24",
                        fontSize: 13,
                        fontWeight: "800",
                      }}
                    >
                      {heroRating}
                    </Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text
                style={{
                  color: "#fff",
                  fontSize: 30,
                  fontWeight: "900",
                  marginBottom: 18,
                  letterSpacing: -0.9,
                  lineHeight: 36,
                  textShadowColor: "rgba(0,0,0,0.6)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                }}
                numberOfLines={2}
              >
                {heroTitle}
              </Text>

              {/* Buttons */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={handleHeroPlay}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    backgroundColor: "#E50914",
                    paddingVertical: 13,
                    borderRadius: 10,
                    shadowColor: "#E50914",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.55,
                    shadowRadius: 10,
                    elevation: 8,
                  }}
                >
                  <Play size={15} color="#fff" fill="#fff" />
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}
                  >
                    Play Now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const hero = heroPool[heroIdx];
                    if (!hero) return;
                    const type =
                      hero.media_type || (hero.title ? "movie" : "tv");
                    router.push(`/details/${type}/${hero.id}`);
                  }}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    paddingVertical: 13,
                    paddingHorizontal: 18,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <Info size={16} color="#fff" />
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                  >
                    Info
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleHeroList}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    paddingVertical: 13,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <Plus size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Dots */}
        {heroPool.length > 1 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 5,
              marginTop: 10,
              marginBottom: 28,
            }}
          >
            {heroPool.slice(0, 8).map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setHeroIdx(i)}>
                <View
                  style={{
                    width: i === heroIdx ? 20 : 5,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor:
                      i === heroIdx ? "#E50914" : "rgba(255,255,255,0.18)",
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Continue Watching ── */}
        <ContinueWatchingRow
          items={continueWatching}
          onPress={handleCWPress}
          onRemove={handleRemoveCW}
        />

        {/* ── Recommended For You ── */}
        <ContentRow
          label="Recommended For You"
          icon={Sparkles}
          iconColor="#a78bfa"
          items={recommended}
          onPress={handleItemPress}
        />

        {/* Content rows */}
        <ContentRow
          label="Trending Now"
          icon={Flame}
          iconColor="#ef4444"
          items={data.trending}
          onPress={handleItemPress}
        />
        <ContentRow
          label="Korean"
          icon={Globe}
          iconColor="#FF6B9D"
          items={data.korean}
          onPress={handleItemPress}
        />
        <ContentRow
          label="High Fantasy"
          icon={Swords}
          iconColor="#7c3aed"
          items={data.fantasy}
          onPress={handleItemPress}
        />
        <ContentRow
          label="Drama"
          icon={Heart}
          iconColor="#f59e0b"
          items={data.drama}
          onPress={handleItemPress}
        />
        <ContentRow
          label="Popular Movies"
          icon={Clapperboard}
          iconColor="#E50914"
          items={data.movies}
          onPress={handleItemPress}
        />
        <ContentRow
          label="Popular TV Shows"
          icon={Tv}
          iconColor="#3b82f6"
          items={data.tv}
          onPress={handleItemPress}
        />
      </ScrollView>
    </View>
  );
}
