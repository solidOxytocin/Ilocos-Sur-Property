import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function PropertyDetails() {
  const { property } = useLocalSearchParams();
  const parsedProperty = property ? JSON.parse(property as string) : null;
  console.log("Parsed Property:", parsedProperty);
  return (
    <View className="justify-center items-center">
      <Text>Property Details</Text>
      {parsedProperty && <Text className="text-lg">{parsedProperty.city}</Text>}
    </View>
  );
}
