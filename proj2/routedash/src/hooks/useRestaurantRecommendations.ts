import { useCallback, useMemo, useState } from "react";

import { apiFetch } from "../api/client";
import type { Coordinate } from "../utils/polyline";

export type Restaurant = {
  id: string;
  name: string;
  rating: number | null;
  ratingCount: number | null;
  travelTimeMinutes: number;
  address: string;
  priceLevel?: string;
  iconUrl?: string;
  location: Coordinate;
};

type RecommendationState = {
  isLoading: boolean;
  error: string | null;
  items: Restaurant[];
  targetTravelMinutes: number | null;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceInMeters = (a: Coordinate, b: Coordinate) => {
  const R = 6371e3;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const c =
    sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));

  return R * d;
};

const pickTargetCoordinate = (
  coordinates: Coordinate[],
  durationSeconds: number,
  preferredMinuteMark: number
) => {
  if (!coordinates.length) {
    return null;
  }

  const totalMinutes = durationSeconds > 0 ? durationSeconds / 60 : 0;
  const desiredMinutes = preferredMinuteMark > 0 ? preferredMinuteMark : 35;

  let ratio: number;

  if (!totalMinutes) {
    ratio = 0.5;
  } else {
    const rawRatio = desiredMinutes / totalMinutes;
    ratio = clamp(rawRatio, 0.05, 0.95);
  }

  const index = Math.min(Math.round(ratio * (coordinates.length - 1)), coordinates.length - 1);
  const coordinate = coordinates[index] ?? coordinates[coordinates.length - 1];
  const minuteMark = totalMinutes ? Math.round(totalMinutes * ratio) : Math.round(desiredMinutes);

  return {
    coordinate,
    minuteMark
  };
};

export const useRestaurantRecommendations = () => {
  const [{ isLoading, error, items, targetTravelMinutes }, setState] = useState<RecommendationState>({
    isLoading: false,
    error: null,
    items: [],
    targetTravelMinutes: null
  });

  const fetchRestaurants = useCallback(
    async (coordinates: Coordinate[], durationSeconds: number, preferredMinuteMark: number) => {
      if (!coordinates.length) {
        setState((prev) => ({
          ...prev,
          items: [],
          error: null,
          isLoading: false,
          targetTravelMinutes: null
        }));
        return;
      }

      const target = pickTargetCoordinate(coordinates, durationSeconds, preferredMinuteMark);
      if (!target) {
        setState({
          isLoading: false,
          error:
            "We couldn't determine a midpoint for this route. Try plotting a different trip.",
          items: [],
          targetTravelMinutes: null
        });
        return;
      }

      setState({ isLoading: true, error: null, items: [], targetTravelMinutes: target.minuteMark });

      try {
        const { restaurants } = await apiFetch<{
          restaurants: {
            id: string;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
          }[];
        }>("/api/restaurants", { requireAuth: false });

        const nextItems: Restaurant[] = restaurants
          .map((restaurant) => {
            const location =
              restaurant.latitude && restaurant.longitude
                ? { latitude: restaurant.latitude, longitude: restaurant.longitude }
                : target.coordinate;
            const distance = distanceInMeters(target.coordinate, location);
            return {
              id: restaurant.id,
              name: restaurant.name,
              rating: null,
              ratingCount: null,
              travelTimeMinutes: target.minuteMark,
              address: restaurant.address,
              location,
              distance
            };
          })
          .filter((restaurant) => restaurant.distance <= 8000 || restaurant.distance === 0)
          .slice(0, 10)
          .map(({ distance, ...rest }) => rest);

        setState({
          isLoading: false,
          error: null,
          items: nextItems,
          targetTravelMinutes: target.minuteMark
        });
      } catch (placesError) {
        console.warn("RouteDash useRestaurantRecommendations: failed", placesError);
        setState({
          isLoading: false,
          error:
            "We couldn't load restaurant ideas near this route right now. Please try again shortly.",
          items: [],
          targetTravelMinutes: null
        });
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, items: [], targetTravelMinutes: null });
  }, []);

  return useMemo(
    () => ({
      isLoading,
      error,
      items,
      targetTravelMinutes,
      fetchRestaurants,
      reset
    }),
    [error, fetchRestaurants, isLoading, items, reset, targetTravelMinutes]
  );
};
