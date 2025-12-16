import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, TrendingUp, Sparkles } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAppTheme } from "@/utils/theme";
import Svg, { Circle } from "react-native-svg";

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams();

  const overallScore = parseInt(params.overallScore) || 0;
  const scores = {
    Spiritual: parseInt(params.spiritual) || 0,
    Physical: parseInt(params.physical) || 0,
    Mental: parseInt(params.mental) || 0,
    Educational: parseInt(params.educational) || 0,
    Financial: parseInt(params.financial) || 0,
  };

  const [displayScore, setDisplayScore] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate score counter
    const duration = 2000;
    const steps = 60;
    const increment = overallScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= overallScore) {
        setDisplayScore(overallScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    // Fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearInterval(timer);
  }, [overallScore]);

  const getScoreTier = (score) => {
    if (score >= 80) return { label: "Thriving", color: colors.thriving };
    if (score >= 60) return { label: "Good", color: colors.good };
    if (score >= 40) return { label: "Fair", color: colors.fair };
    return { label: "Needs Attention", color: colors.needsAttention };
  };

  const getDimensionIcon = (dimension) => {
    const icons = {
      Spiritual: "✨",
      Physical: "💪",
      Mental: "🧠",
      Educational: "📚",
      Financial: "💰",
    };
    return icons[dimension] || "⭐";
  };

  const getMessage = (score) => {
    if (score >= 80)
      return "You're excelling—your balanced focus is paying off.";
    if (score >= 60)
      return "You're doing well—keep building on your strengths.";
    if (score >= 40)
      return "You're on your way—focus on improving consistency.";
    return "Let's refocus on small habits to rebuild momentum.";
  };

  const getRecommendations = (dimension, score) => {
    const recs = {
      Spiritual: [
        "Start journaling 5 minutes daily",
        "Practice meditation or mindfulness",
        "Connect with your community",
      ],
      Physical: [
        "Set a consistent sleep schedule",
        "Add 10 minutes of movement daily",
        "Drink 8 glasses of water",
      ],
      Mental: [
        "Practice deep breathing exercises",
        "Limit social media to 30 min/day",
        "Schedule weekly self-care time",
      ],
      Educational: [
        "Read one book this month",
        "Enroll in one online course",
        "Learn a new skill for 15 min/day",
      ],
      Financial: [
        "Create a simple budget",
        "Set one financial goal this month",
        "Dedicate a 'no-spend day' weekly",
      ],
    };
    return score < 70 ? recs[dimension]?.[0] : "Keep up the great work!";
  };

  const tier = getScoreTier(overallScore);
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = (overallScore / 100) * circumference;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 40,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <View
            style={{
              width: 200,
              height: 200,
              marginBottom: 24,
              position: "relative",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Svg
              width={200}
              height={200}
              style={{ transform: [{ rotate: "-90deg" }] }}
            >
              <Circle
                cx={100}
                cy={100}
                r={radius}
                stroke={colors.surfaceVariant}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={100}
                cy={100}
                r={radius}
                stroke={tier.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
              />
            </Svg>
            <View style={{ position: "absolute", alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 64,
                  fontFamily: "Inconsolata_600SemiBold",
                  color: tier.color,
                }}
              >
                {displayScore}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Sparkles size={20} color={tier.color} style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 24,
                fontFamily: "Montserrat_600SemiBold",
                color: tier.color,
              }}
            >
              {tier.label}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 15,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              textAlign: "center",
              lineHeight: 24,
              paddingHorizontal: 20,
            }}
          >
            {getMessage(overallScore)}
          </Text>
        </Animated.View>

        <Text
          style={{
            fontSize: 20,
            fontFamily: "Montserrat_600SemiBold",
            color: colors.primary,
            marginBottom: 16,
          }}
        >
          Dimension Breakdown
        </Text>

        {Object.entries(scores).map(([dimension, score], index) => (
          <View
            key={dimension}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <Text style={{ fontSize: 24, marginRight: 12 }}>
                  {getDimensionIcon(dimension)}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Montserrat_600SemiBold",
                    color: colors.primary,
                  }}
                >
                  {dimension}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 28,
                  fontFamily: "Inconsolata_600SemiBold",
                  color: getScoreTier(score).color,
                }}
              >
                {score}
              </Text>
            </View>

            <View
              style={{
                height: 8,
                backgroundColor: colors.surfaceVariant,
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: `${score}%`,
                  height: "100%",
                  backgroundColor: getScoreTier(score).color,
                  borderRadius: 4,
                }}
              />
            </View>

            <Text
              style={{
                fontSize: 13,
                fontFamily: "Montserrat_400Regular",
                color: colors.secondary,
                lineHeight: 20,
              }}
            >
              💡 {getRecommendations(dimension, score)}
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
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              lineHeight: 22,
              textAlign: "center",
            }}
          >
            Wellness is multidimensional—celebrate strength and lean into
            growth. Commit to one new action this week.
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
            marginBottom: 12,
          }}
          onPress={() => router.replace("/(tabs)")}
        >
          <Home size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_600SemiBold",
              color: "#FFFFFF",
            }}
          >
            Go to Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => router.push("/(tabs)/history")}
        >
          <TrendingUp
            size={20}
            color={colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
            }}
          >
            View History
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
