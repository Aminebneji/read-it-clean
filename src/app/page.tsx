"use client";

import { useState, useEffect, useCallback } from "react";
import { article } from "@/types/article.types";
import FilterBar from "@/components/FilterBar";
import ArticleGrid from "@/components/ArticleGrid";
import PinnedSidebar from "@/components/PinnedSidebar";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Read It Clean
          </h1>
          <p className="text-gray-600 mt-2">
            Les dernières actualités de World of Warcraft
          </p>
        </div>
      </header>

      {/* Filter Bar */}
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
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Précédent
              </button>
              <span className="text-gray-600 font-medium">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Pinned Sidebar */}
      <PinnedSidebar articles={pinnedArticles} />
    </div>
  );
}
