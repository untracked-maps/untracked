---
status: "{proposed | rejected | accepted | deprecated | superseded by ADR-NNNN}"
date: YYYY-MM-DD
decision-makers:
  - GitHub handle
---

# Short title that states the problem solved and the option chosen

## Context and Problem Statement

The problem and the constraints that weighed on it, as they stood when the decision was taken. Cite the earlier decisions it depends on. Keep only the figures that weighed on the choice.

## Decision Drivers

Optional. The forces that set the options apart, one per line.

## Considered Options

- Name of the chosen option
- Name of another option

## Decision Outcome

Chosen option: « Name of the chosen option », because … One or two sentences that state the decision as a whole, then one subsection per rule.

### First rule of the decision

The rule and its reason, in terms of architecture, without naming code. When the target is not reached: the current state, then « Target, tracked by #N ».

### Consequences

- Good, because what the decision makes possible.
- Bad, because what it costs. Known limits and targets not reached go here, without a schedule.
- Neutral, because what it changes without gain or loss (optional).

### Confirmation

Optional. How compliance is checked: a linter, a test, a review.

## Pros and Cons of the Options

### Name of another option

What it offered and why it was set aside, in a few sentences. One subsection per option really considered.

## More Information

### Where to find the detail

Links to the abilities whose scenarios describe each behaviour, and to the configuration that enforces the decision.

### References

External documentation (APIs, standards, RFCs), earlier decisions, conventions of the repository. One link per line.

### History

- YYYY-MM-DD, GitHub handle: first writing.
