import type { Manifest, ManifestChunk } from 'vite';

type Imports = (chunk: ManifestChunk) => readonly string[];

const staticImports: Imports = (chunk) => chunk.imports ?? [];

const everyImport: Imports = (chunk) => [...(chunk.imports ?? []), ...(chunk.dynamicImports ?? [])];

const importsOf =
  (manifest: Manifest, imports: Imports) =>
  (key: string): readonly string[] => {
    const chunk = manifest[key];
    return chunk === undefined ? [] : imports(chunk);
  };

const reachedThrough =
  (next: (key: string) => readonly string[]) =>
  (frontier: readonly string[], seen: ReadonlySet<string>): ReadonlySet<string> => {
    const fresh = frontier.filter((key) => !seen.has(key));
    return fresh.length === 0 ? seen : reachedThrough(next)(fresh.flatMap(next), new Set([...seen, ...fresh]));
  };

const entries = (manifest: Manifest): readonly string[] =>
  Object.entries(manifest)
    .filter(([, chunk]) => chunk.isEntry === true)
    .map(([key]) => key);

const reachedFromEntries = (manifest: Manifest, imports: Imports): ReadonlySet<string> =>
  reachedThrough(importsOf(manifest, imports))(entries(manifest), new Set());

const filesOf = (manifest: Manifest, keys: Iterable<string>): readonly string[] =>
  [...keys].flatMap((key) => {
    const chunk = manifest[key];
    return chunk === undefined ? [] : [chunk.file];
  });

const startUpChunks = (manifest: Manifest): readonly string[] => filesOf(manifest, reachedFromEntries(manifest, staticImports));

const onDemandChunks = (manifest: Manifest): readonly string[] => {
  const startUp = reachedFromEntries(manifest, staticImports);
  return filesOf(
    manifest,
    [...reachedFromEntries(manifest, everyImport)].filter((key) => !startUp.has(key))
  );
};

export { onDemandChunks, startUpChunks };
