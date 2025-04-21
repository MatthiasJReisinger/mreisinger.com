import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => <h2 className="pt-10 pb-5">{children}</h2>,
    h3: ({ children }) => <h3 className="pt-5 pb-3">{children}</h3>,
    p: ({ children }) => <p className="pb-5">{children}</p>,
    ol: (props) => <ol className="list-decimal pl-6 mb-4" {...props} />,
    ul: (props) => <ul className="list-disc pl-6 mb-4" {...props} />,
    table: ({ children }) => (
      <table className="mx-auto mt-5 mb-10">{children}</table>
    ),
    th: ({ children }) => <th className="px-5 text-center">{children}</th>,
    blockquote: ({ children }) => (
      <blockquote className="pl-3 pt-3 mb-3 text-gray-500 border-l-2">
        {children}
      </blockquote>
    ),
    ...components,
  };
}
