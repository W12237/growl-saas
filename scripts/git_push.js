const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');

async function main() {
  console.log("Initializing Git repo via Isomorphic-Git...");

  // 1. Initialize repo
  await git.init({ fs, dir });

  // 2. Read gitignore
  const gitignoreContent = fs.readFileSync(path.join(dir, '.gitignore'), 'utf8');
  const ignoredPatterns = gitignoreContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  function isIgnored(filepath) {
    if (filepath.startsWith('.git/')) return true;
    if (filepath.startsWith('node_modules/')) return true;
    if (filepath.startsWith('.next/')) return true;
    if (filepath.endsWith('.db') || filepath.endsWith('.db-journal')) return true;
    if (filepath === '.DS_Store') return true;
    return false;
  }

  // Helper to recursively walk files
  function getAllFiles(dirPath, relativePath = '') {
    let results = [];
    const list = fs.readdirSync(dirPath);
    for (const file of list) {
      const fullPath = path.join(dirPath, file);
      const relPath = relativePath ? `${relativePath}/${file}` : file;
      if (isIgnored(relPath)) continue;

      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getAllFiles(fullPath, relPath));
      } else {
        results.push(relPath);
      }
    }
    return results;
  }

  console.log("Staging files...");
  const files = getAllFiles(dir);
  for (const filepath of files) {
    await git.add({ fs, dir, filepath });
  }

  console.log(`Staged ${files.length} files.`);

  // 3. Commit
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Wessam',
      email: 'wessam@growl.cloud',
    },
    message: 'first commit: Agency OS SaaS codebase',
  });

  console.log(`Commit created with SHA: ${sha}`);

  // 4. Update branch to main
  await git.branch({ fs, dir, ref: 'main', checkout: true });

  // 5. Add remote
  const remoteUrl = 'https://github.com/W12237/growl-saas.git';
  try {
    await git.addRemote({ fs, dir, remote: 'origin', url: remoteUrl });
  } catch (e) {
    await git.deleteRemote({ fs, dir, remote: 'origin' });
    await git.addRemote({ fs, dir, remote: 'origin', url: remoteUrl });
  }

  console.log(`Remote origin set to ${remoteUrl}`);
  console.log("Ready to push!");
}

main().catch(err => {
  console.error("Git error:", err);
});
