# Graph Report - leetcode  (2026-09-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1244 nodes · 1894 edges · 90 communities (68 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `439ec63c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- javascript-docs/src/index.ts
- createProblemController
- options
- shared.ts
- WorkspaceContext.tsx
- compilerOptions
- content.js
- dependencies
- problem-engine/src/index.ts
- ProblemService
- dependencies
- clip.ts
- ai/src/index.ts
- compilerOptions
- package.json
- DatabaseComponent
- asset.service.ts
- ThemeService
- tsconfig.app.json
- database/package.json
- devDependencies
- manifest.json
- dependencies
- lib/api.ts
- devDependencies
- compilerOptions
- compilerOptions
- services/problem.service.ts
- compilerOptions
- compilerOptions
- paths
- typescript
- javascript-docs/package.json
- extension/package.json
- server/package.json
- node_modules
- ai/package.json
- compilerOptions
- parse_markdown_file
- compilerOptions
- problem-engine/package.json
- shared/package.json
- devDependencies
- database.component.ts
- KnowledgeContext.tsx
- compilerOptions
- compilerOptions
- ProblemService
- devDependencies
- shared/src/index.ts
- ErrorBoundaryImpl
- ../shared/src
- @leetcode/shared
- app.routes.ts
- Problem
- devDependencies
- eslint
- CodeEditor.tsx
- core/problem.service.ts
- ErrorContext.tsx
- theme.tsx
- devDependencies
- paths
- DocPage.tsx
- ./packages/shared/src
- dependencies
- ai/tsconfig.json
- database/tsconfig.json
- problem-engine/tsconfig.json
- exclude
- sync-api-url.mjs
- DescriptionPanel.tsx
- ErrorPanel.tsx
- bundle.mjs
- chrome.d.ts
- graphify.js

## God Nodes (most connected - your core abstractions)
1. `DatabaseComponent` - 42 edges
2. `ProblemService` - 23 edges
3. `ProblemMeta` - 22 edges
4. `compilerOptions` - 18 edges
5. `ProblemDatabase` - 17 edges
6. `compilerOptions` - 17 edges
7. `ProblemEngine` - 14 edges
8. `createProblemController()` - 14 edges
9. `buildProblemClip()` - 14 edges
10. `Problem` - 13 edges

## Surprising Connections (you probably didn't know these)
- `@leetcode/shared` --extends--> `./packages/shared/src`  [EXTRACTED]
  apps/server/tsconfig.json → tsconfig.json
- `exclude` --extends--> `node_modules`  [EXTRACTED]
  apps/extension/tsconfig.json → tsconfig.json
- `@leetcode/shared` --extends--> `./packages/shared/src`  [EXTRACTED]
  apps/web/tsconfig.json → tsconfig.json
- `ClientMessage` --references--> `AIProblemInput`  [EXTRACTED]
  apps/server/src/controllers/ai.controller.ts → packages/ai/src/index.ts
- `ImportClipResult` --references--> `Problem`  [EXTRACTED]
  apps/server/src/services/problem.service.ts → packages/problem-engine/src/index.ts

## Import Cycles
- None detected.

## Communities (90 total, 8 thin omitted)

### Community 0 - "javascript-docs/src/index.ts"
Cohesion: 0.07
Nodes (70): DocEntry, docsIndex, jsDocs, allDocFiles, allViDocFiles, getAllDocFiles(), getAllDocFilesVi(), getAllKeywords() (+62 more)

### Community 1 - "createProblemController"
Cohesion: 0.06
Nodes (27): createApp(), ASSETS_ROOT, config, PLAYGROUND_ROOT, createAiController(), healthHandler(), createPlaygroundController(), save() (+19 more)

### Community 2 - "options"
Cohesion: 0.04
Nodes (47): architect, prefix, projectType, root, schematics, sourceRoot, build, serve (+39 more)

### Community 3 - "shared.ts"
Cohesion: 0.10
Nodes (31): PostResult, postToServer(), isValidClipForPost(), handleClip(), init(), API_BASE, copyToClipboard(), Difficulty (+23 more)

### Community 4 - "WorkspaceContext.tsx"
Cohesion: 0.10
Nodes (31): PANEL_LABELS, formatValue(), TestCaseTabsProps, ValueBlock(), computePanelsVisible(), countTabs(), defaultState, findParentRow() (+23 more)

