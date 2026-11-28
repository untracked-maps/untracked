---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Architecture decisions recorded in MADR, and checked by tools

## Context and Problem Statement

The repository had grown, in two weeks, to seventy-nine records of decisions in a format of its own. Many described what the app does for its users rather than how it is built, several restated or refined one another, some contradicted the code or each other, and a dated update was added at the bottom of a record whenever a later change touched it. Nothing checked their shape beyond a unique number. A reader could no longer tell which record held, and a writer could no longer tell what belonged in one.

How should decisions be recorded, so that each one stays true, says only what the architecture decided, and keeps its shape without a reviewer?

## Decision Drivers

- A record says what is costly to reverse in the structure of the code, never what the app does for its users.
- A reader finds the decision that holds without reading the others.
- A tool, not a reviewer, keeps the shape of every record.
- A known format, so that people and tools from outside the project read it.

## Considered Options

- MADR, every former record rewritten into a smaller set, checked by mdbook-lint and markdownlint
- The former format of the repository, kept and pruned
- Michael Nygard's format, written with adr-tools
- MADR without any check

## Decision Outcome

Chosen option: « MADR, every former record rewritten into a smaller set, checked by mdbook-lint and markdownlint », because MADR is the most used structured format of records, its sections force the options set aside and the consequences to be written, and two maintained tools check it.

### What a record covers

A record covers architecture only: the structure of the code, its non-functional qualities, its dependencies, its interfaces, its construction techniques, and what would be costly to reverse. Business rules are the scenarios of the abilities, and what a screen shows is its stories: a record may point to them, never restate them. An architecture rule never bears on a business scenario. How to contribute, commit or merge lives in the contributing guide.

### How a record is written

One decision per record, in English, after the MADR template of the repository. No name of code and no path in the text, no dated update in the body, references only to records with a lower number, no figure that drifts. A decision whose target is not reached describes the current state, then names the issue that reaches it.

### One rewriting, then records that accumulate

The former records were all deleted and their decisions rewritten from scratch, merged where they overlapped, settled where they contradicted each other, and moved to the scenarios, the stories or the contributing guide where they were not architecture. From then on, a new decision is a new record, and a record that a later one replaces is marked as superseded rather than edited.

### Records numbered on four digits in their own folder

Records live in the folder of decisions, named after MADR's convention: four digits, then the title with dashes. The numbering starts again at one, so that a number cited in an older commit or issue never designates a rewritten record.

### Consequences

- Good, because a reader finds one record per decision, and each states the options it set aside.
- Good, because the shape of every record is checked on each commit and in CI, without a reviewer.
- Good, because behaviour has a single home, the scenarios and the stories, which the tests play.
- Bad, because the former records are gone from the tree: their history is only in Git, and the numbers cited by older commits, issues and pull requests point nowhere.
- Bad, because mdbook-lint is a Rust tool: the hooks build it once on each machine before its first run.
- Neutral, because the checks do not read the meaning of a record: whether it covers architecture only is still a matter of review.

### Confirmation

The commit hooks and CI run mdbook-lint with every MADR rule, warnings included, and markdownlint without a limit on the length of lines, on every record of the folder.

## Pros and Cons of the Options

### The former format of the repository, kept and pruned

It kept the history of every record in the tree. Its sections did not ask for the options set aside nor for the consequences, so records kept mixing decisions with behaviour, and no tool knew its shape.

### Michael Nygard's format, written with adr-tools

The first and simplest format of records, with a tool that creates and links them. Its free sections ask neither for the options set aside nor for the drivers, and adr-tools is no longer maintained.

### MADR without any check

The right format, but nothing would keep its shape: the drift that led to this rewriting would start again.

## More Information

### Where to find the detail

- [The rules of writing and the template](README.md)

### References

- [MADR](https://adr.github.io/madr/)
- [mdbook-lint](https://github.com/joshrotenberg/mdbook-lint)
- [markdownlint](https://github.com/DavidAnson/markdownlint-cli2)
- [Architecture decision records](https://github.com/joelparkerhenderson/architecture-decision-record)

### History

- 2026-11-28, marc-gavanier: first writing.
