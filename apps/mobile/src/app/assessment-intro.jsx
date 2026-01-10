import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Play, Clock, ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useAppTheme, fonts } from "@/utils/theme";

export default function AssessmentIntroScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const dimensions = [
    {
      name: "Spiritual",
      icon: "✨",
      description: "Purpose, values, connection",
    },
    { name: "Physical", icon: "💪", description: "Fitness, sleep, nutrition" },
    { name: "Mental", icon: "🧠", description: "Emotional resilience, stress" },
    {
      name: "Educational",
      icon: "📚",
      description: "Continuous learning, curiosity",
    },
    { name: "Financial", icon: "💰", description: "Money mindset, security" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, justifyContent: "center" }}
        >
          <ChevronLeft size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 36,
            fontFamily: fonts.display.bold,
            color: colors.primary,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Wellness Assessment
        </Text>

        <Text
          style={{
            fontSize: 16,
            fontFamily: fonts.body.regular,
            color: colors.secondary,
            lineHeight: 24,
            marginBottom: 32,
          }}
        >
          Take a comprehensive assessment to understand your current wellness
          across five interconnected dimensions.
        </Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Clock size={20} color={colors.actualize} />
            <Text
              style={{
                fontSize: 14,
                fontFamily: fonts.display.semiBold,
                color: colors.primary,
                marginLeft: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Estimated Time: 8-10 minutes
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              fontFamily: fonts.body.regular,
              color: colors.secondary,
              lineHeight: 22,
            }}
          >
            Answer 35 thoughtfully crafted questions (7 per dimension). Your
            responses will be scored to give you insights into your overall
            wellness.
          </Text>
        </View>

        <Text
          style={{
            fontSize: 20,
            fontFamily: fonts.display.semiBold,
            color: colors.primary,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Five Dimensions
        </Text>

        {dimensions.map((dim, index) => (
          <View
            key={dim.name}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text style={{ fontSize: 24, marginRight: 12 }}>{dim.icon}</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: fonts.display.semiBold,
                  color: colors.primary,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {dim.name}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontFamily: fonts.body.regular,
                color: colors.secondary,
                marginLeft: 36,
              }}
            >
              {dim.description}
            </Text>
          </View>
        ))}

        <View
          style={{
            backgroundColor: colors.surfaceVariant,
            borderRadius: 16,
            padding: 20,
            marginTop: 8,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: fonts.body.italic,
              color: colors.lime,
              lineHeight: 20,
            }}
          >
            "Progress isn't perfection—it's awareness and deliberate change."
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: fonts.body.regular,
              color: colors.secondary,
              marginTop: 8,
            }}
          >
            Answer honestly for the most accurate insights.
          </Text>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: colors.actualize,
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => router.push("/assessment")}
        >
          <Play size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: fonts.display.semiBold,
              color: "#FFFFFF",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Start Assessment
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
