# Actualize Mobile App

Expo/React Native mobile application for iOS and Android.

## Development

### Prerequisites
- Node.js 20+
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on physical device

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

   Update `EXPO_PUBLIC_API_URL` to point to your backend.

3. Start Expo:
   ```bash
   npx expo start
   ```

   - Press `i` for iOS simulator
   - Press `a` for Android emulator  
   - Scan QR code with Expo Go app

### Available Scripts

- `npx expo start` - Start Expo dev server
- `npx expo start --ios` - Start with iOS simulator
- `npx expo start --android` - Start with Android emulator
- `npm test` - Run Jest tests

### Building for Production

Using EAS (Expo Application Services):

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

### Project Structure

```
src/
├── app/           # Expo Router file-based routing
├── components/   # Reusable components
├── utils/        # Utilities and helpers
└── assets/       # Images, fonts, etc.
```

### Tech Stack

- **Expo SDK 54**: Development platform
- **React Native 0.81**: Mobile framework
- **Expo Router**: File-based navigation
- **React Navigation**: Navigation library
- **TanStack Query**: Data fetching
- **Zustand**: State management

### Testing on Devices

1. Install Expo Go from App Store/Play Store
2. Run `npx expo start`
3. Scan QR code with:
   - iOS: Camera app
   - Android: Expo Go app

### Environment Variables

See `.env.example` for configuration options.

### Deployment

App Store and Play Store submissions are manual. Build with EAS and submit through respective consoles.
