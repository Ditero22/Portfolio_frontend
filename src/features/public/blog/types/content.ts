export type Alignment = "left" | "center" | "right";
export type TextStyle = "paragraph" | "lead" | "heading";
export type BlogBlock =
  | {
      id: string;
      type: "text";
      text: string;
      alignment: Alignment;
      style?: TextStyle;
    }
  | {
      id: string;
      type: "image";
      src: string;
      alt: string;
      caption: string;
      alignment: Alignment;
      width: "small" | "medium" | "full";
    }
  | {
      id: string;
      type: "featured-image";
      alt: string;
      caption: string;
      alignment: Alignment;
      width: "small" | "medium" | "full";
    }
  | {
      id: string;
      type: "quote";
      text: string;
      citation: string;
      alignment: Alignment;
    }
  | {
      id: string;
      type: "link";
      text: string;
      href: string;
      appearance: "inline" | "button" | "card";
      alignment: Alignment;
    }
  | {
      id: string;
      type: "embed";
      url: string;
      caption: string;
      alignment: Alignment;
    };

const format = "portfolio-blocks-v1";
const alignments = ["left", "center", "right"];

export function isBlock(value: unknown): value is BlogBlock {
  if (!value || typeof value !== "object") return false;
  const block = value as Record<string, unknown>;
  if (
    typeof block.id !== "string" ||
    !alignments.includes(String(block.alignment))
  )
    return false;
  if (block.type === "text") {
    return (
      typeof block.text === "string" &&
      (block.style === undefined ||
        ["paragraph", "lead", "heading"].includes(String(block.style)))
    );
  }
  if (block.type === "quote")
    return typeof block.text === "string" && typeof block.citation === "string";
  if (block.type === "link")
    return (
      typeof block.text === "string" &&
      typeof block.href === "string" &&
      ["inline", "button", "card"].includes(String(block.appearance))
    );
  if (block.type === "embed")
    return typeof block.url === "string" && typeof block.caption === "string";
  if (block.type !== "image" && block.type !== "featured-image") return false;
  return (
    typeof block.alt === "string" &&
    typeof block.caption === "string" &&
    ["small", "medium", "full"].includes(String(block.width)) &&
    (block.type === "featured-image" || typeof block.src === "string")
  );
}

// Keep the existing content column and read legacy plain-text articles unchanged.
export function parseContent(content: string): BlogBlock[] {
  try {
    const document = JSON.parse(content);
    if (
      document?.format === format &&
      Array.isArray(document.blocks) &&
      document.blocks.every(isBlock)
    )
      return document.blocks;
  } catch {
    /* Plain text is the original content format. */
  }
  return [
    {
      id: "legacy-featured",
      type: "featured-image",
      alt: "",
      caption: "",
      alignment: "center",
      width: "full",
    },
    { id: "legacy-text", type: "text", text: content, alignment: "left" },
  ];
}

export function serializeContent(blocks: BlogBlock[]): string {
  return JSON.stringify({ format, blocks });
}

export function safeMediaUrl(
  value: string | null | undefined,
  allowPreview = false,
): string | undefined {
  if (!value) return undefined;
  if (allowPreview && value.startsWith("blob:")) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? value : undefined;
  } catch {
    return undefined;
  }
}
