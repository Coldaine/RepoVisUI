import { describe, it, expect } from 'vitest';
import { calculateFileGravity, GitCommit } from '../lib/analysis/gravity';

describe('File Gravity Calculation', () => {
  it('should rank co-edited files accurately and output the total local commits', () => {
    const mockCommits: GitCommit[] = [
      {
        hash: 'A', author: 'pmaclyman', timestamp: '2026-04-10T10:00:00Z',
        message: 'fix: updated exhibits',
        filesChanged: ['app/page.tsx', 'lib/exhibits.ts', 'components/ui/card.tsx']
      },
      {
        hash: 'B', author: 'pmaclyman', timestamp: '2026-04-12T11:00:00Z',
        message: 'feat: add audio',
        filesChanged: ['app/page.tsx', 'lib/audio.ts']
      },
      {
        hash: 'C', author: 'pmaclyman', timestamp: '2026-04-15T12:00:00Z',
        message: 'refactor: models',
        filesChanged: ['lib/exhibits.ts', 'app/page.tsx']
      }
    ];

    const result = calculateFileGravity(mockCommits, 'app/page.tsx');

    // app/page.tsx was in 3 commits total.
    expect(result.totalCommits).toBe(3);
    expect(result.centerFile).toBe('app/page.tsx');

    // Expected co-edit metrics: 
    // lib/exhibits.ts appeared twice with page.tsx (Commits A, C). Score = 2/3 = 0.67
    // components/ui/card.tsx appeared once (Commit A). Score = 1/3 = 0.33
    // lib/audio.ts appeared once (Commit B). Score = 1/3 = 0.33

    const satellites = result.satellites;
    expect(satellites.length).toBe(3);
    
    // Sort logic inherently ranks exhibits.ts first
    expect(satellites[0].name).toBe('lib/exhibits.ts');
    expect(satellites[0].coEditScore).toBeGreaterThan(0.66);
    
    // Check log entry capturing
    expect(satellites[0].logEntries).toContain('fix: updated exhibits');
  });

  it('should handle zero overlap cleanly', () => {
    const mockCommits: GitCommit[] = [
      {
        hash: 'D', author: 'user', timestamp: '2026-04-20',
        message: 'update readme',
        filesChanged: ['README.md']
      }
    ];

    const result = calculateFileGravity(mockCommits, 'app/page.tsx');
    expect(result.totalCommits).toBe(0);
    expect(result.satellites.length).toBe(0);
  });
});
