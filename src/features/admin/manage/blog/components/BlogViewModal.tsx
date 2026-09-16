import type { BlogPost } from "@/features/public/blog/types/blog";
import { Modal } from "@/shared/components/ui";

interface BlogViewModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

function BlogViewModal({
  post,
  isOpen,
  onClose,
}: BlogViewModalProps) {
  if (!post) {
    return null;
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Blog Preview"
      size="lg"
    >
      <article>
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
      </article>
    </Modal>
  );
}

export default BlogViewModal;