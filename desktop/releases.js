// Horizon release catalog: GitHub Releases parsing, bundled fallback and cache
import fs from 'fs';
import path from 'path';
import { SRC_DIR, RELEASES_CACHE_FILE } from './paths.js';

// Extract clean version name without changelogs or redundant descriptions
function extractCleanVersionName(rawName, tagName, isNightly) {
  if (isNightly) {
    const dateMatch = (rawName || tagName || '').match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) return `Nightly ${dateMatch[1]}`;
    return 'Horizon Nightly';
  }
  const verMatch = (rawName || tagName || '').match(/0\.\d+\.\d+/);
  if (verMatch) return `Horizon ${verMatch[0]}`;
  const split = (rawName || tagName || '').split(':')[0].trim();
  return split || tagName;
}

// Parse supported Minecraft versions from Horizon release metadata
function parseSupportedMcVersions(release) {
  const text = `${release.name || ''} ${release.body || ''} ${release.tag_name || release.tag || ''}`;
  const found = new Set();

  const matches = text.match(/\b(26\.\d+|1\.\d+(?:\.\d+)?)\b/g);
  if (matches) {
    for (const m of matches) {
      if (m.startsWith('0.') || m === '2026' || m.length > 8) continue;
      if (m.startsWith('26.') || (m.startsWith('1.') && parseFloat(m.slice(2)) >= 14)) {
        found.add(m);
      }
    }
  }

  if (release.mcVersion) found.add(release.mcVersion);
  if (found.size === 0) found.add('26.3');

  return Array.from(found).sort((a, b) => {
    const numA = a.split('.').map(Number);
    const numB = b.split('.').map(Number);
    for (let i = 0; i < Math.max(numA.length, numB.length); i++) {
      const diff = (numA[i] || 0) - (numB[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });
}

function loadBundledReleases() {
  try {
    const bundledPath = path.join(SRC_DIR, 'assets', 'horizon_releases.json');
    if (fs.existsSync(bundledPath)) {
      const items = JSON.parse(fs.readFileSync(bundledPath, 'utf-8'));
      return items.map(r => {
        const isNightly = Boolean(r.prerelease || (r.tag && r.tag.includes('nightly')));
        const supported = r.supportedMcVersions || [r.mcVersion || '26.3'];
        return {
          ...r,
          name: extractCleanVersionName(r.name, r.tag, isNightly),
          status: isNightly ? 'Nightly' : 'Релиз',
          supportedMcVersions: supported,
          defaultMcVersion: r.defaultMcVersion || supported[supported.length - 1] || '26.3',
        };
      });
    }
  } catch (_) {}
  return [];
}

const DEFAULT_RELEASES = loadBundledReleases();

function cleanReleaseDescription(text, isNightly) {
  if (!text) return isNightly ? 'Экспериментальная сборка Nightly.' : 'Стабильный релиз движка Horizon.';
  return text
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown link to text
    .replace(/[#*`_~]/g, '') // remove markdown markup
    .replace(/\s+/g, ' ')
    .trim();
}

// Dynamic GitHub Releases Parser with instant cache serving
async function fetchOnlineReleases() {
  // If local cache exists, serve instantly for instant UI rendering!
  if (fs.existsSync(RELEASES_CACHE_FILE)) {
    try {
      const cached = JSON.parse(fs.readFileSync(RELEASES_CACHE_FILE, 'utf-8'));
      if (Array.isArray(cached) && cached.length > 0) {
        // Trigger background update without delaying UI
        setTimeout(fetchFreshReleases, 100);
        return cached;
      }
    } catch (_) {}
  }

  return await fetchFreshReleases();
}

async function fetchFreshReleases() {
  try {
    const response = await fetch('https://api.github.com/repos/horizon-rust/horizon/releases?per_page=30', {
      headers: {
        'User-Agent': 'Zenith-Launcher/1.0 (Linux; x86_64)',
        'Accept': 'application/vnd.github.v3+json',
      },
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned HTTP ${response.status}`);
    }

    const rawReleases = await response.json();
    if (!Array.isArray(rawReleases)) {
      throw new Error('Invalid JSON format from GitHub API');
    }

    // Filter out tags starting with launcher@
    const filtered = rawReleases.filter(r => !r.tag_name.startsWith('launcher@'));

    const parsed = filtered.map(r => {
      const isNightly = Boolean(r.prerelease || r.tag_name.includes('nightly'));
      const cleanName = extractCleanVersionName(r.name, r.tag_name, isNightly);
      const supportedMcVersions = parseSupportedMcVersions(r);
      const defaultMcVersion = supportedMcVersions[supportedMcVersions.length - 1] || '26.3';

      return {
        id: r.tag_name,
        tag: r.tag_name,
        name: cleanName,
        prerelease: isNightly,
        channel: isNightly ? 'nightly' : 'stable',
        status: isNightly ? 'Nightly' : 'Релиз',
        supportedMcVersions,
        defaultMcVersion,
        publishedAt: (r.published_at || '').split('T')[0] || '2026-10-28',
        description: cleanReleaseDescription(r.body, isNightly),
        assets: (r.assets || []).map(a => ({
          name: a.name,
          size: a.size,
          sizeFormatted: `${Math.round((a.size || 0) / (1024 * 1024))} МБ`,
          downloadUrl: a.browser_download_url,
        })),
      };
    });

    if (parsed.length > 0) {
      fs.writeFileSync(RELEASES_CACHE_FILE, JSON.stringify(parsed, null, 2));
      return parsed;
    }
  } catch (err) {
    console.warn('GitHub Releases fetch note:', err.message);
  }

  // Fallback to cache file if present
  try {
    if (fs.existsSync(RELEASES_CACHE_FILE)) {
      const cached = JSON.parse(fs.readFileSync(RELEASES_CACHE_FILE, 'utf-8'));
      if (Array.isArray(cached) && cached.length > 0) return cached;
    }
  } catch (_) {}

  return DEFAULT_RELEASES;
}

export {
  DEFAULT_RELEASES,
  fetchOnlineReleases,
  fetchFreshReleases,
};
