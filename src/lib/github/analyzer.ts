import { Octokit } from '@octokit/rest';
import { GitHubFinding, GitHubAnalysis } from '@/types';

export async function analyzeGitHubRepo(
  owner: string,
  repo: string,
  websiteId: string,
  githubToken?: string
): Promise<GitHubAnalysis> {
  const octokit = new Octokit({ auth: githubToken });
  const findings: GitHubFinding[] = [];
  let framework = 'unknown';
  let hasSitemap = false;
  let hasRobotsTxt = false;
  let hasStructuredData = false;

  try {
    // Get repo tree
    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: 'HEAD',
      recursive: '1',
    });

    const files = tree.tree.map(f => f.path || '');

    // Check for sitemap and robots.txt
    hasSitemap = files.some(f => f.includes('sitemap') && (f.endsWith('.xml') || f.endsWith('.ts') || f.endsWith('.js')));
    hasRobotsTxt = files.some(f => f === 'robots.txt' || f === 'public/robots.txt');

    if (!hasSitemap) {
      findings.push({
        type: 'missing-sitemap',
        file: 'public/',
        description: 'No sitemap.xml found. Search engines cannot efficiently crawl your site.',
        severity: 'high',
      });
    }

    if (!hasRobotsTxt) {
      findings.push({
        type: 'missing-robots',
        file: 'public/',
        description: 'No robots.txt found. Search engines have no guidance on which pages to crawl.',
        severity: 'medium',
      });
    }

    // Check package.json for framework
    const pkgFile = tree.tree.find(f => f.path === 'package.json');
    if (pkgFile?.sha) {
      try {
        const { data: pkgBlob } = await octokit.git.getBlob({ owner, repo, file_sha: pkgFile.sha });
        const pkgContent = Buffer.from(pkgBlob.content, 'base64').toString();
        const pkg = JSON.parse(pkgContent);
        
        if (pkg.dependencies?.next) framework = 'nextjs';
        else if (pkg.dependencies?.nuxt) framework = 'nuxtjs';
        else if (pkg.dependencies?.react) framework = 'react';
        else if (pkg.dependencies?.vue) framework = 'vue';
        else if (pkg.dependencies?.svelte) framework = 'svelte';
      } catch {}
    }

    // Check key HTML/JSX files for SEO issues
    const htmlFiles = tree.tree
      .filter(f => f.path && (f.path.endsWith('.html') || f.path.includes('layout') || f.path.includes('_document')))
      .slice(0, 10);

    for (const file of htmlFiles) {
      if (!file.sha || !file.path) continue;
      try {
        const { data: blob } = await octokit.git.getBlob({ owner, repo, file_sha: file.sha });
        const content = Buffer.from(blob.content, 'base64').toString();

        // Check for meta tags
        if (!content.includes('<meta') && !content.includes('metadata') && !content.includes('generateMetadata')) {
          findings.push({
            type: 'missing-meta',
            file: file.path,
            description: 'Missing meta tags (title, description). Critical for SEO.',
            severity: 'critical',
          });
        }

        // Check for Open Graph
        if (!content.includes('og:title') && !content.includes('openGraph')) {
          findings.push({
            type: 'missing-og',
            file: file.path,
            description: 'Missing Open Graph meta tags. Social sharing will show poor previews.',
            severity: 'medium',
          });
        }

        // Check for canonical
        if (!content.includes('canonical')) {
          findings.push({
            type: 'missing-canonical',
            file: file.path,
            description: 'Missing canonical URL tags. Risk of duplicate content penalties.',
            severity: 'medium',
          });
        }

        // Check for structured data
        if (content.includes('application/ld+json')) {
          hasStructuredData = true;
        }
      } catch {}
    }

    if (!hasStructuredData) {
      findings.push({
        type: 'missing-structured-data',
        file: 'pages/',
        description: 'No JSON-LD structured data found. Missing rich snippet opportunities.',
        severity: 'medium',
      });
    }

    // Check for image optimization
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|bmp)$/i.test(f));
    if (imageFiles.length > 0 && framework === 'nextjs') {
      const hasNextImage = tree.tree.some(f => 
        f.path && (f.path.endsWith('.tsx') || f.path.endsWith('.jsx')) && f.type === 'blob'
      );
      if (hasNextImage) {
        findings.push({
          type: 'image-optimization',
          file: 'general',
          description: `Found ${imageFiles.length} unoptimized image(s). Use Next.js Image component for better Core Web Vitals.`,
          severity: 'medium',
        });
      }
    }

  } catch (error: any) {
    findings.push({
      type: 'analysis-error',
      file: 'repository',
      description: `Could not fully analyze repository: ${error.message}`,
      severity: 'info',
    });
  }

  return {
    websiteId,
    repo: `${owner}/${repo}`,
    createdAt: new Date().toISOString(),
    findings,
    framework,
    hasSitemap,
    hasRobotsTxt,
    hasStructuredData,
  };
}
