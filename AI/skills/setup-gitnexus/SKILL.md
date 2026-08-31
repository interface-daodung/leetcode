---

name: setup-gitnexus
description: Install, configure, verify, refresh, and remove GitNexus in a pnpm monorepo for OpenCode. GitNexus must always be installed at the pnpm workspace root and never globally or inside an individual workspace package unless the user explicitly requests it.
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# GitNexus Setup Skill

## Purpose

This skill manages GitNexus for a **pnpm monorepo + OpenCode** environment.

GitNexus provides a code knowledge graph that allows AI agents to understand:

* symbols
* imports
* dependencies
* callers and callees
* execution flows
* functional clusters
* API relationships
* change impact
* code traces
* semantic code search

The target architecture is:

```text
pnpm monorepo
│
├── apps/
├── packages/
├── package.json
├── pnpm-workspace.yaml
│
├── .gitnexus/
│
└── AGENTS.md
        │
        ▼
     GitNexus
        │
        ▼
      MCP
        │
        ▼
    OpenCode
        │
        ▼
     AI Agent
```

---

# 1. Absolute Installation Rules

These rules are mandatory.

## 1.1 GitNexus MUST be project-local

GitNexus MUST be installed as a dependency of the pnpm workspace root.

Correct:

```text
monorepo/
├── package.json
│   └── devDependencies.gitnexus
├── pnpm-workspace.yaml
└── ...
```

Incorrect:

```text
monorepo/
├── apps/
│   └── web/
│       └── package.json
│           └── devDependencies.gitnexus
```

Incorrect:

```text
monorepo/
├── packages/
│   └── shared/
│       └── package.json
│           └── devDependencies.gitnexus
```

Incorrect:

```bash
npm install -g gitnexus
```

Never install GitNexus globally unless the user explicitly asks for global installation.

---

# 2. Workspace Root Is the Source of Truth

GitNexus MUST operate on the **pnpm workspace root**, not an individual application/package.

The agent must identify the workspace root before installing anything.

Expected structure:

```text
repository/
├── package.json
├── pnpm-workspace.yaml
│
├── apps/
│   ├── web/
│   ├── api/
│   └── admin/
│
├── packages/
│   ├── ui/
│   ├── config/
│   └── utils/
│
└── ...
```

GitNexus belongs here:

```text
repository/
├── package.json        ← GitNexus dependency
├── pnpm-workspace.yaml
└── .gitnexus/          ← GitNexus index
```

---

# 3. Determine Git Repository Root

Before modifying anything, run:

```bash
git rev-parse --show-toplevel
```

Store the result as:

```text
GIT_ROOT
```

If the command fails:

* stop
* do not install GitNexus
* report that the current directory is not inside a Git repository

---

# 4. Determine pnpm Workspace Root

The agent MUST locate the pnpm workspace root.

Check upward from the current directory for:

```text
pnpm-workspace.yaml
```

The directory containing this file is the preferred workspace root.

Example:

```text
D:\Projects\js-lab\pnpm-workspace.yaml
```

Therefore:

```text
WORKSPACE_ROOT = D:\Projects\js-lab
```

If `pnpm-workspace.yaml` does not exist, inspect the root `package.json` for:

```json
{
  "workspaces": [...]
}
```

However, this skill is specifically for pnpm monorepos.

If no pnpm workspace configuration exists:

* do not create one automatically
* stop
* tell the user that this skill expects a pnpm workspace

---

# 5. Validate Git Root and Workspace Root

Normally:

```text
GIT_ROOT == WORKSPACE_ROOT
```

is expected.

If they differ:

```text
GIT_ROOT
   │
   └── repository

WORKSPACE_ROOT
   │
   └── nested pnpm workspace
```

Do NOT automatically decide which one should be indexed.

Stop and report:

```text
Git repository root and pnpm workspace root are different.
Manual confirmation is required before indexing.
```

This prevents accidental indexing of the wrong directory.

