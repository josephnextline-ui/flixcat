import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  Compass,
  Clapperboard,
  Tv,
  Star,
  Globe,
  Swords,
  Film,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 10 * 2) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

const CATEGORIES = [
  { id: "all", label: "All", icon: Compass, color: "#E50914" },
  { id: "korean", label: "Korean", icon: Globe, color: "#FF6B9D" },
  { id: "fantasy", label: "Fantasy", icon: Swords, color: "#7C3AED" },
  { id: "drama", label: "Drama", icon: Film, color: "#F59E0B" },
  { id: "movies", label: "Movies", icon: Clapperboard, color: "#E50914" },
  { id: "tv", label: "TV Shows", icon: Tv, color: "#3B82F6" },
];

const GENRES = [
  { id: "", label: "All Genres" },
  { id: "28", label: "Action" },
  { id: "12", label: "Adventure" },
  { id: "16", label: "Animation" },
  { id: "35", label: "Comedy" },
  { id: "80", label: "Crime" },
  { id: "99", label: "Documentary" },
  { id: "18", label: "Drama" },
  { id: "14", label: "Fantasy" },
  { id: "27", label: "Horror" },
  { id: "10402", label: "Music" },
  { id: "9648", label: "Mystery" },
  { id: "10749", label: "Romance" },
  { id: "878", label: "Sci-Fi" },
  { id: "53", label: "Thriller" },
];

const SORT_OPTIONS = [
  { id: "popularity.desc", label: "Most Popular" },
  { id: "vote_average.desc", label: "Highest Rated" },
  { id: "release_date.desc", label: "Newest First" },
  { id: "release_date.asc", label: "Oldest First" },
];