### Community 5 - "compilerOptions"
Cohesion: 0.05
Nodes (37): compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleResolution, noEmit, skipLibCheck (+29 more)

### Community 6 - "content.js"
Cohesion: 0.13
Nodes (32): buildProblemClip(), buildTestCasesFromLines(), cleanDescription(), copyToClipboard(), createWidget(), ensureToast(), extractDifficulty(), extractHints() (+24 more)

### Community 7 - "dependencies"
Cohesion: 0.06
Nodes (32): @angular/animations, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/platform-browser-dynamic, @angular/router (+24 more)

### Community 8 - "problem-engine/src/index.ts"
Cohesion: 0.14
Nodes (16): ProblemEngine, createProblemTreeState(), findProblem(), getDifficultyCounts(), getTags(), hydrateProblems(), listByDifficulty(), listByTag() (+8 more)

### Community 9 - "ProblemService"
Cohesion: 0.12
Nodes (5): ensureAssetFiles(), ProblemService, ProblemDatabase, engine, ProblemClip

### Community 10 - "dependencies"
Cohesion: 0.07
Nodes (28): @fortawesome/fontawesome-free, dependencies, flexlayout-react, @fortawesome/fontawesome-free, @leetcode/javascript-docs, marked, react, react-dom (+20 more)

### Community 11 - "clip.ts"
Cohesion: 0.21
Nodes (20): buildProblemClip(), isValidProblemClip(), cleanDescription(), findDescriptionContainer(), findTitleAnchor(), extractDifficulty(), normalizeDifficulty(), extractHints() (+12 more)

### Community 12 - "ai/src/index.ts"
Cohesion: 0.12
Nodes (22): MockSocket, parseMessage(), ClientMessage, handle(), AIPanel(), AiMessage, ErrorMessage, GuideMessage (+14 more)

### Community 13 - "compilerOptions"
Cohesion: 0.08
Nodes (25): angularCompilerOptions, enableI18nLegacyMessageIdFormat, strictInjectionParameters, strictInputAccessModifiers, strictTemplates, compileOnSave, compilerOptions, esModuleInterop (+17 more)

### Community 14 - "package.json"
Cohesion: 0.08
Nodes (25): concurrently, description, devDependencies, concurrently, typescript, typescript-language-server, vitest, @vitest/ui (+17 more)

### Community 16 - "asset.service.ts"
Cohesion: 0.13
Nodes (16): ASSETS_ROOT, hashToPath, perProblem, downloadAndRewriteImages(), ensureDir(), extensionFromContentType(), extractImgSrcs(), sanitizeFilename() (+8 more)

### Community 17 - "ThemeService"
Cohesion: 0.14
Nodes (7): AppComponent, Component, appConfig, ThemeService, Injectable, SidebarComponent, Component

### Community 18 - "tsconfig.app.json"
Cohesion: 0.11
Nodes (18): compilerOptions, outDir, types, extends, files, include, src/**/*.d.ts, ./tsconfig.json (+10 more)

### Community 19 - "database/package.json"
Cohesion: 0.10
Nodes (19): drizzle-orm, @libsql/client, dependencies, drizzle-orm, @leetcode/shared, @libsql/client, main, name (+11 more)

### Community 20 - "devDependencies"
Cohesion: 0.11
Nodes (19): @angular/cli, @angular/compiler-cli, @angular-devkit/build-angular, devDependencies, @angular/cli, @angular/compiler-cli, @angular-devkit/build-angular, autoprefixer (+11 more)

### Community 21 - "manifest.json"
Cohesion: 0.11
Nodes (17): content_scripts, description, host_permissions, icons, 128, 16, 32, 48 (+9 more)

### Community 22 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, dotenv, fastify, @fastify/static, @fastify/websocket, @leetcode/ai, @leetcode/problem-engine, ws (+10 more)

### Community 23 - "lib/api.ts"
Cohesion: 0.22
Nodes (12): App(), ProblemLoader(), EditorPanel(), ExplorerPanel(), Filter, ConnectionDiag, diagnoseConnection(), fetchProblem() (+4 more)

