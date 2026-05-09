import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type DataFetchStateVariant = "error" | "offline" | "empty";

export type DataFetchStateProps = {
  variant: DataFetchStateVariant;
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  loading?: boolean;
  /** Compact layout for horizontal strips (e.g. featured row). */
  compact?: boolean;
};

export function DataFetchState({
  variant,
  title,
  message,
  onRetry,
  retryLabel = "Try again",
  loading,
  compact,
}: DataFetchStateProps) {
  const iconName =
    variant === "offline"
      ? "wifi-off"
      : variant === "empty"
        ? "inbox-outline"
        : "cloud-alert-outline";

  const iconColor = variant === "offline" ? "#ca8a04" : variant === "empty" ? "#64748b" : "#dc2626";

  if (compact) {
    return (
      <View className="px-4 py-6 items-center justify-center">
        <MaterialCommunityIcons name={iconName as any} size={36} color={iconColor} />
        <Text className="text-base font-semibold text-slate-800 text-center mt-2">{title}</Text>
        <Text className="text-sm text-slate-600 text-center mt-1 px-2">{message}</Text>
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            disabled={loading}
            className="mt-4 px-5 py-2.5 rounded-full bg-blue-600 active:opacity-90 flex-row items-center"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white font-semibold">{retryLabel}</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center px-8 py-12 min-h-[200px]">
      <View className="bg-slate-100 rounded-full p-4 mb-4">
        <MaterialCommunityIcons name={iconName as any} size={48} color={iconColor} />
      </View>
      <Text className="text-xl font-bold text-slate-800 text-center">{title}</Text>
      <Text className="text-base text-slate-600 text-center mt-2 max-w-sm leading-relaxed">{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          disabled={loading}
          className="mt-6 px-6 py-3 rounded-xl bg-blue-600 flex-row items-center"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">{retryLabel}</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
