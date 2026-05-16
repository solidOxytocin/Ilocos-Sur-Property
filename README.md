# Ilocos Sur Property (User App)

Cross-platform property discovery app for browsing real estate listings across Ilocos Sur. Built with **Expo**, **React Native**, and **Expo Router**, targeting **web**, **iOS**, and **Android**.

This repository is the **public-facing user application**. It connects to a separate backend API for live property data. Admin and API projects live in sibling folders and are not covered here.

## Features

- **Landing page (web)** — Hero, featured listings, location highlights, and marketing sections
- **Home & browse** — Tab navigation on mobile; responsive property catalog on web
- **Property search & filters** — Type, status, price range, lot area, city/barangay (Ilocos Sur municipalities), features, and amenities
- **Grid & list views** — Toggle layout; infinite scroll with paginated API results
- **Property details** — Photos, amenities, location, and map view (Google Maps)
- **Mock mode** — Run the UI against local mock data without a backend

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo ~55, React Native 0.83 |
| Routing | Expo Router (file-based) |
| Styling | NativeWind (Tailwind CSS) |
| UI | React Native Paper, Expo Vector Icons |
| Maps | `react-native-maps` (native), `@react-google-maps/api` (web) |
| Language | TypeScript |

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (optional; `npx expo` works)
- For **Android/iOS**: Android Studio and/or Xcode, or the [Expo Go](https://expo.dev/go) app for quick testing
- A running **property API** (unless using mock mode)
- **Google Maps API key** (for map views on web and native)

## Getting Started

### 1. Install dependencies

```bash
cd ilocos_sur_property
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Base URL of the property API (e.g. `http://localhost:3000`) |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key for web and native maps |
| `EXPO_PUBLIC_IS_MOCK` | Set to `true` to use built-in mock data instead of the API |

**Android emulator note:** Use `http://10.0.2.2:<port>` instead of `localhost` to reach a API running on your host machine.

**Physical device note:** Use your machine’s LAN IP (e.g. `http://192.168.1.x:3000`) so the phone can reach the API.

### 3. Google Maps (native builds)

For Android native maps, set your API key in `app.config.js` under `android.config.googleMaps.apiKey` and the `react-native-maps` plugin. Web maps read `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` from `.env`.

### 4. Start the development server

```bash
npm start
```

Then press:

- `w` — open in web browser
- `a` — open on Android emulator/device
- `i` — open on iOS simulator/device

Or run platform-specific scripts:

```bash
npm run web      # Web only
npm run android  # Android
npm run ios      # iOS
```

## Project Structure

```
ilocos_sur_property/
├── app/                          # Expo Router screens & app code
│   ├── (tabs)/                   # Tab navigator (Home, Browse) — mobile
│   ├── index.tsx                 # Web landing page entry
│   ├── details.tsx               # Property detail screen
│   ├── _layout.tsx               # Root stack layout
│   ├── config/env.tsx            # Runtime env profile (mock / dev / prod)
│   ├── constants/                # API paths, mock data
│   ├── lib/                      # API helpers (result types, fetch)
│   ├── modules/
│   │   ├── landing/              # Web marketing landing page
│   │   ├── property-list/        # Search, filters, grid/list cards
│   │   ├── details-view/         # Property detail UI & maps
│   │   └── generics/             # Shared UI (skeletons, fetch states)
│   ├── service/                  # Property API service layer
│   └── theme/                    # Colors, typography, spacing
├── assets/                       # Images, icons, splash
├── app.config.js                 # Dynamic Expo config (maps keys, etc.)
├── app.json                      # Static Expo manifest
├── .env.example                  # Environment variable template
└── tailwind.config.js            # Tailwind / NativeWind config
```

## API Integration

The app expects a REST API at `EXPO_PUBLIC_API_URL` with endpoints such as:

| Endpoint | Purpose |
|----------|---------|
| `GET /property/getAll` | Paginated property list (supports query filters) |
| `GET /property/bounds` | Max price and lot area for filter sliders |
| `GET /property/city-counts` | Property counts per city |

Request/response handling lives in `app/service/property-service.tsx`. Toggle mock data via `EXPO_PUBLIC_IS_MOCK=true` or `app/config/env.tsx` (`useMock`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run web` | Start for web |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset starter files (Expo template utility) |

## Platform Behavior

- **Web** — Root route shows the full landing page; browse and details use responsive layouts. Bottom tabs are hidden on web.
- **Mobile** — Root redirects to `/(tabs)` (Home and Browse). Property details open via `/details?id=...`.

## Building for Production

Use [EAS Build](https://docs.expo.dev/build/introduction/) or local prebuild:

```bash
npx expo prebuild
npx expo run:android
npx expo run:ios
```

Ensure production API URLs and Google Maps keys are set before release builds.

## Related Projects

| Project | Role |
|---------|------|
| **ilocos_sur_property** (this app) | Public property browser |
| **ilocos_sur_property_admin** | Admin dashboard (separate repo/folder) |
| **API** | Backend property service (separate repo/folder) |

## License

Private project — all rights reserved unless otherwise specified by the project owner.
