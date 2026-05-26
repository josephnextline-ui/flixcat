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
import { useRouter } from "expo-router";
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
  ChevronRight,
} from "lucide-react-native";
import { addToWatchlist } from "@/utils/watchlist";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = 120;
const CARD_HEIGHT = 180;

function ContentRow({
  label,
  icon: Icon,
  iconColor = "#E50914",
  items,
  onPress,
}) {
  if (!items || items.length === 0) return null;
  return (
    <View style={{ marginBottom: 28 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: `${iconColor}22`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} color={iconColor} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>
          {label}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
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
              activeOpacity={0.85}
            >
              <View
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: "#1f1f1f",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                {posterUrl ? (
                  <Image
                    source={{ uri: posterUrl }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={100}
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Clapperboard size={32} color="#555" />
                  </View>
                )}
                {/* Type badge */}
                <View
                  style={{
                    position: "absolute",
                    top: 5,
                    left: 5,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                    borderRadius: 4,
                    backgroundColor: type === "movie" ? "#1d4ed8" : "#7c3aed",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {type === "movie" ? (
                    <Clapperboard size={7} color="#fff" />
                  ) : (
                    <Tv size={7} color="#fff" />
                  )}
                  <Text
                    style={{ color: "#fff", fontSize: 8, fontWeight: "700" }}
                  >
                    {type === "movie" ? "MOVIE" : "TV"}
                  </Text>
                </View>
                {rating && (
                  <View
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      paddingHorizontal: 5,
                      paddingVertical: 2,
                      borderRadius: 4,
                      backgroundColor: "rgba(0,0,0,0.75)",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Star size={7} color="#fbbf24" fill="#fbbf24" />
                    <Text
                      style={{
                        color: "#fbbf24",
                        fontSize: 8,
                        fontWeight: "700",
                      }}
                    >
                      {rating}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  color: "#9ca3af",
                  fontSize: 11,
                  fontWeight: "600",
                  marginTop: 6,
                  width: CARD_WIDTH,
                }}
                numberOfLines={2}
              >
                {item.title || item.name}
              </Text>
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
          backgroundColor: "#0a0a0a",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        <StatusBar style="light" />
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: "#E50914",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Clapperboard size={26} color="white" />
        </View>
        <ActivityIndicator color="#E50914" size="small" />
        <Text style={{ color: "#555", fontSize: 13 }}>Loading FlixCat...</Text>
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
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Hero */}
        {hero && (
          <View style={{ height: 500, marginBottom: 8 }}>
            {backdropUrl && (
              <Image
                source={{ uri: backdropUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
              />
            )}
            <LinearGradient
              colors={["rgba(0,0,0,0.05)", "rgba(10,10,10,0.95)"]}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.75)", "transparent"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: insets.top + 70,
              }}
            />

            {/* Logo */}
            <View
              style={{
                position: "absolute",
                top: insets.top + 14,
                left: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  backgroundColor: "#E50914",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clapperboard size={16} color="white" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: "900", color: "white" }}>
                Flix<Text style={{ color: "#E50914" }}>Cat</Text>
              </Text>
            </View>

            {/* Hero info */}
            <View
              style={{ position: "absolute", bottom: 24, left: 16, right: 16 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 6,
                  marginBottom: 10,
                  flexWrap: "wrap",
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor:
                      heroType === "movie" ? "#1d4ed8" : "#7c3aed",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {heroType === "movie" ? (
                    <Clapperboard size={9} color="#fff" />
                  ) : (
                    <Tv size={9} color="#fff" />
                  )}
                  <Text
                    style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}
                  >
                    {heroType === "movie" ? "MOVIE" : "TV SHOW"}
                  </Text>
                </View>
                {heroRating && (
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor: "rgba(245,158,11,0.2)",
                      borderWidth: 1,
                      borderColor: "rgba(245,158,11,0.4)",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Star size={9} color="#fbbf24" fill="#fbbf24" />
                    <Text
                      style={{
                        color: "#fbbf24",
                        fontSize: 9,
                        fontWeight: "700",
                      }}
                    >
                      {heroRating}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 26,
                  fontWeight: "900",
                  marginBottom: 14,
                  lineHeight: 32,
                }}
                numberOfLines={2}
              >
                {heroTitle}
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={handleHeroPlay}
                  style={{
                    flex: 1,
                    backgroundColor: "#E50914",
                    paddingVertical: 13,
                    borderRadius: 12,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Play size={16} color="white" fill="white" />
                  <Text
                    style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}
                  >
                    Play
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleHeroList}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 13,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Plus size={16} color="white" />
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                  >
                    List
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Hero dots */}
        {heroPool.length > 1 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 5,
              marginBottom: 24,
            }}
          >
            {heroPool.slice(0, 8).map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setHeroIdx(i)}>
                <View
                  style={{
                    width: i === heroIdx ? 18 : 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor:
                      i === heroIdx ? "#E50914" : "rgba(255,255,255,0.2)",
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Rows */}
        <ContentRow
          label="Trending"
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
