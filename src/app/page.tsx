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
import Image from "next/image";
import { formatErrorMessage } from "@/utils/error.utils";
import PaginationControls from "@/components/ui/pagination-controls";

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
      {/* Header Container */}
      <div className="w-full px-6 md:px-12 py-6 flex items-center justify-between">
        {/* LOGO Section */}
        <div className="flex items-center gap-4">
          <Image
            src="/RICLOGO.png"
            alt="Read It Clean Logo"
            width={180}
            height={60}
            className="h-10 md:h-12 w-auto object-contain"
            priority
          />
        </div>

        {/* Action Section (Dark Mode) */}
        <div className="flex items-center gap-4">
          <ModeToggle />
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

        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </main>

      {/* Pinned */}
      <PinnedSidebar articles={pinnedArticles} />
    </div>
  );
}
