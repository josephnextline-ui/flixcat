import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
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
  Calendar,
  Globe,
  ChevronDown,
  ChevronUp,
  Film,
  Heart,
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
  const scrollRef = useRef(null);
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const [content, setContent] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [season, setSeason] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [showAllOverview, setShowAllOverview] = useState(false);
  const [activeTab, setActiveTab] = useState("episodes"); // "episodes" | "cast" | "similar"

  useEffect(() => {
    if (id && type) {
      fetchDetails();
      isInWatchlist(parseInt(id), type).then(setInList);
    }
  }, [id, type]);

  useEffect(() => {
    if (type === "tv" && id) {
      fetchSeasonData(season);
    }
  }, [season, id, type]);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/tmdb/details/${type}/${id}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setContent(data);

      const simRes = await fetch(`/api/tmdb/similar?type=${type}&id=${id}`);
      const simData = await simRes.json();
      setSimilar(
        simData.results?.filter((r) => r.poster_path).slice(0, 12) || [],
      );
    } catch (err) {
      console.error("fetchDetails:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonData = async (s) => {
    setSeasonLoading(true);
    try {
      const res = await fetch(`/api/tmdb/tv/season?id=${id}&season=${s}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSeasonData(data);
    } catch (err) {
      console.error("fetchSeasonData:", err);
    } finally {
      setSeasonLoading(false);
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

  const handlePlay = (s, e) => {
    if (type === "tv") {
      router.push(`/watch/${type}/${id}?season=${s || 1}&episode=${e || 1}`);
    } else {
      router.push(`/watch/${type}/${id}`);
    }
  };

  const handleScroll = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const opacity = Math.min(y / 200, 1);
    headerOpacity.setValue(opacity);
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
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={{ color: "#4a4a4a", fontSize: 13, marginTop: 12 }}>
          Loading...
        </Text>
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
  const cast = content.credits?.cast?.slice(0, 15) || [];
  const isMovie = type === "movie";
  const totalSeasons = content.number_of_seasons || 0;
  const totalEpisodes = content.number_of_episodes || 0;
  const overview = content.overview || "";
  const overviewShort =
    overview.length > 200 ? overview.slice(0, 200) + "…" : overview;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      {/* ─── Floating animated header ─── */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingTop: insets.top,
          opacity: headerOpacity,
        }}
        pointerEvents="none"
      >
        <View style={{ backgroundColor: "#000", height: 52 }} />
      </Animated.View>

      {/* ─── Back button (always visible) ─── */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          zIndex: 200,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <ChevronLeft size={20} color="#fff" />
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* ─── Hero backdrop ─── */}
        <View style={{ height: 320, position: "relative" }}>
          {backdrop ? (
            <Image
              source={{ uri: backdrop }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: "#111" }]}
            />
          )}
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.15)",
              "rgba(0,0,0,0.05)",
              "rgba(0,0,0,0.85)",
              "#000",
            ]}
            locations={[0, 0.3, 0.75, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* ─── Poster + Info card ─── */}
        <View style={{ paddingHorizontal: 16, marginTop: -90 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              marginBottom: 20,
              alignItems: "flex-end",
            }}
          >
            {/* Poster */}
            {poster && (
              <View
                style={{
                  width: 115,
                  height: 172,
                  borderRadius: 12,
                  overflow: "hidden",
                  flexShrink: 0,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.6,
                  shadowRadius: 12,
                  elevation: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Image
                  source={{ uri: poster }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={200}
                />
              </View>
            )}

            {/* Info */}
            <View style={{ flex: 1, paddingBottom: 4 }}>
              {/* Type pill */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor: isMovie
                    ? "rgba(29,78,216,0.2)"
                    : "rgba(124,58,237,0.2)",
                  borderWidth: 1,
                  borderColor: isMovie
                    ? "rgba(29,78,216,0.4)"
                    : "rgba(124,58,237,0.4)",
                  alignSelf: "flex-start",
                  marginBottom: 10,
                }}
              >
                {isMovie ? (
                  <Film size={10} color="#60a5fa" />
                ) : (
                  <Tv size={10} color="#a78bfa" />
                )}
                <Text
                  style={{
                    color: isMovie ? "#60a5fa" : "#a78bfa",
                    fontSize: 10,
                    fontWeight: "800",
                    letterSpacing: 0.8,
                  }}
                >
                  {isMovie ? "MOVIE" : "TV SERIES"}
                </Text>
              </View>

              <Text
                style={{
                  color: "#fff",
                  fontSize: 21,
                  fontWeight: "900",
                  lineHeight: 26,
                  letterSpacing: -0.5,
                  marginBottom: 10,
                }}
                numberOfLines={3}
              >
                {title}
              </Text>

              {/* Meta pills */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {rating && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: "rgba(251,191,36,0.1)",
                      borderRadius: 6,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                      borderWidth: 1,
                      borderColor: "rgba(251,191,36,0.25)",
                    }}
                  >
                    <Star size={11} color="#fbbf24" fill="#fbbf24" />
                    <Text
                      style={{
                        color: "#fbbf24",
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {rating}
                    </Text>
                  </View>
                )}
                {year && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderRadius: 6,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Calendar size={10} color="#6B6B6B" />
                    <Text style={{ color: "#9ca3af", fontSize: 11 }}>
                      {year}
                    </Text>
                  </View>
                )}
                {content.runtime > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderRadius: 6,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Clock size={10} color="#6B6B6B" />
                    <Text style={{ color: "#9ca3af", fontSize: 11 }}>
                      {Math.floor(content.runtime / 60)}h {content.runtime % 60}
                      m
                    </Text>
                  </View>
                )}
                {totalSeasons > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderRadius: 6,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Tv size={10} color="#6B6B6B" />
                    <Text style={{ color: "#9ca3af", fontSize: 11 }}>
                      {totalSeasons}S · {totalEpisodes}E
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ─── Genre chips ─── */}
          {content.genres?.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ gap: 8, marginBottom: 16 }}
            >
              {content.genres.map((g) => (
                <View
                  key={g.id}
                  style={{
                    paddingHorizontal: 13,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text
                    style={{
                      color: "#d1d5db",
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    {g.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* ─── Overview ─── */}
          {overview.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: "#9ca3af", fontSize: 14, lineHeight: 23 }}>
                {showAllOverview ? overview : overviewShort}
              </Text>
              {overview.length > 200 && (
                <TouchableOpacity
                  onPress={() => setShowAllOverview(!showAllOverview)}
                  style={{ marginTop: 6 }}
                >
                  <Text
                    style={{
                      color: "#E50914",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {showAllOverview ? "Show less" : "Read more"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ─── Action buttons ─── */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
            <TouchableOpacity
              onPress={() => handlePlay(1, 1)}
              activeOpacity={0.85}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#E50914",
                paddingVertical: 14,
                borderRadius: 12,
                shadowColor: "#E50914",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Play size={17} color="#fff" fill="#fff" />
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>
                {isMovie ? "Play Movie" : "Play S1 E1"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleList}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: inList
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(255,255,255,0.08)",
                paddingVertical: 14,
                paddingHorizontal: 18,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: inList
                  ? "rgba(34,197,94,0.4)"
                  : "rgba(255,255,255,0.12)",
              }}
            >
              {inList ? (
                <Check size={17} color="#22c55e" strokeWidth={2.5} />
              ) : (
                <Plus size={17} color="#fff" />
              )}
              <Text
                style={{
                  color: inList ? "#22c55e" : "#fff",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {inList ? "Saved" : "My List"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── TV: Season/Episode section ─── */}
          {!isMovie && totalSeasons > 0 && (
            <View style={{ marginBottom: 28 }}>
              {/* Section header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Tv size={15} color="#E50914" />
                <Text
                  style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}
                >
                  Episodes
                </Text>
                {totalEpisodes > 0 && (
                  <Text style={{ color: "#4a4a4a", fontSize: 13 }}>
                    · {totalEpisodes} total
                  </Text>
                )}
              </View>

              {/* Season selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ gap: 8, marginBottom: 14 }}
              >
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(
                  (s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setSeason(s)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor:
                          season === s ? "#E50914" : "rgba(255,255,255,0.06)",
                        borderWidth: 1,
                        borderColor:
                          season === s ? "#E50914" : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: season === s ? "800" : "500",
                        }}
                      >
                        Season {s}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>

              {/* Episode list */}
              <View
                style={{
                  backgroundColor: "#080808",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#1a1a1a",
                  overflow: "hidden",
                }}
              >
                {seasonLoading ? (
                  <View style={{ padding: 32, alignItems: "center" }}>
                    <ActivityIndicator color="#E50914" />
                    <Text
                      style={{ color: "#4a4a4a", fontSize: 12, marginTop: 10 }}
                    >
                      Loading episodes...
                    </Text>
                  </View>
                ) : seasonData?.episodes?.length > 0 ? (
                  seasonData.episodes.map((ep, epIdx) => {
                    const stillUrl = ep.still_path
                      ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                      : null;
                    const airDate = ep.air_date
                      ? ep.air_date.split("-")[0]
                      : null;
                    return (
                      <TouchableOpacity
                        key={ep.id}
                        onPress={() => handlePlay(season, ep.episode_number)}
                        activeOpacity={0.8}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 12,
                          borderTopWidth: epIdx === 0 ? 0 : 1,
                          borderColor: "#111",
                        }}
                      >
                        {/* Thumbnail with play overlay */}
                        <View
                          style={{
                            width: 96,
                            height: 58,
                            borderRadius: 8,
                            overflow: "hidden",
                            backgroundColor: "#111",
                            marginRight: 12,
                            flexShrink: 0,
                          }}
                        >
                          {stillUrl ? (
                            <Image
                              source={{ uri: stillUrl }}
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
                              <Tv size={22} color="#333" />
                            </View>
                          )}
                          {/* Play icon overlay */}
                          <View
                            style={{
                              position: "absolute",
                              bottom: 5,
                              right: 5,
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: "rgba(229,9,20,0.9)",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Play size={10} color="#fff" fill="#fff" />
                          </View>
                        </View>

                        {/* Episode details */}
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 3,
                            }}
                          >
                            <Text
                              style={{
                                color: "#6B6B6B",
                                fontSize: 11,
                                fontWeight: "700",
                              }}
                            >
                              E{ep.episode_number}
                              {ep.runtime > 0 ? ` · ${ep.runtime}m` : ""}
                            </Text>
                            {ep.vote_average > 0 && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 3,
                                }}
                              >
                                <Star size={9} color="#fbbf24" fill="#fbbf24" />
                                <Text
                                  style={{
                                    color: "#fbbf24",
                                    fontSize: 10,
                                    fontWeight: "600",
                                  }}
                                >
                                  {ep.vote_average.toFixed(1)}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: "600",
                              marginBottom: 2,
                            }}
                            numberOfLines={1}
                          >
                            {ep.name}
                          </Text>
                          {ep.overview ? (
                            <Text
                              style={{
                                color: "#4a4a4a",
                                fontSize: 11,
                                lineHeight: 15,
                              }}
                              numberOfLines={2}
                            >
                              {ep.overview}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={{ padding: 24, alignItems: "center" }}>
                    <Text style={{ color: "#4a4a4a", fontSize: 13 }}>
                      No episodes available for this season.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ─── Cast ─── */}
          {cast.length > 0 && (
            <View style={{ marginBottom: 28 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Users size={15} color="#E50914" />
                <Text
                  style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}
                >
                  Cast
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ gap: 14 }}
              >
                {cast.map((actor) => (
                  <View
                    key={actor.id}
                    style={{ alignItems: "center", width: 76 }}
                  >
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        overflow: "hidden",
                        backgroundColor: "#1a1a1a",
                        marginBottom: 7,
                        borderWidth: 2,
                        borderColor: "#2a2a2a",
                      }}
                    >
                      {actor.profile_path ? (
                        <Image
                          source={{
                            uri: `https://image.tmdb.org/t/p/w185${actor.profile_path}`,
                          }}
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
                          <Users size={24} color="#333" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        color: "#e5e7eb",
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
                        color: "#4a4a4a",
                        fontSize: 9,
                        textAlign: "center",
                        marginTop: 2,
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

          {/* ─── More Like This ─── */}
          {similar.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Film size={15} color="#E50914" />
                <Text
                  style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}
                >
                  More Like This
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ gap: 10 }}
              >
                {similar.map((item) => {
                  const itemRating =
                    item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => router.push(`/details/${type}/${item.id}`)}
                      activeOpacity={0.85}
                    >
                      <View
                        style={{
                          width: 120,
                          height: 180,
                          borderRadius: 10,
                          overflow: "hidden",
                          backgroundColor: "#1a1a1a",
                          marginBottom: 6,
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.05)",
                        }}
                      >
                        <Image
                          source={{
                            uri: `https://image.tmdb.org/t/p/w342${item.poster_path}`,
                          }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                          transition={100}
                        />
                        {itemRating && (
                          <View
                            style={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 3,
                              backgroundColor: "rgba(0,0,0,0.75)",
                              paddingHorizontal: 6,
                              paddingVertical: 3,
                              borderRadius: 6,
                            }}
                          >
                            <Star size={8} color="#fbbf24" fill="#fbbf24" />
                            <Text
                              style={{
                                color: "#fff",
                                fontSize: 9,
                                fontWeight: "700",
                              }}
                            >
                              {itemRating}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={{
                          color: "#d1d5db",
                          fontSize: 11,
                          width: 120,
                          fontWeight: "500",
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
          )}
        </View>
      </ScrollView>
    </View>
  );
}
