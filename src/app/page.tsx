"use client"
import { useState, useEffect, useCallback } from "react";
import { article } from "@/types/article.types";
import FilterBar from "@/components/FilterBar";
import ArticleGrid from "@/components/ArticleGrid";
import PinnedSidebar from "@/components/PinnedSidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "@/components/Icons";
import { formatErrorMessage } from "@/utils/error.utils";

export default function Home() {
  const [articles, setArticles] = useState<article[]>([]);
  const [pinnedArticles, setPinnedArticles] = useState<article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("desc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildQueryParams(page, category, sort, search);
      const res = await fetch(`/api/articles?${params}`);

      if (!res.ok) {
        throw new Error("Impossible de charger les articles. Veuillez réessayer.");
      }

      const data = await res.json();

      if (data.success) {
        setArticles(data.data.articles);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        throw new Error(data.message || "Une erreur est survenue lors du chargement.");
      }
    } catch (err) {
      setError(formatErrorMessage(err, "Articles"));
    } finally {
      setLoading(false);
    }
  }, [page, category, sort, search]);

  const fetchPinnedArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles/pinned");
      if (!res.ok) throw new Error("Erreur de récupération des articles épinglés");
      const data = await res.json();

      if (data.success) {
        setPinnedArticles(data.data);
      }
    } catch (err) {
      console.error(formatErrorMessage(err, "PinnedArticles"));
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchPinnedArticles();

    const eventSource = new EventSource('/api/events');

    const handleRefresh = () => {
      fetchPinnedArticles();
      fetchArticles();
    };

    eventSource.addEventListener('pinChange', () => {
      handleRefresh();
    });

    eventSource.addEventListener('update', () => {
      handleRefresh();
    });

    eventSource.addEventListener('delete', () => {
      handleRefresh();
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [fetchPinnedArticles, fetchArticles]);

  const buildQueryParams = (
    page: number,
    category: string,
    sort: string,
    search: string
  ): URLSearchParams => {
    const params = {
      page: page.toString(),
      limit: "12",
      publishedOnly: "true",
      ...(category && { category }),
      ...(sort && { sort }),
      ...(search && { search }),
    };

    return new URLSearchParams(params);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };



  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Fixed  */}
      <div className="absolute right-6 top-25 z-[40]">
        <ModeToggle />
      </div>

      {/* LOGO Section */}
      <div
        className="w-full overflow-hidden flex items-center justify-start px-6 md:px-12 relative pointer-events-none"
      >
        <div className="flex items-center relative gap-4">
          <div className="relative z-10 flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 leading-tight drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)] dark:drop-shadow-none">
              Read It Clean
            </h1>
            <p className="text-muted-foreground text-xs font-bold hidden md:block">
              Les dernières actualités de World of Warcraft
            </p>
          </div>
        </div>
      </div>


      {/* FilterBar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FilterBar
            category={category}
            sort={sort}
            search={search}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onSearchChange={handleSearchChange}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-1">
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchArticles()}
                  className="ml-4"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Réessayer
                </Button>
              </div>
            </Alert>
          )}
        </div>

        <ArticleGrid articles={articles} loading={loading} />

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2 bg-card border border-border rounded-lg font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Précédent
              </button>
              <span className="text-muted-foreground font-medium">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-6 py-2 bg-card border border-border rounded-lg font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Pinned */}
      <PinnedSidebar articles={pinnedArticles} />
    </div>
  );
}
