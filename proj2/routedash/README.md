# RouteDash Mobile (Milestone 1)

RouteDash is a travel-aware pickup planner that pairs food orders with your current drive. Milestone 1 focuses on the core mobile experience: signing in, plotting a route, viewing a live map with directions, and simulating the trip progress.

## Features delivered
- **Full authentication** – register/login customers and restaurants backed by the Express API (JWT cookies).
- **Route planner** – capture origin/destination via Google Directions, adjust a “ready to eat” slider, and preview a live map.
- **Registered restaurants only** – recommendations and browse views surface the real restaurants from the backend (no dummy data).
- **Menu + checkout** – pull live menus, build a cart, and create an order record that drives the order-status screen.
- **Merchant dashboard** – restaurant users can add sections/items, toggle availability, and see changes reflected instantly for travelers.

## Getting started

1. Install dependencies:
   ```bash
   cd routedash
   npm install
   ```
2. Create an `.env` based on `.env.example` and provide both the Google Maps key and your API URL (defaults to `http://localhost:4000`):
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

### API connection
- `API_URL` should point to the Express server (defaults to `http://localhost:4000`). For iOS Simulator, `http://127.0.0.1:4000` also works. For Android Emulator, set `API_URL=http://10.0.2.2:4000`.
- Ensure the server is running before launching the app so auth/menu/order calls succeed.

## Next steps
- Plug in live user location via `expo-location` to anchor simulation to GPS.
- Enhance the recommendation rules (e.g., dietary filters, multiple time windows, richer place details).
- Layer in secure authentication (Cognito, Auth0, etc.) instead of the demo credentials.
- **API service** – Express/TypeScript server scaffold under `server/` with health check and tooling (tsconfig, ESLint, Vitest). Copy `.env.example` to `.env`, set a strong `JWT_SECRET` (and database URL when ready), run `npm install`, then `npm run dev` inside `server/` to start the API at `http://localhost:4000`.
