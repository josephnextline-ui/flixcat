import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  Search as SearchIcon,
  Star,
  Clapperboard,
  Tv,
  Film,
  SearchX,
  X,
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const QUICK_SUGGESTIONS = [
  "Breaking Bad",
  "Interstellar",
  "Attack on Titan",
  "The Bear",
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const debounceRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = async (q) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(q)}`,
      );
      const data = await res.json();
      setResults(data.results?.filter((r) => r.media_type !== "person") || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(val), 500);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
  };

  const handleItemPress = (item) => {
    const type = item.media_type || (item.title ? "movie" : "tv");
    router.push(`/details/${type}/${item.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: "900",
            marginBottom: 14,
            letterSpacing: -0.5,
          }}
        >
          Search
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#111",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#222",
            paddingHorizontal: 14,
            gap: 10,
          }}
        >
          <SearchIcon size={18} color="#4a4a4a" />
          <TextInput
            value={query}
            onChangeText={handleInput}
            placeholder="Movies, TV shows, anime..."
            placeholderTextColor="#3a3a3a"
            style={{
              flex: 1,
              color: "#fff",
              fontSize: 15,
              paddingVertical: 14,
            }}
            returnKeyType="search"
            onSubmitEditing={() => performSearch(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#2a2a2a",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <X size={12} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 80,
          flexGrow: 1,
        }}
      >
        {/* Empty state */}
        {!searched && !loading && (
          <View
            style={{
              alignItems: "center",
              marginTop: 52,
              gap: 14,
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#0f0f0f",
                borderWidth: 1,
                borderColor: "#1f1f1f",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SearchIcon size={32} color="#2a2a2a" />
            </View>
            <Text style={{ color: "#fff", fontSize: 19, fontWeight: "800" }}>
              Find something to watch
            </Text>
            <Text
              style={{
                color: "#4a4a4a",
                fontSize: 14,
                textAlign: "center",
                lineHeight: 21,
              }}
            >
              Search across thousands of movies, TV shows, and anime
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
                marginTop: 4,
              }}
            >
              {QUICK_SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    setQuery(s);
                    performSearch(s);
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: "rgba(229,9,20,0.08)",
                    borderWidth: 1,
                    borderColor: "rgba(229,9,20,0.2)",
                  }}
                >
                  <Text
                    style={{
                      color: "#E50914",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={{ alignItems: "center", marginTop: 60, gap: 14 }}>
            <ActivityIndicator size="large" color="#E50914" />
            <Text style={{ color: "#4a4a4a", fontSize: 14 }}>Searching...</Text>
          </View>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 60, gap: 12 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#0f0f0f",
                borderWidth: 1,
                borderColor: "#1f1f1f",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SearchX size={30} color="#2a2a2a" />
            </View>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              Nothing found
            </Text>
            <Text
              style={{ color: "#4a4a4a", fontSize: 14, textAlign: "center" }}
            >
              Try a different search term
            </Text>
          </View>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <>
            <Text
              style={{
                color: "#4a4a4a",
                fontSize: 11,
                fontWeight: "700",
                marginBottom: 14,
                letterSpacing: 0.8,
              }}
            >
              {results.length} RESULTS
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
              {results.map((item) => {
                const posterUrl = item.poster_path
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : null;
                const title = item.title || item.name;
                const type = item.media_type || (item.title ? "movie" : "tv");
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.85}
                    style={{ width: CARD_WIDTH }}
                  >
                    <View
                      style={{
                        width: CARD_WIDTH,
                        height: CARD_WIDTH * 1.5,
                        borderRadius: 12,
                        overflow: "hidden",
                        backgroundColor: "#111",
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.04)",
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
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Film size={32} color="#2a2a2a" />
                        </View>
                      )}
                      <View
                        style={{
                          position: "absolute",
                          top: 7,
                          left: 7,
                          paddingHorizontal: 7,
                          paddingVertical: 3,
                          borderRadius: 5,
                          backgroundColor:
                            type === "movie"
                              ? "rgba(29,78,216,0.85)"
                              : "rgba(124,58,237,0.85)",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        {type === "movie" ? (
                          <Clapperboard size={8} color="#fff" />
                        ) : (
                          <Tv size={8} color="#fff" />
                        )}
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 8,
                            fontWeight: "800",
                          }}
                        >
                          {type === "movie" ? "MOVIE" : "TV"}
                        </Text>
                      </View>
                      {item.vote_average > 0 && (
                        <View
                          style={{
                            position: "absolute",
                            top: 7,
                            right: 7,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 3,
                            backgroundColor: "rgba(0,0,0,0.8)",
                            paddingHorizontal: 6,
                            paddingVertical: 3,
                            borderRadius: 5,
                          }}
                        >
                          <Star size={8} color="#fbbf24" fill="#fbbf24" />
                          <Text
                            style={{
                              color: "#fbbf24",
                              fontSize: 9,
                              fontWeight: "700",
                            }}
                          >
                            {item.vote_average.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        color: "#e5e7eb",
                        fontSize: 13,
                        fontWeight: "600",
                        lineHeight: 18,
                      }}
                      numberOfLines={2}
                    >
                      {title}
                    </Text>
                    {item.vote_average > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          marginTop: 3,
                        }}
                      >
                        <Star size={10} color="#fbbf24" fill="#fbbf24" />
                        <Text
                          style={{
                            color: "#fbbf24",
                            fontSize: 11,
                            fontWeight: "600",
                          }}
                        >
                          {item.vote_average.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
