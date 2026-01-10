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
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useAppTheme } from "@/utils/theme";

export default function AssessmentScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions");
      if (response.ok) {
        const data = await response.json();
        const flatQuestions = [];

        // Flatten questions from grouped structure
        Object.entries(data.questions).forEach(([dimension, questions]) => {
          questions.forEach((q) => {
            flatQuestions.push({
              ...q,
              dimension,
            });
          });
        });

        setAllQuestions(flatQuestions);
      } else {
        console.error("Failed to fetch questions");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (rating) => {
    const currentQuestion = allQuestions[currentQuestionIndex];
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: rating,
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });

      if (response.ok) {
        const data = await response.json();
        router.replace({
          pathname: "/results",
          params: {
            assessmentId: data.assessment.id,
            overallScore: data.assessment.overallScore,
            spiritual: data.assessment.scores.Spiritual,
            physical: data.assessment.scores.Physical,
            mental: data.assessment.scores.Mental,
            educational: data.assessment.scores.Educational,
            financial: data.assessment.scores.Financial,
          },
        });
      } else {
        console.error("Failed to submit assessment");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      setSubmitting(false);
    }
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

  const getDimensionColor = (dimension) => {
    const dimColors = {
      Spiritual: colors.spiritual,
      Physical: colors.physical,
      Mental: colors.mental,
      Educational: colors.educational,
      Financial: colors.financial,
    };
    return dimColors[dimension] || colors.actualize;
  };

  if (!fontsLoaded || loading) {
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

  if (allQuestions.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Montserrat_500Medium",
            color: colors.secondary,
            textAlign: "center",
          }}
        >
          No questions available. Please try again later.
        </Text>
      </View>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;
  const isAnswered = responses[currentQuestion.id] !== undefined;
  const allAnswered = Object.keys(responses).length === allQuestions.length;

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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, justifyContent: "center" }}
          >
            <ChevronLeft size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Montserrat_600SemiBold",
              color: colors.secondary,
            }}
          >
            {currentQuestionIndex + 1} / {allQuestions.length}
          </Text>
        </View>

        <View
          style={{
            height: 4,
            backgroundColor: colors.surfaceVariant,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: colors.actualize,
              borderRadius: 2,
            }}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor:
                getDimensionColor(currentQuestion.dimension) + "20",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 24 }}>
              {getDimensionIcon(currentQuestion.dimension)}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Montserrat_600SemiBold",
              color: getDimensionColor(currentQuestion.dimension),
            }}
          >
            {currentQuestion.dimension}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 24,
            fontFamily: "Montserrat_600SemiBold",
            color: colors.primary,
            lineHeight: 34,
            marginBottom: 40,
          }}
        >
          {currentQuestion.text}
        </Text>

        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
              }}
            >
              Strongly Disagree
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Montserrat_500Medium",
                color: colors.secondary,
              }}
            >
              Strongly Agree
            </Text>
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                onPress={() => handleResponse(rating)}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor:
                    responses[currentQuestion.id] === rating
                      ? colors.actualize
                      : colors.surface,
                  borderWidth: 2,
                  borderColor:
                    responses[currentQuestion.id] === rating
                      ? colors.actualize
                      : colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: "Montserrat_600SemiBold",
                    color:
                      responses[currentQuestion.id] === rating
                        ? "#FFFFFF"
                        : colors.primary,
                  }}
                >
                  {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isAnswered && (
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Montserrat_500Medium",
              color: colors.secondary,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            ✓ Answer recorded
          </Text>
        )}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surface,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
            style={{
              flex: 1,
              marginRight: 8,
              backgroundColor:
                currentQuestionIndex === 0
                  ? colors.surfaceVariant
                  : colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingVertical: 14,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ChevronLeft
              size={20}
              color={
                currentQuestionIndex === 0 ? colors.secondary : colors.primary
              }
            />
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Montserrat_600SemiBold",
                color:
                  currentQuestionIndex === 0
                    ? colors.secondary
                    : colors.primary,
                marginLeft: 4,
              }}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex < allQuestions.length - 1 ? (
            <TouchableOpacity
              onPress={handleNext}
              disabled={!isAnswered}
              style={{
                flex: 1,
                marginLeft: 8,
                backgroundColor: isAnswered
                  ? colors.actualize
                  : colors.surfaceVariant,
                borderRadius: 12,
                paddingVertical: 14,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Montserrat_600SemiBold",
                  color: isAnswered ? "#FFFFFF" : colors.secondary,
                  marginRight: 4,
                }}
              >
                Next
              </Text>
              <ChevronRight
                size={20}
                color={isAnswered ? "#FFFFFF" : colors.secondary}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!allAnswered || submitting}
              style={{
                flex: 1,
                marginLeft: 8,
                backgroundColor:
                  allAnswered && !submitting
                    ? colors.actualize
                    : colors.surfaceVariant,
                borderRadius: 12,
                paddingVertical: 14,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Montserrat_600SemiBold",
                    color: allAnswered ? "#FFFFFF" : colors.secondary,
                  }}
                >
                  Complete
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
