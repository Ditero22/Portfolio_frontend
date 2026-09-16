export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  slug: string;
  imageUrl: string | null;
  link: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostForm {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  slug: string;
  imageUrl: string | null;
  link: string | null;
  published: boolean;
}