### Community 24 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, @tailwindcss/vite, @types/marked, @types/react, @types/react-dom, @types/react-syntax-highlighter, vite, @vitejs/plugin-react (+9 more)

### Community 25 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck (+7 more)

### Community 26 - "compilerOptions"
Cohesion: 0.13
Nodes (15): compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck (+7 more)

### Community 27 - "services/problem.service.ts"
Cohesion: 0.25
Nodes (9): ImportClipResult, RunOutcome, extractFunctionName(), extractSolutionFunction(), stripComments(), wrapSolution(), Problem, TestCaseResult (+1 more)

### Community 28 - "compilerOptions"
Cohesion: 0.15
Nodes (13): compilerOptions, declaration, declarationMap, lib, module, moduleResolution, outDir, resolveJsonModule (+5 more)

### Community 29 - "compilerOptions"
Cohesion: 0.15
Nodes (13): compilerOptions, declaration, declarationMap, isolatedModules, lib, module, moduleResolution, noEmit (+5 more)

### Community 30 - "paths"
Cohesion: 0.18
Nodes (12): paths, @leetcode/database, @leetcode/problem-engine, @leetcode/shared, ./packages/javascript-docs/src, paths, ./packages/database/src, ./packages/problem-engine/src (+4 more)

### Community 31 - "typescript"
Cohesion: 0.17
Nodes (12): typescript, typescript, devDependencies, eslint, typescript, vitest, vitest, devDependencies (+4 more)

### Community 32 - "javascript-docs/package.json"
Cohesion: 0.17
Nodes (11): main, name, private, scripts, build, generate, lint, test (+3 more)

### Community 33 - "extension/package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, lint, prebuild, sync:config, test (+2 more)

### Community 34 - "server/package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, start, test (+2 more)

### Community 35 - "node_modules"
Cohesion: 0.18
Nodes (9): exclude, include, dist, src/**/*, exclude, include, dist, src/**/* (+1 more)

### Community 36 - "ai/package.json"
Cohesion: 0.18
Nodes (10): main, name, private, scripts, build, lint, test, type (+2 more)

### Community 37 - "compilerOptions"
Cohesion: 0.18
Nodes (11): compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck (+3 more)

