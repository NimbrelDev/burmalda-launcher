// Remote configuration endpoints and fetch helpers for launcher updates and
// player announcements. Primary mirror: GitFlic; Secondary backup mirror: Codeberg.
import { app } from 'electron';

// Remote configuration endpoints for launcher updates and player announcements
// Primary mirror: GitFlic; Secondary backup mirror: Codeberg
const UPDATE_CONFIG_URLS = [
  'https://gitflic.ru/project/nimbrel/rust-launcher/blob/raw?file=version.json',
  'https://codeberg.org/Nimbrel/rust-launcher/raw/branch/main/version.json',
];

const BROADCAST_CONFIG_URLS = [
  'https://gitflic.ru/project/nimbrel/rust-launcher/blob/raw?file=broadcast.json',
];

// Helper to compare SemVer versions (e.g. "1.0.0" vs "1.0.1")
function compareSemver(a, b) {
  if (!a || !b) return 0;
  const cleanA = String(a).replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const cleanB = String(b).replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(cleanA.length, cleanB.length); i++) {
    const valA = cleanA[i] || 0;
    const valB = cleanB[i] || 0;
    if (valA > valB) return 1;
    if (valA < valB) return -1;
  }
  return 0;
}

// Fetch single remote JSON with status and network error differentiation
async function fetchSingleRemoteJson(url) {
  if (!url) return { ok: false, status: 0, data: null, isNetworkError: false };
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(4500),
      headers: {
        'User-Agent': `Burmalda-Launcher/${app.getVersion()} (${process.platform})`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim().startsWith('{')) {
        return { ok: true, status: response.status, data: JSON.parse(text), isNetworkError: false };
      }
    }
    return { ok: false, status: response.status, data: null, isNetworkError: false };
  } catch (err) {
    return { ok: false, status: 0, data: null, isNetworkError: true, error: err.message };
  }
}

// Version checking: query all mirrors, whichever mirror shows higher version is authoritative truth
async function fetchHighestVersionConfig(urls) {
  if (!urls || urls.length === 0) return null;
  const results = await Promise.all(urls.map(url => fetchSingleRemoteJson(url)));
  const validConfigs = results.filter(r => r.ok && r.data).map(r => r.data);

  if (validConfigs.length === 0) return null;
  if (validConfigs.length === 1) return validConfigs[0];

  // Whichever mirror has higher latestVersion wins
  let best = validConfigs[0];
  for (let i = 1; i < validConfigs.length; i++) {
    const candidate = validConfigs[i];
    const latestDiff = compareSemver(candidate.latestVersion, best.latestVersion);
    if (latestDiff > 0) {
      best = candidate;
    } else if (latestDiff === 0) {
      const minDiff = compareSemver(candidate.minSupportedVersion, best.minSupportedVersion);
      if (minDiff > 0) {
        best = candidate;
      }
    }
  }

  // If any valid mirror demands a higher minSupportedVersion (security kill-switch), respect it
  for (const cfg of validConfigs) {
    if (compareSemver(cfg.minSupportedVersion, best.minSupportedVersion) > 0) {
      best.minSupportedVersion = cfg.minSupportedVersion;
      if (cfg.blockedTitle) best.blockedTitle = cfg.blockedTitle;
      if (cfg.blockedMessage) best.blockedMessage = cfg.blockedMessage;
    }
  }

  return best;
}

// Announcements: takes announcement strictly from primary site (GitFlic).
// If primary returns 404 (deleted/renamed), announcement is OFF (do not resurrect from backup).
// Secondary (Codeberg) is only used as a standby fallback if primary has network connection error.
async function fetchBroadcastFromPrimary(primaryUrl, backupUrl) {
  if (!primaryUrl) {
    if (backupUrl) {
      const bRes = await fetchSingleRemoteJson(backupUrl);
      return (bRes.ok && bRes.data && bRes.data.message) ? bRes.data : null;
    }
    return null;
  }

  // 1. Try primary site
  const primaryRes = await fetchSingleRemoteJson(primaryUrl);
  if (primaryRes.ok && primaryRes.data && primaryRes.data.message) {
    return primaryRes.data;
  }

  // If primary responded with HTTP error (e.g. 404 Not Found) - file is deliberately off!
  if (!primaryRes.isNetworkError && primaryRes.status !== 0) {
    return null;
  }

  // 2. Only if primary failed due to network / connection failure, fall back to backup
  if (backupUrl) {
    const backupRes = await fetchSingleRemoteJson(backupUrl);
    if (backupRes.ok && backupRes.data && backupRes.data.message) {
      return backupRes.data;
    }
  }

  return null;
}

export {
  UPDATE_CONFIG_URLS,
  BROADCAST_CONFIG_URLS,
  compareSemver,
  fetchSingleRemoteJson,
  fetchHighestVersionConfig,
  fetchBroadcastFromPrimary,
};
