import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import {
  X,
  Clapperboard,
  Tv,
  Heart,
  BookMarked,
  Play,
} from "lucide-react-native";
import { getWatchlist, removeFromWatchlist } from "@/utils/watchlist";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function MyListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, []),
  );

  const loadWatchlist = async () => {
    const items = await getWatchlist();
    setWatchlist(items);
  };

  const handleRemove = async (item) => {
    await removeFromWatchlist(item.content_id, item.content_type);
    loadWatchlist();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: watchlist.length > 0 ? 1 : 0,
          borderColor: "#111",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Heart size={22} color="#E50914" fill="#E50914" />
          <Text
            style={{
              color: "#fff",
              fontSize: 26,
              fontWeight: "900",
              letterSpacing: -0.5,
            }}
          >
            My List
          </Text>
        </View>
        {watchlist.length > 0 && (
          <View
            style={{
              backgroundColor: "rgba(229,9,20,0.1)",
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: "rgba(229,9,20,0.2)",
            }}
          >
            <Text style={{ color: "#E50914", fontSize: 12, fontWeight: "700" }}>
              {watchlist.length} {watchlist.length === 1 ? "title" : "titles"}
            </Text>
          </View>
        )}
      </View>

      {watchlist.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            paddingHorizontal: 40,
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: "#0f0f0f",
              borderWidth: 1,
              borderColor: "#1f1f1f",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BookMarked size={38} color="#2a2a2a" />
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 20,
              fontWeight: "800",
              textAlign: "center",
            }}
          >
            Your list is empty
          </Text>
          <Text
            style={{
              color: "#4a4a4a",
              fontSize: 14,
              textAlign: "center",
              lineHeight: 21,
            }}
          >
            Browse movies and shows, then tap the + button to save them here
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/browse")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#E50914",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 25,
              marginTop: 8,
            }}
          >
            <Play size={14} color="#fff" fill="#fff" />
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
              Browse Content
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 80,
          }}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            {watchlist.map((item) => {
              const posterUrl = item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : null;
              return (
                <TouchableOpacity
                  key={`${item.content_id}-${item.content_type}`}
                  onPress={() =>
                    router.push(
                      `/details/${item.content_type}/${item.content_id}`,
                    )
                  }
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
                      borderColor: "rgba(255,255,255,0.05)",
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
                        {item.content_type === "movie" ? (
                          <Clapperboard size={32} color="#2a2a2a" />
                        ) : (
                          <Tv size={32} color="#2a2a2a" />
                        )}
                      </View>
                    )}

                    {/* Play button overlay */}
                    <View
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "rgba(229,9,20,0.9)",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Play size={13} color="#fff" fill="#fff" />
                    </View>

                    {/* Remove button */}
                    <TouchableOpacity
                      onPress={() => handleRemove(item)}
                      style={{
                        position: "absolute",
                        top: 7,
                        right: 7,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.1)",
                      }}
                    >
                      <X size={13} color="#fff" strokeWidth={2.5} />
                    </TouchableOpacity>
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
                    {item.title}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 3,
                    }}
                  >
                    {item.content_type === "movie" ? (
                      <Clapperboard size={10} color="#4a4a4a" />
                    ) : (
                      <Tv size={10} color="#4a4a4a" />
                    )}
                    <Text style={{ color: "#4a4a4a", fontSize: 11 }}>
                      {item.content_type === "movie" ? "Movie" : "TV Series"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
