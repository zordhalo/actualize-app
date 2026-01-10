import { useColorScheme } from "react-native";

// Actualize Brand Font Families
export const fonts = {
  // Display/Heading font - bold, condensed sans-serif
  display: {
    regular: "Oswald_400Regular",
    medium: "Oswald_500Medium",
    semiBold: "Oswald_600SemiBold",
    bold: "Oswald_700Bold",
  },
  // Body/Navigation font - clean, readable sans-serif
  body: {
    light: "Montserrat_300Light",
    regular: "Montserrat_400Regular",
    medium: "Montserrat_500Medium",
    semiBold: "Montserrat_600SemiBold",
    bold: "Montserrat_700Bold",
    italic: "Montserrat_400Regular_Italic",
    mediumItalic: "Montserrat_500Medium_Italic",
  },
  // Script/Accent font - elegant cursive for taglines
  script: {
    regular: "Allura_400Regular",
  },
};

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    fonts,
    colors: {
      // Actualize Brand - Primary Colors
      actualize: "#CC0000", // Brand Red
      actualizeLight: "#DC143C", // Crimson variant
      actualizeDark: "#A30000", // Darker red for hover/press
      actualizeGradient: ["#DC143C", "#CC0000", "#A30000"],

      // Actualize Brand - Background colors
      background: "#000000", // True Black
      surface: "#1A1A1A", // Charcoal
      surfaceVariant: "#2B2B2B", // Light Charcoal

      // Actualize Brand - Text colors
      primary: "#FFFFFF", // White
      secondary: "#999999", // Muted Gray
      tertiary: "#666666", // Darker Gray
      placeholder: "#666666",

      // Actualize Brand - Accent Color
      lime: "#ADFF2F", // Neon/Lime Green accent
      limeDark: "#8BC34A", // Darker lime

      // Border colors
      border: "#2B2B2B",
      borderLight: "#3A3A3A",

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

      // Legacy color aliases for compatibility
      orange: "#CC0000",
      orangeLight: "rgba(204, 0, 0, 0.1)",
      blue: "#3b82f6",
      blueLight: "rgba(59, 130, 246, 0.1)",
      green: "#22c55e",
      greenLight: "rgba(34, 197, 94, 0.1)",
      yellow: "#f59e0b",
      yellowLight: "rgba(245, 158, 11, 0.1)",
      yellowStar: "#d4af37",
      purple: "#9b87f5",
      pink: "#CC0000",
      pinkVariant: "#A30000",

      // Profile specific colors
      profileGreen: "#22c55e",
      profileBlue: "#3b82f6",
      profileOrange: "#CC0000",
    },
  };
};
