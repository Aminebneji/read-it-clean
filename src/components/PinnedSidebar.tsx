"use client";

import { article } from "@/types/article.types";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface PinnedSidebarProps {
    articles: article[];
}

export default function PinnedSidebar({ articles }: PinnedSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (articles.length === 0) return null;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed right-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-6 rounded-l-lg shadow-lg hover:bg-blue-700 transition-all z-40 flex items-center gap-2"
                style={{ right: isOpen ? '320px' : '0' }}
            >
                <svg
                    className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium whitespace-nowrap">
                    {isOpen ? 'Fermer' : 'Épinglés'}
                </span>
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 z-30 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                        Articles Épinglés
                    </h2>
                    <div className="space-y-4">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                href={article.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group"
                            >
                                <article className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                                    {article.image && (
                                        <div className="relative w-full h-32 bg-gray-100">
                                            <Image
                                                src={article.image}
                                                alt={article.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 line-clamp-2 transition-colors">
                                            {article.title}
                                        </h3>
                                        <span className="text-xs text-gray-500 mt-1 block">
                                            {new Date(article.pubDate || article.createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-20"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
