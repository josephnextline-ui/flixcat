import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Play,
  Plus,
  Check,
  Star,
  Clock,
  ChevronLeft,
  Clapperboard,
  Tv,
  Users,
} from "lucide-react-native";
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "@/utils/watchlist";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DetailsScreen() {
  const { type, id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (id && type) {
      fetchDetails();
      isInWatchlist(parseInt(id), type).then(setInList);
    }
  }, [id, type]);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/tmdb/details/${type}/${id}`);
      const data = await res.json();
      setContent(data);

      const simRes = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}/similar?api_key=b4cfa4ecfc855af75ebec1745dc3f155`,
      );
      const simData = await simRes.json();
      setSimilar(
        simData.results?.filter((r) => r.poster_path).slice(0, 10) || [],
      );
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleList = async () => {
    if (inList) {
      await removeFromWatchlist(parseInt(id), type);
      setInList(false);
    } else {
      await addToWatchlist({
        content_id: parseInt(id),
        content_type: type,
        title: content.title || content.name,
        poster_path: content.poster_path,
      });
      setInList(true);
    }
  };

  const handlePlay = () => {
    router.push(`/watch/${type}/${id}`);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator color="#E50914" />
      </View>
    );
  }

  if (!content) return null;

  const title = content.title || content.name;
  const year =
    content.release_date?.split("-")[0] ||
    content.first_air_date?.split("-")[0];
  const rating = content.vote_average ? content.vote_average.toFixed(1) : null;
  const backdrop = content.backdrop_path
    ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    : null;
  const poster = content.poster_path
    ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
    : null;
  const cast = content.credits?.cast?.slice(0, 8) || [];
  const isMovie = type === "movie";

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Backdrop */}
        <View style={{ height: 280, position: "relative" }}>
          {backdrop && (
            <Image
              source={{ uri: backdrop }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              onLoad={() => setImgLoaded(true)}
            />
          )}
          <LinearGradient
            colors={["rgba(10,10,10,0.3)", "rgba(10,10,10,1)"]}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent"]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: insets.top + 60,
            }}
          />

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: insets.top + 10,
              left: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "rgba(0,0,0,0.5)",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <ChevronLeft size={16} color="white" />
            <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 16, marginTop: -60 }}>
          <View style={{ flexDirection: "row", gap: 14, marginBottom: 16 }}>
            {/* Poster */}
            {poster && (
              <View
                style={{
                  width: 110,
                  height: 165,
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  shadowColor: "#000",
                  shadowOpacity: 0.8,
                  shadowRadius: 12,
                }}
              >
                <Image
                  source={{ uri: poster }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
            )}

            {/* Info */}
            <View style={{ flex: 1, paddingTop: 60 }}>
              {/* Type badge */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 5,
                    backgroundColor: isMovie ? "#1d4ed8" : "#7c3aed",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {isMovie ? (
                    <Clapperboard size={9} color="#fff" />
                  ) : (
                    <Tv size={9} color="#fff" />
                  )}
                  <Text
                    style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}
                  >
                    {isMovie ? "MOVIE" : "TV SHOW"}
                  </Text>
                </View>
                {year && (
                  <Text style={{ color: "#6b7280", fontSize: 11 }}>{year}</Text>
                )}
              </View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "900",
                  lineHeight: 24,
                  marginBottom: 8,
                }}
                numberOfLines={3}
              >
                {title}
              </Text>
              {/* Meta */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {rating && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Star size={12} color="#fbbf24" fill="#fbbf24" />
                    <Text
                      style={{
                        color: "#fbbf24",
                        fontSize: 13,
                        fontWeight: "700",
                      }}
                    >
                      {rating}
                    </Text>
                  </View>
                )}
                {content.runtime && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Clock size={12} color="#6b7280" />
                    <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                      {Math.floor(content.runtime / 60)}h {content.runtime % 60}
                      m
                    </Text>
                  </View>
                )}
                {content.number_of_seasons && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Tv size={12} color="#6b7280" />
                    <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                      {content.number_of_seasons} Seasons
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Genre chips */}
          {content.genres?.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16, flexGrow: 0 }}
              contentContainerStyle={{ gap: 6 }}
            >
              {content.genres.map((g) => (
                <View
                  key={g.id}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.12)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Text style={{ color: "#d1d5db", fontSize: 12 }}>
                    {g.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Overview */}
          {content.overview && (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.07)",
                marginBottom: 20,
              }}
            >
              <Text style={{ color: "#d1d5db", fontSize: 13, lineHeight: 20 }}>
                {content.overview}
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={handlePlay}
              style={{
                flex: 1,
                backgroundColor: "#E50914",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Play size={18} color="white" fill="white" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
                Play Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleList}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: inList ? "#22c55e" : "rgba(255,255,255,0.15)",
                backgroundColor: inList
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(255,255,255,0.06)",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              {inList ? (
                <Check size={18} color="#22c55e" />
              ) : (
                <Plus size={18} color="white" />
              )}
              <Text
                style={{
                  color: inList ? "#22c55e" : "white",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {inList ? "Saved" : "My List"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cast */}
          {cast.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <Users size={16} color="#E50914" />
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                >
                  Cast
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ gap: 12 }}
              >
                {cast.map((actor) => (
                  <View
                    key={actor.id}
                    style={{ alignItems: "center", width: 72 }}
                  >
                    <View
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 27,
                        overflow: "hidden",
                        backgroundColor: "#1f1f1f",
                        marginBottom: 6,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.1)",
                      }}
                    >
                      {actor.profile_path ? (
                        <Image
                          source={{
                            uri: `https://image.tmdb.org/t/p/w185${actor.profile_path}`,
                          }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Users size={20} color="#555" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                      numberOfLines={2}
                    >
                      {actor.name}
                    </Text>
                    <Text
                      style={{
                        color: "#6b7280",
                        fontSize: 9,
                        textAlign: "center",
                      }}
                      numberOfLines={1}
                    >
                      {actor.character}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Similar */}
          {similar.length > 0 && (
            <View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "700",
                  marginBottom: 12,
                }}
              >
                More Like This
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ gap: 10 }}
              >
                {similar.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/details/${type}/${item.id}`)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={{
                        width: 110,
                        height: 165,
                        borderRadius: 10,
                        overflow: "hidden",
                        backgroundColor: "#1f1f1f",
                      }}
                    >
                      <Image
                        source={{
                          uri: `https://image.tmdb.org/t/p/w342${item.poster_path}`,
                        }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    </View>
                    <Text
                      style={{
                        color: "#9ca3af",
                        fontSize: 10,
                        marginTop: 5,
                        width: 110,
                      }}
                      numberOfLines={2}
                    >
                      {item.title || item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
