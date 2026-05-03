import { Stack } from "expo-router";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import "./globals.css";

// Suppress Reanimated strict mode warnings often caused by third-party libraries 
// like React Navigation or NativeWind.
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
