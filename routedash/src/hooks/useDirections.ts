import NetInfo from "@react-native-community/netinfo";
import Constants from "expo-constants";
import { useCallback, useMemo, useState } from "react";
import type { Coordinate } from "../utils/polyline";
import { decodePolyline } from "../utils/polyline";

type Bounds = {
  northeast: { lat: number; lng: number };
  southwest: { lat: number; lng: number };
};

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
  bounds: Bounds;
  leg: RouteLeg;
};

type UseDirectionsState = {
  isLoading: boolean;
  error: string | null;
  result: DirectionsResult | null;
};

const GOOGLE_ENDPOINT = "https://maps.googleapis.com/maps/api/directions/json";

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
      const params = new URLSearchParams({
        origin: inputOrigin,
        destination: inputDestination,
        key: apiKey,
        mode: "driving"
      });

      const response = await fetch(`${GOOGLE_ENDPOINT}?${params.toString()}`);
      const payload = await response.json();

      if (payload.status !== "OK" || !payload.routes?.length) {
        throw new Error(payload.error_message ?? "Directions request failed");
      }

      const [route] = payload.routes;
      const [leg] = route.legs;

      const coordinates = decodePolyline(route.overview_polyline.points);
      const nextResult: DirectionsResult = {
        coordinates,
        bounds: route.bounds,
        leg: {
          distanceText: leg.distance?.text ?? "—",
          distanceMeters: leg.distance?.value ?? 0,
          durationText: leg.duration?.text ?? "—",
          durationSeconds: leg.duration?.value ?? 0,
          startAddress: leg.start_address ?? inputOrigin,
          endAddress: leg.end_address ?? inputDestination
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
          "We hit an issue fetching directions. Double-check the addresses and try again in a moment.",
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
