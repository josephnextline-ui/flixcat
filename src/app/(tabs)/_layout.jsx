import { Tabs } from "expo-router";
import { View } from "react-native";
import { Home, Search, Heart, User, Compass } from "lucide-react-native";

function TabIcon({ IconComponent, color, focused }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <IconComponent
        color={color}
        size={22}
        strokeWidth={focused ? 2.5 : 1.8}
      />
      {focused && (
        <View
          style={{
            position: "absolute",
            bottom: -6,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#E50914",
          }}
        />
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(8,8,8,0.97)",
          borderTopWidth: 0.5,
          borderColor: "rgba(255,255,255,0.07)",
          paddingTop: 6,
          paddingBottom: 2,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#4a4a4a",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Search} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Compass} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-list"
        options={{
          title: "My List",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Heart} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={User} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
