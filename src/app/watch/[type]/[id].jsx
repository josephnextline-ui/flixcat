import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ArrowLeft, Heart, ChevronDown } from "lucide-react-native";
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "@/utils/watchlist";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PLAYER_HEIGHT = SCREEN_WIDTH * (9 / 16);

const PROVIDERS = [
  {
    name: "VidLink",
    movie: (id) => `https://vidlink.pro/movie/${id}`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    name: "VidFast",
    movie: (id) => `https://vidfast.pro/movie/${id}`,
    tv: (id, s, e) => `https://vidfast.pro/tv/${id}/${s}/${e}`,
  },
  {
    name: "VidNest",
    movie: (id) => `https://vidnest.fun/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidnest.fun/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: "Videasy",
    movie: (id) => `https://player.videasy.net/movie/${id}`,
    tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  {
    name: "VidZee",
    movie: (id) => `https://player.vidzee.wtf/movie/${id}`,
    tv: (id, s, e) => `https://player.vidzee.wtf/tv/${id}/${s}/${e}`,
  },
];

// Injected JS to block ads inside the WebView
const AD_BLOCK_JS = `
(function() {
  // Override window.open to kill popup ads
  window.open = function() { return null; };
  window.alert = function() {};
  window.confirm = function() { return true; };

  const AD_SELECTORS = [
    '[class*="popup"]','[class*="overlay"]','[id*="popup"]','[id*="overlay"]',
    '[class*="ad-"]','[class*="-ad"]','[id*="ad-"]','[class*="banner"]',
    'iframe[src*="doubleclick"]','iframe[src*="googlesyndication"]',
    '[class*="Advertisement"]','[class*="advertisement"]',
    '[class*="sponsore"]','[class*="promo"]','[class*="modal"]',
  ];

  const removeAds = () => {
    AD_SELECTORS.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => {
          const tag = el.tagName?.toUpperCase();
          if (tag !== 'VIDEO' && tag !== 'SOURCE' && tag !== 'TRACK') {
            el.remove();
          }
        });
      } catch(e) {}
    });
  };

  removeAds();
  try {
    new MutationObserver(removeAds).observe(document.documentElement, { childList: true, subtree: true });
  } catch(e) {}
  true; // required for Android
})();
`;

export default function WatchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { type, id } = useLocalSearchParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlistState, setInWatchlistState] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(0);
  const [showProviders, setShowProviders] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [seasonData, setSeasonData] = useState(null);

  useEffect(() => {
    if (id && type) {
      fetchContent();
      checkWatchlist();
    }
  }, [id, type]);

  useEffect(() => {
    if (type === "tv" && id) fetchSeasonData();
  }, [season, id, type]);

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/tmdb/details/${type}/${id}`);
      const data = await res.json();
      setContent(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching content:", err);
      setLoading(false);
    }
  };

  const fetchSeasonData = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=b4cfa4ecfc855af75ebec1745dc3f155`,
      );
      const data = await res.json();
      setSeasonData(data);
    } catch (err) {
      console.error("Error fetching season:", err);
    }
  };

  const checkWatchlist = async () => {
    const result = await isInWatchlist(parseInt(id), type);
    setInWatchlistState(result);
  };

  const toggleWatchlist = async () => {
    if (inWatchlistState) {
      await removeFromWatchlist(parseInt(id), type);
      setInWatchlistState(false);
    } else {
      await addToWatchlist({
        content_id: parseInt(id),
        content_type: type,
        title: content?.title || content?.name,
        poster_path: content?.poster_path,
      });
      setInWatchlistState(true);
    }
  };

  const provider = PROVIDERS[currentProvider];
  const embedUrl =
    type === "movie" ? provider.movie(id) : provider.tv(id, season, episode);

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
        <Text style={{ fontSize: 48, marginBottom: 12 }}>🐱</Text>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
          Loading...
        </Text>
      </View>
    );
  }

  const title = content?.title || content?.name || "Unknown";
  const rating = content?.vote_average
    ? content.vote_average.toFixed(1)
    : "N/A";
  const year =
    content?.release_date?.split("-")[0] ||
    content?.first_air_date?.split("-")[0];
  const seasons = content?.number_of_seasons;

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <StatusBar style="light" />

      {/* Sticky header */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: "#000",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingBottom: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12, padding: 4 }}
        >
          <ArrowLeft color="#fff" size={22} />
        </TouchableOpacity>
        <Text
          style={{ color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <TouchableOpacity onPress={toggleWatchlist} style={{ padding: 4 }}>
          <Heart
            color={inWatchlistState ? "#E50914" : "#fff"}
            size={22}
            fill={inWatchlistState ? "#E50914" : "none"}
          />
        </TouchableOpacity>
      </View>

      {/* WebView player — in-app with ad blocking */}
      <View
        style={{
          width: SCREEN_WIDTH,
          height: PLAYER_HEIGHT,
          backgroundColor: "#000",
        }}
      >
        <WebView
          key={embedUrl}
          source={{ uri: embedUrl }}
          style={{ flex: 1 }}
          javaScriptEnabled
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          injectedJavaScript={AD_BLOCK_JS}
          onShouldStartLoadWithRequest={(req) => {
            // Block obvious ad/redirect URLs, allow everything else
            const blocked = [
              "doubleclick.net",
              "googlesyndication",
              "adnxs.com",
              "outbrain",
              "taboola",
            ].some((d) => req.url.includes(d));
            return !blocked;
          }}
          allowsInlineMediaPlayback
          scrollEnabled={false}
        />
      </View>

      {/* Provider / Server switcher */}
      <View
        style={{
          backgroundColor: "#111",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#222",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#22c55e",
            }}
          />
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>
            Via{" "}
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {provider.name}
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowProviders(!showProviders)}
          style={{
            backgroundColor: "#1f1f1f",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#d1d5db", fontSize: 12 }}>
            Change Server ▾
          </Text>
        </TouchableOpacity>
      </View>
      {showProviders && (
        <View
          style={{
            backgroundColor: "#1a1a1a",
            borderBottomWidth: 1,
            borderBottomColor: "#222",
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {PROVIDERS.map((p, idx) => (
            <TouchableOpacity
              key={p.name}
              onPress={() => {
                setCurrentProvider(idx);
                setShowProviders(false);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor:
                  idx === currentProvider ? "#E50914" : "#2a2a2a",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Scrollable info */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#fff",
              marginBottom: 6,
            }}
          >
            {title}
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: type === "movie" ? "#1d4ed8" : "#7c3aed",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                {type === "movie" ? "🎬 MOVIE" : "📺 TV SHOW"}
              </Text>
            </View>
            {year && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor: "#1f1f1f",
                }}
              >
                <Text style={{ color: "#9ca3af", fontSize: 10 }}>{year}</Text>
              </View>
            )}
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: "#422006",
              }}
            >
              <Text
                style={{ color: "#fbbf24", fontSize: 10, fontWeight: "700" }}
              >
                ⭐ {rating}
              </Text>
            </View>
          </View>

          {/* TV Episode selector */}
          {type === "tv" && seasons && (
            <View
              style={{
                backgroundColor: "#141414",
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#2a2a2a",
              }}
            >
              <TouchableOpacity
                onPress={() => setShowEpisodes(!showEpisodes)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                >
                  📺 S{season} E{episode}
                </Text>
                <ChevronDown color="#6b7280" size={20} />
              </TouchableOpacity>
              {showEpisodes && (
                <View style={{ marginTop: 12 }}>
                  {/* Season selector */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 10, flexGrow: 0 }}
                  >
                    {Array.from({ length: seasons }, (_, i) => i + 1).map(
                      (s) => (
                        <TouchableOpacity
                          key={s}
                          onPress={() => {
                            setSeason(s);
                            setEpisode(1);
                          }}
                          style={{
                            marginRight: 8,
                            paddingHorizontal: 14,
                            paddingVertical: 7,
                            borderRadius: 20,
                            backgroundColor:
                              season === s ? "#E50914" : "#2a2a2a",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: "700",
                            }}
                          >
                            S{s}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </ScrollView>
                  {/* Episodes */}
                  {seasonData?.episodes?.map((ep) => (
                    <TouchableOpacity
                      key={ep.episode_number}
                      onPress={() => {
                        setEpisode(ep.episode_number);
                        setShowEpisodes(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        padding: 10,
                        borderRadius: 8,
                        marginBottom: 4,
                        backgroundColor:
                          episode === ep.episode_number
                            ? "#E50914/20"
                            : "transparent",
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          backgroundColor:
                            episode === ep.episode_number
                              ? "#E50914"
                              : "#2a2a2a",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: "700",
                          }}
                        >
                          {ep.episode_number}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color:
                            episode === ep.episode_number ? "#fff" : "#9ca3af",
                          fontSize: 13,
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {ep.name}
                      </Text>
                      {ep.runtime && (
                        <Text style={{ color: "#6b7280", fontSize: 11 }}>
                          {ep.runtime}m
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Genres */}
          {content?.genres && content.genres.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {content.genres.map((g) => (
                <View
                  key={g.id}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#2a2a2a",
                    backgroundColor: "#141414",
                  }}
                >
                  <Text style={{ color: "#d1d5db", fontSize: 12 }}>
                    {g.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text style={{ color: "#9ca3af", fontSize: 14, lineHeight: 22 }}>
            {content?.overview}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
