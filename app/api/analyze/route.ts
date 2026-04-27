import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { detectArchitecturalDrift, generateDriftExhibit, FileData } from '@/lib/analysis/drift';
import { calculateFileGravity, generateFocusExhibit, GitCommit } from '@/lib/analysis/gravity';

export async function GET() {
  try {
    // 1. Analyze Architectural Drift
    // Here we read a couple of real files from the project to AST Parse
    const filesToAnalyze: FileData[] = [];
    
    const readDirRecursive = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          readDirRecursive(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          // Format path to look somewhat like workspace relative
          filesToAnalyze.push({ path: fullPath.split('.next')[0], content });
        }
      }
    };

    // Analyze lib directory for components importing (intentional drift test case)
    try {
      const libPath = path.join(process.cwd(), 'lib');
      readDirRecursive(libPath);
    } catch (e) {
      console.error('Failed reading lib dir', e);
    }

    const driftViolations = detectArchitecturalDrift(filesToAnalyze);
    const driftExhibit = generateDriftExhibit(driftViolations); // Will return null if no drift, may need a mock if clean


    // 2. Generate File Gravity (Focus Exhibit)
    // We mock git log output for demonstration, as Node doesn't have native git parsing without 'child_process' 
    // and running arbitrary commands may have mixed results in this container.
    const mockCommits: GitCommit[] = [
      {
        hash: 'a1b2c3d', author: 'pmaclyman', timestamp: '2026-04-10T10:00:00Z',
        message: 'fix: updated exhibits and page layout',
        filesChanged: ['app/page.tsx', 'lib/exhibits.ts', 'components/ui/card.tsx']
      },
      {
        hash: 'e5f6g7h', author: 'pmaclyman', timestamp: '2026-04-12T11:00:00Z',
        message: 'feat: add audio audio triggers',
        filesChanged: ['app/page.tsx', 'lib/audio.ts']
      },
      {
        hash: 'i8j9k0l', author: 'pmaclyman', timestamp: '2026-04-15T12:00:00Z',
        message: 'refactor: exhibit models',
        filesChanged: ['lib/exhibits.ts', 'app/page.tsx']
      },
      {
        hash: 'm1n2o3p', author: 'pmaclyman', timestamp: '2026-04-16T13:00:00Z',
        message: 'feat: deep dives',
        filesChanged: ['app/page.tsx', 'lib/exhibits.ts', 'lib/utils.ts']
      }
    ];

    const gravityResult = calculateFileGravity(mockCommits, 'app/page.tsx');
    const focusExhibit = generateFocusExhibit(gravityResult);

    return NextResponse.json({
      drift: driftExhibit || { message: "No drift detected natively." },
      focus: focusExhibit || { message: "No gravity metrics generated." }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
