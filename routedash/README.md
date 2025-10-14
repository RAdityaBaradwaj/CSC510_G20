# RouteDash Mobile (Milestone 1)

RouteDash is a travel-aware pickup planner that pairs food orders with your current drive. Milestone 1 focuses on the core mobile experience: signing in, plotting a route, viewing a live map with directions, and simulating the trip progress.

## Features delivered
- **Demo authentication** – simple sign-in flow with persisted session storage.
- **Route inputs** – capture origin and destination addresses with inline address autocomplete.
- **Mealtime slider** – scrub across the full trip timeline to choose when you’d like to stop for food.
- **Directions fetch** – integrates with the Google Routes API to draw the full route polyline.
- **Map visualization** – interactive map with origin/destination pins and automatic viewport fitting.
- **Restaurant recommendations** – surfaces the top pickup-friendly restaurants around the 30–40 minute point of your drive.

## Getting started

1. Install dependencies:
   ```bash
   cd routedash
   npm install
   ```
2. Create an `.env` based on `.env.example` and provide a Google Maps API key with **Routes API**, **Places API**, and the platform-specific Maps SDKs enabled:
   ```bash
   cp .env.example .env
   # edit .env and add GOOGLE_MAPS_API_KEY=your_key_here
   ```
3. Run the Expo development server:
   ```bash
   npm start
   ```
   Press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code with the Expo Go app.

### Emulator setup tips
- For iOS, use Xcode's Simulator (iOS 17+ recommended).
- For Android, ensure an emulator with Google Play services is running so Google Maps renders correctly.

### Google Maps configuration
- iOS: Expo reads `GOOGLE_MAPS_API_KEY` from the env file and injects it into the native build config (enable **Maps SDK for iOS** in Google Cloud).
- Android: the same key is mapped via `app.config.ts` for the Google Maps SDK (enable **Maps SDK for Android**).
- Web: when running `npm run web`, the key is used for the Routes REST call.

## Next steps
- Plug in live user location via `expo-location` to anchor simulation to GPS.
- Enhance the recommendation rules (e.g., dietary filters, multiple time windows, richer place details).
- Layer in secure authentication (Cognito, Auth0, etc.) instead of the demo credentials.
