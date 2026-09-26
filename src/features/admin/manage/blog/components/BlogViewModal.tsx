import type { BlogPost } from "@/features/public/blog/types/blog";
import { Modal } from "@/shared/components/ui";
import BlogArticle from "@/features/public/blog/components/BlogArticle";

interface Props {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}
export default function BlogViewModal({ post, isOpen, onClose }: Props) {
  if (!post) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Blog Preview"
      size="lg"
    >
      <BlogArticle
        post={post}
        preview
      />
    </Modal>
  );
}