### Community 38 - "parse_markdown_file"
Cohesion: 0.33
Nodes (10): extract_code_blocks(), extract_mdn_url(), extract_tables(), generate_lang(), md_to_html(), parse_markdown_file(), Bỏ các div điều hướng (<div align=...>Back to Top / MDN ...</div>, div anchor…, slugify() (+2 more)

### Community 39 - "compilerOptions"
Cohesion: 0.18
Nodes (11): compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck (+3 more)

### Community 40 - "problem-engine/package.json"
Cohesion: 0.18
Nodes (10): main, name, private, scripts, build, lint, test, type (+2 more)

### Community 41 - "shared/package.json"
Cohesion: 0.18
Nodes (10): main, name, private, scripts, build, lint, test, type (+2 more)

### Community 42 - "devDependencies"
Cohesion: 0.20
Nodes (10): @types/node, @types/node, @types/node, @types/node, devDependencies, eslint, @types/node, typescript (+2 more)

### Community 43 - "database.component.ts"
Cohesion: 0.20
Nodes (7): Difficulty, ProblemInput, ColumnDef, ColumnId, EMPTY_ASSETS, EMPTY_HINTS, SortDir

### Community 44 - "KnowledgeContext.tsx"
Cohesion: 0.22
Nodes (8): CATEGORIES_EN, CATEGORIES_VI, KNOWLEDGE_CATEGORIES, KnowledgeCtx, KnowledgeState, Lang, useKnowledgeState(), useSelectedSection()

### Community 45 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict, include (+1 more)

### Community 46 - "compilerOptions"
Cohesion: 0.20
Nodes (10): compilerOptions, lib, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck, strict (+2 more)

### Community 48 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, tsx, @types/ws, typescript, vitest, vitest, tsx (+1 more)

### Community 49 - "shared/src/index.ts"
Cohesion: 0.22
Nodes (3): dbMock, styles, version

### Community 50 - "ErrorBoundaryImpl"
Cohesion: 0.22
Nodes (3): ErrorBoundaryImpl, Props, State

### Community 51 - "../shared/src"
Cohesion: 0.22
Nodes (9): paths, ../shared/src, @leetcode/shared, paths, @leetcode/shared, paths, @leetcode/database, @leetcode/shared (+1 more)

### Community 52 - "@leetcode/shared"
Cohesion: 0.25
Nodes (8): @leetcode/shared, @leetcode/shared, @leetcode/shared, @leetcode/shared, dependencies, @leetcode/shared, dependencies, @leetcode/shared

### Community 53 - "app.routes.ts"
Cohesion: 0.32
Nodes (4): routes, DashboardComponent, Stats, Component

### Community 55 - "devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, esbuild, jsdom, typescript, vitest, jsdom, vitest, esbuild

### Community 56 - "eslint"
Cohesion: 0.25
Nodes (8): eslint, eslint, eslint, devDependencies, eslint, typescript, vitest, vitest

### Community 57 - "CodeEditor.tsx"
Cohesion: 0.39
Nodes (7): buildHighlightedHtml(), CodeEditor(), CodeEditorProps, getCaretOffset(), getCaretRect(), KIND_BADGE, setCaretOffset()

### Community 58 - "core/problem.service.ts"
Cohesion: 0.43
Nodes (3): API_URL_TOKEN, Window, SAMPLE

### Community 60 - "ErrorContext.tsx"
Cohesion: 0.29
Nodes (4): AppError, ErrorCtx, ErrorSource, ErrorState

### Community 61 - "theme.tsx"
Cohesion: 0.38
Nodes (5): applyTheme(), getInitialTheme(), Theme, ThemeCtx, ThemeProvider()

### Community 62 - "devDependencies"
Cohesion: 0.29
Nodes (7): drizzle-kit, devDependencies, drizzle-kit, eslint, typescript, vitest, vitest

### Community 63 - "paths"
Cohesion: 0.33
Nodes (6): @leetcode/ai, paths, @leetcode/ai, @leetcode/shared, ./packages/ai/src, @leetcode/ai

### Community 64 - "DocPage.tsx"
Cohesion: 0.47
Nodes (5): DocPage(), enModules, resolveModule(), slugify(), viModules

### Community 65 - "./packages/shared/src"
Cohesion: 0.40
Nodes (5): paths, @leetcode/shared, paths, @leetcode/shared, ./packages/shared/src

### Community 66 - "dependencies"
Cohesion: 0.40
Nodes (5): @leetcode/database, @leetcode/database, dependencies, @leetcode/database, @leetcode/shared

### Community 67 - "ai/tsconfig.json"
Cohesion: 0.40
Nodes (4): exclude, include, dist, src/**/*

### Community 68 - "database/tsconfig.json"
Cohesion: 0.40
Nodes (4): exclude, include, dist, src/**/*

### Community 69 - "problem-engine/tsconfig.json"
Cohesion: 0.40
Nodes (4): exclude, include, dist, src/**/*

### Community 70 - "exclude"
Cohesion: 0.40
Nodes (4): apps/*/dist, packages/*/dist, exclude, dist

### Community 73 - "ErrorPanel.tsx"
Cohesion: 0.67
Nodes (3): ErrorPanel(), fmtTime(), SOURCE_LABEL

## Knowledge Gaps
- **436 isolated node(s):** `DocEntry`, `SearchOptions`, `DocEntry`, `PlaygroundSaveResult`, `AiMessage` (+431 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 535 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `dependencies`, `options`, `@leetcode/shared`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `typescript` connect `typescript` to `devDependencies`, `package.json`, `devDependencies`, `devDependencies`, `devDependencies`, `eslint`, `devDependencies`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `node_modules` connect `node_modules` to `ai/tsconfig.json`, `database/tsconfig.json`, `problem-engine/tsconfig.json`, `compilerOptions`, `exclude`, `compilerOptions`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `DocEntry`, `SearchOptions`, `DocEntry` to the rest of the system?**
  _436 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `javascript-docs/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06511761331038439 - nodes in this community are weakly interconnected._
- **Should `createProblemController` be split into smaller, more focused modules?**
  _Cohesion score 0.0602322206095791 - nodes in this community are weakly interconnected._
- **Should `options` be split into smaller, more focused modules?**
  _Cohesion score 0.04251700680272109 - nodes in this community are weakly interconnected._