---

# 6. Never Install From apps/* or packages/*

If the agent starts from:

```text
apps/web/
```

or:

```text
packages/ui/
```

it MUST first move to:

```text
WORKSPACE_ROOT
```

Example:

```bash
cd <workspace-root>
```

Only then may it execute:

```bash
pnpm add -D gitnexus
```

Never run:

```bash
pnpm add -D gitnexus
```

from:

```text
apps/*
packages/*
```

---

# 7. Inspect Existing Root Configuration

Before installing GitNexus, inspect:

```text
<workspace-root>/package.json
<workspace-root>/pnpm-workspace.yaml
<workspace-root>/pnpm-lock.yaml
<workspace-root>/.gitignore
```

Do not overwrite any of these files.

Determine:

* package manager configuration
* package manager version
* Node.js version
* existing GitNexus dependency
* existing scripts
* existing ignore rules

---

# 8. Verify Node.js and pnpm

From the workspace root:

```bash
node --version
pnpm --version
```

If either command is unavailable:

* stop
* report the missing dependency
* do not install Node.js or pnpm automatically

Do not change the project's Node.js version.

Do not change pnpm configuration unless explicitly requested.

---

# 9. Check Existing GitNexus Installation

Inspect the root:

```text
package.json
```

Look for:

```json
{
  "devDependencies": {
    "gitnexus": "..."
  }
}
```

Also check:

```text
.gitnexus/
```

Possible states:

### State A — GitNexus does not exist

Install it.

### State B — GitNexus dependency exists

Do not reinstall it automatically.

Use the existing version.

### State C — `.gitnexus/` exists but dependency does not

Install the dependency at the workspace root, then verify the existing index.

### State D — GitNexus exists in apps/* or packages/*

Do NOT silently move it.

Report the incorrect installation and ask whether it should be removed/migrated.

---

# 10. Install GitNexus at Workspace Root

Change directory:

```bash
cd <workspace-root>
```

Then:

```bash
pnpm add -D gitnexus
```

This MUST modify only the root dependency configuration.

Expected:

```text
package.json
pnpm-lock.yaml
node_modules/.pnpm/
```

Do not manually edit the version unless required.

Do not install another copy inside workspace packages.

---

# 11. Verify Local Installation

Run:

```bash
pnpm exec gitnexus --version
```

The command MUST resolve the project-local GitNexus.

Do not use:

```bash
where gitnexus
```

as proof of project-local installation because a global binary may be found first.

The reliable execution method is:

```bash
pnpm exec gitnexus
```

---

# 12. Check for Global GitNexus

A global GitNexus installation is not required.

If useful, inspect:

```bash
npm list -g gitnexus --depth=0
```

or:

```bash
pnpm list -g gitnexus
```

If a global installation exists:

* do not remove it automatically
* do not depend on it
* do not use it for this repository

The project-local version is authoritative.

---

# 13. Analyze the Entire Monorepo

GitNexus MUST be executed from:

```text
WORKSPACE_ROOT
```

Run:

```bash
pnpm exec gitnexus analyze
```

This indexes the monorepo as a single codebase.

Expected:

```text
workspace/
├── apps/
├── packages/
├── package.json
├── pnpm-workspace.yaml
└── .gitnexus/
```

Do NOT run analysis separately from:

```text
apps/web/
apps/api/
packages/ui/
packages/utils/
```

unless the user explicitly requests independent repositories/indexes.

---

# 14. Why the Entire Workspace Must Be Indexed

The purpose of GitNexus in a monorepo is to expose cross-package relationships.

Example:

```text
apps/web
    │
    ▼
packages/ui
    │
    ▼
packages/shared
    │
    ▼
apps/api
```

If only:

```text
apps/web
```

is indexed, the AI may miss:

```text
packages/ui
packages/shared
apps/api
```

Index the workspace root instead:

```text
workspace root
       │
       ├── apps/web
       ├── apps/api
       ├── packages/ui
       └── packages/shared
```

