import type { Rule } from './rules';

type Link = {
  readonly href: string;
  readonly label: string;
};

type ArchitectureDocument = {
  readonly rules: readonly Rule[];
  readonly folders: readonly string[];
  readonly links: readonly Link[];
};

const escapeHtml = (text: string): string =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const conditionList = (conditions: readonly string[]): string =>
  conditions.map((condition) => `<code>${escapeHtml(condition)}</code>`).join('<br />');

const ruleRow = ({ name, comment, from, to }: Rule): string =>
  `<tr><td><code>${escapeHtml(name)}</code></td><td>${escapeHtml(comment)}</td><td>${conditionList(from)}</td><td>${conditionList(to)}</td></tr>`;

const folderItem = (folder: string): string => `<li><code>${escapeHtml(folder)}</code></li>`;

const linkItem = ({ href, label }: Link): string => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`;

const renderPage = ({ rules, folders, links }: ArchitectureDocument): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Untracked Maps architecture</title>
<style>
body { font-family: system-ui, sans-serif; max-width: 72rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; vertical-align: top; }
img { max-width: 100%; }
</style>
</head>
<body>
<h1>Untracked Maps architecture</h1>
<p>Generated from the code at each release.</p>
<ul>${links.map(linkItem).join('')}</ul>
<h2>Dependencies</h2>
<img src="dependencies.svg" alt="Dependencies between routes, features, abilities and libraries" />
<h2>Allowed folders</h2>
<ul>${folders.map(folderItem).join('')}</ul>
<h2>Dependency rules</h2>
<table>
<thead><tr><th>Rule</th><th>Why</th><th>From</th><th>To</th></tr></thead>
<tbody>${rules.map(ruleRow).join('')}</tbody>
</table>
</body>
</html>
`;

export { renderPage };
