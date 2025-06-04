"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import * as L from "leaflet";
import { Moment } from "@/lib/supabase";
import {
  HiMapPin,
  HiCamera,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import MediaDisplay from "./MediaDisplay";
import "leaflet/dist/leaflet.css";

// Fix for default markers in leaflet
delete (Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationData {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  moments: Moment[];
}

interface WorldMapProps {
  moments: Moment[];
  selectedMoment?: Moment | null;
  onMomentSelect?: (moment: Moment) => void;
}

export interface WorldMapRef {
  centerOnMoment: (moment: Moment) => void;
}

// Custom marker icons based on category
const createHeartIcon = (color = "#ef4444") => {
  const iconSvg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 28C16 28 4 18 4 11C4 7.5 7 4.5 10.5 4.5C13 4.5 15 6 16 8C17 6 19 4.5 21.5 4.5C25 4.5 28 7.5 28 11C28 18 16 28 16 28Z" fill="${color}" stroke="white" stroke-width="3"/>
    </svg>
  `;

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(iconSvg)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const createStarIcon = (color = "#f59e0b") => {
  const iconSvg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2L20.12 10.24L29.36 11.64L22.68 18.16L24.24 27.36L16 23L7.76 27.36L9.32 18.16L2.64 11.64L11.88 10.24L16 2Z" fill="${color}" stroke="white" stroke-width="3"/>
    </svg>
  `;

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(iconSvg)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const createCustomIcon = (color = "#3b82f6") => {
  const iconSvg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="3"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.8"/>
    </svg>
  `;

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(iconSvg)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Function to determine icon based on location's moments
const getLocationIcon = (moments: Moment[]) => {
  // Priority: anniversary (heart) > favourite (star) > default (circle)
  const hasAnniversary = moments.some(
    (moment) => moment.category === "anniversary"
  );
  const hasFavourite = moments.some(
    (moment) => moment.category === "favourite"
  );

  if (hasAnniversary) {
    return createHeartIcon();
  } else if (hasFavourite) {
    return createStarIcon();
  } else {
    return createCustomIcon();
  }
};

// Geocoding function (simplified - in production you'd use a proper geocoding service)
const getCoordinatesFromLocation = async (
  city: string,
  country: string
): Promise<{ lat: number; lng: number } | null> => {
  // This is a simplified version - in production, use Google Maps Geocoding API or similar
  const locationMap: { [key: string]: { lat: number; lng: number } } = {
    "Paris, France": { lat: 48.8566, lng: 2.3522 },
    "London, United Kingdom": { lat: 51.5074, lng: -0.1278 },
    "New York, United States": { lat: 40.7128, lng: -74.006 },
    "Tokyo, Japan": { lat: 35.6762, lng: 139.6503 },
    "Sydney, Australia": { lat: -33.8688, lng: 151.2093 },
    "Rome, Italy": { lat: 41.9028, lng: 12.4964 },
    "Barcelona, Spain": { lat: 41.3851, lng: 2.1734 },
    "Hawaii, United States": { lat: 21.3099, lng: -157.8581 },
    "Santorini, Greece": { lat: 36.3932, lng: 25.4615 },
    "Bali, Indonesia": { lat: -8.3405, lng: 115.092 },
    "Dubai, United Arab Emirates": { lat: 25.2048, lng: 55.2708 },
    "Mumbai, India": { lat: 19.076, lng: 72.8777 },
    "Berlin, Germany": { lat: 52.52, lng: 13.405 },
    "Amsterdam, Netherlands": { lat: 52.3676, lng: 4.9041 },
    "Prague, Czech Republic": { lat: 50.0755, lng: 14.4378 },
    "Vienna, Austria": { lat: 48.2082, lng: 16.3738 },
    "Budapest, Hungary": { lat: 47.4979, lng: 19.0402 },
    "Stockholm, Sweden": { lat: 59.3293, lng: 18.0686 },
    "Copenhagen, Denmark": { lat: 55.6761, lng: 12.5683 },
    "Oslo, Norway": { lat: 59.9139, lng: 10.7522 },
    "Shanghai, China": { lat: 31.2304, lng: 121.4737 },
    "Changzhou, China": { lat: 31.7727, lng: 119.954 },
    "Bologna, Italy": { lat: 44.4949, lng: 11.3426 },
    "Tuscany, Italy": { lat: 43.7696, lng: 11.2558 },
  };

  const key = `${city}, ${country}`;
  return locationMap[key] || null;
};

// Component for location popup with navigation
const LocationPopup: React.FC<{
  location: LocationData;
  onMomentSelect?: (moment: Moment) => void;
}> = ({ location, onMomentSelect }) => {
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const hasMultipleMoments = location.moments.length > 1;
  const currentMoment = location.moments[currentMomentIndex];

  const handleNavigate = (direction: "prev" | "next") => {
    let newIndex = currentMomentIndex;
    if (direction === "prev" && currentMomentIndex > 0) {
      newIndex = currentMomentIndex - 1;
    } else if (
      direction === "next" &&
      currentMomentIndex < location.moments.length - 1
    ) {
      newIndex = currentMomentIndex + 1;
    }

    if (newIndex !== currentMomentIndex) {
      setCurrentMomentIndex(newIndex);
      onMomentSelect?.(location.moments[newIndex]);
    }
  };

  const canNavigatePrev = currentMomentIndex > 0;
  const canNavigateNext = currentMomentIndex < location.moments.length - 1;

  return (
    <div className="p-4 w-80">
      <div className="flex items-center gap-2 mb-3">
        <HiMapPin className="text-blue-600 text-xl" />
        <h3 className="font-bold text-lg">
          {location.city}, {location.country}
        </h3>
      </div>

      {/* Current moment display */}
      <div className={hasMultipleMoments ? "mb-2" : "mb-4"}>
        <h4 className="font-semibold text-sm mb-2">{currentMoment.title}</h4>

        {currentMoment.media_url && (
          <div className="mb-2">
            <MediaDisplay
              url={currentMoment.media_url}
              alt={currentMoment.title}
              title={currentMoment.title}
            />
          </div>
        )}

        {currentMoment.content && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-3">
            {currentMoment.content}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {currentMoment.media_url && <HiCamera className="text-blue-500" />}
          <span>{new Date(currentMoment.started_at).toLocaleDateString()}</span>
          {currentMoment.completed_at && (
            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full">
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Navigation bar - only show if multiple moments */}
      {hasMultipleMoments && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <button
            onClick={() => handleNavigate("prev")}
            disabled={!canNavigatePrev}
            className={`p-1 rounded-lg transition-all duration-200 ${
              canNavigatePrev
                ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            <HiChevronLeft className="text-base" />
          </button>

          <div className="flex items-center gap-1 px-2">
            {location.moments.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentMomentIndex(index);
                  onMomentSelect?.(location.moments[index]);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentMomentIndex
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => handleNavigate("next")}
            disabled={!canNavigateNext}
            className={`p-1 rounded-lg transition-all duration-200 ${
              canNavigateNext
                ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            <HiChevronRight className="text-base" />
          </button>
        </div>
      )}
    </div>
  );
};

// Component to handle map updates from outside
const MapController: React.FC<{
  selectedMoment?: Moment | null;
  locationData: LocationData[];
}> = ({ selectedMoment, locationData }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedMoment && selectedMoment.city && selectedMoment.country) {
      const location = locationData.find(
        (loc) =>
          loc.city === selectedMoment.city &&
          loc.country === selectedMoment.country
      );

      if (location) {
        // Center the map on the location while maintaining current zoom level
        const currentZoom = map.getZoom();
        map.setView([location.lat, location.lng], currentZoom, {
          animate: false,
        });

        // Find and open the popup for this location immediately
        map.eachLayer(
          (
            layer: L.Layer & {
              getLatLng?: () => L.LatLng;
              openPopup?: () => void;
            }
          ) => {
            if (
              layer.getLatLng &&
              layer.openPopup &&
              Math.abs(layer.getLatLng().lat - location.lat) < 0.001 &&
              Math.abs(layer.getLatLng().lng - location.lng) < 0.001
            ) {
              layer.openPopup();
            }
          }
        );
      }
    }
  }, [selectedMoment, locationData, map]);

  return null;
};

const WorldMap = forwardRef<WorldMapRef, WorldMapProps>(
  ({ moments, selectedMoment, onMomentSelect }, ref) => {
    const [locationData, setLocationData] = useState<LocationData[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        centerOnMoment: () => {
          // The MapController will handle the actual centering
        },
      }),
      []
    );

    // Process moments data into location data
    useEffect(() => {
      const processLocations = async () => {
        const locationMap = new Map<string, LocationData>();

        for (const moment of moments) {
          if (moment.city && moment.country) {
            const locationKey = `${moment.city}, ${moment.country}`;
            const coordinates = await getCoordinatesFromLocation(
              moment.city,
              moment.country
            );

            if (coordinates) {
              if (locationMap.has(locationKey)) {
                const existing = locationMap.get(locationKey)!;
                existing.moments.push(moment);
              } else {
                locationMap.set(locationKey, {
                  id: locationKey,
                  city: moment.city,
                  country: moment.country,
                  lat: coordinates.lat,
                  lng: coordinates.lng,
                  moments: [moment],
                });
              }
            }
          }
        }

        setLocationData(Array.from(locationMap.values()));
        setIsLoaded(true);
      };

      processLocations();
    }, [moments]);

    // Calculate map bounds with padding
    const bounds = useMemo(() => {
      if (locationData.length === 0) return undefined;
      if (locationData.length === 1) {
        // For single location, create bounds around it
        const location = locationData[0];
        return new LatLngBounds(
          [location.lat - 5, location.lng - 5],
          [location.lat + 5, location.lng + 5]
        );
      }

      const latLngs = locationData.map(
        (location) => [location.lat, location.lng] as [number, number]
      );
      return new LatLngBounds(latLngs);
    }, [locationData]);

    // Calculate initial zoom and center based on bounds
    const { initialZoom, initialCenter } = useMemo(() => {
      if (!bounds) {
        return { initialZoom: 2, initialCenter: [20, 0] as [number, number] };
      }

      // Calculate the span of coordinates
      const latSpan = bounds.getNorth() - bounds.getSouth();
      const lngSpan = bounds.getEast() - bounds.getWest();

      // Calculate zoom level based on coordinate span
      // These values are empirically determined for good visual results
      let zoom = 2;
      const maxSpan = Math.max(latSpan, lngSpan);

      if (maxSpan < 1) zoom = 10;
      else if (maxSpan < 5) zoom = 8;
      else if (maxSpan < 10) zoom = 6;
      else if (maxSpan < 20) zoom = 5;
      else if (maxSpan < 40) zoom = 4;
      else if (maxSpan < 80) zoom = 3;
      else zoom = 2;

      // Ensure minimum zoom for single locations
      if (locationData.length === 1) {
        zoom = Math.max(zoom, 8);
      }

      const center = bounds.getCenter();
      return {
        initialZoom: zoom,
        initialCenter: [center.lat, center.lng] as [number, number],
      };
    }, [bounds, locationData.length]);

    // Define world bounds to prevent infinite scrolling
    const worldBounds = new LatLngBounds([-90, -180], [90, 180]);

    if (!isLoaded) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your world map...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [20, 20] }}
          className="w-full h-full"
          zoomControl={true}
          scrollWheelZoom={true}
          zoom={initialZoom}
          center={initialCenter}
          maxBounds={worldBounds}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
          minZoom={4}
          maxZoom={18}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapController
            selectedMoment={selectedMoment}
            locationData={locationData}
          />

          {/* Location markers */}
          {locationData.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={getLocationIcon(location.moments)}
              eventHandlers={{
                popupopen: () => {
                  // When popup opens, automatically select the first moment from this location
                  if (location.moments.length > 0) {
                    onMomentSelect?.(location.moments[0]);
                  }
                },
              }}
            >
              <Popup className="custom-popup" maxWidth={400}>
                <LocationPopup
                  location={location}
                  onMomentSelect={onMomentSelect}
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  }
);

WorldMap.displayName = "WorldMap";

export default WorldMap;