This provides the AI with a much more complete architectural view.

---

# 15. Embeddings

Embeddings are optional.

For AI-oriented semantic search, prefer:

```bash
pnpm exec gitnexus analyze --embeddings
```

Use embeddings when:

* the repository is large
* semantic code search is useful
* AI agents need conceptual rather than exact-name retrieval

If embedding setup fails but normal analysis succeeds:

```bash
pnpm exec gitnexus analyze
```

must remain the fallback.

Do not treat an embedding failure as proof that the entire GitNexus installation failed.

Report the embedding-specific failure separately.

---

# 16. GitNexus Generated Files

After analysis, inspect:

```text
.gitnexus/
AGENTS.md
CLAUDE.md
```

Do not delete existing instructions.

If:

```text
AGENTS.md
```

already exists:

* read it first
* preserve existing project instructions
* do not replace the file wholesale

If GitNexus attempts to generate instructions:

* preserve project-specific rules
* merge where appropriate
* never remove unrelated instructions

---

# 17. .gitignore

Inspect:

```text
.gitignore
```

Determine whether `.gitnexus/` is already ignored.

Preferred local-only configuration:

```gitignore
.gitnexus/
```

If it is missing, add it only if repository conventions indicate that generated local index data should not be committed.

Do NOT automatically add unrelated ignore patterns.

Never use:

```gitignore
.*
```

or broad destructive patterns.

---

# 18. OpenCode MCP Configuration

GitNexus must be connected to OpenCode through MCP.

First inspect the existing OpenCode configuration.

Do NOT overwrite the entire configuration.

The GitNexus setup command may be used:

```bash
pnpm exec gitnexus setup -c opencode
```

Before executing it:

* verify that the GitNexus dependency is project-local
* run the command from the workspace root
* preserve existing OpenCode configuration

---

# 19. MCP Configuration Safety

The agent MUST inspect the generated configuration after setup.

Do not assume that:

```bash
pnpm exec gitnexus setup -c opencode
```

necessarily produces a project-local MCP configuration.

Verify:

```text
MCP command
MCP arguments
GitNexus executable
configuration location
```

The MCP server should ultimately use the GitNexus version associated with this workspace.

If setup generates a command using a global GitNexus executable:

* do not silently accept it
* prefer a project-local invocation
* preserve unrelated MCP configuration

---

# 20. Preferred Local MCP Principle

The desired relationship is:

```text
OpenCode
   │
   ▼
project-local GitNexus
   │
   ▼
.gitnexus/
```

Not:

```text
OpenCode
   │
   ▼
global GitNexus
   │
   ▼
unknown repository
```

The workspace-local installation must remain the source of truth.

---

# 21. Multiple Repositories

Do not create a global GitNexus installation merely because the user has multiple repositories.

Each repository should independently contain:

```text
repository-A/
├── package.json
└── .gitnexus/

repository-B/
├── package.json
└── .gitnexus/
```

Each repository can pin its own GitNexus version.

Example:

```text
repo-A → gitnexus@version-A
repo-B → gitnexus@version-B
```

This is intentional.

Do not synchronize versions across repositories unless explicitly requested.

---

# 22. Verify GitNexus Status

From the workspace root:

```bash
pnpm exec gitnexus status
```

Verify:

* repository is recognized
* workspace root is correct
* index exists
* index is readable
* no fatal database errors
* no fatal parser errors
* index is not obviously stale

If stale:

```bash
pnpm exec gitnexus analyze
```

Do not immediately use `--force`.

---

# 23. Full Rebuild

Use:

```bash
pnpm exec gitnexus analyze --force
```

ONLY when:

* normal analysis fails to repair the index
* index corruption is suspected
* parser state is inconsistent
* the user explicitly requests a full rebuild

Do not use `--force` during normal setup if the index is already valid.

---

# 24. AI Verification

