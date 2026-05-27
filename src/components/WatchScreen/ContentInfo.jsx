import { View, Text, ScrollView } from "react-native";
import { Star, Clock, Calendar, Tv, Film } from "lucide-react-native";

export function ContentInfo({ content, type }) {
  const title = content?.title || content?.name || "Loading...";
  const rating = content?.vote_average ? content.vote_average.toFixed(1) : null;
  const year =
    content?.release_date?.split("-")[0] ||
    content?.first_air_date?.split("-")[0];
  const totalSeasons = content?.number_of_seasons || 0;

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: "900",
          letterSpacing: -0.5,
          marginBottom: 8,
        }}
        numberOfLines={2}
      >
        {title}
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* Type badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            backgroundColor:
              type === "movie"
                ? "rgba(29,78,216,0.25)"
                : "rgba(124,58,237,0.25)",
            borderWidth: 1,
            borderColor:
              type === "movie" ? "rgba(29,78,216,0.5)" : "rgba(124,58,237,0.5)",
          }}
        >
          {type === "movie" ? (
            <Film size={10} color={type === "movie" ? "#60a5fa" : "#a78bfa"} />
          ) : (
            <Tv size={10} color="#a78bfa" />
          )}
          <Text
            style={{
              color: type === "movie" ? "#60a5fa" : "#a78bfa",
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            {type === "movie" ? "MOVIE" : "TV SHOW"}
          </Text>
        </View>

        {year && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Calendar size={12} color="#6B6B6B" />
            <Text style={{ color: "#6B6B6B", fontSize: 12 }}>{year}</Text>
          </View>
        )}

        {rating && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <Text style={{ color: "#fbbf24", fontSize: 12, fontWeight: "700" }}>
              {rating}
            </Text>
          </View>
        )}

        {type === "tv" && totalSeasons > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Tv size={12} color="#6B6B6B" />
            <Text style={{ color: "#6B6B6B", fontSize: 12 }}>
              {totalSeasons} {totalSeasons === 1 ? "Season" : "Seasons"}
            </Text>
          </View>
        )}

        {content?.runtime > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Clock size={12} color="#6B6B6B" />
            <Text style={{ color: "#6B6B6B", fontSize: 12 }}>
              {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
            </Text>
          </View>
        )}
      </View>

      {/* Genre chips */}
      {content?.genres?.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginTop: 14 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {content.genres.map((g) => (
            <View
              key={g.id}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.06)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Text style={{ color: "#9ca3af", fontSize: 12 }}>{g.name}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Overview */}
      {content?.overview && (
        <Text
          style={{
            color: "#9ca3af",
            fontSize: 14,
            lineHeight: 22,
            marginTop: 14,
          }}
        >
          {content.overview}
        </Text>
      )}
    </View>
  );
}
