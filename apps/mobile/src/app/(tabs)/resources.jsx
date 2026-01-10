import React from "react";
import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Sparkles,
  Activity,
  Brain,
  BookOpen,
  Coins,
  Lightbulb,
} from "lucide-react-native";
import { useAppTheme, fonts } from "@/utils/theme";

export default function ResourcesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const resources = [
    {
      dimension: "Spiritual",
      icon: Sparkles,
      color: colors.spiritual,
      tips: [
        "Start a daily gratitude journal",
        "Practice 5 minutes of meditation",
        "Connect with your community weekly",
        "Reflect on your personal values",
        "Engage in activities that bring meaning",
      ],
    },
    {
      dimension: "Physical",
      icon: Activity,
      color: colors.physical,
      tips: [
        "Aim for 7-9 hours of sleep nightly",
        "Move your body for 30 minutes daily",
        "Drink 8 glasses of water each day",
        "Eat colorful, whole foods",
        "Schedule regular health checkups",
      ],
    },
    {
      dimension: "Mental",
      icon: Brain,
      color: colors.mental,
      tips: [
        "Practice deep breathing when stressed",
        "Limit screen time before bed",
        "Talk to someone you trust",
        "Take regular breaks throughout the day",
        "Engage in hobbies you enjoy",
      ],
    },
    {
      dimension: "Educational",
      icon: BookOpen,
      color: colors.educational,
      tips: [
        "Read for 15 minutes daily",
        "Learn one new skill this month",
        "Take an online course",
        "Listen to educational podcasts",
        "Challenge yourself intellectually",
      ],
    },
    {
      dimension: "Financial",
      icon: Coins,
      color: colors.financial,
      tips: [
        "Create and follow a monthly budget",
        "Save 10% of your income",
        "Review your expenses weekly",
        "Set clear financial goals",
        "Build an emergency fund",
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 36,
            fontFamily: fonts.display.bold,
            color: colors.primary,
            marginTop: 20,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Resources
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: fonts.body.medium,
            color: colors.secondary,
            marginTop: 4,
          }}
        >
          Actionable tips for each dimension
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
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
              marginBottom: 12,
            }}
          >
            <Lightbulb size={20} color={colors.actualize} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: fonts.display.semiBold,
                color: colors.primary,
                marginLeft: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              About Wellness
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
            Wellness is multidimensional—celebrate strength and lean into
            growth. Consistency compounds. Commit to one new action this week.
          </Text>
        </View>

        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <View
              key={resource.dimension}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: resource.color + "20",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Icon size={20} color={resource.color} />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: fonts.display.semiBold,
                    color: colors.primary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {resource.dimension}
                </Text>
              </View>

              <View style={{ gap: 12 }}>
                {resource.tips.map((tip, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: resource.color,
                        marginTop: 7,
                        marginRight: 12,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: fonts.body.regular,
                        color: colors.secondary,
                        lineHeight: 22,
                        flex: 1,
                      }}
                    >
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View
          style={{
            backgroundColor: colors.surfaceVariant,
            borderRadius: 16,
            padding: 20,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: fonts.body.italic,
              color: colors.lime,
              lineHeight: 20,
              textAlign: "center",
            }}
          >
            "Progress isn't perfection—it's awareness and deliberate change."
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: fonts.body.regular,
              color: colors.secondary,
              lineHeight: 18,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Start small, build consistently, and celebrate every step forward.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
