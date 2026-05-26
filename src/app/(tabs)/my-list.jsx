import { useState, useEffect, useCallback } from "react";
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
import { getWatchlist, removeFromWatchlist } from "@/utils/watchlist";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function MyListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);

  // Reload whenever the tab gains focus
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
    <View
      style={{ flex: 1, backgroundColor: "#0a0a0a", paddingTop: insets.top }}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff" }}>
          ❤ My List
        </Text>
        {watchlist.length > 0 && (
          <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
            {watchlist.length} saved
          </Text>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {watchlist.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🐱</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Your list is empty
            </Text>
            <Text
              style={{
                color: "#6b7280",
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Browse movies and shows and tap + to save them here
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {watchlist.map((item) => {
              const posterUrl = item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : null;
              return (
                <View
                  key={`${item.content_type}-${item.content_id}`}
                  style={{ width: CARD_WIDTH }}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push(
                        `/watch/${item.content_type}/${item.content_id}`,
                      )
                    }
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
                        <Text style={{ fontSize: 40 }}>🐱</Text>
                      </View>
                    )}
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: "600",
                        marginTop: 8,
                      }}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}
                    >
                      {item.content_type === "movie" ? "🎬 Movie" : "📺 TV"}
                    </Text>
                  </TouchableOpacity>
                  {/* Remove button */}
                  <TouchableOpacity
                    onPress={() => handleRemove(item)}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: "#E50914",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}
                    >
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