After OpenCode MCP setup, verify that GitNexus is visible to the agent.

The agent should be able to access GitNexus MCP capabilities such as:

```text
query
context
impact
trace
detect_changes
check
rename
cypher
route_map
tool_map
api_impact
```

The exact list depends on the installed GitNexus version.

Do not assume a tool exists.

Use the tools actually exposed by the MCP server.

---

# 25. Read-Only Verification Test

The verification must not modify source code.

Use GitNexus to determine:

```text
1. repository/workspace name
2. indexed codebase information
3. important code clusters
4. important execution processes
5. one dependency relationship
```

Then test an impact query against a real symbol.

Example conceptual request:

```text
What code depends on <symbol>?
```

Expected architecture:

```text
OpenCode
   │
   ▼
GitNexus MCP
   │
   ├── context
   ├── impact
   ├── trace
   └── query
   │
   ▼
.gitnexus knowledge graph
   │
   ▼
Monorepo
```

If the agent cannot access GitNexus:

1. inspect MCP configuration
2. inspect GitNexus startup output
3. verify project-local installation
4. verify `.gitnexus/`
5. verify workspace root
6. verify OpenCode MCP state

Do not reinstall everything blindly.

---

# 26. Normal Development Workflow

After initial setup:

```bash
cd <workspace-root>

pnpm exec gitnexus analyze
```

Run this after significant structural changes.

Examples:

```text
new package
new application
large refactor
API changes
major dependency changes
large file movement
```

For small changes, do not unnecessarily force a complete rebuild.

---

# 27. Recommended package scripts

If the root `package.json` already contains project scripts, do not overwrite them.

If appropriate, GitNexus scripts may be added:

```json
{
  "scripts": {
    "gitnexus:analyze": "gitnexus analyze",
    "gitnexus:embeddings": "gitnexus analyze --embeddings",
    "gitnexus:status": "gitnexus status"
  }
}
```

Only add these if:

* they do not already exist
* the project convention allows utility scripts
* adding them provides useful developer ergonomics

Do not add scripts merely for the sake of adding them.

---

# 28. Monorepo Boundary Rules

GitNexus should normally index:

```text
workspace root
├── apps/
├── packages/
└── shared workspace code
```

The agent must not intentionally index:

```text
node_modules/
.git/
temporary build output
cache directories
generated artifacts
```

Respect GitNexus's own ignore/indexing behavior.

Do not manually delete directories merely because they are large.

---

# 29. Do Not Mix Project Indexes

Never do:

```text
workspace/
├── .gitnexus/

apps/web/
└── .gitnexus/
```

unless the user explicitly wants independent indexes.

The default architecture is:

```text
workspace/
└── .gitnexus/
```

One monorepo → one primary GitNexus index.

---

# 30. Removal

If the user asks to uninstall GitNexus:

## Step 1 — Inspect

Check:

```text
package.json
pnpm-lock.yaml
.gitnexus/
.gitignore
AGENTS.md
CLAUDE.md
OpenCode MCP configuration
```

## Step 2 — Remove dependency

From workspace root:

```bash
pnpm remove gitnexus
```

## Step 3 — Remove index

If `.gitnexus/` is confirmed to be GitNexus-generated local data, remove it.

Prefer GitNexus's own cleanup command if supported:

```bash
pnpm exec gitnexus clean
```

If the package has already been removed and the command is unavailable, remove only:

```text
.gitnexus/
```

## Step 4 — Remove MCP integration

Use GitNexus's supported uninstall mechanism if available:

```bash
pnpm exec gitnexus uninstall
```

If unavailable:

* inspect the OpenCode configuration
* remove only the GitNexus MCP entry
* preserve all unrelated MCP servers

## Step 5 — Review generated files

Do NOT automatically delete:

```text
AGENTS.md
CLAUDE.md
```

These may contain user-written instructions.

Only remove GitNexus-generated sections when they can be identified safely.

---

# 31. Rollback Rules

