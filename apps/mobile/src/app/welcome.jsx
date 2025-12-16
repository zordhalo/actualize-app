import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { ArrowRight } from "lucide-react-native";
import { router } from "expo-router";
import { useAppTheme } from "@/utils/theme";
import { useAuth } from "@/utils/auth/useAuth";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { signIn, signUp } = useAuth();

  const [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 40,
            fontFamily: "Montserrat_600SemiBold",
            color: colors.primary,
            marginBottom: 16,
          }}
        >
          Actualize
        </Text>

        <Text
          style={{
            fontSize: 18,
            fontFamily: "Montserrat_500Medium",
            color: colors.secondary,
            lineHeight: 28,
            marginBottom: 40,
          }}
        >
          You're on a journey to becoming your best self across every area of
          life.
        </Text>

        <View style={{ marginBottom: 40 }}>
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.actualize,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 24 }}>✨</Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.primary,
                marginBottom: 8,
              }}
            >
              Comprehensive Assessment
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                lineHeight: 22,
              }}
            >
              Measure your wellness across five key dimensions with
              scientifically-grounded questions
            </Text>
          </View>

          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.good,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 24 }}>📊</Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.primary,
                marginBottom: 8,
              }}
            >
              Track Your Progress
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                lineHeight: 22,
              }}
            >
              Monitor your growth over time with detailed analytics and insights
            </Text>
          </View>

          <View>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.thriving,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 24 }}>🎯</Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.primary,
                marginBottom: 8,
              }}
            >
              Actionable Recommendations
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                lineHeight: 22,
              }}
            >
              Get personalized tips to improve in each dimension
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: colors.actualize,
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
          onPress={() => signUp()}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_600SemiBold",
              color: "#FFFFFF",
              marginRight: 8,
            }}
          >
            Create Account
          </Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
          }}
          onPress={() => signIn()}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
            }}
          >
            Sign In
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
