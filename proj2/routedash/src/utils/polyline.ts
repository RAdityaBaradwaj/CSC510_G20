/* eslint-disable no-bitwise */

export type Coordinate = {
  latitude: number;
  longitude: number;
};

/**
 * Decodes a polyline string from Google Directions API into coordinate pairs.
 */
export const decodePolyline = (encoded: string): Coordinate[] => {
  let index = 0;
  const length = encoded.length;
  const coordinates: Coordinate[] = [];
  let latitude = 0;
  let longitude = 0;

  while (index < length) {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    latitude += deltaLat;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    longitude += deltaLng;

    coordinates.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  return coordinates;
};

/* eslint-enable no-bitwise */
