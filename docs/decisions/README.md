# Architecture decisions

This folder records the architecture decisions of the repository, in the [MADR](https://adr.github.io/madr/) format. They are written in English.

## Write a decision

Copy [`adr-template.md`](adr-template.md) to `NNNN-title-with-dashes.md`, numbered after the last decision on four digits, then replace each instruction with the content. The headings and the status values are MADR's, so that the checks recognise them. Remove the optional sections that serve nothing.

The commit hooks and CI check the decisions with [mdbook-lint](https://github.com/joshrotenberg/mdbook-lint) and its MADR rules (front matter, status, date, required sections, considered options, numbering, links between decisions, consequences in « Good, because… », « Bad, because… », « Neutral, because… »), then with [markdownlint](https://github.com/DavidAnson/markdownlint-cli2), without a limit on the length of lines.

## What a decision covers

A decision covers architecture only: the structure of the code, its non-functional qualities, its dependencies, its interfaces, its construction techniques, and what would be costly to reverse.

- What the app does for its users is not a decision: business rules are the scenarios of the abilities (`*.ability.md`), which the tests play; what a screen shows is its Storybook stories. A decision may point to them; it never restates them.
- An architecture rule never bears on a business scenario.
- How to contribute, commit, review or merge lives in the [contributing guide](../../CONTRIBUTING.md), not in a decision.
- One decision per record. When a record needs « and » in its title, it is probably two.

## How a decision is written

- **No code names**: no function, file or line, no path in the text. Only the links of « More Information » point into the repository.
- **No log**: no dated update in the body. Git keeps the details; the history lists only the writings and revisions of the record, and the front matter carries the date of the last one.
- **References to the past only**: a decision cites only decisions with a lower number. The newer record cites the older one it completes or replaces.
- **A target not reached yet**: describe the current state, then the target and the issue that reaches it, as « Target, tracked by #N ».
- **No figures that drift**: no count of files, lines or occurrences, no measure that a later change will make false, except the figures that grounded the decision.
