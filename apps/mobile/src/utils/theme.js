import { useColorScheme } from "react-native";

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    colors: {
      // Actualize Brand - Background colors
      background: "#0a0a0a", // Black/Charcoal
      surface: "#1a1a1a", // Off-Black
      surfaceVariant: "#2a2a2a", // Dark Gray

      // Actualize Brand - Text colors
      primary: "#f5f5f5", // White/Cream
      secondary: "#666666", // Neutral Gray
      tertiary: "#888888",
      placeholder: "#666666",

      // Actualize Brand - Primary action color
      actualize: "#d90428", // Actualize Red
      actualizeGradient: ["#ff1a41", "#cf0023", "#d90428"],

      // Border colors
      border: "#2a2a2a",
      borderLight: "#333333",

      // UI element colors
      dragHandle: "#666666",

      // Wellness Scoring Colors
      thriving: "#d4af37", // Gold (80-100)
      good: "#22c55e", // Success Green (60-79)
      fair: "#f59e0b", // Warning Amber (40-59)
      needsAttention: "#ef4444", // Alert Red (0-39)
      info: "#3b82f6", // Informational Blue

      // Dimension accent colors
      spiritual: "#9b87f5",
      physical: "#22c55e",
      mental: "#3b82f6",
      educational: "#f59e0b",
      financial: "#d4af37",

      // Keep some legacy colors for compatibility
      orange: "#d90428",
      orangeLight: "rgba(217, 4, 40, 0.1)",
      blue: "#3b82f6",
      blueLight: "rgba(59, 130, 246, 0.1)",
      green: "#22c55e",
      greenLight: "rgba(34, 197, 94, 0.1)",
      yellow: "#f59e0b",
      yellowLight: "rgba(245, 158, 11, 0.1)",
      yellowStar: "#d4af37",
      purple: "#9b87f5",
      pink: "#d90428",
      pinkVariant: "#cf0023",

      // Profile specific colors
      profileGreen: "#22c55e",
      profileBlue: "#3b82f6",
      profileOrange: "#d90428",
    },
  };
};
