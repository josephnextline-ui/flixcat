import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { VideoView } from "expo-video";
import {
  AlertCircle,
  RotateCcw,
  PictureInPicture2,
  Subtitles,
} from "lucide-react-native";
import { AD_BLOCK_JS, EXTRACTION_JS } from "@/utils/adBlockScripts";
import { AD_BLOCK_DOMAINS } from "@/constants/adBlockConfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PLAYER_HEIGHT = Math.round((SCREEN_WIDTH * 9) / 16) + 60;

const StyleSheet_absoluteFill = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export function VideoPlayer({
  extractionState,
  embedUrl,
  handleExtraction,
  extractedUrl,
  player,
  videoViewRef,
  selectedSubtitleIdx,
  subtitles,
  onShowSubtitlePicker,
  currentSubtitle,
  provider,
  webRef,
  webLoading,
  webError,
  setWebLoading,
  setWebError,
}) {
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: PLAYER_HEIGHT,
        backgroundColor: "#0a0a0a",
        position: "relative",
      }}
    >
      {/* Hidden extraction WebView — runs in background to sniff the raw stream URL */}
      {extractionState === "extracting" && (
        <WebView
          key={`extract-${embedUrl}`}
          source={{ uri: embedUrl }}
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            opacity: 0,
            top: -9999,
          }}
          injectedJavaScript={EXTRACTION_JS}
          onMessage={handleExtraction}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          mixedContentMode="always"
          mediaPlaybackRequiresUserAction={false}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        />
      )}

      {/* ── Native ad-free player (extraction succeeded) ── */}
      {extractionState === "success" && extractedUrl && (
        <View style={{ width: SCREEN_WIDTH, height: PLAYER_HEIGHT }}>
          <VideoView
            ref={videoViewRef}
            player={player}
            style={{ width: SCREEN_WIDTH, height: PLAYER_HEIGHT }}
            allowsFullscreen
            allowsPictureInPicture
            contentFit="contain"
            nativeControls
          />
          {/* Custom overlay: top-right action buttons */}
          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              flexDirection: "row",
              gap: 8,
              zIndex: 20,
            }}
          >
            {/* Picture-in-Picture */}
            <TouchableOpacity
              onPress={() => {
                try {
                  videoViewRef.current?.startPictureInPicture();
                } catch (e) {}
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "rgba(0,0,0,0.65)",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <PictureInPicture2 size={16} color="#fff" />
            </TouchableOpacity>

            {/* Subtitle picker button */}
            <TouchableOpacity
              onPress={onShowSubtitlePicker}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor:
                  selectedSubtitleIdx !== null
                    ? "rgba(229,9,20,0.75)"
                    : "rgba(0,0,0,0.65)",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor:
                  selectedSubtitleIdx !== null
                    ? "rgba(229,9,20,0.8)"
                    : "rgba(255,255,255,0.15)",
              }}
            >
              <Subtitles size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Active subtitle label badge */}
          {selectedSubtitleIdx !== null && subtitles[selectedSubtitleIdx] && (
            <View
              style={{
                position: "absolute",
                bottom: 52,
                left: 10,
                backgroundColor: "rgba(229,9,20,0.85)",
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                zIndex: 20,
              }}
            >
              <Subtitles size={10} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                {subtitles[selectedSubtitleIdx].label}
              </Text>
            </View>
          )}

          {/* Subtitle text overlay — rendered on top of the video */}
          {currentSubtitle !== "" && (
            <View
              style={{
                position: "absolute",
                bottom: 44,
                left: 12,
                right: 12,
                alignItems: "center",
                zIndex: 30,
                pointerEvents: "none",
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.78)",
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  maxWidth: "90%",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: "600",
                    textAlign: "center",
                    lineHeight: 20,
                    textShadowColor: "rgba(0,0,0,0.9)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }}
                >
                  {currentSubtitle}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* ── Fallback: regular ad-blocked WebView (extraction timed out) ── */}
      {extractionState === "failed" && (
        <WebView
          ref={webRef}
          key={`fallback-${embedUrl}`}
          source={{ uri: embedUrl }}
          style={{
            width: SCREEN_WIDTH,
            height: PLAYER_HEIGHT,
            backgroundColor: "#000",
          }}
          injectedJavaScript={AD_BLOCK_JS}
          onShouldStartLoadWithRequest={(req) => {
            const isBlocked = AD_BLOCK_DOMAINS.some((d) => req.url.includes(d));
            if (isBlocked) return false;
            if (req.navigationType === "click" && req.url !== embedUrl) {
              try {
                const isNewWindow = !req.url.includes(
                  new URL(embedUrl).hostname,
                );
                if (isNewWindow) return false;
              } catch (e) {}
            }
            return true;
          }}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          originWhitelist={["*"]}
          mixedContentMode="always"
          onLoadStart={() => {
            setWebLoading(true);
            setWebError(false);
          }}
          onLoad={() => setWebLoading(false)}
          onError={() => {
            setWebLoading(false);
            setWebError(true);
          }}
          onHttpError={() => {
            setWebLoading(false);
            setWebError(true);
          }}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        />
      )}

      {/* ── Extracting overlay ── */}
      {extractionState === "extracting" && (
        <View
          style={{
            ...StyleSheet_absoluteFill,
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
          }}
        >
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
            Extracting stream...
          </Text>
          <Text
            style={{
              color: "#6B6B6B",
              fontSize: 12,
              textAlign: "center",
              paddingHorizontal: 32,
            }}
          >
            Pulling the raw video from {provider.name} — this removes all ads
          </Text>
        </View>
      )}

      {/* ── Fallback loading overlay ── */}
      {extractionState === "failed" && webLoading && !webError && (
        <View
          style={{
            ...StyleSheet_absoluteFill,
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
            Stream not extractable — loading {provider.name} with ad blocker
          </Text>
        </View>
      )}

      {/* ── Error overlay (fallback WebView failed too) ── */}
      {extractionState === "failed" && webError && (
        <View
          style={{
            ...StyleSheet_absoluteFill,
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
            padding: 32,
          }}
        >
          <AlertCircle size={40} color="#E50914" />
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            This server didn't load
          </Text>
          <Text style={{ color: "#6B6B6B", fontSize: 13, textAlign: "center" }}>
            Try a different server below
          </Text>
          <TouchableOpacity
            onPress={() => {
              setWebError(false);
              setWebLoading(true);
              webRef.current?.reload();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#1a1a1a",
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#2a2a2a",
            }}
          >
            <RotateCcw size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
