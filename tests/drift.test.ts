import { describe, it, expect } from 'vitest';
import { detectArchitecturalDrift, ArchitectureRule, FileData } from '../lib/analysis/drift';

describe('Architectural Drift Detection', () => {
  it('should detect when a lib file imports a UI component', () => {
    const rules: ArchitectureRule[] = [
      {
        sourcePattern: /^lib\//,
        disallowedTargetPattern: /^components\//,
        message: "Library files should not depend on UI components."
      }
    ];

    const files: FileData[] = [
      {
        path: 'lib/utils.ts',
        content: `import { Button } from '@/components/ui/button';\nexport function test() {}`
      }
    ];

    const violations = detectArchitecturalDrift(files, rules);

    expect(violations.length).toBe(1);
    expect(violations[0].sourceFile).toBe('lib/utils.ts');
    expect(violations[0].targetDependency).toBe('components/ui/button');
    expect(violations[0].severity).toBe('high');
  });

  it('should pass cleanly when boundaries are respected', () => {
    const rules: ArchitectureRule[] = [
      {
        sourcePattern: /^lib\//,
        disallowedTargetPattern: /^components\//,
        message: "Library files should not depend on UI components."
      }
    ];

    const files: FileData[] = [
      {
        path: 'lib/utils.ts',
        content: `import { clsx } from "clsx";\nexport function cn() {}`
      }
    ];

    const violations = detectArchitecturalDrift(files, rules);
    expect(violations.length).toBe(0);
  });
});
