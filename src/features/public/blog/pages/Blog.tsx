import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";
import { getBlogPosts } from "../services/blog.service";
import type { BlogPostSummary } from "../types/blog";
import { watchBlogUpdates } from "../services/blogUpdates";
import PublicPageFrame from "@/shared/components/Layouts/PublicPageFrame";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    return watchBlogUpdates(async (signal) => {
      try {
        const data = await getBlogPosts(signal);
        if (!signal.aborted) {
          setPosts(data);
          setError("");
        }
      } catch {
        if (!signal.aborted)
          setError("Could not load blog posts. Retrying automatically.");
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    });
  }, [attempt]);
  return (
    <PublicPageFrame
      number="05"
      eyebrow="Notes and experiments"
      title="Blog"
      description="Thoughts, notes, and things I learn while building projects and exploring technology."
    >
      {isLoading ? (
        <p className="public-content-empty">Loading posts…</p>
      ) : error ? (
        <div
          role="alert"
          className="public-content-empty public-content-empty--error"
        >
          <p>{error}</p>
          <button
            className="rounded border border-ink/20 px-3 py-2"
            onClick={() => {
              setError("");
              setIsLoading(true);
              setAttempt((n) => n + 1);
            }}
          >
            Retry
          </button>
        </div>
      ) : posts.length ? (
        <div className="public-page-list">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
            />
          ))}
        </div>
      ) : (
        <p className="public-content-empty">
          No published posts yet. Check back soon.
        </p>
      )}
    </PublicPageFrame>
  );
}