If installation fails:

```text
pnpm add -D gitnexus
```

may have modified:

```text
package.json
pnpm-lock.yaml
```

Do not blindly revert these files with Git.

First inspect the diff:

```bash
git diff -- package.json pnpm-lock.yaml
```

Only revert changes clearly caused by this skill.

Never discard unrelated user changes.

If MCP setup fails:

* do not reset the entire OpenCode configuration
* inspect the diff/configuration
* remove only changes introduced by GitNexus if safe

---

# 32. Security and Privacy

GitNexus is being configured for local code intelligence.

Do not upload or copy private source code to an external service as part of this skill.

Do not:

* commit secrets
* print `.env` contents
* print API keys
* expose tokens
* copy private source code into generated reports
* modify authentication configuration

If environment variables are needed, inspect only variable names unless values are explicitly required.

Never print secret values.

---

# 33. Agent Decision Tree

Use this decision process.

```text
START
  │
  ▼
Is this a Git repository?
  │
  ├── NO → STOP
  │
  ▼
Find pnpm-workspace.yaml
  │
  ├── NOT FOUND → STOP
  │
  ▼
Git root == workspace root?
  │
  ├── NO → STOP + report
  │
  ▼
Move to workspace root
  │
  ▼
Does root package.json contain GitNexus?
  │
  ├── YES → keep existing version
  │
  └── NO
       │
       ▼
   pnpm add -D gitnexus
       │
       ▼
pnpm exec gitnexus --version
       │
       ▼
Does .gitnexus exist?
  │
  ├── NO → analyze
  │
  └── YES → status
                │
                ▼
           stale/corrupt?
             │
             ├── NO → continue
             │
             └── YES → analyze
       │
       ▼
Configure OpenCode MCP
       │
       ▼
Verify MCP
       │
       ▼
Verify read-only GitNexus query
       │
       ▼
DONE
```

---

# 34. Completion Requirements

The skill is successful ONLY when all applicable conditions are satisfied:

```text
[✓] Git repository detected
[✓] pnpm workspace detected
[✓] workspace root identified
[✓] Git root/workspace root validated
[✓] GitNexus installed at workspace root
[✓] GitNexus NOT installed globally by this skill
[✓] GitNexus NOT installed in apps/*
[✓] GitNexus NOT installed in packages/*
[✓] .gitnexus index created or verified
[✓] OpenCode MCP configured or verified
[✓] MCP configuration inspected
[✓] read-only GitNexus verification passed
```

If one of the required steps fails, do not report the installation as successful.

---

# 35. Final Report

After completion, report:

```text
GitNexus setup completed.

Workspace:
<workspace-root>

Git repository:
<git-root>

Installation:
Project-local

GitNexus version:
<version>

Index:
<created / refreshed / already valid>

Embeddings:
<enabled / disabled>

Index:
<workspace-root>/.gitnexus/

OpenCode MCP:
<configured / already configured / failed>

Verification:
<passed / failed>

Package locations:
<confirm GitNexus exists only in root package.json>

Notes:
<any warnings or follow-up actions>
```

If setup fails, report:

```text
GitNexus setup failed.

Failed step:
<step>

Reason:
<exact error summary>

Changes made:
<list only confirmed changes>

Recommended next action:
<action>
```

## Never claim success when MCP or indexing has not been verified.

# 36. Canonical Setup Commands

For a new pnpm monorepo:

```bash
cd <workspace-root>

pnpm add -D gitnexus

pnpm exec gitnexus --version

pnpm exec gitnexus analyze --embeddings

pnpm exec gitnexus setup -c opencode

pnpm exec gitnexus status
```

For an existing installation:

```bash
cd <workspace-root>

pnpm exec gitnexus --version

pnpm exec gitnexus status

pnpm exec gitnexus analyze

pnpm exec gitnexus setup -c opencode
```

Never replace these with a global installation unless explicitly instructed by the user.
