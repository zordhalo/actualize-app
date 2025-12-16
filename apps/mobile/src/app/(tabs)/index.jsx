import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, TrendingUp, Target } from "lucide-react-native";
import { router } from "expo-router";
import { useAppTheme } from "@/utils/theme";
import useUser from "@/utils/useUser";
import { useAuth } from "@/utils/auth/useAuth";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { data: user, loading: userLoading } = useUser();
  const { isReady, isAuthenticated } = useAuth();
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      fetchLatestAssessment();
    } else if (isReady && !isAuthenticated) {
      setLoading(false);
    }
  }, [isReady, isAuthenticated]);

  const fetchLatestAssessment = async () => {
    try {
      const response = await fetch("/api/assessments");
      if (response.ok) {
        const data = await response.json();
        if (data.assessments && data.assessments.length > 0) {
          setLatestAssessment(data.assessments[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreTier = (score) => {
    if (score >= 80) return { label: "Thriving", color: colors.thriving };
    if (score >= 60) return { label: "Good", color: colors.good };
    if (score >= 40) return { label: "Fair", color: colors.fair };
    return { label: "Needs Attention", color: colors.needsAttention };
  };

  const getDimensionIcon = (dimension) => {
    switch (dimension) {
      case "Spiritual":
        return "✨";
      case "Physical":
        return "💪";
      case "Mental":
        return "🧠";
      case "Educational":
        return "📚";
      case "Financial":
        return "💰";
      default:
        return "⭐";
    }
  };

  if (loading || userLoading || !isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.actualize} />
      </View>
    );
  }

  if (!isAuthenticated) {
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
              fontSize: 32,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.primary,
              marginTop: 40,
            }}
          >
            Actualize
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              marginTop: 8,
              lineHeight: 24,
            }}
          >
            Measure and optimize your wellness across five key dimensions
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 24,
              marginTop: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Montserrat_600SemiBold",
                color: colors.primary,
                marginBottom: 12,
              }}
            >
              Welcome to Actualize
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
                lineHeight: 22,
              }}
            >
              You're on a journey to becoming your best self across every area
              of life. Sign in to start your wellness assessment.
            </Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: colors.actualize,
              borderRadius: 16,
              paddingVertical: 16,
              marginTop: 32,
              alignItems: "center",
            }}
            onPress={() => router.push("/welcome")}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              Get Started
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

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
            fontSize: 32,
            fontFamily: "Montserrat_600SemiBold",
            color: colors.primary,
            marginTop: 20,
          }}
        >
          Actualize
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Montserrat_500Medium",
            color: colors.secondary,
            marginTop: 4,
          }}
        >
          Your Wellness Dashboard
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
        {!latestAssessment ? (
          <>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 24,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Montserrat_600SemiBold",
                  color: colors.primary,
                  marginBottom: 12,
                }}
              >
                Start Your Journey
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Montserrat_500Medium",
                  color: colors.secondary,
                  lineHeight: 22,
                  marginBottom: 24,
                }}
              >
                Take your first wellness assessment to understand your current
                state across five key dimensions.
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.actualize,
                  borderRadius: 16,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => router.push("/assessment-intro")}
              >
                <Plus size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Montserrat_600SemiBold",
                    color: "#FFFFFF",
                  }}
                >
                  Begin Assessment
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Montserrat_600SemiBold",
                  color: colors.primary,
                  marginBottom: 16,
                }}
              >
                Five Dimensions of Wellness
              </Text>

              {[
                "Spiritual",
                "Physical",
                "Mental",
                "Educational",
                "Financial",
              ].map((dim, index) => (
                <View
                  key={dim}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: index < 4 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>
                    {getDimensionIcon(dim)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Montserrat_500Medium",
                      color: colors.primary,
                    }}
                  >
                    {dim}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 24,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Montserrat_600SemiBold",
                    color: colors.primary,
                  }}
                >
                  Latest Score
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/assessment-intro")}
                  style={{
                    backgroundColor: colors.actualize,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Montserrat_600SemiBold",
                      color: "#FFFFFF",
                    }}
                  >
                    Retake
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 64,
                    fontFamily: "Montserrat_600SemiBold",
                    color: getScoreTier(latestAssessment.overallScore).color,
                  }}
                >
                  {latestAssessment.overallScore}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Montserrat_600SemiBold",
                    color: getScoreTier(latestAssessment.overallScore).color,
                    marginTop: 8,
                  }}
                >
                  {getScoreTier(latestAssessment.overallScore).label}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Montserrat_500Medium",
                  color: colors.secondary,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {latestAssessment.overallScore >= 80
                  ? "You're excelling—your balanced focus is paying off."
                  : latestAssessment.overallScore >= 60
                    ? "You're doing well—keep building on your strengths."
                    : latestAssessment.overallScore >= 40
                      ? "You're on your way—focus on improving consistency."
                      : "Let's refocus on small habits to rebuild momentum."}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Montserrat_600SemiBold",
                  color: colors.primary,
                  marginBottom: 16,
                }}
              >
                Dimension Breakdown
              </Text>

              {Object.entries(latestAssessment.scores).map(
                ([dimension, score]) => (
                  <View
                    key={dimension}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: dimension !== "Financial" ? 1 : 0,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <Text style={{ fontSize: 20, marginRight: 12 }}>
                        {getDimensionIcon(dimension)}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Montserrat_500Medium",
                          color: colors.primary,
                        }}
                      >
                        {dimension}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: "Montserrat_600SemiBold",
                          color: getScoreTier(score).color,
                          marginRight: 8,
                        }}
                      >
                        {score}
                      </Text>
                      <View
                        style={{
                          width: 60,
                          height: 8,
                          backgroundColor: colors.surfaceVariant,
                          borderRadius: 4,
                          overflow: "hidden",
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
                    </View>
                  </View>
                ),
              )}
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onPress={() => router.push("/(tabs)/history")}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TrendingUp size={24} color={colors.actualize} />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Montserrat_600SemiBold",
                    color: colors.primary,
                    marginLeft: 12,
                  }}
                >
                  View Progress History
                </Text>
              </View>
              <Target size={20} color={colors.secondary} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}
