import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, TrendingUp } from "lucide-react-native";
import { useAppTheme, fonts } from "@/utils/theme";
import useUser from "@/utils/useUser";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { data: user, loading: userLoading } = useUser();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssessments();
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [user, userLoading]);

  const fetchAssessments = async () => {
    try {
      const response = await fetch("/api/assessments");
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreTier = (score) => {
    if (score >= 80) return { label: "THRIVING", color: colors.thriving };
    if (score >= 60) return { label: "GOOD", color: colors.good };
    if (score >= 40) return { label: "FAIR", color: colors.fair };
    return { label: "NEEDS ATTENTION", color: colors.needsAttention };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading || userLoading) {
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
          History
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: fonts.body.medium,
            color: colors.secondary,
            marginTop: 4,
          }}
        >
          Track your wellness journey
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
        {assessments.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 40,
              alignItems: "center",
            }}
          >
            <Calendar
              size={48}
              color={colors.secondary}
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                fontSize: 20,
                fontFamily: fonts.display.semiBold,
                color: colors.primary,
                marginBottom: 8,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              No Assessments Yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: fonts.body.regular,
                color: colors.secondary,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Complete your first assessment to start tracking your wellness
              progress
            </Text>
          </View>
        ) : (
          <>
            {assessments.length > 1 && (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <TrendingUp size={20} color={colors.actualize} />
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
                    Progress Overview
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginTop: 12,
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 32,
                        fontFamily: fonts.display.bold,
                        color: colors.actualize,
                      }}
                    >
                      {assessments.length}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: fonts.body.medium,
                        color: colors.secondary,
                        marginTop: 4,
                        textTransform: "uppercase",
                      }}
                    >
                      Total
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 32,
                        fontFamily: fonts.display.bold,
                        color: getScoreTier(
                          Math.round(
                            assessments.reduce(
                              (sum, a) => sum + a.overallScore,
                              0,
                            ) / assessments.length,
                          ),
                        ).color,
                      }}
                    >
                      {Math.round(
                        assessments.reduce(
                          (sum, a) => sum + a.overallScore,
                          0,
                        ) / assessments.length,
                      )}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: fonts.body.medium,
                        color: colors.secondary,
                        marginTop: 4,
                        textTransform: "uppercase",
                      }}
                    >
                      Average
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 32,
                        fontFamily: fonts.display.bold,
                        color: getScoreTier(
                          Math.max(...assessments.map((a) => a.overallScore)),
                        ).color,
                      }}
                    >
                      {Math.max(...assessments.map((a) => a.overallScore))}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: fonts.body.medium,
                        color: colors.secondary,
                        marginTop: 4,
                        textTransform: "uppercase",
                      }}
                    >
                      Best
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Text
              style={{
                fontSize: 18,
                fontFamily: fonts.display.semiBold,
                color: colors.primary,
                marginBottom: 16,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              All Assessments
            </Text>

            {assessments.map((assessment, index) => {
              const tier = getScoreTier(assessment.overallScore);
              return (
                <View
                  key={assessment.id}
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
                      marginBottom: 16,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: fonts.body.medium,
                          color: colors.secondary,
                          marginBottom: 4,
                        }}
                      >
                        {formatDate(assessment.completedAt)}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 44,
                            fontFamily: fonts.display.bold,
                            color: tier.color,
                          }}
                        >
                          {assessment.overallScore}
                        </Text>
                        <View style={{ marginLeft: 12 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: fonts.display.semiBold,
                              color: tier.color,
                              textTransform: "uppercase",
                              letterSpacing: 1,
                            }}
                          >
                            {tier.label}
                          </Text>
                          {index === 0 && (
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: fonts.body.medium,
                                color: colors.lime,
                                marginTop: 2,
                              }}
                            >
                              Latest
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={{ gap: 8 }}>
                    {Object.entries(assessment.scores).map(([dim, score]) => (
                      <View
                        key={dim}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: fonts.body.medium,
                            color: colors.secondary,
                            flex: 1,
                          }}
                        >
                          {dim}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: fonts.display.semiBold,
                              color: getScoreTier(score).color,
                              width: 32,
                              textAlign: "right",
                              marginRight: 8,
                            }}
                          >
                            {score}
                          </Text>
                          <View
                            style={{
                              width: 60,
                              height: 6,
                              backgroundColor: colors.surfaceVariant,
                              borderRadius: 3,
                              overflow: "hidden",
                            }}
                          >
                            <View
                              style={{
                                width: `${score}%`,
                                height: "100%",
                                backgroundColor: getScoreTier(score).color,
                                borderRadius: 3,
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}
