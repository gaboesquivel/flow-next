#!/usr/bin/env node
// Liveness: is one commit at one ref live? A light report; it never gates, rolls back, reverts, or promotes.
//   node liveness.mjs <repo-dir> [ref|sha] [pr-number] [--url <url>] [--health <path>] [--wait <seconds>]
// With a merged pull request it checks the merge commit on the base branch; with an open one, its head on its branch.
// Prints one JSON line {state, sha, ref, url?, detail}. State is one of STATES. Exit 0 for any state, 2 on bad usage.
// Reads through `git` and `gh api` REST (works behind proxies that refuse GraphQL). Zero dependencies, Node >= 22.
import { execFileSync } from 'node:child_process'
import { realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const STATES = ['live', 'pushed, no deployment reported', 'reachable, commit unconfirmed', 'not live', 'unverified']

const GET_TIMEOUT_MS = 10_000
const POLL_MS = 10_000
const SIGN_IN = /(^|[/.])(login|signin|sign-in|sso|auth)([/?.#]|$)/iu

/** Runs a command with an argument array; returns stdout, throws like execFileSync. Injectable for tests. */
export function runCommand(cmd, args, { cwd, timeout = 20_000 } = {}) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024 })
}

/** One unauthenticated GET with a timeout; resolves to {status, finalUrl, redirected} or {error}. Injectable for tests. */
export async function httpGet(url, { timeoutMs = GET_TIMEOUT_MS } = {}) {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) })
    await res.body?.cancel()
    return { status: res.status, finalUrl: res.url, redirected: res.redirected }
  } catch (error) {
    return { error: error?.name === 'TimeoutError' ? `timed out after ${timeoutMs} ms` : String(error?.message ?? error) }
  }
}

