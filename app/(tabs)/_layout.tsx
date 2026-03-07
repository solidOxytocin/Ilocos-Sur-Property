import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import "../globals.css";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Properties",

          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="home-outline"
              size={24}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="cog-outline"
              size={24}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
      />
      <Tabs.Screen name="profile" />
      <Tabs.Screen
        name="contact"
        options={{
          title: "Contact",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="phone-outline"
              size={24}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
