import type { NextConfig } from 'next';

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
const repoBasePath = isGitHubActions ? '/FEARLESS' : '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: repoBasePath,
  assetPrefix: repoBasePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
