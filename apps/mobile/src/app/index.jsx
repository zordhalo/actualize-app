import { Redirect } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#d90428" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}
