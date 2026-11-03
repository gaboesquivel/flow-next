/**
 * Next free spec and decision numbers across the working tree and every local and remote branch.
 *   node <to-spec skill folder>/scripts/next-number.mjs [repo]   (default: the Git repository holding the current directory;
 *   run `git fetch` first for current remotes)
 * Parallel sessions pick numbers on separate branches, so one tree alone cannot show which are free. Self-contained:
 * the skill installs on its own.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, realpathSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const FOLDERS = [['specs', 3], ['decisions', 4]]

export function nextNumbers(names) {
  const result = {}
  for (const [folder, digits] of FOLDERS) {
    const used = names.map((name) => name.match(new RegExp(`^docs/${folder}/(\\d{${digits}})-.+\\.md$`, 'u'))).filter(Boolean).map((m) => Number(m[1]))
    result[folder] = String(Math.max(0, ...used) + 1).padStart(digits, '0')
  }
  return result
}

export function recordPaths(repoRoot) {
  const git = (...args) => execFileSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8' }).trim()
  const names = new Set()
  for (const ref of git('for-each-ref', '--format=%(refname)', 'refs/heads', 'refs/remotes').split('\n').filter(Boolean)) {
    for (const path of git('ls-tree', '-r', '--name-only', ref, '--', 'docs/specs', 'docs/decisions').split('\n')) names.add(path)
  }
  for (const [folder] of FOLDERS) {
    const dir = join(repoRoot, 'docs', folder)
    if (existsSync(dir)) for (const file of readdirSync(dir)) names.add(`docs/${folder}/${file}`)
  }
  return [...names]
}

export const repoRootOf = (dir) => execFileSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()

export function run(repoRoot) {
  const { specs, decisions } = nextNumbers(recordPaths(repoRoot))
  console.log(`Next spec: ${specs}\nNext decision: ${decisions}`)
}

// Compare real paths: an installed skill is usually reached through a linked folder.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  run(repoRootOf(resolve(process.argv[2] ?? process.cwd())))
}
