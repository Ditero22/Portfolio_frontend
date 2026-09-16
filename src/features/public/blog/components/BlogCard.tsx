import type { BlogPost } from "../types/blog";
import { Link } from "react-router-dom";

interface BlogCardProps {
  post: BlogPost;
}

function BlogCard({ post }: BlogCardProps) {
  const date = new Date(post.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <article className="group rounded-md border border-white/10 bg-white/[0.02] p-5 transition duration-200 hover:border-white/20 hover:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-white/40">
          {date}
        </span>

        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-white/50">
          {post.category}
        </span>
      </div>

      <h2
        className="mt-4 text-2xl text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {post.title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-white/55">
        {post.excerpt}
      </p>

      <Link
        to={`/blog/${post.slug}`}
        className="mt-5 block text-xs text-white/40 transition group-hover:text-white/70"
      >
        Read →
      </Link>
    </article>
  );
}

export default BlogCard;