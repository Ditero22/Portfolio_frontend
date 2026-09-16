import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getBlogPostBySlug } from "../services/blog.service";
import type { BlogPost as BlogPostType } from "../types/blog";

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostType | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      const data = await getBlogPostBySlug(slug);
      setPost(data);
      setIsLoading(false);
    }

    loadPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl text-sm text-white/40">
        Loading post...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Link
          to="/blog"
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← Back to Blog
        </Link>

        <h1
          className="mt-8 text-4xl text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Blog post not found
        </h1>
      </div>
    );
  }

  const date = new Date(post.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <article className="mx-auto w-full max-w-3xl">
      <Link
        to="/blog"
        className="text-sm text-white/50 transition hover:text-white"
      >
        ← Back to Blog
      </Link>

      <div className="mt-8">
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/40">
            {date}
          </span>

          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-white/50">
            {post.category}
          </span>
        </div>

        <h1
          className="mt-5 text-4xl text-white md:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {post.title}
        </h1>

        <p className="mt-4 text-base leading-7 text-white/55">
          {post.excerpt}
        </p>

        <div className="mt-8 border-t border-white/10 pt-8">
          <div className="whitespace-pre-line text-sm leading-7 text-white/70">
            {post.content}
          </div>
        </div>
      </div>
    </article>
  );
}

export default BlogPost;