const CATEGORY_DEFAULTS = {
  all: { type: "movie", language: "", genre: "" },
  korean: { type: "tv", language: "ko", genre: "" },
  fantasy: { type: "tv", language: "", genre: "14" },
  drama: { type: "tv", language: "", genre: "18" },
  movies: { type: "movie", language: "", genre: "" },
  tv: { type: "tv", language: "", genre: "" },
};

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [mediaType, setMediaType] = useState("movie");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("popularity.desc");
  const [minRating, setMinRating] = useState("");
  const [year, setYear] = useState("");

  // Sync category defaults
  const applyCategory = (catId) => {
    setCategory(catId);
    const d = CATEGORY_DEFAULTS[catId];
    setMediaType(d.type);
    setGenre(d.genre);
    if (catId === "korean") setMediaType("tv");
  };

  useEffect(() => {
    loadItems(1, true);
  }, [category, mediaType, genre, sort, minRating, year]);

  const buildParams = (p) => {
    const params = new URLSearchParams({
      type: mediaType,
      page: p,
      sort,
      min_votes: "20",
    });
    if (genre) params.set("genre", genre);
    if (
      category === "korean" ||
      (category === "all" && mediaType === "tv" && genre === "")
    ) {
      // for korean category, set language
    }
    if (CATEGORY_DEFAULTS[category]?.language)
      params.set("language", CATEGORY_DEFAULTS[category].language);
    if (minRating) params.set("vote_average_gte", minRating);
    if (year) params.set("year", year);
    return params;
  };

  const loadItems = async (p, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = buildParams(p);
      const res = await fetch(`/api/tmdb/discover?${params}`);
      const data = await res.json();
      const results = (data.results || []).filter((r) => r.poster_path);
      if (reset) setItems(results);
      else setItems((prev) => [...prev, ...results]);
      setPage(p);
      setHasMore(p < Math.min(data.total_pages || 1, 20));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleItemPress = (item) => {
    router.push(`/details/${mediaType}/${item.id}`);
  };

  const renderItem = ({ item, index }) => {
    const posterUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : null;
    const rating = item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        activeOpacity={0.85}
        style={{
          width: CARD_WIDTH,
          marginBottom: 12,
          marginLeft: index % 3 === 0 ? 0 : 10,
        }}
      >
        <View
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#1a1a1a",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={100}
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clapperboard size={28} color="#444" />
            </View>
          )}
          {rating && (
            <View
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                backgroundColor: "rgba(0,0,0,0.75)",
                paddingHorizontal: 5,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Star size={8} color="#fbbf24" fill="#fbbf24" />
              <Text
                style={{ color: "#fbbf24", fontSize: 9, fontWeight: "700" }}
              >
                {rating}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={{ color: "#9ca3af", fontSize: 11, marginTop: 5 }}
          numberOfLines={2}
        >
          {item.title || item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const currentCat = CATEGORIES.find((c) => c.id === category);
  const CatIcon = currentCat?.icon || Compass;

  return (
    <View
      style={{ flex: 1, backgroundColor: "#0a0a0a", paddingTop: insets.top }}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <CatIcon size={20} color={currentCat?.color || "#E50914"} />
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>
              Browse
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: showFilters
                ? "#E50914"
                : "rgba(255,255,255,0.08)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: showFilters ? "#E50914" : "rgba(255,255,255,0.12)",
            }}
          >
            <SlidersHorizontal size={14} color="white" />
            <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
              Filters
            </Text>
            {showFilters ? (
              <ChevronUp size={12} color="white" />
            ) : (
              <ChevronDown size={12} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginBottom: 14 }}
          contentContainerStyle={{ gap: 6, paddingRight: 8 }}
        >
          {CATEGORIES.map((cat) => {
            const CIcon = cat.icon;
            const active = category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => applyCategory(cat.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: active
                    ? cat.color
                    : "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor: active ? cat.color : "rgba(255,255,255,0.08)",
                }}
              >
                <CIcon size={13} color={active ? "white" : "#9ca3af"} />
                <Text
                  style={{
                    color: active ? "white" : "#9ca3af",
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Filters panel */}
        {showFilters && (
          <View
            style={{
              backgroundColor: "#141414",
              borderRadius: 14,
              padding: 14,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              gap: 12,
            }}
          >
            {/* Type */}
            <View>
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 10,
                  fontWeight: "600",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Type
              </Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {[
                  { id: "movie", label: "Movies" },
                  { id: "tv", label: "TV Shows" },
                ].map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setMediaType(t.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 7,
                      borderRadius: 8,
                      alignItems: "center",
                      backgroundColor:
                        mediaType === t.id
                          ? "#E50914"
                          : "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor:
                        mediaType === t.id
                          ? "#E50914"
                          : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort */}
            <View>
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 10,
                  fontWeight: "600",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Sort By
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ gap: 5 }}
              >
                {SORT_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setSort(s.id)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor:
                        sort === s.id
                          ? "rgba(229,9,20,0.2)"
                          : "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor:
                        sort === s.id ? "#E50914" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text
                      style={{
                        color: sort === s.id ? "#E50914" : "#9ca3af",
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Genre */}
            <View>
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 10,
                  fontWeight: "600",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Genre
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ gap: 5 }}
              >
                {GENRES.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setGenre(g.id)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor:
                        genre === g.id
                          ? "rgba(229,9,20,0.2)"
                          : "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor:
                        genre === g.id ? "#E50914" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Text
                      style={{
                        color: genre === g.id ? "#E50914" : "#9ca3af",
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year + Rating row */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: 10,
                    fontWeight: "600",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Year
                </Text>
                <TextInput
                  value={year}
                  onChangeText={setYear}
                  placeholder="e.g. 2024"
                  placeholderTextColor="#4b5563"
                  keyboardType="numeric"
                  maxLength={4}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "white",
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#6b7280",
                    fontSize: 10,
                    fontWeight: "600",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Min Rating
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0 }}
                  contentContainerStyle={{ gap: 4 }}
                >
                  {["", "5", "6", "7", "8"].map((r) => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setMinRating(r)}
                      style={{
                        paddingHorizontal: 9,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor:
                          minRating === r
                            ? "rgba(229,9,20,0.2)"
                            : "rgba(255,255,255,0.06)",
                        borderWidth: 1,
                        borderColor:
                          minRating === r
                            ? "#E50914"
                            : "rgba(255,255,255,0.08)",
                      }}
                    >
                      <Text
                        style={{
                          color: minRating === r ? "#E50914" : "#9ca3af",
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        {r || "Any"}
                        {r ? "+" : ""}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Grid */}
      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color="#E50914" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 80,
          }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasMore && !loadingMore) loadItems(page + 1);
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color="#E50914"
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 80,
              }}
            >
              <Compass size={40} color="#333" />
              <Text style={{ color: "#6b7280", marginTop: 12, fontSize: 14 }}>
                No results found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
