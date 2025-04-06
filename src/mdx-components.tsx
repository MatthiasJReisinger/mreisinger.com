import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => <h2 className="pt-10 pb-5">{children}</h2>,
    h3: ({ children }) => <h3 className="pt-5 pb-3">{children}</h3>,
    ...components,
  };
}
