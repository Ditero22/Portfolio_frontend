import { ArrowUpRight, CalendarDays, Feather } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { watchBlogUpdates } from "@/features/public/blog/services/blogUpdates";
import { getBlogPosts } from "@/features/public/blog/services/blog.service";
import type { BlogPostSummary } from "@/features/public/blog/types/blog";
import { safeMediaUrl } from "@/features/public/blog/types/content";

export default function LatestBlogPreview() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    return watchBlogUpdates(async (signal) => {
      try {
        const latestPosts = await getBlogPosts(signal);
        if (signal.aborted) return;

        setPosts(latestPosts.filter((post) => post.published));
        setUnavailable(false);
      } catch {
        if (!signal.aborted) setUnavailable(true);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    });
  }, []);

  const latestPosts = [...posts]
    .sort(
      (first, second) =>
        getTimestamp(second.createdAt) - getTimestamp(first.createdAt),
    )
    .slice(0, 3);
  const [featuredPost, ...otherPosts] = latestPosts;
  const featuredImageUrl = featuredPost
    ? safeMediaUrl(featuredPost.imageUrl)
    : undefined;

  return (
    <section className="portfolio-reveal">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
            03 / Notes and experiments
          </p>
          <h2 className="text-4xl text-ink">Latest writing</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-ink/60">
            Recent notes from projects, technology, and things I am learning.
          </p>
        </div>
        <Link
          to="/blog"
          className="group flex min-h-11 items-center gap-2 rounded-full border border-ink/15 px-4 font-mono text-[10px] uppercase tracking-wider text-ink/70 transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        >
          All posts
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </Link>
      </header>

      {loading && latestPosts.length === 0 ? (
        <p
          className="rounded-2xl border border-dashed border-ink/20 p-6 text-sm text-ink/60"
          role="status"
        >
          Loading recent posts…
        </p>
      ) : unavailable && latestPosts.length === 0 ? (
        <p
          className="rounded-2xl border border-dashed border-ink/20 p-6 text-sm text-ink/60"
          role="status"
        >
          Blog posts are temporarily unavailable.
        </p>
      ) : featuredPost ? (
        <div className="latest-blog-grid">
          <article className="latest-blog-feature">
            {featuredImageUrl ? (
              <img
                src={featuredImageUrl}
                alt=""
                loading="lazy"
              />
            ) : (
              <div className="latest-blog-feature__art" aria-hidden="true">
                <Feather size={32} strokeWidth={1.2} />
                <span>FIELD NOTES / 01</span>
              </div>
            )}
            <div className="latest-blog-feature__body">
              <PostMeta post={featuredPost} />
              <h3>
                <Link to={postPath(featuredPost)}>
                  {featuredPost.title || "Untitled post"}
                </Link>
              </h3>
              <p>
                {featuredPost.excerpt ||
                  "Open the article to read the full post."}
              </p>
              <Link className="latest-blog-read" to={postPath(featuredPost)}>
                Read the post
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </article>

          {otherPosts.length > 0 && (
            <div className="latest-blog-list" aria-label="More recent posts">
              {otherPosts.map((post, index) => (
                <article className="latest-blog-list__item" key={post.id}>
                  <span className="latest-blog-list__index" aria-hidden="true">
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <div>
                    <PostMeta post={post} />
                    <h3>
                      <Link to={postPath(post)}>
                        {post.title || "Untitled post"}
                      </Link>
                    </h3>
                    {post.excerpt && <p>{post.excerpt}</p>}
                  </div>
                  <Link
                    to={postPath(post)}
                    className="latest-blog-list__arrow"
                    aria-label={`Read ${post.title || "untitled post"}`}
                  >
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-sm text-ink/60">
          No published posts yet. New writing will appear here.
        </p>
      )}

      {unavailable && latestPosts.length > 0 && (
        <p className="mt-3 text-xs text-ink/50" role="status">
          Showing saved posts. New posts could not be loaded just now.
        </p>
      )}
    </section>
  );
}

function PostMeta({ post }: { post: BlogPostSummary }) {
  const date = getFormattedDate(post.createdAt);

  return (
    <div className="latest-blog-meta">
      <span>{post.category || "Article"}</span>
      <span aria-hidden="true">·</span>
      <CalendarDays
        size={12}
        aria-hidden="true"
      />
      {date ? (
        <time dateTime={post.createdAt}>{date}</time>
      ) : (
        <span>Date unavailable</span>
      )}
    </div>
  );
}

function getTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getFormattedDate(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "";

  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function postPath(post: BlogPostSummary) {
  return `/blog/${encodeURIComponent(post.slug || post.id)}`;
}
