import React from "react";
import {
  HiGlobeAmericas,
  HiCamera,
  HiHeart,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import { Moment } from "@/lib/supabase";

interface StatsGridProps {
  totalCountries: number;
  totalCities: number;
  totalPhotos: number;
  totalMoments: number;
  currentMoment?: Moment | null;
  currentMomentIndex: number;
  onNavigate: (direction: "prev" | "next") => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  collectionName: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  totalCountries,
  totalCities,
  totalPhotos,
  totalMoments,
  currentMoment,
  currentMomentIndex,
  onNavigate,
  canNavigatePrev,
  canNavigateNext,
  collectionName,
}) => {
  const quickStats = [
    {
      icon: HiGlobeAmericas,
      value: totalCountries,
      label: "Countries",
      color: "text-blue-600",
    },
    {
      icon: HiGlobeAmericas,
      value: totalCities,
      label: "Cities",
      color: "text-green-600",
    },
    {
      icon: HiCamera,
      value: totalPhotos,
      label: "Photos",
      color: "text-purple-600",
    },
    {
      icon: HiHeart,
      value: totalMoments,
      label: "Memories",
      color: "text-red-600",
    },
  ];

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 flex items-center">
      {/* Left Navigation Button */}
      <button
        onClick={() => onNavigate("prev")}
        disabled={!canNavigatePrev}
        className={`p-4 rounded-l-2xl transition-all duration-200 ${
          canNavigatePrev
            ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
        }`}
      >
        <HiChevronLeft className="text-xl" />
      </button>

      {/* Stats Content */}
      <div className="px-4 py-4">
        {/* Collection Title */}
        <div className="text-center mb-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {collectionName}
          </h1>
        </div>

        {currentMoment && (
          <div className="text-center mb-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
              {currentMoment.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {currentMoment.city}, {currentMoment.country} •{" "}
              {currentMomentIndex + 1} of {totalMoments}
            </p>
          </div>
        )}

        <div className="flex gap-6">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex flex-col items-center">
                  <IconComponent className={`${stat.color} text-lg mb-1`} />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Navigation Button */}
      <button
        onClick={() => onNavigate("next")}
        disabled={!canNavigateNext}
        className={`p-4 rounded-r-2xl transition-all duration-200 ${
          canNavigateNext
            ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
        }`}
      >
        <HiChevronRight className="text-xl" />
      </button>
    </div>
  );
};

export default StatsGrid;
