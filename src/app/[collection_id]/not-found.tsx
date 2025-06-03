import { HiArrowLeft, HiHome } from "react-icons/hi2";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="w-full">
          <h1 className="text-4xl font-bold mb-4">Collection Not Found</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            The collection you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
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
