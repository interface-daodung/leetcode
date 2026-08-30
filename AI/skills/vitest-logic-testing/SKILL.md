---
name: vitest-logic-testing
description: Tạo unit test cho logic thuần bằng Vitest. Use when viết test cho function logic, utility, algorithm, hoặc được yêu cầu unit test.
---

# Vitest Logic Testing Skill

## Purpose
Create unit tests for pure logic functions using Vitest. Focus on testing business logic, algorithms, and utility functions - NOT UI components.

## When to Use
- After implementing a new feature with logic functions
- When refactoring existing logic functions
- To ensure edge cases are covered

## Testing Principles
- Test pure functions (same input = same output)
- Cover edge cases: empty inputs, null/undefined, boundaries
- Test error handling paths
- Avoid testing implementation details
- No UI/React component testing - only logic functions

## File Structure
```
packages/<package-name>/src/
├── features/
│   └── <feature-name>/
│       ├── <logic-file>.ts
│       └── <logic-file>.test.ts  <-- Create this
```

## Commands
- Run tests: `pnpm test` (runs all packages)
- Run specific: `pnpm --filter=<package> test`
- Watch mode: `pnpm test -- --watch`
- UI: `pnpm test -- --ui`

## Vitest Patterns

### Basic Test
```typescript
import { describe, it, expect } from 'vitest'
import { functionName } from './logic-file'

describe('functionName', () => {
  it('should handle normal case', () => {
    expect(functionName(input)).toBe(expected)
  })
  
  it('should handle edge case', () => {
    expect(functionName(edgeInput)).toBe(edgeExpected)
  })
})
```

### Parametrized Tests
```typescript
import { describe, it, expect } from 'vitest'

describe.each([
  [input1, expected1],
  [input2, expected2],
  [edgeCase, expectedEdge],
])('functionName(%s) = %s', (input, expected) => {
  it('returns correct result', () => {
    expect(functionName(input)).toBe(expected)
  })
})
```

### Async Tests
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction()
  expect(result).toBe(expected)
})
```

## Checklist for New Tests
- [ ] Happy path works
- [ ] Empty/null/undefined inputs handled
- [ ] Boundary values tested
- [ ] Error cases throw correctly
- [ ] No console.log in tests
- [ ] Tests are deterministic (no random, no Date.now)