/** `owner/name` when a remote URL points at github.com (https, ssh, scp-like); null otherwise. */
export function parseGithubRemote(url) {
  const match = /^(?:[a-z][\w+.-]*:\/\/)?(?:[^@/\s]+@)?github\.com(?::\d+)?[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/iu.exec(String(url).trim())
  return match ? `${match[1]}/${match[2]}` : null
}

const SHA = /^[0-9a-f]{7,40}$/iu

export async function liveness({ repoDir, ref = 'HEAD', pr = null, url = null, health = null, waitSeconds = 60, run = runCommand, get = httpGet, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  const git = (...args) => run('git', args, { cwd: repoDir }).trim()
  const tryGit = (...args) => { try { return git(...args) } catch { return null } }
  const api = (path) => JSON.parse(run('gh', ['api', path], { cwd: repoDir }))
  const result = (state, sha, branch, detail, extra = {}) => ({ state, sha, ref: branch, ...extra, detail })

  const remoteUrl = tryGit('remote', 'get-url', 'origin')
  const repo = remoteUrl ? parseGithubRemote(remoteUrl) : null
  const defaultBranch = tryGit('symbolic-ref', '--short', 'refs/remotes/origin/HEAD')?.replace(/^origin\//u, '') ?? null

  // Which commit, on which branch.
  let sha
  let branch
  if (pr != null) {
    if (!repo) return result('unverified', null, null, 'a pull request number needs a GitHub origin')
    let pull
    try { pull = api(`repos/${repo}/pulls/${pr}`) } catch (e) { return result('unverified', null, null, `cannot read pull request #${pr}: ${firstLine(e)}`) }
    if (pull.merged_at && pull.merge_commit_sha) { sha = pull.merge_commit_sha; branch = pull.base.ref }
    else { sha = pull.head.sha; branch = pull.head.ref }
  } else {
    sha = tryGit('rev-parse', '--verify', `${ref}^{commit}`)
    if (!sha) return result('unverified', null, null, `cannot resolve ${ref}`)
    const named = ref === 'HEAD' ? tryGit('symbolic-ref', '--short', 'HEAD') : SHA.test(ref) ? null : ref.replace(/^(refs\/heads\/|origin\/)/u, '')
    branch = named ?? defaultBranch
  }
  if (!branch) return result('unverified', sha, null, 'cannot tell which remote branch to check; pass a branch name')

  // On the remote: the remote branch contains the commit.
  if (!remoteUrl) return result('unverified', sha, branch, 'no remote: nothing was published')
  let remoteSha
  try { remoteSha = git('ls-remote', 'origin', `refs/heads/${branch}`).split(/\s+/u)[0] || null } catch (e) { return result('unverified', sha, branch, `cannot read the remote: ${firstLine(e)}`) }
  if (!remoteSha) return result('not live', sha, branch, `origin has no branch ${branch}`)
  if (remoteSha !== sha && !contains(tryGit, run, repoDir, remoteSha, sha, branch)) return result('not live', sha, branch, `origin/${branch} (${remoteSha.slice(0, 7)}) does not contain ${sha.slice(0, 7)}`)

  // Deployed: the host's deployment for this commit, or a later one on the branch that contains it.
  if (!repo) return url ? probe('reachable, commit unconfirmed', 'remote is not on GitHub; deployments not read') : result('pushed, no deployment reported', sha, branch, 'remote is not on GitHub; deployments not read')
  let exact
  let onRef
  try {
    exact = api(`repos/${repo}/deployments?sha=${sha}&per_page=100`)
    onRef = exact.length ? [] : api(`repos/${repo}/deployments?ref=${encodeURIComponent(branch)}&per_page=20`)
  } catch (e) { return result('unverified', sha, branch, `cannot read deployments: ${firstLine(e)}`) }
  const later = onRef.find((d) => d.sha !== sha && tryGit('merge-base', '--is-ancestor', sha, d.sha) !== null)
  const picked = pickDeployment(exact) ?? later ?? null
  if (!picked) {
    if (url || onRef.length) {
      // Something is deployed on this branch, but not provably this commit.
      const other = onRef[0]
      if (!url && other) {
        const status = latestStatus(api, repo, other)
        if (status?.state === 'success' && (status.environment_url || status.target_url)) url = status.environment_url || status.target_url
      }
      if (url) return probe('reachable, commit unconfirmed', `no deployment matches ${sha.slice(0, 7)}`)
    }
    return result('pushed, no deployment reported', sha, branch, `origin/${branch} contains ${sha.slice(0, 7)}; the host reported no deployment for it`)
  }
  let deployment = picked
  let via = deployment.sha === sha ? '' : ` (via later commit ${deployment.sha.slice(0, 7)})`

  let status
  const deadline = waitSeconds * 1000
  for (let waited = 0; ; waited += POLL_MS) {
    try { status = latestStatus(api, repo, deployment, true) } catch (e) { return result('unverified', sha, branch, `cannot read deployment status: ${firstLine(e)}`) }
    if (!['pending', 'queued', 'in_progress'].includes(status?.state ?? 'pending') || waited + POLL_MS > deadline) break
    await sleep(POLL_MS)
  }
  // Inactive: a later deployment on the same environment superseded this one. Live when the newest successful one
  // there contains this commit.
  if (status?.state === 'inactive') {
    const superseded = deployment
    let newer
    try { newer = api(`repos/${repo}/deployments?environment=${encodeURIComponent(superseded.environment ?? '')}&per_page=20`) } catch (e) { return result('unverified', sha, branch, `deployment ${superseded.id} is inactive; cannot read later deployments: ${firstLine(e)}`) }
    let found = null
    for (const d of [...(Array.isArray(newer) ? newer : [])].sort((a, b) => b.id - a.id)) {
      // A redeploy of this same commit counts; only the superseded deployment itself is skipped.
      if (d.id === superseded.id || (d.sha !== sha && tryGit('merge-base', '--is-ancestor', sha, d.sha) === null)) continue
      const s = latestStatus(api, repo, d)
      if (s?.state === 'success') { found = { d, s }; break }
    }
    if (!found) return result('not live', sha, branch, `deployment ${superseded.id}${via} is inactive (superseded) and no later successful deployment on ${superseded.environment ?? 'its environment'} contains ${sha.slice(0, 7)}`)
    deployment = found.d
    status = found.s
    via = deployment.sha === sha
      ? ` (redeploy of ${sha.slice(0, 7)}; deployment ${superseded.id} was superseded)`
      : ` (via later commit ${deployment.sha.slice(0, 7)}; deployment ${superseded.id} was superseded)`
  }
  const state = status?.state ?? 'pending'
  if (['pending', 'queued', 'in_progress'].includes(state)) return result('unverified', sha, branch, `deployment ${deployment.id}${via} still ${state} after ${waitSeconds}s`)
  if (state !== 'success') return result('not live', sha, branch, `deployment ${deployment.id}${via} is ${state}`)
  url ??= status.environment_url || status.target_url || null
  if (!url) return result('unverified', sha, branch, `deployment ${deployment.id}${via} is ready but reported no URL; pass --url with the production domain`)
  return probe('live', `deployment ${deployment.id}${via} is ready`)

  async function probe(okState, why) {
    for (const target of [url, health && new URL(health, url).href].filter(Boolean)) {
      const res = await get(target, { timeoutMs: GET_TIMEOUT_MS })
      if (res.error) return result('not live', sha, branch, `${why}; GET ${target} failed: ${res.error}`, { url })
      if (res.redirected && res.finalUrl && new URL(res.finalUrl).host !== new URL(target).host && [new URL(res.finalUrl).host, new URL(res.finalUrl).pathname].some((part) => SIGN_IN.test(part))) {
        return result('unverified', sha, branch, `${why}; GET ${target} redirects to a sign-in (${new URL(res.finalUrl).host}): wrong URL or deployment protection`, { url })
      }
      if (res.status < 200 || res.status > 299) return result('not live', sha, branch, `${why}; GET ${target} returned ${res.status}`, { url })
    }
    return result(okState, sha, branch, `${why}; GET returned 2xx`, { url })
  }
}

function contains(tryGit, run, repoDir, remoteSha, sha, branch) {
  if (tryGit('merge-base', '--is-ancestor', sha, remoteSha) !== null) return true
  try { run('git', ['fetch', '--quiet', 'origin', branch], { cwd: repoDir }) } catch { return false }
  return tryGit('merge-base', '--is-ancestor', sha, remoteSha) !== null
}

// Prefer a production deployment, then the newest.
function pickDeployment(list) {
  if (!list?.length) return null
  const newest = [...list].sort((a, b) => b.id - a.id)
  return newest.find((d) => d.production_environment || /^prod/iu.test(d.environment ?? '')) ?? newest[0]
}

function latestStatus(api, repo, deployment, raise = false) {
  try { return api(`repos/${repo}/deployments/${deployment.id}/statuses?per_page=1`)[0] ?? null } catch (e) { if (raise) throw e; return null }
}

const firstLine = (e) => String(e?.stderr || e?.message || e).trim().split('\n')[0]

export function parseArgs(argv) {
  const opts = { positional: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--url' || a === '--health' || a === '--wait') opts[a.slice(2)] = argv[++i]
    else opts.positional.push(a)
  }
  const [repoDir = '.', ref = 'HEAD', pr] = opts.positional
  const number = pr == null ? null : Number(String(pr).replace('#', ''))
  const waitSeconds = opts.wait == null ? 60 : Number(opts.wait)
  if ((number !== null && (!Number.isInteger(number) || number < 1)) || !Number.isFinite(waitSeconds) || waitSeconds < 0) return null
  return { repoDir: resolve(repoDir), ref, pr: number, url: opts.url ?? null, health: opts.health ?? null, waitSeconds }
}

async function main(argv) {
  const args = parseArgs(argv)
  if (!args) {
    console.log(JSON.stringify({ state: 'unverified', sha: null, detail: 'usage: liveness.mjs <repo-dir> [ref|sha] [pr-number] [--url <url>] [--health <path>] [--wait <seconds>]' }))
    return 2
  }
  console.log(JSON.stringify(await liveness(args)))
  return 0
}

const real = (path) => { try { return realpathSync(path) } catch { return path } }
if (process.argv[1] && real(process.argv[1]) === real(fileURLToPath(import.meta.url))) process.exitCode = await main(process.argv.slice(2))
