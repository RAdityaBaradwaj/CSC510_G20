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
import MapView, { LatLng, Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useDirections } from "../hooks/useDirections";
import { PlaceSuggestion, usePlacesAutocomplete } from "../hooks/usePlacesAutocomplete";

type TripState = "idle" | "ready" | "running" | "paused" | "complete";

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

const formatEta = (seconds: number) => {
  if (!seconds) {
    return "—";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hrs = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hrs}h ${remainingMinutes}m` : `${hrs}h`;
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
  const {
    error: directionsError,
    fetchRoute,
    isLoading: isDirectionsLoading,
    reset,
    result
  } = useDirections();
  const originAutocomplete = usePlacesAutocomplete();
  const destinationAutocomplete = usePlacesAutocomplete();

  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [tripState, setTripState] = useState<TripState>("idle");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  const window = useWindowDimensions();
  const mapRef = useRef<MapView | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedMultiplierRef = useRef<number>(1);
  const originDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const coordinates = result?.coordinates ?? [];
  const startPoint: LatLng | undefined = coordinates[0];
  const endPoint: LatLng | undefined = coordinates[coordinates.length - 1];
  const currentPoint: LatLng | undefined = coordinates[activeIndex];

  const progress = coordinates.length > 1 ? activeIndex / (coordinates.length - 1) : 0;

  const region = useMemo(() => computeRegionFromCoordinates(coordinates), [coordinates]);
  const mapHeight = useMemo(() => Math.max(260, window.height * 0.33), [window.height]);
  const isCompactWidth = window.width < 380;
  const isCompactHeight = window.height < 760;
  const statSpacingStyle = useMemo(() => (isCompactWidth ? undefined : styles.statCardSpacing), [isCompactWidth]);

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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (originDebounceRef.current) {
        clearTimeout(originDebounceRef.current);
      }
      if (destinationDebounceRef.current) {
        clearTimeout(destinationDebounceRef.current);
      }
    },
    []
  );

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePreviewRoute = async () => {
    const success = await fetchRoute(origin, destination);
    if (success) {
      setTripState("ready");
      setActiveIndex(0);
      setSpeedMultiplier(1);
      speedMultiplierRef.current = 1;
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

  const handleStartTrip = () => {
    if (!coordinates.length) {
      return;
    }

    clearTimer();
    setTripState("running");

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = prev + speedMultiplierRef.current;
        if (nextIndex >= coordinates.length - 1) {
          clearTimer();
          setTripState("complete");
          return coordinates.length - 1;
        }
        return nextIndex;
      });
    }, 1000);
  };

  const handlePauseTrip = () => {
    clearTimer();
    setTripState("paused");
  };

  const handleResetTrip = () => {
    clearTimer();
    reset();
    setTripState("idle");
    setActiveIndex(0);
    setSpeedMultiplier(1);
    speedMultiplierRef.current = 1;
  };

  useEffect(() => {
    if (!["running", "paused"].includes(tripState) && timerRef.current) {
      clearTimer();
    }
  }, [tripState]);

  const statusLabel: string = useMemo(() => {
    switch (tripState) {
      case "ready":
        return "Route mapped — ready when you are.";
      case "running":
        return "Trip is in progress.";
      case "paused":
        return "Trip paused.";
      case "complete":
        return "Arrived at pickup!";
      default:
        return "Plot a trip to get started.";
    }
  }, [tripState]);

  const remainingDurationSeconds = result?.leg.durationSeconds
    ? Math.max(result.leg.durationSeconds * (1 - progress), 0)
    : 0;

  const estimatedArrival = useMemo(() => {
    if (!remainingDurationSeconds) {
      return "—";
    }
    const eta = new Date(Date.now() + remainingDurationSeconds * 1000);
    return eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [remainingDurationSeconds]);

  const canStartTrip = tripState === "ready" || tripState === "paused";
  const canPreview =
    Boolean(origin.trim()) && Boolean(destination.trim()) && !isDirectionsLoading;

  const renderControls = () => {
    if (!coordinates.length) {
      return null;
    }

    return (
      <View style={styles.tripControls}>
        {tripState !== "running" ? (
          <Pressable
            style={[styles.primaryButton, styles.tripButton, !canStartTrip && styles.disabled]}
            disabled={!canStartTrip}
            onPress={handleStartTrip}
          >
            <Text style={styles.primaryButtonText}>{tripState === "paused" ? "Resume Trip" : "Start Trip"}</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.secondaryButton, styles.tripButton]} onPress={handlePauseTrip}>
            <Text style={styles.secondaryButtonText}>Pause</Text>
          </Pressable>
        )}

        <Pressable
          style={[
            styles.secondaryButton,
            styles.tripButton,
            (tripState === "idle" || isDirectionsLoading) && styles.disabled
          ]}
          onPress={handleResetTrip}
          disabled={tripState === "idle" || isDirectionsLoading}
        >
          <Text style={styles.secondaryButtonText}>Reset</Text>
        </Pressable>

        <View style={styles.speedRow}>
          <Text style={styles.speedLabel}>Sim speed</Text>
          <View style={styles.speedButtons}>
            {[1, 2, 4].map((speed) => (
              <Pressable
                key={speed}
                style={[styles.speedButton, speedMultiplier === speed && styles.speedButtonActive]}
                onPress={() => {
                  setSpeedMultiplier(speed);
                  speedMultiplierRef.current = speed;
                  if (tripState === "running") {
                    handleStartTrip();
                  }
                }}
                disabled={tripState === "idle" || !coordinates.length}
              >
                <Text style={[styles.speedButtonText, speedMultiplier === speed && styles.speedButtonTextActive]}>{speed}x</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  };

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
        contentContainerStyle={[
          styles.scrollContent,
          isCompactHeight && styles.scrollContentCompact,
          { paddingHorizontal: isCompactWidth ? 16 : 24 }
        ]}
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
                      index === destinationAutocomplete.suggestions.length - 1 && styles.suggestionRowLast
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
                  {currentPoint ? (
                    <Marker coordinate={currentPoint} title="Current position" pinColor="#f97316" />
                  ) : null}
                </>
              ) : null}
            </MapView>
          </View>

          <View style={styles.routeSummary}>
            <View style={[styles.statCard, statSpacingStyle]}>
              <Text style={styles.statLabel}>Progress</Text>
              <Text style={styles.statValue}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={[styles.statCard, statSpacingStyle]}>
              <Text style={styles.statLabel}>ETA</Text>
              <Text style={styles.statValue}>{estimatedArrival}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Time left</Text>
              <Text style={styles.statValue}>{formatEta(remainingDurationSeconds)}</Text>
            </View>
          </View>

          {renderControls()}
        </View>

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
  secondaryButtonText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "600"
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
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    minWidth: 120
  },
  statCardSpacing: {
    marginRight: 12,
    marginBottom: 0
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
  tripControls: {
    marginTop: 8
  },
  tripButton: {
    marginBottom: 12
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
    color: "#0F172A",
    marginBottom: 6
  },
  speedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4
  },
  speedLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155"
  },
  speedButtons: {
    flexDirection: "row"
  },
  speedButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#E2E8F0"
  },
  speedButtonActive: {
    backgroundColor: "#1D4ED8"
  },
  speedButtonText: {
    color: "#1E293B",
    fontWeight: "600"
  },
  speedButtonTextActive: {
    color: "#FFFFFF"
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
  }
});
