# AGENTS.md

## 1) Mission

ReviewBridge is a lean validation prototype for small service businesses. The goal is to help businesses capture private customer feedback before negative public reviews occur.

This repository exists to test problem-solution fit and willingness to pay, not to build a full reputation-management platform.

## 2) Build Priorities

When implementing changes, optimize for:

- Clarity
- Speed of shipping
- Small scope
- Demoability with real business owners
- Maintainability for a tiny team
- Simple, understandable UX

Default to the simplest working approach.

## 3) Non-Goals

Avoid introducing:

- Overbuilt systems
- Speculative architecture
- Enterprise abstractions
- Unnecessary dependencies
- Features outside MVP scope
- Premature optimization

If a decision increases complexity without improving validation speed or learning, do not do it.

## 4) MVP Product Boundaries

Allowed initial functional scope:

- Landing page
- Feedback flow (Great / Okay / Not Good)
- Private feedback submission path
- Email notification to business owner
- Simple business-facing view (minimal dashboard)

Anything beyond this scope requires explicit instruction.

## 5) Architecture Guidance

- Keep the file structure simple and easy to navigate
- Prefer straightforward implementation patterns over abstraction layers
- Favor readability over cleverness
- Use minimal dependencies
- Do not add background jobs, queues, or event-driven systems unless explicitly required
- Do not design for scale before validation proves demand

Choose boring, predictable solutions first.

## 6) UX Guidance

The interface should feel:

- Calm
- Simple
- Trustworthy
- Not overly corporate
- Not cluttered

The product should communicate:

- Conversation
- Bridge
- Early feedback
- Resolution before escalation

Favor clear language and low cognitive load over visual complexity.

## 7) Coding Guardrails

- Do not add features that were not requested
- Do not rename major product concepts without strong reason
- Do not invent platform complexity
- Keep components small and understandable
- Prefer incremental, reversible changes
- Explain tradeoffs when making structural decisions

When uncertain, choose the option that keeps the prototype easier to demo and modify.

## 8) Git Identity

This repository uses Jacob Langley's personal GitHub identity at the repo level.

- GitHub account: `jacobnlangley`
- Git user.name: `jacobnlangley`
- Git user.email: `jacob.n.langley@gmail.com`
- Expected remote owner: `jacobnlangley` (for example, `https://github.com/jacobnlangley/ReviewBridge`)

Do not use `fullh3art` credentials in this repository.

## 9) Definition of Done

For early iterations, work is done when:

- The core flow works end-to-end
- The screens are understandable to non-technical users
- The product can be shown to a real business owner
- The repository remains easy to iterate on

Done does not mean feature-complete; done means useful for validation.
