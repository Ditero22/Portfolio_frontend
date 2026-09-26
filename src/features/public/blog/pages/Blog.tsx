import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";
import { getBlogPosts } from "../services/blog.service";
import type { BlogPostSummary } from "../types/blog";
import { watchBlogUpdates } from "../services/blogUpdates";

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
    <section className="mx-auto mb-16 w-full max-w-2xl md:mb-0 md:pt-1">
      <header className="mb-8">
        <h1 className="text-4xl text-ink md:text-5xl">Blog</h1>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          Thoughts, notes, and things I learn while building projects and
          exploring technology.
        </p>
      </header>
      {isLoading ? (
        <p className="text-sm text-ink/60">Loading posts…</p>
      ) : error ? (
        <div
          role="alert"
          className="space-y-3 text-ink"
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
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink/60">
          No published posts yet. Check back soon.
        </p>
      )}
    </section>
  );
}
