import { Eye, Pencil, Trash2 } from "lucide-react";

import { Table } from "@/shared/components/ui";
import type { BlogPost } from "@/features/public/blog/types/blog";

interface BlogTableProps {
  posts: BlogPost[];
  onView: (post: BlogPost) => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
}

function BlogTable({ posts, onView, onEdit, onDelete }: BlogTableProps) {
  const columns = [
    {
      key: "image",
      label: "Image",
      render: (post: BlogPost) =>
        post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            loading="lazy"
            className="h-12 w-20 rounded object-cover"
          />
        ) : (
          <span className="text-ink/50">No image</span>
        ),
    },
    {
      key: "title",
      label: "Title",
      render: (post: BlogPost) => (
        <span className="text-ink">{post.title}</span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (post: BlogPost) => (
        <span className="text-ink/60">{post.category}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (post: BlogPost) => (
        <span className={post.published ? "text-ink" : "text-ink/40"}>
          {post.published ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (post: BlogPost) => (
        <span className="text-ink/60">
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (post: BlogPost) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView(post)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink/40 transition hover:bg-ink/[0.06] hover:text-ink"
            aria-label={`View ${post.title}`}
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            onClick={() => onEdit(post)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink/40 transition hover:bg-ink/[0.06] hover:text-ink"
            aria-label={`Edit ${post.title}`}
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(post)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink/40 transition hover:bg-ink/[0.06] hover:text-red-400"
            aria-label={`Delete ${post.title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={posts}
      getRowKey={(post) => post.id}
      emptyMessage="No blog posts found."
    />
  );
}

export default BlogTable;
