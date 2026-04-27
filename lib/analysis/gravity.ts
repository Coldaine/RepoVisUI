export interface GitCommit {
  hash: string;
  author: string;
  message: string;
  timestamp: string;
  filesChanged: string[];
}

export interface CoEditTarget {
  name: string;
  coEditScore: number; 
  commits: number;
  logEntries: string[];
}

export interface FileGravityResult {
  centerFile: string;
  totalCommits: number;
  satellites: CoEditTarget[];
}

/**
 * Parses commit history to calculate the "File Gravity" metric,
 * representing how strongly files are bound together through co-editing.
 */
export function calculateFileGravity(commits: GitCommit[], targetFile: string): FileGravityResult {
  let targetCommitsCount = 0;
  const coEditMap = new Map<string, { count: number; messages: string[] }>();

  // Parse commits to assign co-edit scores
  for (const commit of commits) {
    if (commit.filesChanged.includes(targetFile)) {
      targetCommitsCount++;
      for (const file of commit.filesChanged) {
        if (file !== targetFile) {
          const existing = coEditMap.get(file) || { count: 0, messages: [] };
          existing.count++;
          if (existing.messages.length < 3) {
             existing.messages.push(commit.message);
          }
          coEditMap.set(file, existing);
        }
      }
    }
  }

  // Calculate normalized scores and format output
  const satellites: CoEditTarget[] = [];
  for (const [file, data] of coEditMap.entries()) {
    satellites.push({
      name: file,
      coEditScore: targetCommitsCount > 0 ? +(data.count / targetCommitsCount).toFixed(2) : 0,
      commits: data.count,
      logEntries: data.messages
    });
  }

  // Sort satellites by score descending
  satellites.sort((a, b) => b.coEditScore - a.coEditScore);

  return {
    centerFile: targetFile,
    totalCommits: targetCommitsCount,
    satellites
  };
}

/**
 * Generates an exhibit payload natively tailored for the 'Focus' macro type.
 */
export function generateFocusExhibit(gravityData: FileGravityResult) {
  if (gravityData.totalCommits === 0) return null;

  return {
    id: `focus-${Date.now()}`,
    type: 'focus' as const,
    title: `${gravityData.centerFile.split('/').pop()} Gravity`,
    summary: 'Deep dive into structural cohesion mechanics.',
    narrative: `The ${gravityData.centerFile} node exhibits high magnetic pull. Analyzed ${gravityData.totalCommits} localized commits. Top satellite is ${gravityData.satellites[0]?.name || 'none'} coupling at ${(gravityData.satellites[0]?.coEditScore || 0) * 100}%.`,
    agent: 'FocusTracker',
    timestamp: new Date().toISOString(),
    severity: (gravityData.satellites[0]?.coEditScore || 0) > 0.8 ? 'warning' : 'healthy',
    data: {
      center: {
        name: gravityData.centerFile,
        commitFrequency: gravityData.totalCommits
      },
      satellites: gravityData.satellites.slice(0, 15) // Limit to top 15 satellites for optimal D3 viz
    }
  };
}
