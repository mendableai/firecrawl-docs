declare module 'openapi-snippet' {
  export function getEndpointSnippets(
    spec: any,
    path: string,
    method: string,
    targets: string[],
    requestBody?: any
  ): {
    snippets: Array<{
      id: string;
      title: string;
      content: string;
    }>;
  };

  export function getSnippets(
    spec: any,
    targets: string[]
  ): {
    snippets: Array<{
      id: string;
      title: string;
      content: string;
    }>;
  };

  export const targets: string[];
}
