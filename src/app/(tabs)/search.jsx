import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Search as SearchIcon } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

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

  const handleItemPress = (item) => {
    const type = item.media_type || (item.title ? "movie" : "tv");
    router.push(`/watch/${type}/${item.id}`);
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#0a0a0a", paddingTop: insets.top }}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: "#fff",
            marginBottom: 14,
          }}
        >
          🔍 Search
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#141414",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#2a2a2a",
            paddingHorizontal: 14,
          }}
        >
          <SearchIcon color="#4b5563" size={18} />
          <TextInput
            value={query}
            onChangeText={handleInput}
            placeholder="Movies, TV shows, anime..."
            placeholderTextColor="#4b5563"
            style={{
              flex: 1,
              color: "#fff",
              paddingVertical: 13,
              paddingLeft: 10,
              fontSize: 15,
            }}
            returnKeyType="search"
            onSubmitEditing={() => performSearch(query)}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 80,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {!searched && !loading && (
          <View style={{ alignItems: "center", paddingTop: 48 }}>
            <Text style={{ fontSize: 56, marginBottom: 12 }}>🐱</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              What are you looking for?
            </Text>
            <Text
              style={{
                color: "#6b7280",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Search for movies, TV shows, and anime
            </Text>
          </View>
        )}

        {loading && (
          <View style={{ alignItems: "center", paddingTop: 48 }}>
            <Text style={{ fontSize: 48, marginBottom: 10 }}>🐱</Text>
            <Text style={{ color: "#9ca3af", fontSize: 16 }}>Searching...</Text>
          </View>
        )}

        {!loading && searched && results.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 48 }}>
            <Text style={{ fontSize: 48, marginBottom: 10 }}>😿</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              Nothing found
            </Text>
            <Text
              style={{
                color: "#6b7280",
                fontSize: 13,
              }}
            >
              Try a different search term
            </Text>
          </View>
        )}

        {!loading && results.length > 0 && (
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                {results.length} results
              </Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
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
                    {posterUrl ? (
                      <Image
                        source={{ uri: posterUrl }}
                        style={{
                          width: "100%",
                          height: CARD_WIDTH * 1.5,
                          borderRadius: 10,
                        }}
                        contentFit="cover"
                        transition={100}
                      />
                    ) : (
                      <View
                        style={{
                          width: "100%",
                          height: CARD_WIDTH * 1.5,
                          borderRadius: 10,
                          backgroundColor: "#1f1f1f",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 36 }}>🐱</Text>
                      </View>
                    )}
                    <View
                      style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 5,
                        backgroundColor:
                          type === "movie" ? "#1d4ed8" : "#7c3aed",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: "700",
                        }}
                      >
                        {type === "movie" ? "MOVIE" : "TV"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: "600",
                        marginTop: 8,
                      }}
                      numberOfLines={2}
                    >
                      {title}
                    </Text>
                    {item.vote_average > 0 && (
                      <Text
                        style={{
                          color: "#fbbf24",
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        ⭐ {item.vote_average.toFixed(1)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
