import { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MapView, { LatLng, Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { useDirections } from "../hooks/useDirections";
import { PlaceSuggestion, usePlacesAutocomplete } from "../hooks/usePlacesAutocomplete";
import { useRestaurantRecommendations } from "../hooks/useRestaurantRecommendations";
import type { Restaurant as RecommendedRestaurant } from "../hooks/useRestaurantRecommendations";
import { RootStackParamList, RestaurantSummary, TripContext } from "../navigation/types";

const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5
};

const formatDistance = (meters: number) => {
  if (!meters) {
    return "—";
  }

  if (meters < 1000) {
    return `${meters.toFixed(0)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
};

const computeRegionFromCoordinates = (points: LatLng[]) => {
  if (!points.length) {
    return DEFAULT_REGION;
  }

  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;

  points.forEach((point) => {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  });

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  const latitudeDelta = Math.max(0.02, (maxLat - minLat) * 1.4);
  const longitudeDelta = Math.max(0.02, (maxLng - minLng) * 1.4);

  return { latitude, longitude, latitudeDelta, longitudeDelta };
};

export const PlannerScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    error: directionsError,
    fetchRoute,
    isLoading: isDirectionsLoading,
    reset,
    result
  } = useDirections();
  const originAutocomplete = usePlacesAutocomplete();
  const destinationAutocomplete = usePlacesAutocomplete();
  const {
    error: recommendationsError,
    fetchRestaurants,
    isLoading: isRecommendationsLoading,
    items: restaurantRecommendations,
    targetTravelMinutes,
    reset: resetRecommendations
  } = useRestaurantRecommendations();

  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [isRoutePlotted, setIsRoutePlotted] = useState(false);
  const [mealWindow, setMealWindow] = useState<number>(35);

  const window = useWindowDimensions();
  const mapRef = useRef<MapView | null>(null);
  const originDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const coordinates = result?.coordinates ?? [];
  const startPoint: LatLng | undefined = coordinates[0];
  const endPoint: LatLng | undefined = coordinates[coordinates.length - 1];
  const totalMinutes = useMemo(
    () => (result?.leg.durationSeconds ? Math.max(Math.round(result.leg.durationSeconds / 60), 1) : null),
    [result?.leg.durationSeconds]
  );

  const region = useMemo(() => computeRegionFromCoordinates(coordinates), [coordinates]);
  const mapHeight = useMemo(() => Math.max(260, window.height * 0.33), [window.height]);
  const isCompactWidth = window.width < 380;
  const isCompactHeight = window.height < 760;
  const statSpacingStyle = useMemo(() => (isCompactWidth ? undefined : styles.statCardSpacing), [isCompactWidth]);

  const sliderMin = totalMinutes ? 1 : 15;
  const sliderMax = totalMinutes ?? 120;
  const sliderStep = totalMinutes && totalMinutes <= 45 ? 1 : 5;
  const sliderValue = useMemo(
    () => Math.min(Math.max(mealWindow, sliderMin), sliderMax),
    [mealWindow, sliderMax, sliderMin]
  );

  const tripContext: TripContext = useMemo(
    () => ({
      origin,
      destination,
      pickupEtaMin: sliderValue
    }),
    [destination, origin, sliderValue]
  );

  useEffect(() => {
    if (coordinates.length && mapRef.current) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true
      });
    }
  }, [coordinates]);

  useEffect(
    () => () => {
      if (originDebounceRef.current) {
        clearTimeout(originDebounceRef.current);
      }
      if (destinationDebounceRef.current) {
        clearTimeout(destinationDebounceRef.current);
      }
    },
    []
  );

  const handlePreviewRoute = async () => {
    const success = await fetchRoute(origin, destination);
    if (success) {
      setIsRoutePlotted(true);
    }
  };

  const handleOriginChange = (value: string) => {
    setOrigin(value);
    if (originDebounceRef.current) {
      clearTimeout(originDebounceRef.current);
    }
    if (!value.trim()) {
      originAutocomplete.clearSuggestions();
      return;
    }
    originDebounceRef.current = setTimeout(() => {
      void originAutocomplete.fetchSuggestions(value);
    }, 280);
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    if (destinationDebounceRef.current) {
      clearTimeout(destinationDebounceRef.current);
    }
    if (!value.trim()) {
      destinationAutocomplete.clearSuggestions();
      return;
    }
    destinationDebounceRef.current = setTimeout(() => {
      void destinationAutocomplete.fetchSuggestions(value);
    }, 280);
  };

  const handleSelectSuggestion = (
    suggestion: PlaceSuggestion,
    field: "origin" | "destination"
  ) => {
    if (field === "origin") {
      if (originDebounceRef.current) {
        clearTimeout(originDebounceRef.current);
        originDebounceRef.current = null;
      }
      setOrigin(suggestion.description);
      originAutocomplete.clearSuggestions();
    } else {
      if (destinationDebounceRef.current) {
        clearTimeout(destinationDebounceRef.current);
        destinationDebounceRef.current = null;
      }
      setDestination(suggestion.description);
      destinationAutocomplete.clearSuggestions();
    }
  };

  useEffect(() => {
    if (result?.coordinates?.length && result.leg.durationSeconds) {
      void fetchRestaurants(result.coordinates, result.leg.durationSeconds, sliderValue);
    } else {
      resetRecommendations();
    }
  }, [
    fetchRestaurants,
    sliderValue,
    resetRecommendations,
    result?.coordinates,
    result?.leg.durationSeconds
  ]);

  useEffect(() => {
    if (!result?.coordinates?.length) {
      setIsRoutePlotted(false);
    }
  }, [result?.coordinates?.length]);

  const handleClearPlanner = () => {
    setOrigin("");
    setDestination("");
    setIsRoutePlotted(false);
    setMealWindow(35);
    reset();
    resetRecommendations();
    originAutocomplete.clearSuggestions();
    destinationAutocomplete.clearSuggestions();
    if (mapRef.current) {
      mapRef.current.animateToRegion(DEFAULT_REGION, 300);
    }
  };

  useEffect(() => {
    if (totalMinutes) {
      const clamped = Math.min(Math.max(mealWindow, sliderMin), sliderMax);
      if (clamped !== mealWindow) {
        setMealWindow(clamped);
      }
    }
  }, [mealWindow, sliderMax, sliderMin, totalMinutes]);

  const statusLabel: string = useMemo(() => {
    if (isDirectionsLoading) {
      return "Mapping your drive…";
    }
    if (isRecommendationsLoading) {
      return "Searching for restaurants 30–40 minutes ahead…";
    }
    if (restaurantRecommendations.length) {
      const minuteMark = targetTravelMinutes ?? sliderValue;
      return `Here are ${restaurantRecommendations.length} restaurants near the ${minuteMark}-minute mark of your trip.`;
    }
    if (recommendationsError) {
      return "We couldn't load restaurant ideas just now. Try again in a moment.";
    }
    if (isRoutePlotted) {
      return "Route ready — adjust the mealtime slider to refresh recommendations.";
    }
    return "Plot a trip to discover great pickup stops along the way.";
  }, [
    isDirectionsLoading,
    isRecommendationsLoading,
    restaurantRecommendations.length,
    targetTravelMinutes,
    recommendationsError,
    isRoutePlotted,
    sliderValue
  ]);

  const handleOpenRestaurantMenu = (restaurant: RecommendedRestaurant) => {
    if (!origin || !destination) {
      return;
    }

    const summary: RestaurantSummary = {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      latitude: restaurant.location.latitude,
      longitude: restaurant.location.longitude
    };

    navigation.navigate("Menu", { restaurant: summary, trip: tripContext });
  };

  const canPreview =
    Boolean(origin.trim()) && Boolean(destination.trim()) && !isDirectionsLoading;
  const canClear = Boolean(origin.trim() || destination.trim() || coordinates.length);
  const canAdjustMealWindow = Boolean(totalMinutes && sliderMax > sliderMin);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brandBadge}>RouteDash</Text>
          <Text style={styles.headerTitle}>Trip Planner</Text>
          <Text style={styles.headerSubtitle}>{statusLabel}</Text>
        </View>

        <View style={styles.userBadge}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? "R"}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name ?? "Operator"}</Text>
            <Text style={styles.userEmail}>{user?.email ?? "demo@routedash.com"}</Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={[
    styles.scrollContent,
    isCompactHeight && styles.scrollContentCompact,
    { 
      paddingHorizontal: isCompactWidth ? 16 : 24,
      paddingBottom: 120,  // ensures space for bottom content
      flexGrow: 1          // enables proper vertical scrolling
    }
  ]}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>

        <View style={[styles.formCard, isCompactWidth && styles.cardCompact]}>
          <Text style={styles.sectionTitle}>Route details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Starting point</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main St, Durham NC"
              value={origin}
              onChangeText={handleOriginChange}
              onBlur={originAutocomplete.clearSuggestions}
              autoCapitalize="none"
            />
            {originAutocomplete.isLoading ? (
              <Text style={styles.suggestionNote}>Searching for matching addresses…</Text>
            ) : null}
            {originAutocomplete.suggestions.length ? (
              <View style={styles.suggestionList}>
                {originAutocomplete.suggestions.map((suggestion, index) => (
                  <Pressable
                    key={suggestion.id}
                    style={[
                      styles.suggestionRow,
                      index === originAutocomplete.suggestions.length - 1 && styles.suggestionRowLast
                    ]}
                    onPress={() => handleSelectSuggestion(suggestion, "origin")}
                  >
                    <Text style={styles.suggestionPrimary}>{suggestion.primaryText}</Text>
                    {suggestion.secondaryText ? (
                      <Text style={styles.suggestionSecondary}>{suggestion.secondaryText}</Text>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Destination</Text>
            <TextInput
              style={styles.input}
              placeholder="500 Hillsborough St, Raleigh NC"
              value={destination}
              onChangeText={handleDestinationChange}
              onBlur={destinationAutocomplete.clearSuggestions}
              autoCapitalize="none"
            />
            {destinationAutocomplete.isLoading ? (
              <Text style={styles.suggestionNote}>Searching for matching addresses…</Text>
            ) : null}
            {destinationAutocomplete.suggestions.length ? (
              <View style={styles.suggestionList}>
                {destinationAutocomplete.suggestions.map((suggestion, index) => (
                  <Pressable
                    key={suggestion.id}
                    style={[
                      styles.suggestionRow,
                      index === destinationAutocomplete.suggestions.length - 1 &&
                        styles.suggestionRowLast
                    ]}
                    onPress={() => handleSelectSuggestion(suggestion, "destination")}
                  >
                    <Text style={styles.suggestionPrimary}>{suggestion.primaryText}</Text>
                    {suggestion.secondaryText ? (
                      <Text style={styles.suggestionSecondary}>{suggestion.secondaryText}</Text>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <Pressable
            style={[styles.primaryButton, !canPreview && styles.disabled]}
            disabled={!canPreview}
            onPress={handlePreviewRoute}
          >
            <Text style={styles.primaryButtonText}>
              {isDirectionsLoading ? "Calculating…" : "Preview route"}
            </Text>
          </Pressable>

          <View style={styles.mealWindowControl}>
            <View style={styles.mealWindowHeader}>
              <Text style={styles.inputLabel}>Preferred mealtime</Text>
              <Text style={styles.mealWindowValue}>
                {sliderValue} min{totalMinutes ? ` of ${totalMinutes} min` : ""}
              </Text>
            </View>
            <Slider
              style={styles.mealWindowSlider}
              minimumValue={sliderMin}
              maximumValue={sliderMax}
              step={sliderStep}
              value={sliderValue}
              onValueChange={(value) => {
                const stepSize = sliderStep || 1;
                const next = Math.min(
                  Math.max(Math.round(value / stepSize) * stepSize, sliderMin),
                  sliderMax
                );
                if (next !== mealWindow) {
                  setMealWindow(next);
                }
              }}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#CBD5F5"
              thumbTintColor={canAdjustMealWindow ? "#2563EB" : "#94A3B8"}
              disabled={!canAdjustMealWindow}
            />
            <View style={styles.mealWindowLabels}>
              <Text style={styles.mealWindowLabelText}>{sliderMin} min</Text>
              <Text style={styles.mealWindowLabelText}>{sliderMax} min</Text>
            </View>
            {!canAdjustMealWindow ? (
              <Text style={styles.suggestionNote}>
                Preview a route to unlock mealtime suggestions.
              </Text>
            ) : null}
          </View>

          <Pressable
            style={[styles.secondaryButton, styles.clearButton, !canClear && styles.disabled]}
            disabled={!canClear}
            onPress={handleClearPlanner}
          >
            <Text style={styles.secondaryButtonText}>Clear route</Text>
          </Pressable>

          {directionsError ? <Text style={styles.errorBanner}>{directionsError}</Text> : null}
          {originAutocomplete.error ? (
            <Text style={styles.inlineError}>{originAutocomplete.error}</Text>
          ) : null}
          {destinationAutocomplete.error ? (
            <Text style={styles.inlineError}>{destinationAutocomplete.error}</Text>
          ) : null}
        </View>

        <View style={[styles.mapCard, isCompactWidth && styles.cardCompact]}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionTitle}>Live route</Text>
            <Text style={styles.secondaryLabel}>{formatDistance(result?.leg.distanceMeters ?? 0)}</Text>
          </View>

          <View style={[styles.mapWrapper, { height: mapHeight }]}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              initialRegion={region}
              showsUserLocation={false}
              pitchEnabled
              scrollEnabled
              zoomEnabled
            >
              {coordinates.length ? (
                <>
                  <Polyline coordinates={coordinates} strokeColor="#2563eb" strokeWidth={5} />
                  {startPoint ? (
                    <Marker coordinate={startPoint} title="Origin" pinColor="#22c55e" />
                  ) : null}
                  {endPoint ? (
                    <Marker coordinate={endPoint} title="Destination" pinColor="#ef4444" />
                  ) : null}
                </>
              ) : null}
            </MapView>
          </View>

          <View style={styles.routeSummary}>
            <View style={[styles.statCard, statSpacingStyle]}>
              <Text style={styles.statLabel}>Drive time</Text>
              <Text style={styles.statValue}>{result?.leg.durationText ?? "—"}</Text>
            </View>
            <View style={[styles.statCard, statSpacingStyle]}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{result?.leg.distanceText ?? "—"}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Top picks</Text>
              <Text style={styles.statValue}>
                {isRecommendationsLoading
                  ? "…"
                  : restaurantRecommendations.length || (isRoutePlotted ? "0" : "—")}
              </Text>
            </View>
          </View>
        </View>

        {isRoutePlotted ? (
          <View style={[styles.statusCard, isCompactWidth && styles.cardCompact]}>
            <Text style={styles.sectionTitle}>Restaurant picks</Text>
            <Text style={styles.detailSubtitle}>
              {targetTravelMinutes
                ? `Close to the ${targetTravelMinutes}-minute mark of your trip`
                : `Aiming for the ${mealWindow}-minute window`}
            </Text>

            {isRecommendationsLoading ? (
              <Text style={styles.suggestionNote}>Finding popular restaurants near your route…</Text>
            ) : restaurantRecommendations.length ? (
              <View style={styles.recommendationList}>
                {restaurantRecommendations.map((restaurant) => (
                  <Pressable
                    key={restaurant.id}
                    style={styles.recommendationItem}
                    onPress={() => handleOpenRestaurantMenu(restaurant)}
                  >
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationName}>{restaurant.name}</Text>
                    </View>
                    <Text style={styles.recommendationMeta}>{restaurant.address}</Text>
                    <Text style={styles.recommendationMeta}>
                      {restaurant.travelTimeMinutes
                        ? `~${restaurant.travelTimeMinutes} min from start`
                        : "Along your current route"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.suggestionNote}>
                We didn’t spot standout restaurants near that window. Try tweaking the route or search again shortly.
              </Text>
            )}

            {recommendationsError ? <Text style={styles.inlineError}>{recommendationsError}</Text> : null}
            <Pressable
              style={[styles.secondaryButton, styles.browseButton, (!origin || !destination) && styles.disabled]}
              disabled={!origin || !destination}
              onPress={() => navigation.navigate("Restaurants", { trip: tripContext })}
            >
              <Text style={styles.secondaryButtonText}>Browse all registered restaurants</Text>
            </Pressable>
          </View>
        ) : null}

        {result ? (
          <View style={[styles.statusCard, isCompactWidth && styles.cardCompact]}>
            <Text style={styles.sectionTitle}>Trip synopsis</Text>
            <Text style={styles.detailLabel}>Start</Text>
            <Text style={styles.detailValue}>{result.leg.startAddress}</Text>
            <Text style={styles.detailLabel}>Destination</Text>
            <Text style={styles.detailValue}>{result.leg.endAddress}</Text>
            <Text style={styles.detailLabel}>Estimated drive</Text>
            <Text style={styles.detailValue}>{`${result.leg.durationText} • ${result.leg.distanceText}`}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F5F9"
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: Platform.select({ ios: 12, android: 16 }),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  brandBadge: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 6
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A"
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#475569",
    marginTop: 2
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    flexWrap: "wrap",
    gap: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700"
  },
  userName: {
    fontWeight: "700",
    color: "#0F172A",
    fontSize: 16
  },
  userEmail: {
    color: "#475569",
    fontSize: 12
  },
  userDetails: {
    marginLeft: 12
  },
  logoutButton: {
    marginLeft: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#E2E8F0"
  },
  logoutText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 13
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 48,
    gap: 24,
    flexGrow: 1
  },
  scrollContentCompact: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 18
  },
  cardCompact: {
    padding: 16,
    marginBottom: 20
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 0,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 24,
    shadowOffset: { height: 12, width: 0 },
    elevation: 5
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 16, android: 12 }),
    fontSize: 16,
    color: "#0F172A"
  },
  mealWindowControl: {
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    padding: 16
  },
  mealWindowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  mealWindowValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB"
  },
  mealWindowSlider: {
    width: "100%",
    height: 40
  },
  mealWindowLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6
  },
  mealWindowLabelText: {
    fontSize: 12,
    color: "#64748B"
  },
  primaryButton: {
    borderRadius: 14,
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600"
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0F2FE"
  },
  clearButton: {
    marginTop: 12
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "600"
  },
  browseButton: {
    marginTop: 12
  },
  disabled: {
    opacity: 0.55
  },
  errorBanner: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    fontSize: 14,
    lineHeight: 20
  },
  inlineError: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    fontSize: 13
  },
  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 28,
    shadowOffset: { height: 14, width: 0 },
    elevation: 6
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  secondaryLabel: {
    fontWeight: "600",
    color: "#1E293B"
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#E2E8F0"
  },
  map: {
    flex: 1
  },
  routeSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: 12
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center"
  },
  statCardSpacing: {
    marginRight: 12
  },
  statLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4
  },
  statValue: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700"
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { height: 12, width: 0 },
    elevation: 5,
    gap: 8
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#64748B"
  },
  detailValue: {
    fontSize: 15,
    color: "#0F172A"
  },
  detailSubtitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 10
  },
  suggestionNote: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748B"
  },
  suggestionList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    maxHeight: 200
  },
  suggestionRow: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0"
  },
  suggestionRowLast: {
    borderBottomWidth: 0
  },
  suggestionPrimary: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A"
  },
  suggestionSecondary: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2
  },
  recommendationList: {
    marginTop: 8,
    gap: 12
  },
  recommendationItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF"
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    flexShrink: 1,
    paddingRight: 8
  },
  recommendationRating: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1D4ED8"
  },
  recommendationMeta: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2
  }
});
