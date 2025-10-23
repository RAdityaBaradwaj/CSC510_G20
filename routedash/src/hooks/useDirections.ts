import NetInfo from "@react-native-community/netinfo";
import Constants from "expo-constants";
import { useCallback, useMemo, useState } from "react";
import type { Coordinate } from "../utils/polyline";
import { decodePolyline } from "../utils/polyline";

type RouteLeg = {
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  startAddress: string;
  endAddress: string;
};

export type DirectionsResult = {
  coordinates: Coordinate[];
  leg: RouteLeg;
};

type UseDirectionsState = {
  isLoading: boolean;
  error: string | null;
  result: DirectionsResult | null;
};

const ROUTES_ENDPOINT = "https://routes.googleapis.com/directions/v2:computeRoutes";

const getApiKey = (): string => {
  const extra = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra;
  return (extra?.googleMapsApiKey as string | undefined) ?? "";
};

export const useDirections = () => {
  const [{ isLoading, error, result }, setState] = useState<UseDirectionsState>({
    isLoading: false,
    error: null,
    result: null
  });

  const fetchRoute = useCallback(async (origin: string, destination: string) => {
    const inputOrigin = origin.trim();
    const inputDestination = destination.trim();

    if (!inputOrigin || !inputDestination) {
      setState((prev) => ({
        ...prev,
        error: "Enter both a starting point and a destination to plot your trip."
      }));
      return false;
    }

    const { isConnected } = await NetInfo.fetch();
    if (!isConnected) {
      setState((prev) => ({
        ...prev,
        error:
          "We couldn't confirm an internet connection. Check connectivity and try generating the route again."
      }));
      return false;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      setState((prev) => ({
        ...prev,
        error:
          "Missing Google Maps API key. Add GOOGLE_MAPS_API_KEY to your local .env file before requesting directions."
      }));
      return false;
    }

    setState({ isLoading: true, error: null, result: null });

    try {
      const response = await fetch(ROUTES_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.duration,routes.legs.localizedValues.duration,routes.legs.localizedValues.distance,routes.legs.distanceMeters"
        },
        body: JSON.stringify({
          origin: {
            address: inputOrigin
          },
          destination: {
            address: inputDestination
          },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
          computeAlternativeRoutes: false,
          routeModifiers: {
            avoidTolls: false,
            avoidHighways: false,
            avoidFerries: false
          },
          languageCode: "en-US",
          units: "IMPERIAL"
        })
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error?.message ?? "Directions request failed");
      }

      const payload = await response.json();
      const [route] = payload.routes ?? [];
      if (!route) {
        throw new Error("No routes found for that trip");
      }

      const [leg] = route.legs ?? [];
      const encodedPolyline = route.polyline?.encodedPolyline;
      const coordinates = encodedPolyline ? decodePolyline(encodedPolyline) : [];

      const parseDurationSeconds = (duration: any): number => {
        if (!duration) {
          return 0;
        }
        if (typeof duration === "string") {
          const normalized = duration.endsWith("s") ? duration.slice(0, -1) : duration;
          const parsed = Number(normalized);
          return Number.isFinite(parsed) ? parsed : 0;
        }
        if (typeof duration === "object" && typeof duration.seconds !== "undefined") {
          const seconds = duration.seconds;
          if (typeof seconds === "string") {
            const parsed = Number(seconds);
            return Number.isFinite(parsed) ? parsed : 0;
          }
          if (typeof seconds === "number") {
            return seconds;
          }
        }
        if (typeof duration === "number") {
          return duration;
        }
        return 0;
      };

      const durationSeconds = parseDurationSeconds(leg?.duration);
      const distanceMeters =
        typeof leg?.distanceMeters === "number" && leg.distanceMeters > 0
          ? leg.distanceMeters
          : route.distanceMeters ?? 0;

      const nextResult: DirectionsResult = {
        coordinates,
        leg: {
          distanceText: leg?.localizedValues?.distance?.text ?? "—",
          distanceMeters,
          durationText: leg?.localizedValues?.duration?.text ?? "—",
          durationSeconds,
          startAddress: inputOrigin,
          endAddress: inputDestination
        }
      };

      setState({
        isLoading: false,
        error: null,
        result: nextResult
      });

      return true;
    } catch (routeError) {
      console.warn("RouteDash useDirections: failed to fetch directions", routeError);
      setState({
        isLoading: false,
        error:
          "We hit an issue fetching directions. Confirm the Google Routes API is enabled for your key and try again.",
        result: null
      });

      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, result: null });
  }, []);

  return useMemo(
    () => ({
      isLoading,
      error,
      result,
      fetchRoute,
      reset
    }),
    [error, fetchRoute, isLoading, reset, result]
  );
};
