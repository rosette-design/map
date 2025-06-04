"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Collection, Moment, User } from "@/lib/supabase";
import StatsGrid from "./StatsGrid";

// Dynamically import WorldMap to avoid SSR issues with Leaflet
const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Loading your world map...
        </p>
      </div>
    </div>
  ),
});

interface MapInterfaceProps {
  moments: Moment[];
  collection: Collection;
  user: User | null;
}

const MapInterface: React.FC<MapInterfaceProps> = ({ moments, collection }) => {
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const worldMapRef = useRef<{
    centerOnMoment: (moment: Moment) => void;
  } | null>(null);

  // Initialize with first moment if available
  useEffect(() => {
    if (moments.length > 0 && !selectedMoment) {
      setSelectedMoment(moments[0]);
      setCurrentMomentIndex(0);
    }
  }, [moments, selectedMoment]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const countries = new Set();
    const cities = new Set();
    let totalPhotos = 0;
    let completedMoments = 0;

    moments.forEach((moment) => {
      if (moment.country) countries.add(moment.country);
      if (moment.city) cities.add(moment.city);
      if (moment.media_url) totalPhotos++;
      if (moment.completed_at) completedMoments++;
    });

    return {
      totalCountries: countries.size,
      totalCities: cities.size,
      totalPhotos,
      totalMoments: moments.length,
      completedMoments,
    };
  }, [moments]);

  const handleNavigate = (direction: "prev" | "next") => {
    if (!moments.length) return;

    let newIndex = currentMomentIndex;
    if (direction === "prev" && currentMomentIndex > 0) {
      newIndex = currentMomentIndex - 1;
    } else if (
      direction === "next" &&
      currentMomentIndex < moments.length - 1
    ) {
      newIndex = currentMomentIndex + 1;
    }

    if (newIndex !== currentMomentIndex) {
      setCurrentMomentIndex(newIndex);
      setSelectedMoment(moments[newIndex]);
      // Center map on the new moment
      worldMapRef.current?.centerOnMoment(moments[newIndex]);
    }
  };

  const canNavigatePrev = currentMomentIndex > 0;
  const canNavigateNext = currentMomentIndex < moments.length - 1;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full-screen background map */}
      <div className="absolute inset-0 z-0">
        <WorldMap
          ref={worldMapRef}
          moments={moments}
          selectedMoment={selectedMoment}
          onMomentSelect={(moment) => {
            const index = moments.findIndex((m) => m.id === moment.id);
            if (index >= 0) {
              setCurrentMomentIndex(index);
              setSelectedMoment(moment);
            }
          }}
        />
      </div>

      {/* Stats dock with navigation at bottom center */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <StatsGrid
          totalCountries={stats.totalCountries}
          totalCities={stats.totalCities}
          totalPhotos={stats.totalPhotos}
          totalMoments={stats.totalMoments}
          currentMoment={selectedMoment}
          currentMomentIndex={currentMomentIndex}
          onNavigate={handleNavigate}
          canNavigatePrev={canNavigatePrev}
          canNavigateNext={canNavigateNext}
          collectionName={collection.name}
        />
      </div>
    </div>
  );
};

export default MapInterface;
