"use client";

import { useState, useEffect, useCallback } from "react";
import { article } from "@/types/article.types";
import FilterBar from "@/components/FilterBar";
import ArticleGrid from "@/components/ArticleGrid";
import PinnedSidebar from "@/components/PinnedSidebar";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  const [articles, setArticles] = useState<article[]>([]);
  const [pinnedArticles, setPinnedArticles] = useState<article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("desc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildQueryParams(page, category, sort, search);
      const res = await fetch(`/api/articles?${params}`);
      const data = await res.json();

      if (data.success) {
        setArticles(data.data.articles);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch articles", error);
    } finally {
      setLoading(false);
    }
  }, [page, category, sort, search]);

  const fetchPinnedArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles/pinned");
      const data = await res.json();

      if (data.success) {
        setPinnedArticles(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pinned articles", error);
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
      console.log('Pinned articles maj reçu via SSE');
      handleRefresh();
    });

    eventSource.addEventListener('update', () => {
      console.log('Mise à jour d article reçu via SSE');
      handleRefresh();
    });

    eventSource.addEventListener('delete', () => {
      console.log('Supression d article reçu via SSE');
      handleRefresh();
    });

    eventSource.onerror = (err) => {
      console.error('SSE Connection Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [fetchPinnedArticles]);

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
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Read It Clean
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Les dernières actualités de World of Warcraft
            </p>
          </div>
          <ModeToggle />
        </div>
      </header>

      {/* Filtre */}
      <FilterBar
        category={category}
        sort={sort}
        search={search}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
      />

      {/* Main Content */}
      <main className="pb-12">
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
