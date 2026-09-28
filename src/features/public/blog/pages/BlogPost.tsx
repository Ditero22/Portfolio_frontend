import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBlogPostBySlug } from "../services/blog.service";
import type { BlogPost as Post } from "../types/blog";
import BlogArticle from "../components/BlogArticle";
import { watchBlogUpdates } from "../services/blogUpdates";

export default function BlogPost() {
  const { slug } = useParams();
  // Remount the loader for each slug so previous requests cannot replace a new article.
  return (
    <ArticleLoader
      key={slug}
      slug={slug}
    />
  );
}

function ArticleLoader({ slug }: { slug?: string }) {
  const [post, setPost] = useState<Post>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    return watchBlogUpdates(async (signal) => {
      try {
        const data = await getBlogPostBySlug(slug ?? "", signal);
        if (!signal.aborted) {
          setPost(data);
          setError("");
        }
      } catch {
        if (!signal.aborted)
          setError("Could not load this post. Retrying automatically.");
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    });
  }, [slug, attempt]);
  return (
    <div className="public-page public-page--article">
      <div className="public-page-article">
        <Link
          to="/blog"
          className="public-page-back-link"
        >
          ← Back to Blog
        </Link>
        {isLoading ? (
          <p className="public-content-empty">Loading post…</p>
        ) : error ? (
          <div
            role="alert"
            className="public-content-empty public-content-empty--error"
          >
            <p>{error}</p>
            <button
              className="w-fit rounded border border-ink/20 px-3 py-2 text-sm transition hover:border-teal-500"
              onClick={() => {
                setError("");
                setIsLoading(true);
                setAttempt((n) => n + 1);
              }}
            >
              Retry
            </button>
          </div>
        ) : post ? (
          <BlogArticle post={post} />
        ) : (
          <h1 className="text-4xl text-ink">Blog post not found</h1>
        )}
      </div>
    </div>
  );
}
