import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import { router } from "expo-router";
import { useAppTheme, fonts } from "@/utils/theme";
import { useAuth } from "@/utils/auth/useAuth";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { signIn, signUp } = useAuth();

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
        {/* Brand Logo - Display Font */}
        <Text
          style={{
            fontSize: 48,
            fontFamily: fonts.display.bold,
            color: colors.actualize,
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Actualize
        </Text>

        {/* Script Tagline */}
        <Text
          style={{
            fontSize: 24,
            fontFamily: fonts.script.regular,
            color: colors.primary,
            marginBottom: 16,
          }}
        >
          Energy Over Everything
        </Text>

        <Text
          style={{
            fontSize: 18,
            fontFamily: fonts.body.medium,
            color: colors.secondary,
            lineHeight: 28,
            marginBottom: 40,
          }}
        >
          You're on a journey to becoming your best self across every area of
          life.
        </Text>

        {/* Feature Cards */}
        <View style={{ marginBottom: 40 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
            }}
          >
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
                fontSize: 18,
                fontFamily: fonts.display.semiBold,
                color: colors.primary,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Comprehensive Assessment
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: fonts.body.regular,
                color: colors.secondary,
                lineHeight: 22,
              }}
            >
              Measure your wellness across five key dimensions with
              scientifically-grounded questions
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
            }}
          >
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
                fontSize: 18,
                fontFamily: fonts.display.semiBold,
                color: colors.primary,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Track Your Progress
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: fonts.body.regular,
                color: colors.secondary,
                lineHeight: 22,
              }}
            >
              Monitor your growth over time with detailed analytics and insights
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
            }}
          >
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
                fontSize: 18,
                fontFamily: fonts.display.semiBold,
                color: colors.primary,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Actionable Recommendations
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: fonts.body.regular,
                color: colors.secondary,
                lineHeight: 22,
              }}
            >
              Get personalized tips to improve{" "}
              <Text style={{ color: colors.lime, fontFamily: fonts.body.bold }}>
                (IN ALL AREAS OF LIFE)
              </Text>
            </Text>
          </View>
        </View>

        {/* CTA Buttons */}
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
              fontFamily: fonts.display.semiBold,
              color: "#FFFFFF",
              marginRight: 8,
              textTransform: "uppercase",
              letterSpacing: 1,
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
              fontFamily: fonts.body.semiBold,
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
