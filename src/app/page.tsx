export default function Home() {
  return (
    <div className="font-sans flex items-center justify-center min-h-screen p-8">
      <main className="flex flex-col gap-8 items-center text-center max-w-2xl">
        <h1 className="text-4xl font-bold">Read It Clean</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Read It Clean permet de mieux lire que sur Wowhead
        </p>

        <div className="flex gap-4 flex-wrap justify-center mt-4">
          <a
            className="rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-5"
            href="/api/rss"
            rel="noopener noreferrer"
          >
            Voir les flux RSS
          </a>
        </div>
      </main>
    </div>
  );
}
