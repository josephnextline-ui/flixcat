import { Tabs } from "expo-router";
import { Home, Search, Heart, User, Compass } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 1,
          borderColor: "#1f1f1f",
          paddingTop: 4,
        },
        tabBarActiveTintColor: "#E50914",
        tabBarInactiveTintColor: "#6B6B6B",
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <Search color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color }) => <Compass color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="my-list"
        options={{
          title: "My List",
          tabBarIcon: ({ color }) => <Heart color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
