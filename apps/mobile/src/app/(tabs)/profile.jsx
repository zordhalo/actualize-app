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
import { Mail, Calendar, TrendingUp, Award, LogOut } from "lucide-react-native";
import { useAppTheme, fonts } from "@/utils/theme";
import useUser from "@/utils/useUser";
import { useAuth } from "@/utils/auth/useAuth";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { data: user, loading: userLoading } = useUser();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [user, userLoading]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleSignOut = async () => {
    await signOut();
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
          Profile
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: fonts.body.medium,
            color: colors.secondary,
            marginTop: 4,
          }}
        >
          Your wellness account
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
            padding: 24,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.actualize,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontFamily: fonts.display.bold,
                color: "#FFFFFF",
              }}
            >
              {getInitials(user?.email)}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 22,
              fontFamily: fonts.display.semiBold,
              color: colors.primary,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {profile?.profile?.fullName || user?.name || "Wellness User"}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Mail size={14} color={colors.secondary} />
            <Text
              style={{
                fontSize: 14,
                fontFamily: fonts.body.regular,
                color: colors.secondary,
                marginLeft: 6,
              }}
            >
              {user?.email}
            </Text>
          </View>

          {profile?.profile?.memberSince && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Calendar size={14} color={colors.secondary} />
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: fonts.body.regular,
                  color: colors.secondary,
                  marginLeft: 6,
                }}
              >
                Member since {formatDate(profile.profile.memberSince)}
              </Text>
            </View>
          )}
        </View>

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
          Wellness Stats
        </Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 20,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.actualize + "20",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <TrendingUp size={24} color={colors.actualize} />
              </View>
              <Text
                style={{
                  fontSize: 28,
                  fontFamily: fonts.display.bold,
                  color: colors.primary,
                }}
              >
                {profile?.stats?.totalAssessments || 0}
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
                Assessments
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.good + "20",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Award size={24} color={colors.good} />
              </View>
              <Text
                style={{
                  fontSize: 28,
                  fontFamily: fonts.display.bold,
                  color: colors.primary,
                }}
              >
                {profile?.stats?.averageScore || 0}
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
                Avg Score
              </Text>
            </View>
          </View>

          {profile?.stats?.bestDimension && (
            <View
              style={{
                backgroundColor: colors.surfaceVariant,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: fonts.body.medium,
                  color: colors.secondary,
                  marginBottom: 4,
                }}
              >
                Your Best Dimension
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: fonts.display.semiBold,
                  color: colors.lime,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {profile.stats.bestDimension}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={handleSignOut}
        >
          <LogOut size={20} color={colors.needsAttention} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: fonts.display.semiBold,
              color: colors.needsAttention,
              marginLeft: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
