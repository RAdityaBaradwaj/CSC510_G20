import Constants from "expo-constants";
import { useCallback, useMemo, useState } from "react";
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

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:searchNearby";

const getApiKey = (): string => {
  const extra = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra;
  return (extra?.googleMapsApiKey as string | undefined) ?? "";
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

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

const formatPriceLevel = (priceLevel?: string) => {
  if (!priceLevel) {
    return undefined;
  }

  const map: Record<string, string> = {
    PRICE_LEVEL_INEXPENSIVE: "$",
    PRICE_LEVEL_MODERATE: "$$",
    PRICE_LEVEL_EXPENSIVE: "$$$",
    PRICE_LEVEL_VERY_EXPENSIVE: "$$$$"
  };

  return map[priceLevel] ?? undefined;
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

      const apiKey = getApiKey();
      if (!apiKey) {
        setState({
          isLoading: false,
          error:
            "Missing Google Maps API key. Add GOOGLE_MAPS_API_KEY to your .env file to get restaurant suggestions.",
          items: [],
          targetTravelMinutes: null
        });
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
        const response = await fetch(PLACES_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.primaryType,places.accessibilityOptions,places.location,places.currentOpeningHours,places.photos"
          },
          body: JSON.stringify({
            includedTypes: ["restaurant"],
            maxResultCount: 10,
            locationRestriction: {
              circle: {
                center: {
                  latitude: target.coordinate.latitude,
                  longitude: target.coordinate.longitude
                },
                radius: 5000
              }
            },
            rankPreference: "POPULARITY"
          })
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error?.message ?? "Failed to fetch restaurant suggestions");
        }

        const payload = await response.json();
        const places = payload.places ?? [];

        const nextItems: Restaurant[] = places.map((place: any) => ({
          id: place.id,
          name: place.displayName?.text ?? "Untitled Restaurant",
          rating: typeof place.rating === "number" ? place.rating : null,
          ratingCount:
            typeof place.userRatingCount === "number" ? place.userRatingCount : null,
          travelTimeMinutes: target.minuteMark,
          address: place.formattedAddress ?? "Address unavailable",
          priceLevel: formatPriceLevel(place.priceLevel),
          iconUrl: place.photos?.[0]?.authorAttributions?.[0]?.photoUri,
          location: {
            latitude: place.location?.latitude ?? target.coordinate.latitude,
            longitude: place.location?.longitude ?? target.coordinate.longitude
          }
        }));

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
