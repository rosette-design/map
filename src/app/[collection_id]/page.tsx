import React from "react";
import { supabase, Collection, Moment, User } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { HiArrowLeft, HiGlobeAlt } from "react-icons/hi2";
import Link from "next/link";
import MapInterface from "@/components/MapInterface";

interface PageProps {
  params: Promise<{
    collection_id: string;
  }>;
}

export async function generateStaticParams() {
  const { data: collections, error } = await supabase
    .from("collections")
    .select("id");

  if (error) {
    console.error("Error fetching collections for static generation:", error);
    return [];
  }

  return (
    collections?.map((collection) => ({
      collection_id: collection.id,
    })) || []
  );
}

async function getCollection(id: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching collection:", error);
    return null;
  }

  return data;
}

async function getUser(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data;
}

async function getMoments(collectionId: string): Promise<Moment[]> {
  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .eq("collection_id", collectionId)
    .order("started_at", { ascending: true });

  if (error) {
    console.error("Error fetching moments:", error);
    return [];
  }

  return data || [];
}

export default async function CollectionPage({ params }: PageProps) {
  const { collection_id } = await params;
  const collection = await getCollection(collection_id);

  if (!collection) {
    notFound();
  }

  const [user, moments] = await Promise.all([
    getUser(collection.user_id),
    getMoments(collection_id),
  ]);

  // Show empty state if no moments with locations
  const momentsWithLocations = moments.filter((m) => m.city && m.country);

  if (momentsWithLocations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">{collection.name}</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
              <HiGlobeAlt className="mx-auto text-6xl text-gray-400 mb-6" />
              <h2 className="text-2xl font-semibold mb-4">
                No Locations Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                This collection doesn&apos;t have any moments with location data
                yet. Add some cities and countries to your moments to see them
                on the world map!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <HiArrowLeft />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MapInterface
      moments={momentsWithLocations}
      collection={collection}
      user={user}
    />
  );
}
