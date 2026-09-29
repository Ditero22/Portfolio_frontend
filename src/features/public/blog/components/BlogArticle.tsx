import DOMPurify from "dompurify";
import type { BlogPostForm } from "../types/blog";
import { parseContent, safeMediaUrl } from "../types/content";

interface Props {
  post: BlogPostForm & { createdAt?: string };
  preview?: boolean;
}

function embedUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be")
      return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    if (["www.youtube.com", "youtube.com"].includes(url.hostname)) {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;
    }
    if (url.hostname === "vimeo.com" && /^\/\d+$/.test(url.pathname))
      return `https://player.vimeo.com/video${url.pathname}`;
  } catch {
    /* Invalid embeds render an editor message only. */
  }
  return undefined;
}

const richTextOptions = {
  ALLOWED_TAGS: ["strong", "b", "em", "i", "u", "br"],
  ALLOWED_ATTR: [],
};

function richText(value: string) {
  const formatted = /<\/?[a-z][\s\S]*>/i.test(value)
    ? value
    : value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
        .replace(/\+\+([\s\S]+?)\+\+/g, "<u>$1</u>");
  return DOMPurify.sanitize(formatted, richTextOptions);
}

export default function BlogArticle({ post, preview = false }: Props) {
  const blocks = parseContent(post.content);
  const link = safeMediaUrl(post.link);
  return (
    <article className="min-w-0 space-y-6 break-words">
      <div className="flex flex-wrap items-center gap-3 text-xs text-ink/60">
        {post.createdAt && (
          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
        {post.category && (
          <span className="rounded-full border border-ink/20 px-2 py-1">
            {post.category}
          </span>
        )}
        {preview && (
          <span>
            {post.published ? "Published" : "Draft · only visible to you"}
          </span>
        )}
      </div>
      <h1 className="text-4xl text-ink md:text-5xl">
        {post.title || "Untitled post"}
      </h1>
      <p className="text-base leading-7 text-ink/70">{post.excerpt}</p>
      <div className="space-y-6 border-t border-ink/15 pt-6">
        {blocks.map((block) => {
          if (block.type === "text") {
            if (block.style === "heading")
              return (
                <h2
                  key={block.id}
                  style={{ textAlign: block.alignment }}
                  className="whitespace-pre-wrap text-3xl text-ink"
                  dangerouslySetInnerHTML={{ __html: richText(block.text) }}
                />
              );
            return (
              <p
                key={block.id}
                style={{ textAlign: block.alignment }}
                className={`whitespace-pre-wrap text-ink/80 ${block.style === "lead" ? "text-lg leading-8" : "text-sm leading-7"}`}
                dangerouslySetInnerHTML={{ __html: richText(block.text) }}
              />
            );
          }
          if (block.type === "quote")
            return (
              <blockquote
                key={block.id}
                style={{ textAlign: block.alignment }}
                className="border-l-2 border-ink/40 pl-5 text-xl italic leading-8 text-ink/85"
              >
                <p>“{block.text}”</p>
                {block.citation && (
                  <cite className="mt-3 block text-sm not-italic text-ink/60">
                    — {block.citation}
                  </cite>
                )}
              </blockquote>
            );
          if (block.type === "link") {
            const href = safeMediaUrl(block.href);
            if (!href) return null;
            const classes =
              block.appearance === "button"
                ? "inline-block rounded-md bg-ink px-4 py-2 text-sm text-paper"
                : block.appearance === "card"
                  ? "block rounded-md border border-ink/20 p-4 text-sm text-ink hover:bg-ink/5"
                  : "text-sm text-ink underline underline-offset-4";
            return (
              <div
                key={block.id}
                style={{ textAlign: block.alignment }}
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes}
                >
                  {block.text || href} ↗
                </a>
              </div>
            );
          }
          if (block.type === "embed") {
            const src = embedUrl(block.url);
            if (!src)
              return preview ? (
                <p
                  key={block.id}
                  className="rounded-md border border-dashed border-ink/20 p-4 text-sm text-ink/60"
                >
                  Paste a public YouTube or Vimeo link to display this embed.
                </p>
              ) : null;
            return (
              <figure
                key={block.id}
                style={{
                  marginLeft: block.alignment === "left" ? 0 : "auto",
                  marginRight: block.alignment === "right" ? 0 : "auto",
                }}
                className="max-w-3xl"
              >
                <div className="aspect-video overflow-hidden rounded-md border border-ink/10">
                  <iframe
                    className="h-full w-full"
                    src={src}
                    title={block.caption || "Embedded media"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                {block.caption && (
                  <figcaption className="mt-2 text-center text-xs text-ink/60">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          const src = safeMediaUrl(
            block.type === "featured-image" ? post.imageUrl : block.src,
            preview,
          );
          if (!src) return null;
          return (
            <figure
              key={block.id}
              style={{
                width:
                  block.width === "small"
                    ? "40%"
                    : block.width === "medium"
                      ? "70%"
                      : "100%",
                marginLeft: block.alignment === "left" ? 0 : "auto",
                marginRight: block.alignment === "right" ? 0 : "auto",
              }}
            >
              <img
                src={src}
                alt={block.alt || post.title}
                className="h-auto w-full rounded-md border border-ink/10"
              />
              {block.caption && (
                <figcaption className="mt-2 text-center text-xs text-ink/60">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-ink underline underline-offset-4"
        >
          Visit related link ↗
        </a>
      )}
    </article>
  );
}
