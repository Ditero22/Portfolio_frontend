import { useEffect, useState } from "react";

import BlogCard from "../components/BlogCard";
import { getBlogPosts } from "../services/blog.service";
import type { BlogPost } from "../types/blog";

function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getBlogPosts();
        setPosts(data);
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, []);

  return (
    <main className="flex min-h-[calc(100dvh-3rem)] justify-center pt-10 md:min-h-screen md:pt-14">
      <div className="w-full max-w-2xl">
        <header className="mb-8">
          <h1
            className="text-4xl text-white md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Blog
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
            Thoughts, notes, and things I learn while building
            projects and exploring technology.
          </p>
        </header>

        {isLoading ? (
          <div className="text-sm text-white/40">
            Loading posts...
          </div>
        ) : (
          <section className="flex flex-col gap-4">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default Blog;