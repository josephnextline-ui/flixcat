import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Tv, Play, ChevronDown, ChevronUp, Star } from "lucide-react-native";

const StyleSheet_absoluteFill = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export function EpisodePicker({
  type,
  totalSeasons,
  season,
  episode,
  seasonData,
  showEpisodes,
  onToggleEpisodes,
  onSelectSeason,
  onSelectEpisode,
}) {
  if (type !== "tv" || totalSeasons === 0) return null;

  const totalEpisodes = seasonData?.episodes?.length || 0;

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
      {/* Now playing indicator */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#0f0f0f",
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: "#1f1f1f",
          marginBottom: 14,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(229,9,20,0.2)",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Play size={14} color="#E50914" fill="#E50914" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#6B6B6B", fontSize: 11, marginBottom: 2 }}>
            NOW PLAYING
          </Text>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            Season {season} · Episode {episode}
            {seasonData?.episodes?.[episode - 1]?.name
              ? ` · ${seasonData.episodes[episode - 1].name}`
              : ""}
          </Text>
        </View>
      </View>

      {/* Episode picker toggle */}
      <TouchableOpacity
        onPress={onToggleEpisodes}
        activeOpacity={0.85}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0f0f0f",
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: showEpisodes ? "#E50914" : "#1f1f1f",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Tv size={16} color="#E50914" />
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            Episodes
          </Text>
          {totalEpisodes > 0 && (
            <View
              style={{
                backgroundColor: "rgba(229,9,20,0.15)",
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  color: "#E50914",
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                {totalEpisodes} eps
              </Text>
            </View>
          )}
        </View>
        {showEpisodes ? (
          <ChevronUp size={16} color="#6B6B6B" />
        ) : (
          <ChevronDown size={16} color="#6B6B6B" />
        )}
      </TouchableOpacity>

      {showEpisodes && (
        <View
          style={{
            backgroundColor: "#0a0a0a",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#1f1f1f",
            marginTop: 8,
            overflow: "hidden",
          }}
        >
          {/* Season tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ borderBottomWidth: 1, borderColor: "#1a1a1a" }}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              gap: 8,
            }}
          >
            {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => onSelectSeason(s)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor:
                    season === s ? "#E50914" : "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor:
                    season === s ? "#E50914" : "rgba(255,255,255,0.08)",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  Season {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Episode list */}
          {!seasonData ? (
            <View style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator color="#E50914" />
            </View>
          ) : (
            seasonData.episodes?.map((ep, epIdx) => {
              const isPlaying = episode === ep.episode_number;
              const stillUrl = ep.still_path
                ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                : null;
              return (
                <TouchableOpacity
                  key={ep.id}
                  onPress={() => onSelectEpisode(ep.episode_number)}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    borderTopWidth: epIdx === 0 ? 0 : 1,
                    borderColor: "#1a1a1a",
                    backgroundColor: isPlaying
                      ? "rgba(229,9,20,0.08)"
                      : "transparent",
                  }}
                >
                  {/* Thumbnail */}
                  <View
                    style={{
                      width: 90,
                      height: 54,
                      borderRadius: 6,
                      overflow: "hidden",
                      backgroundColor: "#1a1a1a",
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
                        <Tv size={20} color="#333" />
                      </View>
                    )}
                    {/* Play overlay on thumbnail if active */}
                    {isPlaying && (
                      <View
                        style={{
                          ...StyleSheet_absoluteFill,
                          backgroundColor: "rgba(229,9,20,0.7)",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Play size={18} color="#fff" fill="#fff" />
                      </View>
                    )}
                  </View>

                  {/* Episode info */}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 3,
                      }}
                    >
                      <Text
                        style={{
                          color: isPlaying ? "#E50914" : "#6B6B6B",
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        E{ep.episode_number}
                      </Text>
                      {ep.runtime > 0 && (
                        <Text style={{ color: "#4a4a4a", fontSize: 10 }}>
                          · {ep.runtime}m
                        </Text>
                      )}
                      {ep.vote_average > 0 && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 2,
                            marginLeft: "auto",
                          }}
                        >
                          <Star size={9} color="#fbbf24" fill="#fbbf24" />
                          <Text
                            style={{
                              color: "#fbbf24",
                              fontSize: 9,
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
                        color: isPlaying ? "#fff" : "#d1d5db",
                        fontSize: 13,
                        fontWeight: isPlaying ? "700" : "500",
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
                          marginTop: 2,
                          lineHeight: 15,
                        }}
                        numberOfLines={1}
                      >
                        {ep.overview}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}
