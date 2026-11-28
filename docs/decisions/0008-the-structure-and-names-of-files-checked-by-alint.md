---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# The structure and names of files checked by alint

## Context and Problem Statement

The layout of features and abilities ([0006](0006-features-and-abilities-on-a-hexagonal-core.md)) says where each kind of file goes: adapters under a folder per technique, components and pages under the interface, presenters, scenarios and their steps beside their ability. dependency-cruiser bounds what each file imports ([0007](0007-imports-bounded-by-dependency-cruiser.md)), but not where a file lies nor how it is named.

folderslint checks that every file the repository tracks lies in an allowed folder. It knows only paths of folders: it cannot say which kind of file a folder accepts, require a file beside another, refuse a file at the root of a folder meant for folders only, or check the shape of a name beyond what the linter checks for the case of file names. Only review catches a file in the wrong place or with a misleading name.

Which tool keeps the structure and the names of files, so that a file in the wrong place or with the wrong name fails without a reviewer?

## Decision Drivers

- A rule that a tool can check goes in the tool, not in an instruction.
- The strictest default: what is not provided for is refused.
- The rules read as data, in one file.
- A maintained tool rather than a script of the project.

## Considered Options

- alint, each rule switched on once the code complies
- folderslint
- Conventions and review
- A script of the project

## Decision Outcome

Chosen option: « alint, each rule switched on once the code complies », because it checks folders, kinds of files and the shape of names from one file of rules, where folderslint checks folders only.

### Each file has its kind, in its place

The name of a file says its role, and each folder accepts only its kinds: a presenter among presenters, an adapter in the folder of its technique, a component or a page in the interface.

### Names follow one shape per folder

Folders follow one case, and the files of each folder follow the shape expected there.

### A folder of folders holds no file

A folder that groups other folders, such as the adapters by technique or the abilities of a feature, holds no file at its root: a file put there has no planned place, and is refused.

### Switched on rule by rule

Today folderslint checks the folders of every tracked file, and Biome the case of file names. alint replaces folderslint, and each of its rules is switched on once the code complies with it, so that no rule is turned on with exceptions waiting to be fixed. Target, tracked by #148.

### Consequences

- Good, because the structure no longer depends on review: a file out of place fails on commit and in CI.
- Good, because the rules read in one file, beside the code.
- Good, because a file created in the wrong place is stopped at once, before any review.
- Bad, because alint is a young tool: some of its checks of case may have to be written as patterns.
- Bad, because every new kind of file needs a change of the rules before the code.

### Confirmation

The check of the structure runs on each commit and in CI. Each rule is proven by creating, on purpose, a file or a folder in a place it refuses.

## Pros and Cons of the Options

### folderslint

The current tool, simple and reliable for allowed folders. It knows neither the kinds of files a folder accepts nor the shape of their names, and cannot refuse a file at the root of a folder of folders.

### Conventions and review

What holds beyond folderslint today. The review of a large change lets a misplaced file through, and nothing stops it before review.

### A script of the project

It would check exactly what the project wants, but it is a tool to write, test and maintain, which others already maintain.

## More Information

### Where to find the detail

- [The layout checked today](../../.folderslintrc)

### References

- [alint](https://github.com/asamarts/alint)
- [folderslint](https://github.com/denisraslov/folderslint)

### History

- 2026-11-28, marc-gavanier: first writing.
