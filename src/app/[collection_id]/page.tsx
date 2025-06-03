import { supabase, Collection, Moment, User } from "@/lib/supabase";
import { notFound } from "next/navigation";
import {
  HiHome,
  HiMapPin,
  HiClock,
  HiCheckCircle,
  HiArrowLeft,
} from "react-icons/hi2";
import Link from "next/link";
import MediaDisplay from "@/components/MediaDisplay";

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

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
        <div className="w-full">
          <h1 className="text-4xl font-bold mb-4">{collection.name}</h1>

          {user && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-2">Collection Owner</h3>
              <div className="flex flex-col gap-1">
                <p className="font-medium">{user.name}</p>
                {user.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Member since: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm text-gray-500 mb-8">
            <p>Collection ID: {collection.id}</p>
            <p>
              Created: {new Date(collection.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-6">
            Moments ({moments.length})
          </h2>

          {moments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No moments found in this collection.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {moments.map((moment) => (
                <div
                  key={moment.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{moment.title}</h3>
                    {moment.category && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {moment.category}
                      </span>
                    )}
                  </div>

                  {moment.media_url && (
                    <MediaDisplay
                      url={moment.media_url}
                      alt={moment.title}
                      title={moment.title}
                    />
                  )}

                  {moment.content && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                      {moment.content}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {(moment.city || moment.country) && (
                      <div className="flex items-center gap-1">
                        <HiMapPin className="text-blue-500" size={16} />
                        <span>
                          {[moment.city, moment.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <HiClock className="text-orange-500" size={16} />
                      <span>
                        Started:{" "}
                        {new Date(moment.started_at).toLocaleDateString()} at{" "}
                        {new Date(moment.started_at).toLocaleTimeString()}
                      </span>
                    </div>

                    {moment.completed_at && (
                      <div className="flex items-center gap-1">
                        <HiCheckCircle className="text-green-500" size={16} />
                        <span>
                          Completed:{" "}
                          {new Date(moment.completed_at).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(moment.completed_at).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {moment.completed_at && (
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                        Completed
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/"
          >
            <HiArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/"
        >
          <HiHome className="text-foreground" size={16} />
          Home
        </Link>
      </footer>
    </div>
  );
}
