import Constants from "expo-constants";
import { useCallback, useMemo, useRef, useState } from "react";

const AUTOCOMPLETE_ENDPOINT =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json?types=geocode&components=country:us";

export type PlaceSuggestion = {
  id: string;
  description: string;
  primaryText: string;
  secondaryText: string;
};

type AutocompleteState = {
  isLoading: boolean;
  error: string | null;
  suggestions: PlaceSuggestion[];
};

const getApiKey = (): string => {
  const extra = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra;
  return (extra?.googleMapsApiKey as string | undefined) ?? "";
};

const createSessionToken = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const usePlacesAutocomplete = () => {
  const [{ isLoading, error, suggestions }, setState] = useState<AutocompleteState>({
    isLoading: false,
    error: null,
    suggestions: []
  });
  const sessionTokenRef = useRef<string | null>(null);

  const ensureSessionToken = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = createSessionToken();
    }
    return sessionTokenRef.current;
  };

  const clearSuggestions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      suggestions: []
    }));
    sessionTokenRef.current = null;
  }, []);

  const fetchSuggestions = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (trimmed.length < 3) {
      clearSuggestions();
      return [];
    }

    const key = getApiKey();
    if (!key) {
      setState({
        isLoading: false,
        error: "Missing Google Maps API key. Add GOOGLE_MAPS_API_KEY to your .env file.",
        suggestions: []
      });
      return [];
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const sessionToken = ensureSessionToken();
      const params = new URLSearchParams({
        input: trimmed,
        key,
        sessiontoken: sessionToken
      });

      const response = await fetch(`${AUTOCOMPLETE_ENDPOINT}&${params.toString()}`);
      const payload = await response.json();

      if (payload.status !== "OK" || !Array.isArray(payload.predictions)) {
        throw new Error(payload.error_message ?? "Autocomplete request failed");
      }

      const mapped: PlaceSuggestion[] = payload.predictions.map((prediction: any) => ({
        id: prediction.place_id,
        description: prediction.description,
        primaryText: prediction.structured_formatting?.main_text ?? prediction.description,
        secondaryText: prediction.structured_formatting?.secondary_text ?? ""
      }));

      setState({
        isLoading: false,
        error: null,
        suggestions: mapped
      });

      return mapped;
    } catch (autoError) {
      console.warn("RouteDash usePlacesAutocomplete: failed fetching suggestions", autoError);
      setState({
        isLoading: false,
        error:
          "We hit a snag while looking up addresses. Please try again in a few seconds.",
        suggestions: []
      });
      sessionTokenRef.current = null;
      return [];
    }
  }, [clearSuggestions]);

  return useMemo(
    () => ({
      isLoading,
      error,
      suggestions,
      fetchSuggestions,
      clearSuggestions
    }),
    [clearSuggestions, error, fetchSuggestions, isLoading, suggestions]
  );
};
