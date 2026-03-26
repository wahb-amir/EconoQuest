# EconoQuest

**EconoQuest** is an interactive Next.js economics simulation game where players make real-time policy decisions, watch macroeconomic indicators react dynamically, and compete on leaderboards to become the ultimate economic manager.

## 🎮 Overview

EconoQuest combines interactive policy controls, a live economic dashboard, scenario-based simulation, and an AI hint system to make macroeconomics feel engaging, visual, and playable.

**Key Experience:**
- Adjust tax rates, interest rates, and government spending via intuitive sliders
- Watch inflation, unemployment, GDP, and public mood shift in real time based on your choices
- Progress through quarterly simulations with branching strategies
- Get Socratic guidance from an AI advisor—hints, not answers
- Climb the leaderboard to prove your economic prowess

## ✨ Features

- **Policy Decision Interface** – Sliders and controls for tax, interest rate, and spending adjustments
- **Live Economic Dashboard** – Real-time metrics: inflation, unemployment, GDP, public mood, and more
- **Scenario-Based Simulation** – Quarter-by-quarter progression with replayable gameplay
- **AI Hint System** – Socratic guidance to help you think through economic decisions
- **Leaderboard & Rankings** – Track performance and compete with other players
- **Authentication** – Full login, registration, and protected routes
- **Responsive UI** – Built with reusable components, hooks, and utility modules

## 🛠 Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion
- **UI Components:** Radix UI / shadcn-style patterns, Lucide icons
- **Charts & Forms:** Recharts, React Hook Form
- **Backend & Auth:** Supabase
- **Deployment:** Vercel

## 🚀 Live Demo

Check out the live deployment:

👉 **[https://econoquest.wahb.space/](https://econoquest.wahb.space)**

## 📋 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended)
- **npm** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/wahb-amir/EconoQuest.git
cd EconoQuest

# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Production Build

```bash
npm run build
npm run start
```

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint checks |

## 📝 Environment Variables

Create a `.env.local` file in the project root and add the following:

```env
# Auth service (client-side)
NEXT_PUBLIC_AUTH_SERVICE_URL=https://wahb-amir-auth-service.hf.space

# Auth service (server-side)
AUTH_SERVICE_URL=https://wahb-amir-auth-service.hf.space

# Backend proxy layer
NEXT_PUBLIC_PROXY_URL=https://wahb-amir-proxy-layer.hf.space

# Supabase configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Internal authentication token
INTERNAL_TOKEN=your_internal_token_here
```

**Variable Notes:**
- `NEXT_PUBLIC_*` variables are exposed to the browser
- `AUTH_SERVICE_URL` is used server-side only (more secure)
- `INTERNAL_TOKEN` must match the token expected by your backend service
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set for database access

## 📁 Project Structure

```
src/
├── app/                      # App Router pages, layouts, and API routes
│   ├── api/                  # Backend endpoints
│   ├── auth/                 # Authentication-related routes
│   ├── game/                 # Core game flows
│   ├── leaderboard/          # Leaderboard page
│   ├── login/                # Login page
│   ├── ranking/              # Ranking/scoring page
│   ├── register/             # Registration page
│   └── setup/                # Onboarding flow
│
├── components/               # Shared React components
│   ├── game/                 # Game-specific UI components
│   ├── landing/              # Landing page components
│   └── ui/                   # Reusable UI primitives (buttons, cards, etc.)
│
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts            # Authentication state management
│   ├── use-mobile.tsx        # Mobile detection hook
│   └── use-toast.ts          # Toast notifications hook
│
├── lib/                      # Core logic and utilities
│   ├── authContext.tsx       # Auth provider and context
│   ├── safeFetch.ts          # Protected fetch wrapper
│   ├── simulation-engine.ts  # Economy simulation logic
│   └── utils.ts              # General utilities
│
├── middleware.ts             # Route protection and request handling
│
└── types/                    # TypeScript type definitions
```

## 🎯 Key Components

### Authentication System
Complete auth flow handling login, registration, token management, and protected routes via `/api/auth/*` endpoints and the auth context.

### Simulation Engine
Drives the economy's response to player decisions, calculating quarter-by-quarter changes in macroeconomic indicators based on policy inputs. Includes end-state scoring logic.

### Leaderboards & Rankings
Tracks and displays player performance, enabling competitive gameplay with persistent scoring.

## 📚 Additional Documentation

See `docs/blueprint.md` for detailed information on:
- Intended gameplay mechanics
- Economic metrics and their relationships
- UI style direction and design system

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feat/your-feature`)
3. **Make your changes** and ensure code quality
4. **Run checks:**
   ```bash
   npm run typecheck
   npm run lint
   ```
5. **Commit** your changes with clear messages
6. **Open a Pull Request** with a description of your changes

## 📄 License

This project is open source. See LICENSE file for details.

---

**Built with passion for making economics interactive and visual.** 🎓📊