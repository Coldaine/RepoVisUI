import * as ts from "typescript";

// Define a baseline architecture constraint rule
export interface ArchitectureRule {
  sourcePattern: RegExp;
  disallowedTargetPattern: RegExp;
  message: string;
}

export const defaultBaseline: ArchitectureRule[] = [
  {
    sourcePattern: /^lib\//,
    disallowedTargetPattern: /^components\//,
    message: "Library files should not depend on UI components."
  },
  {
    sourcePattern: /^components\/ui\//,
    disallowedTargetPattern: /^app\//,
    message: "UI components should not depend on Next.js app router specifics."
  }
];

export interface FileData {
  path: string;
  content: string;
}

export interface DriftViolation {
  sourceFile: string;
  targetDependency: string;
  severity: "high" | "medium" | "low";
  docSnippet: string;
  codeSnippet: string;
}

/**
 * Parses files using TypeScript AST to find imports and compares against
 * baseline architecture rules to detect drift.
 */
export function detectArchitecturalDrift(files: FileData[], rules: ArchitectureRule[] = defaultBaseline): DriftViolation[] {
  const violations: DriftViolation[] = [];

  for (const file of files) {
    const sourceFile = ts.createSourceFile(
      file.path,
      file.content,
      ts.ScriptTarget.Latest,
      true
    );

    const imports: string[] = [];

    // Traverse the AST to find import declarations
    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        let importPath = node.moduleSpecifier.getText().replace(/['"]/g, '');
        // handle relative or alias paths, simplistic resolution
        if (importPath.startsWith('@/')) {
          importPath = importPath.replace('@/', '');
        }
        imports.push(importPath);
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    // Evaluate rules
    for (const rule of rules) {
      if (rule.sourcePattern.test(file.path)) {
        for (const imp of imports) {
          if (rule.disallowedTargetPattern.test(imp)) {
            violations.push({
              sourceFile: file.path,
              targetDependency: imp,
              severity: "high", // simplified
              docSnippet: rule.message,
              codeSnippet: `import ... from '${imp}'`
            });
          }
        }
      }
    }
  }

  return violations;
}

/**
 * Helper to generate 'Drift' exhibit artifact data
 */
export function generateDriftExhibit(violations: DriftViolation[]) {
  if (violations.length === 0) return null;
  
  // Create an exhibit based on the top violation
  const topViolation = violations[0];
  
  return {
    id: `drift-${Date.now()}`,
    type: 'drift' as const,
    title: `Architectural Drift in ${topViolation.sourceFile.split('/').pop()}`,
    summary: 'Component boundaries constraint violated.',
    narrative: `The file ${topViolation.sourceFile} includes a dependency on ${topViolation.targetDependency}, which violates the established baseline: ${topViolation.docSnippet}`,
    agent: 'DriftDetector',
    timestamp: new Date().toISOString(),
    severity: topViolation.severity === 'high' ? 'critical' : 'warning',
    data: {
      severity: topViolation.severity,
      docSnippet: topViolation.docSnippet,
      codeSnippet: topViolation.codeSnippet
    }
  };
}
