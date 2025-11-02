# Git Commit Message Best Practices

Writing clear and consistent commit messages helps your team (and your future self) understand 
the history of a project and why changes were made. This guide outlines proven practices for crafting 
good commit messages.

---

## 1. Structure Your Commit Message

Use this format:

```
<project> <type>(optional scope): <short summary>

<detailed explanation>

<footer>
```

**Example:**
```
[WEB] feat(auth): add Firebase auth login system

Implements authentication with refresh tokens.
Includes middleware for token validation and expiration checks.

BREAKING CHANGE: Session-based login removed; migration guide in docs.
```

---

## 2. Use Project abbreviations in brackets

Helps with narrowing down the criteria.

Common types:

- `[WEB]` – Website
- `[CON]` – Console (user console)
- `[DSH]` – Dashboard
- `[LIB]` – Shared library
- `[WSP]` – Workspace (i.e. package.json, angular.json, etc)
- `[CLD]` – anything inside the functions/ folder. i,e, Firebase functions, Genkit flows

Optionally, add a **scope** in parentheses:  
`feat(ui)`, `fix(auth)`, etc.

---

## 3. Subject Line Guidelines

- **Length:** 50 characters or fewer.
- **Capitalization:** Capitalize the first letter.
- **No punctuation at the end:** Avoid periods at the end of the title.
- **Imperative mood:** Describe what the commit *does*, not what you did.
  - ✅ `Add user profile endpoint`
  - ❌ `Added user profile endpoint`
- **Focus on _what_ and _why_,** not the “how” (that’s for the body).

---

## 4. Use a Conventional Commit Type

Helps with automation, changelogs, and quick understanding.

Common types:

- `feat` – New feature
- `fix` – Bug fix
- `docs` – Documentation changes only
- `style` – Formatting, whitespace, or style changes (no code logic change)
- `refactor` – Code change that doesn’t fix a bug or add a feature
- `perf` – Performance improvement
- `test` – Adding or updating tests
- `chore` – Build tasks, package updates, configuration changes

Optionally, add a **scope** in parentheses:  
`feat(ui)`, `fix(auth)`, etc.

---

## 5. Writing the Commit Body

- Wrap lines at ~72 characters for readability in `git log`.
- Explain **why** you made the change and any important details.
- Mention related issues (`Closes #123`, `Refs #456`).
- Use bullet points if listing multiple changes.

---

## 6. Footer for Metadata

- **Breaking changes:** Start with `BREAKING CHANGE:` and explain clearly.
- **References:** Link issues, PRs, tickets.
- **Co-authors:** `Co-authored-by: Name <email>`

---

## 7. Commit Small, Commit Often

- Each commit should represent **a single logical change**.
- Avoid mixing unrelated changes in one commit.
- Stage and commit **only relevant changes**.

---


### ✅ Good Example
```
[LIB] fix(login): prevent crash when token is missing

Added null-check in token parser middleware to handle
requests without Authorization headers. This prevents
500 errors and returns 401 Unauthorized instead.

Closes #142
```

### ❌ Bad Example
```
fixes stuff
```
(Too vague — no clue what was fixed.)

---
