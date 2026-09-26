import { ArrowUpRight } from "lucide-react";
import { safeMediaUrl } from "../types/content";
import type { BlogPost } from "../types/blog";
import { Link } from "react-router-dom";

interface BlogCardProps {
  post: BlogPost;
}

function BlogCard({ post }: BlogCardProps) {
  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="design-card group relative overflow-hidden rounded-2xl border border-ink/15 bg-surface p-6">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-teal-500/60 via-teal-500/10 to-transparent"
      />
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2
          className="text-2xl text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Link
            to={`/blog/${post.slug}`}
            className="transition group-hover:text-ink/70"
          >
            {post.title}
          </Link>
        </h2>
        <time
          dateTime={post.createdAt}
          className="shrink-0 text-xs text-ink/40"
        >
          {date}
        </time>
      </header>
      {safeMediaUrl(post.imageUrl) && (
        <Link to={`/blog/${post.slug}`}>
          <img
            src={post.imageUrl!}
            alt={post.title}
            loading="lazy"
            className="mb-5 mt-4 aspect-video w-full rounded-xl object-cover"
          />
        </Link>
      )}
      <div className="flex justify-end">
        <span className="rounded-full border border-ink/10 px-2 py-1 text-[10px] uppercase tracking-wider text-ink/50">
          {post.category}
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-ink/55">{post.excerpt}</p>

      <Link
        to={`/blog/${post.slug}`}
        className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4 text-xs text-ink/60 transition group-hover:text-ink"
      >
        <span>Read article</span>
        <ArrowUpRight
          size={17}
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}

export default BlogCard;
