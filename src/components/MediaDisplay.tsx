import Image from "next/image";

interface MediaDisplayProps {
  url: string;
  alt: string;
  title?: string;
  className?: string;
}

// Helper function to determine media type from URL
function getMediaType(url: string): "image" | "video" | "audio" | "unknown" {
  const urlLower = url.toLowerCase();

  // Image extensions
  if (urlLower.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|tiff)(\?.*)?$/)) {
    return "image";
  }

  // Video extensions
  if (urlLower.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v|3gp|ogv)(\?.*)?$/)) {
    return "video";
  }

  // Audio extensions
  if (urlLower.match(/\.(mp3|wav|ogg|aac|flac|m4a|wma|opus)(\?.*)?$/)) {
    return "audio";
  }

  return "unknown";
}

export default function MediaDisplay({
  url,
  alt,
  title,
  className = "",
}: MediaDisplayProps) {
  const mediaType = getMediaType(url);

  switch (mediaType) {
    case "image":
      return (
        <div className={`mb-4 ${className}`}>
          <Image
            src={url}
            alt={alt}
            width={400}
            height={300}
            className="rounded-lg object-cover w-full max-h-[300px]"
          />
        </div>
      );

    case "video":
      return (
        <div className={`mb-4 ${className}`}>
          <video
            controls
            className="rounded-lg w-full max-h-[400px]"
            preload="metadata"
          >
            <source src={url} />
            Your browser does not support the video tag.
          </video>
        </div>
      );

    case "audio":
      return (
        <div className={`mb-4 ${className}`}>
          <audio controls className="w-full" preload="metadata">
            <source src={url} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );

    default:
      return (
        <div className={`mb-4 ${className}`}>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View Media: {title || alt}
              </a>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Unsupported media type - click to open in new tab
            </p>
          </div>
        </div>
      );
  }
}
