#!/usr/bin/env node
// Delivery mode and GitHub route: which mode does this repository deliver in, and how is GitHub reached from here?
//   node gh-route.mjs [repo-dir] [github|local]
// Mode: an explicit argument, else the Flow block's `Delivery:` line, else GitHub when `origin` is a GitHub repository,
// else local. A default branch whose rules require pull requests forces GitHub mode.
// Route: `gh` when `gh pr list` works; `rest` (`gh api`) when GraphQL is refused but REST works; `none` otherwise.
// Prints JSON {mode, route, owner, repo, defaultBranch, reason}. Exit 0, or 1 in GitHub mode with no route (fail closed).
// Judges a route by trying it, never by `gh auth status`. Zero dependencies, Node >= 22.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const MODES = ['github', 'local']
const LEGACY_GITHUB = ['pull-request', 'pull-requests', 'pullrequest', 'pr']

/** Runs a command with an argument array; returns stdout, throws like execFileSync. Injectable for tests. */
export function runCommand(cmd, args, { cwd, timeout = 15_000 } = {}) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 })
}

/** `{owner, repo}` when a remote URL points at github.com (https, ssh, scp-like); null otherwise. */
export function parseGithubRemote(url) {
  const match = /^(?:[a-z][\w+.-]*:\/\/)?(?:[^@/\s]+@)?github\.com(?::\d+)?[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/iu.exec(String(url).trim())
  return match ? { owner: match[1], repo: match[2] } : null
}

export function normalizeMode(value) {
  const mode = String(value ?? '').trim().toLowerCase().replace(/[\s_]+/gu, '-')
  if (LEGACY_GITHUB.includes(mode)) return 'github'
  return MODES.includes(mode) ? mode : null
}

/** The `Delivery:` line inside the Flow block of a text (the format `flow`'s flow-block.mjs writes); null when absent. */
export function readDelivery(text) {
  const block = /<!-- BEGIN FLOW -->([\s\S]*?)<!-- END FLOW -->/u.exec(String(text ?? ''))?.[1]
  return block ? normalizeMode(/^Delivery:[ \t]*(.*)$/imu.exec(block)?.[1]) : null
}

const failure = (error) => {
  if (error?.code === 'ENOENT') return 'gh not installed'
  if (error?.code === 'ETIMEDOUT' || error?.killed) return 'GitHub request timed out'
  const stderr = String(error?.stderr ?? error?.message ?? '')
  if (/auth login|not logged in|authenticat/iu.test(stderr)) return 'gh not authenticated'
  if (/graphql/iu.test(stderr)) return 'GraphQL refused'
  if (/HTTP 403/u.test(stderr)) return 'GitHub refused the request (HTTP 403)'
  return `gh failed: ${stderr.trim().split('\n')[0] || 'unknown error'}`
}

export function route({ repoDir = '.', mode: requested = null, run = runCommand, readFile = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '') } = {}) {
  const tryRun = (cmd, args) => { try { return run(cmd, args, { cwd: repoDir }).trim() } catch { return null } }
  const reasons = []

  const remote = tryRun('git', ['remote', 'get-url', 'origin'])
  let slug = remote ? parseGithubRemote(remote) : null
  const localDefault = tryRun('git', ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'])?.replace(/^origin\//u, '') ?? null

  const fromArg = normalizeMode(requested)
  const fromBlock = fromArg ? null : ['AGENTS.md', 'CLAUDE.md'].map((f) => readDelivery(readFile(join(repoDir, f)))).find(Boolean) ?? null
  let mode = fromArg ?? fromBlock ?? (slug ? 'github' : 'local')
  reasons.push(fromArg ? `mode ${mode} from the request` : fromBlock ? `mode ${mode} from the Flow block's Delivery line` : slug ? 'origin is a GitHub repository' : remote ? 'origin is not a GitHub repository' : 'no origin remote')

  // A Delivery override on a remote gh resolves itself (host aliases): let gh fill the {owner}/{repo} placeholders.
  if (!slug && mode === 'github' && remote) {
    const view = tryRun('gh', ['api', 'repos/{owner}/{repo}'])
    try { const v = JSON.parse(view); if (v?.owner?.login && v?.name) slug = { owner: v.owner.login, repo: v.name } } catch {}
  }

  const out = (routeName, defaultBranch, extra) => ({ mode, route: routeName, owner: slug?.owner ?? null, repo: slug?.repo ?? null, defaultBranch, reason: [...reasons, extra].filter(Boolean).join('; ') })
  if (!slug) return out('none', localDefault ?? (tryRun('git', ['rev-parse', '--verify', '--quiet', 'refs/heads/main']) ? 'main' : null), mode === 'github' ? 'origin cannot be resolved to a GitHub repository' : null)

  const full = `${slug.owner}/${slug.repo}`
  let routeName = 'none'
  let why = null
  try {
    run('gh', ['pr', 'list', '--repo', full, '--limit', '1', '--json', 'number'], { cwd: repoDir })
    routeName = 'gh'
  } catch (error) {
    why = failure(error)
    if (why !== 'gh not installed') {
      try { run('gh', ['api', `repos/${full}`], { cwd: repoDir }); routeName = 'rest'; why = `${why}; REST through gh api works` } catch (restError) { why = `${why}; REST also failed: ${failure(restError)}` }
    }
  }

  let defaultBranch = localDefault
  if (routeName !== 'none') {
    const meta = tryRun('gh', ['api', `repos/${full}`])
    try { defaultBranch = JSON.parse(meta)?.default_branch ?? defaultBranch } catch {}
    // A default branch that requires pull requests forces GitHub mode.
    if (mode === 'local' && defaultBranch) {
      const rules = tryRun('gh', ['api', `repos/${full}/rules/branches/${encodeURIComponent(defaultBranch)}`])
      try {
        if (JSON.parse(rules).some((r) => r.type === 'pull_request')) { mode = 'github'; reasons.push(`${defaultBranch} requires pull requests, so GitHub mode`) }
      } catch {}
    }
  }
  if (mode === 'github' && routeName === 'none') why = `${why}; hand off the one step that fixes it (for example \`gh auth login\`) or use the host's GitHub tools; never fall back to local mode`
  return out(routeName, defaultBranch, why)
}

function main(argv) {
  const [first, second] = argv
  const firstIsMode = normalizeMode(first) !== null && !existsSync(first ?? '')
  const repoDir = resolve(firstIsMode ? '.' : first ?? '.')
  const requested = firstIsMode ? first : second ?? null
  if (requested != null && !normalizeMode(requested)) {
    console.log(JSON.stringify({ mode: null, route: 'none', reason: `usage: gh-route.mjs [repo-dir] [${MODES.join('|')}]` }))
    return 2
  }
  const result = route({ repoDir, mode: requested })
  console.log(JSON.stringify(result))
  return result.mode === 'github' && result.route === 'none' ? 1 : 0
}

const real = (path) => { try { return realpathSync(path) } catch { return path } }
if (process.argv[1] && real(process.argv[1]) === real(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2))
