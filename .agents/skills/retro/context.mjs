/**
 * What a repository asks an agent to read: always-loaded instructions and skill listing, on-demand
 * skill bodies and root docs, and install hygiene. Reports against budgets; never fails.
 *   node <retro skill folder>/context.mjs [--repo <path>] [--json]   (flow-skills: pnpm context)
 * Tokens are estimated as characters / 4 (no key, no network). Spec 056.
 */
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Reference points from host documentation and the 2026-11-02 audit, not rules for skill text.
export const BUDGETS = {
  alwaysLoadedTokens: 2000,
  skillListingTokens: 4000,
  descriptionChars: 1024,
  skillBodyLines: 500,
  skillBodyTokens: 5000,
  designCoreTokens: 3000,
}

const SKILL_DIRS = ['.claude/skills', '.agents/skills', 'skills']
const ROOT_DOCS = ['PRODUCT.md', 'DESIGN.md', 'GLOSSARY.md', 'ARCHITECTURE.md']
const STOP = new Set('about after agent agents also before build code describe does each from have into made make more only other over requests skill skills some such than that their them then there these they this those through when where which while with work would your user users asks says said used uses using'.split(' '))

export const tokens = (text) => Math.ceil(text.length / 4)

/** `name` and `description` from SKILL.md front matter, including folded and literal block scalars. */
export function frontMatter(text) {
  const match = text.replace(/^\uFEFF/u, '').match(/^---\r?\n([\s\S]*?)\r?\n---/u)
  const fields = {}
  if (!match) return fields
  const lines = match[1].split(/\r?\n/u)
  for (let i = 0; i < lines.length; i++) {
    const field = lines[i].match(/^([\w-]+):\s*(.*)$/u)
    if (!field) continue
    let value = field[2].trim()
    // Indented lines that follow continue the value: block scalars, wrapped plain or quoted text.
    const more = []
    while (i + 1 < lines.length && (/^\s+\S/u.test(lines[i + 1]) || (lines[i + 1].trim() === '' && /^\s/u.test(lines[i + 2] ?? '')))) more.push(lines[++i].trim())
    value = (/^[>|][-+]?$/u.test(value) ? more : [value, ...more]).filter(Boolean).join(' ')
    fields[field[1]] = value.replace(/^(['"])([\s\S]*)\1$/u, '$2')
  }
  return fields
}

/** Instruction files Claude Code loads at start: CLAUDE.md with @imports (four hops), else AGENTS.md. */
export function instructionFiles(root) {
  const start = existsSync(join(root, 'CLAUDE.md')) ? 'CLAUDE.md' : existsSync(join(root, 'AGENTS.md')) ? 'AGENTS.md' : null
  const seen = new Map()
  const visit = (path, depth) => {
    const full = resolve(root, path)
    if (seen.has(full) || !existsSync(full) || depth > 4) return
    const text = readFileSync(full, 'utf8')
    seen.set(full, { path: relative(root, full), chars: text.length, tokens: tokens(text) })
    // Imports inside code blocks and code spans are not loaded.
    const prose = text.replace(/^(```|~~~)[\s\S]*?^\1/gmu, '').replace(/`[^`\n]*`/gu, '')
    for (const [, ref] of prose.matchAll(/(?:^|\s)@([\w./~-]+\.md)\b/gu)) visit(resolve(dirname(full), ref), depth + 1)
  }
  if (start) visit(start, 0)
  return [...seen.values()]
}

/** Installed skills a host lists, deduplicated across linked directories. */
export function installedSkills(root) {
  const skills = new Map()
  for (const rel of SKILL_DIRS) {
    const dir = join(root, rel)
    if (!existsSync(dir)) continue
    const real = realpathSync(dir)
    for (const name of readdirSync(real).sort()) {
      const file = join(real, name, 'SKILL.md')
      if (skills.has(name) || !existsSync(file) || !statSync(join(real, name)).isDirectory()) continue
      const text = readFileSync(file, 'utf8')
      const fm = frontMatter(text)
      skills.set(name, {
        name,
        path: join(rel, name, 'SKILL.md'),
        declaredName: fm.name ?? '',
        description: fm.description ?? '',
        listed: String(fm['disable-model-invocation']).toLowerCase() !== 'true',
        lines: text.split(/\r?\n/u).length,
        tokens: tokens(text),
      })
    }
  }
  return [...skills.values()]
}

const words = (text) => new Set(text.toLowerCase().match(/[a-z][a-z-]{3,}/gu)?.filter((w) => !STOP.has(w)) ?? [])

const initials = (name) => name.split('-').map((w) => w[0]).join('')

/** Skill pairs whose names extend or abbreviate one another, or whose descriptions share at least half their content words. */
export function overlaps(skills, threshold = 0.5) {
  const pairs = []
  const listed = skills.filter((s) => s.listed)
  for (let i = 0; i < listed.length; i++) {
    for (let j = i + 1; j < listed.length; j++) {
      const [a, b] = [listed[i], listed[j]]
      const wa = words(a.description)
      const wb = words(b.description)
      const shared = [...wa].filter((w) => wb.has(w)).length
      const score = shared / Math.max(1, Math.min(wa.size, wb.size))
      const named = a.name.startsWith(`${b.name}-`) || b.name.startsWith(`${a.name}-`) || (a.name.includes('-') && initials(a.name) === b.name) || (b.name.includes('-') && initials(b.name) === a.name)
      if (score >= threshold || named) pairs.push({ skills: [a.name, b.name], score: Number(score.toFixed(2)) })
    }
  }
  return pairs.sort((x, y) => y.score - x.score)
}

function lockNames(root) {
  const file = join(root, 'skills-lock.json')
  if (!existsSync(file)) return null
  try {
    const lock = JSON.parse(readFileSync(file, 'utf8'))
    const skills = lock.skills ?? lock
    return Array.isArray(skills) ? skills.map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean) : Object.keys(skills)
  } catch {
    return 'unreadable'
  }
}

/** Skills a root document calls user-invoked while the host can still start them on its own. */
function userInvokedButListed(root, skills) {
  const listed = new Set(skills.filter((s) => s.listed).map((s) => s.name))
  const found = new Set()
  for (const doc of ['AGENTS.md', ...ROOT_DOCS]) {
    const file = join(root, doc)
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      if (!/user-invoked|only when the user asks/iu.test(line)) continue
      for (const [, name] of line.matchAll(/`([a-z0-9-]+)`/gu)) if (listed.has(name)) found.add(name)
    }
  }
  return [...found].sort()
}

export function measure(root) {
  root = resolve(root)
  const instructions = instructionFiles(root)
  const skills = installedSkills(root)
  const listed = skills.filter((s) => s.listed)
  const listingChars = listed.reduce((sum, s) => sum + s.name.length + s.description.length, 0)
  const docs = ROOT_DOCS.filter((d) => existsSync(join(root, d))).map((d) => {
    const text = readFileSync(join(root, d), 'utf8')
    return { path: d, chars: text.length, tokens: tokens(text) }
  })
  const agents = existsSync(join(root, 'AGENTS.md')) ? readFileSync(join(root, 'AGENTS.md'), 'utf8') : ''
  const block = agents.match(/<!-- BEGIN FLOW -->[\s\S]*?<!-- END FLOW -->/u)?.[0]
  const read = lockNames(root)
  const lock = Array.isArray(read) ? read : null
  const installed = skills.map((s) => s.name)
  const alwaysTokens = instructions.reduce((sum, f) => sum + f.tokens, 0)
  const design = docs.find((d) => d.path === 'DESIGN.md')

  return {
    repo: basename(root),
    estimate: 'characters / 4',
    alwaysLoaded: { instructions, instructionTokens: alwaysTokens, listedSkills: listed.length, listingTokens: Math.ceil(listingChars / 4) },
    onDemand: {
      docs,
      flowBlockTokens: block ? tokens(block) : null,
      skills: skills.map(({ name, path, lines, tokens: t }) => ({ name, path, lines, tokens: t })).sort((a, b) => b.tokens - a.tokens),
    },
    hygiene: {
      lockUnreadable: read === 'unreadable',
      notInLock: lock ? installed.filter((n) => !lock.includes(n)) : [],
      lockedNotInstalled: lock && installed.length ? lock.filter((n) => !installed.includes(n)) : [],
      longDescriptions: skills.filter((s) => s.description.length > BUDGETS.descriptionChars).map((s) => ({ name: s.name, chars: s.description.length })),
      noTrigger: listed.filter((s) => !/\buse (it |this )?(when|for|to)\b|\bwhen (the )?user\b|\btrigger/iu.test(s.description)).map((s) => s.name),
      badNames: skills.filter((s) => !/^[a-z0-9]+(-[a-z0-9]+)*$/u.test(s.declaredName) || s.declaredName.length > 64 || s.declaredName !== s.name).map((s) => s.name),
      overlaps: overlaps(skills),
      userInvokedButListed: userInvokedButListed(root, skills),
      agentsWithoutClaude: Boolean(agents) && !existsSync(join(root, 'CLAUDE.md')),
    },
    over: {
      alwaysLoaded: alwaysTokens > BUDGETS.alwaysLoadedTokens,
      skillListing: listingChars / 4 > BUDGETS.skillListingTokens,
      skillBodies: skills.filter((s) => s.lines > BUDGETS.skillBodyLines || s.tokens > BUDGETS.skillBodyTokens).map((s) => s.name),
      designCore: Boolean(design && design.tokens > BUDGETS.designCoreTokens),
    },
  }
}

const list = (items) => (items.length ? items.join(', ') : 'none')

export function report(m) {
  const flag = (over) => (over ? '  over' : '')
  const out = [`${m.repo} (tokens estimated as ${m.estimate})`, '', 'Always loaded']
  for (const f of m.alwaysLoaded.instructions) out.push(`  ${f.path}: ~${f.tokens}`)
  out.push(`  instructions total: ~${m.alwaysLoaded.instructionTokens} / ${BUDGETS.alwaysLoadedTokens}${flag(m.over.alwaysLoaded)}`)
  out.push(`  skill listing: ${m.alwaysLoaded.listedSkills} skills, ~${m.alwaysLoaded.listingTokens} / ${BUDGETS.skillListingTokens}${flag(m.over.skillListing)}`)
  out.push('', 'On demand')
  for (const d of m.onDemand.docs) out.push(`  ${d.path}: ~${d.tokens}${d.path === 'DESIGN.md' ? ` / ${BUDGETS.designCoreTokens}${flag(m.over.designCore)}` : ''}`)
  if (m.onDemand.flowBlockTokens !== null) out.push(`  Flow block: ~${m.onDemand.flowBlockTokens}`)
  out.push(`  largest skills: ${list(m.onDemand.skills.slice(0, 5).map((s) => `${s.name} ~${s.tokens}`))}`)
  out.push(`  skill bodies over ${BUDGETS.skillBodyLines} lines or ~${BUDGETS.skillBodyTokens}: ${list(m.over.skillBodies)}`)
  const h = m.hygiene
  out.push('', 'Hygiene')
  if (h.lockUnreadable) out.push('  skills-lock.json is not valid JSON; drift not checked')
  out.push(`  installed, not in skills-lock.json (${h.notInLock.length}): ${list(h.notInLock)}`)
  out.push(`  locked, not installed (${h.lockedNotInstalled.length}): ${list(h.lockedNotInstalled)}`)
  out.push(`  descriptions over ${BUDGETS.descriptionChars} characters: ${list(h.longDescriptions.map((d) => `${d.name} ${d.chars}`))}`)
  out.push(`  descriptions without a "use when" trigger: ${list(h.noTrigger)}`)
  out.push(`  names that break the Agent Skills rules: ${list(h.badNames)}`)
  out.push(`  possible overlap (${h.overlaps.length}): ${list(h.overlaps.map((p) => p.skills.join(' / ')))}`)
  out.push(`  called user-invoked but listed for automatic use: ${list(h.userInvokedButListed)}`)
  if (h.agentsWithoutClaude) out.push('  info: AGENTS.md without CLAUDE.md (current Claude Code reads AGENTS.md natively)')
  return out.join('\n')
}

// Compare real paths: installed skills are usually reached through a linked folder.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2)
  const at = args.indexOf('--repo')
  const root = (at >= 0 && args[at + 1] && !args[at + 1].startsWith('--') ? args[at + 1] : null) ?? process.cwd()
  const result = measure(root)
  console.log(args.includes('--json') ? JSON.stringify(result, null, 2) : report(result))
}
