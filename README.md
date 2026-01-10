# Actualize App

> Assessment and questions platform with web and mobile applications

## 📦 Project Structure

This is a monorepo containing:

```
actualize-app/
├── apps/
│   ├── web/          # React Router v7 web application
│   └── mobile/       # Expo/React Native mobile app
└── .github/         # CI/CD workflows
```

## ✨ Features

- 📝 Assessment creation and management
- ❓ Question bank with multiple formats
- 📊 Results tracking and analytics
- 📱 Cross-platform (Web + iOS/Android)
- 🔐 Secure authentication with JWT
- 💾 MongoDB database integration

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- MongoDB 7+
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/zordhalo/actualize-app.git
   cd actualize-app
   ```

2. **Install dependencies**
   ```bash
   # For web app
   cd apps/web
   npm install

   # For mobile app
   cd ../mobile
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Web app
   cd apps/web
   cp .env.example .env
   # Edit .env with your configuration

   # Mobile app
   cd apps/mobile
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7

   # Or use your local MongoDB installation
   ```

5. **Run the applications**

   **Web App:**
   ```bash
   cd apps/web
   npm run dev
   # Open http://localhost:3000
   ```

   **Mobile App:**
   ```bash
   cd apps/mobile
   npx expo start
   # Scan QR code with Expo Go app
   ```

## 🛠️ Tech Stack

### Web Application
- **Framework**: React Router v7 with Vite
- **UI**: Chakra UI + Tailwind CSS
- **State**: Zustand + TanStack Query
- **Backend**: Hono.js server
- **Database**: MongoDB
- **Auth**: Auth.js + JWT
- **Payments**: Stripe
- **Maps**: Google Maps

### Mobile Application  
- **Framework**: Expo SDK 54 + React Native 0.81
- **Navigation**: React Navigation
- **UI**: Native Wind (Tailwind for RN)
- **State**: Zustand + TanStack Query
- **In-App Purchases**: RevenueCat

## 📚 Documentation

- [Web App Documentation](./apps/web/README.md)
- [Mobile App Documentation](./apps/mobile/README.md)
- [Brand Guidelines](./docs/BRAND_GUIDELINES.md)
- [API Documentation](./docs/API.md) _(to be created)_
- [Database Schema](./docs/DATABASE.md) _(to be created)_

## 📦 Deployment

### Web App
Deployed using E2B platform via GitHub Actions.

### Mobile App
Built using EAS (Expo Application Services):
```bash
cd apps/mobile
eas build --platform all
```

## 🧑‍💻 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues

Found a bug or have a feature request? [Open an issue](https://github.com/zordhalo/actualize-app/issues)

## 📄 License

[Add license information]

## 👥 Team

[Add team/contact information]
