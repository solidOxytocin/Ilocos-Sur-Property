import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import "../globals.css";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.OS === "web" ? { display: "none" } : {},
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="home-variant-outline"
              size={24}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: "Browse",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
