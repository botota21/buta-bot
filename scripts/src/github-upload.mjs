import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'botota21';
const REPO = 'buta-bot';
const BASE = '/home/runner/workspace';

if (!TOKEN) { console.error('GITHUB_TOKEN not set'); process.exit(1); }

const headers = {
  'Authorization': `token ${TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
  'User-Agent': 'buta-bot-uploader'
};

async function api(method, endpoint, body) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (res.status >= 400) throw new Error(`${method} ${endpoint} → ${res.status}: ${data.message}`);
  return data;
}

const IGNORE = [
  '/node_modules/', '/.git/', '/.local/', '/.cache/',
  '/.upm/', '/.config/', '/.agents/', '/mockup-sandbox/',
  '.tsbuildinfo', '/pnpm-lock.yaml', '/.replit-artifact/'
];

// Only keep the prebuilt bundle from dist/ (Render runs this directly);
// skip source maps and everything else under dist/.
function isAllowedDistFile(full) {
  if (!full.includes('/dist/')) return true;
  return full.endsWith('/dist/index.mjs');
}

function collectFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (IGNORE.some(p => full.includes(p))) continue;
    if (!isAllowedDistFile(full)) continue;
    if (entry.isDirectory()) collectFiles(full, files);
    else files.push({ full, rel: full.replace(BASE + '/', '') });
  }
  return files;
}

async function run() {
  const user = await api('GET', '/user');
  console.log(`✓ Auth: ${user.login}`);

  // Ensure repo exists
  try {
    await api('GET', `/repos/${OWNER}/${REPO}`);
    console.log(`✓ Repo exists`);
  } catch {
    await api('POST', '/user/repos', {
      name: REPO, private: false, auto_init: false, description: 'بوته - Discord Bot'
    });
    console.log(`✓ Repo created`);
  }

  // Step 1: Initialize repo with a README via Contents API (works on empty repos)
  console.log('✓ Initializing repo with first commit...');
  let baseSha = null;
  try {
    const init = await api('PUT', `/repos/${OWNER}/${REPO}/contents/README.md`, {
      message: 'init',
      content: Buffer.from('# بوته Discord Bot').toString('base64')
    });
    baseSha = init.commit.sha;
    console.log(`✓ Init commit: ${baseSha}`);
  } catch (e) {
    // Repo already has commits - get HEAD sha
    console.log('Repo already initialized, getting HEAD...');
    const ref = await api('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/main`);
    baseSha = ref.object.sha;
  }

  // Step 2: Get base tree from init commit
  const baseCommit = await api('GET', `/repos/${OWNER}/${REPO}/git/commits/${baseSha}`);
  const baseTreeSha = baseCommit.tree.sha;
  console.log(`✓ Base tree: ${baseTreeSha}`);

  // Step 3: Collect all files
  const files = collectFiles(BASE);
  console.log(`✓ Found ${files.length} files`);

  // Step 4: Create blobs
  const tree = [];
  for (const { full, rel } of files) {
    try {
      const content = fs.readFileSync(full);
      const blob = await api('POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
        content: content.toString('base64'),
        encoding: 'base64'
      });
      tree.push({ path: rel, mode: '100644', type: 'blob', sha: blob.sha });
      process.stdout.write(`  ↑ ${rel}\n`);
    } catch (e) {
      console.warn(`  ✗ Skipped ${rel}: ${e.message}`);
    }
  }

  // Step 5: Create new tree on top of base
  console.log(`\n✓ Creating tree (${tree.length} files)...`);
  const newTree = await api('POST', `/repos/${OWNER}/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree
  });

  // Step 6: Create commit
  console.log('✓ Creating commit...');
  const commit = await api('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
    message: 'feat: complete bot setup - بوته Discord Bot\n\n18 slash commands (moderation + fun), auto-reply system',
    tree: newTree.sha,
    parents: [baseSha]
  });

  // Step 7: Update main branch
  console.log('✓ Updating main branch...');
  try {
    await api('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/main`, {
      sha: commit.sha, force: true
    });
  } catch {
    await api('POST', `/repos/${OWNER}/${REPO}/git/refs`, {
      ref: 'refs/heads/main', sha: commit.sha
    });
  }

  // Step 8: Set default branch
  await api('PATCH', `/repos/${OWNER}/${REPO}`, { default_branch: 'main' });

  console.log(`\n✅ All done!`);
  console.log(`🔗 https://github.com/${OWNER}/${REPO}`);
  console.log(`📁 ${tree.length} files uploaded`);
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
