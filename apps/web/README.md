# Actualize Web App

React Router v7 web application for the Actualize assessment platform.

## Development

### Prerequisites
- Node.js 20+
- MongoDB running locally or connection string

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret for JWT tokens (generate with `openssl rand -base64 32`)

3. Start development server:
   ```bash
   npm run dev
   ```

   App runs at http://localhost:3000

### Available Scripts

- `npm run dev` - Start development server
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests (if configured)

### Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── assessments/  # Assessment endpoints
│   │   ├── questions/    # Question endpoints
│   │   └── auth/         # Authentication
│   ├── dashboard/      # Dashboard page
│   ├── assessment/     # Assessment pages
│   └── ...            # Other routes
├── utils/             # Utility functions
└── auth.js            # Auth configuration
```

### Tech Stack Details

- **React Router v7**: File-based routing
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **Chakra UI**: Component library
- **Tailwind CSS**: Utility-first CSS
- **MongoDB**: Database
- **Vitest**: Testing framework

### Environment Variables

See `.env.example` for all available configuration options.

### Deployment

The web app deploys automatically via GitHub Actions to E2B when pushing to:
- `main` branch (production)
- `staging` branch (staging)
- `v*` tags (versioned releases)

See `.github/workflows/deploy.yml` for CI/CD configuration.
