#!/usr/bin/env node
// Turbo Console Log pre-commit hook
// Managed by the Turbo Console Log VS Code extension. Do not edit manually.
//
// Connects to the running VS Code instance over a local socket and delegates
// the cleanup decision. The rendezvous is a pointer file under the user's HOME
// (NOT the working tree), keyed by the repo's canonical toplevel.
//
// FAIL-OPEN by design: if VS Code is not running, the pointer/socket is
// missing, or anything errors, the commit proceeds (exit 0). The ONLY non-zero
// exits are the two deliberate ones: the user dismissed/aborted the dialog, or
// the cleaned files could not be re-staged (committing them would defeat the
// user's explicit "Remove & Commit" choice).

'use strict';

const net = require('net');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

// 60s default; overridable (mainly so tests can exercise the fail-open timeout).
const TIMEOUT_MS = Number(process.env.TURBO_HOOK_TIMEOUT_MS) || 60_000;

// After this long without a decision, print a one-line hint to the terminal so a
// CLI commit doesn't look frozen while a modal waits in VS Code. Stays silent on
// the common fast path (no logs / instant reply). Overridable for tests.
const HINT_DELAY_MS = Number(process.env.TURBO_HOOK_HINT_MS) || 1500;

function md5(value) {
  return crypto.createHash('md5').update(value).digest('hex').substring(0, 8);
}

function normalizeRoot(p) {
  return path.normalize(p).replace(/[\\/]+$/, '');
}

function repoToplevel() {
  try {
    const top = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    }).trim();
    if (top) return top;
  } catch {
    /* not a git repo via this path — fall back to cwd */
  }
  return process.cwd();
}

function pointerPathForRoot(root) {
  return path.join(
    os.homedir(),
    '.turbo-console-log',
    'pointers',
    `${md5(normalizeRoot(root))}.sock`,
  );
}

function readSocketPath(pointerPath) {
  try {
    const value = fs.readFileSync(pointerPath, 'utf8').trim();
    return value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function restageFiles(filePaths) {
  // Returns true if every file was re-staged. Files were skipped server-side
  // when partially staged, so a blanket per-file `git add` is safe here.
  if (!filePaths || filePaths.length === 0) return true;
  let allOk = true;
  for (const file of filePaths) {
    try {
      execFileSync('git', ['add', '--', file], { stdio: 'inherit' });
    } catch (err) {
      allOk = false;
      process.stderr.write(
        `[turbo-console-log] Failed to re-stage cleaned file: ${file} (${err.message})\n`,
      );
    }
  }
  return allOk;
}

function run() {
  const root = repoToplevel();
  const pointerPath = pointerPathForRoot(root);

  const socketPath = readSocketPath(pointerPath);
  if (!socketPath) {
    // VS Code extension not active for this repo — proceed without cleanup.
    process.exit(0);
  }

  let settled = false;
  let hintTimer = null;
  function settle(exitCode) {
    if (settled) return;
    settled = true;
    if (hintTimer) clearTimeout(hintTimer);
    process.exit(exitCode);
  }

  // Tell the terminal WHY the commit is pausing if a decision takes a moment.
  hintTimer = setTimeout(() => {
    if (!settled) {
      process.stderr.write(
        '[turbo-console-log] Waiting for the cleanup decision — review the dialog in VS Code…\n',
      );
    }
  }, HINT_DELAY_MS);

  const connectArg =
    process.platform === 'win32' ? { path: socketPath } : socketPath;

  const client = net.createConnection(connectArg, () => {
    client.write(
      JSON.stringify({ type: 'pre-commit', repoPath: root }) + '\n',
    );
  });

  let buffer = '';
  client.on('data', (chunk) => {
    buffer += chunk.toString();
    const nlIdx = buffer.indexOf('\n');
    if (nlIdx === -1) return;

    const raw = buffer.substring(0, nlIdx);
    client.destroy();

    let response;
    try {
      response = JSON.parse(raw);
    } catch {
      settle(0); // malformed reply — fail open
      return;
    }

    if (!response.proceed) {
      process.stderr.write(
        '[turbo-console-log] Commit cancelled from the cleanup dialog in VS Code.\n',
      );
      settle(1);
      return;
    }

    const restaged = restageFiles(response.filesToRestage);
    if (!restaged) {
      process.stderr.write(
        '[turbo-console-log] Could not re-stage cleaned files; aborting so logs are not committed. Re-run your commit.\n',
      );
      settle(1);
      return;
    }
    settle(0);
  });

  client.on('error', () => {
    // Cannot reach VS Code — fail open.
    settle(0);
  });

  client.on('end', () => {
    settle(0);
  });

  // Safety net: never block a commit indefinitely.
  setTimeout(() => {
    if (!settled) {
      process.stderr.write(
        '[turbo-console-log] Cleanup dialog timed out — proceeding with commit.\n',
      );
      try {
        client.destroy();
      } catch {
        /* ignore */
      }
      settle(0);
    }
  }, TIMEOUT_MS);
}

run();
