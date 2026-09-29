import { Eye, Pencil, Trash2 } from "lucide-react";

import { AdminIconAction, AdminStatusBadge, Table } from "@/shared/components/ui";
import type { BlogPost } from "@/features/public/blog/types/blog";

interface BlogTableProps {
  posts: BlogPost[];
  emptyMessage: string;
  onView: (post: BlogPost) => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BlogTable({
  posts,
  emptyMessage,
  onView,
  onEdit,
  onDelete,
}: BlogTableProps) {
  return (
    <Table<BlogPost>
      ariaLabel="Blog posts"
      data={posts}
      emptyMessage={emptyMessage}
      mobileEmptyMessage={emptyMessage}
      getRowKey={(post) => post.id}
      minWidthClassName="min-w-[780px]"
      columns={[
        {
          key: "image",
          label: "Image",
          headerClassName: "w-24",
          cellClassName: "w-24",
          render: (post) =>
            post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt={post.title}
                loading="lazy"
                className="h-12 w-20 rounded-lg object-cover"
              />
            ) : (
              <span className="text-ink/50">No image</span>
            ),
        },
        {
          key: "title",
          label: "Title",
          headerClassName: "w-[28%]",
          cellClassName: "max-w-[22rem] whitespace-normal break-words [overflow-wrap:anywhere]",
          render: (post) => <span className="text-ink">{post.title}</span>,
        },
        {
          key: "category",
          label: "Category",
          headerClassName: "w-32",
          cellClassName: "max-w-40 whitespace-normal break-words [overflow-wrap:anywhere]",
          render: (post) => <span className="text-ink/60">{post.category}</span>,
        },
        {
          key: "status",
          label: "Status",
          headerClassName: "w-28",
          render: (post) => (
            <AdminStatusBadge variant={post.published ? "public" : "quiet"}>
              {post.published ? "Published" : "Draft"}
            </AdminStatusBadge>
          ),
        },
        {
          key: "date",
          label: "Date",
          headerClassName: "w-32",
          cellClassName: "whitespace-nowrap",
          render: (post) => (
            <time className="text-ink/60" dateTime={post.createdAt}>
              {formatDate(post.createdAt)}
            </time>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          headerClassName: "w-32 text-center",
          cellClassName: "whitespace-nowrap",
          render: (post) => (
            <div className="flex items-center justify-center gap-1">
              <AdminIconAction
                icon={<Eye size={16} aria-hidden="true" />}
                label={`View ${post.title}`}
                title="View post"
                hasDialog
                onClick={() => onView(post)}
              />
              <AdminIconAction
                icon={<Pencil size={16} aria-hidden="true" />}
                label={`Edit ${post.title}`}
                title="Edit post"
                hasDialog
                onClick={() => onEdit(post)}
              />
              <AdminIconAction
                icon={<Trash2 size={16} aria-hidden="true" />}
                label={`Delete ${post.title}`}
                title="Delete post"
                variant="danger"
                hasDialog
                onClick={() => onDelete(post)}
              />
            </div>
          ),
        },
      ]}
      renderMobileItem={(post) => (
        <article className="rounded-2xl border border-ink/12 bg-surface p-4 shadow-sm">
          <div className="flex gap-3">
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt=""
                loading="lazy"
                className="h-16 w-20 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-[10px] text-ink/45">
                No image
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 break-words font-semibold leading-5 text-ink">
                {post.title}
              </h2>
              <p className="mt-1 break-words text-xs text-ink/55">
                {post.category}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <AdminStatusBadge
                  variant={post.published ? "public" : "quiet"}
                >
                  {post.published ? "Published" : "Draft"}
                </AdminStatusBadge>
                <time
                  className="text-[10px] text-ink/45"
                  dateTime={post.createdAt}
                >
                  {formatDate(post.createdAt)}
                </time>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 border-t border-ink/10 pt-2">
            <button
              type="button"
              onClick={() => onView(post)}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-xs font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-500"
              aria-label={`View ${post.title}`}
              title="View post"
              aria-haspopup="dialog"
            >
              <Eye size={15} aria-hidden="true" />
              View
            </button>
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-xs font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-teal-500"
              aria-label={`Edit ${post.title}`}
              title="Edit post"
              aria-haspopup="dialog"
            >
              <Pencil size={15} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(post)}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-xs font-medium text-red-600/75 transition hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-500"
              aria-label={`Delete ${post.title}`}
              title="Delete post"
              aria-haspopup="dialog"
            >
              <Trash2 size={15} aria-hidden="true" />
              Delete
            </button>
          </div>
        </article>
      )}
    />
  );
}

export default BlogTable;
