import type { ResourceGroup } from "../types/resource";

export const resourceGroups: ResourceGroup[] = [
  {
    title: "Web development",
    description:
      "Documentation and courses I return to while building for the web.",
    resources: [
      {
        title: "MDN Web Docs",
        description:
          "Practical guides and references for HTML, CSS, JavaScript, and browser APIs.",
        href: "https://developer.mozilla.org/en-US/docs/Web",
        label: "Web platform",
        bestFor: "HTML, CSS, JavaScript, and browser API references",
      },
      {
        title: "React Learn",
        description:
          "The official React learning path for components, state, events, and more.",
        href: "https://react.dev/learn",
        label: "React",
        bestFor: "Learning React components, state, and events",
      },
      {
        title: "TypeScript Handbook",
        description:
          "Clear documentation for writing safer JavaScript with TypeScript.",
        href: "https://www.typescriptlang.org/docs/",
        label: "TypeScript",
        bestFor: "Writing safer JavaScript with TypeScript",
      },
      {
        title: "DevDocs",
        description:
          "A fast, searchable reference that keeps developer documentation in one place.",
        href: "https://devdocs.io/",
        label: "Reference",
        bestFor: "Quick, searchable API references",
      },
      {
        title: "Feather Icons",
        description:
          "A clean set of open-source icons I can use in interfaces and projects.",
        href: "https://feathericons.com/",
        label: "Icons",
        bestFor: "Simple, consistent icons for interface design",
      },
      {
        title: "Udemy",
        description:
          "Courses and guided lessons I use to keep building new skills.",
        href: "https://www.udemy.com/",
        label: "Courses",
        bestFor: "Structured courses and guided lessons",
      },
    ],
  },
  {
    title: "Networking",
    description: "Hands-on resources for learning the foundations of networks.",
    resources: [
      {
        title: "Cisco Skills for All",
        description:
          "Free learning resources and Packet Tracer labs for practicing networking concepts.",
        href: "https://www.skillsforall.com/",
        label: "Networking",
        bestFor: "Free networking lessons and Packet Tracer labs",
      },
      {
        title: "Packet Tracer",
        description:
          "A network simulation tool for experimenting with routers, switches, and topologies.",
        href: "https://www.skillsforall.com/resources/lab-downloads",
        label: "Practice",
        bestFor: "Practicing network topologies and device configuration",
      },
      {
        title: "ChatGPT",
        description:
          "A learning companion I use to discuss Packet Tracer exercises, questions, and networking concepts as I practice.",
        href: "https://chatgpt.com/",
        label: "Study partner",
        bestFor: "Discussing Packet Tracer exercises and networking concepts",
      },
    ],
  },
  {
    title: "Build and ship",
    description: "Tools that help turn ideas into working projects.",
    resources: [
      {
        title: "GitHub Docs",
        description:
          "Guides for version control, repositories, collaboration, and shipping code.",
        href: "https://docs.github.com/",
        label: "Version control",
        bestFor: "Git workflows, repositories, and collaboration",
      },
      {
        title: "Vite Guide",
        description:
          "Fast setup and documentation for modern frontend projects.",
        href: "https://vite.dev/guide/",
        label: "Tooling",
        bestFor: "Setting up modern frontend tooling",
      },
    ],
  },
  {
    title: "Video learning",
    description:
      "Tutorial videos I practice alongside my own projects and exercises.",
    resources: [
      {
        title: "YouTube",
        description:
          "Tutorial practice for Java, React, advanced networking, Node and Express, Drizzle and Prisma, and Supabase.",
        href: "https://www.youtube.com/",
        label: "Tutorials",
        bestFor: "Hands-on tutorials across development topics",
      },
    ],
  },
];
