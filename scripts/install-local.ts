import { lstat, mkdir, readlink, rm, symlink } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

interface Manifest {
	name: string
	publisher: string
	version: string
}

const repoRoot = resolve(import.meta.dir, '..')
const manifestPath = resolve(repoRoot, 'package.json')
const isDryRun = Bun.argv.includes('-d')

void installLocal()

async function installLocal() {
	const manifest = await Bun.file(manifestPath).json() as Manifest
	const extId = `${manifest.publisher}.${manifest.name}-${manifest.version}`
	const extDir = resolve(Bun.env.USERPROFILE ?? '~', '.vscode-insiders', 'extensions')
	const linkPath = resolve(extDir, extId)
	const targetPath = repoRoot

	console.log(`target: ${targetPath}`)
	console.log(`link: ${linkPath}`)
	console.log(`command: mklink /D "${linkPath}" "${targetPath}"`)

	if (isDryRun) return

	await mkdir(dirname(linkPath), { recursive: true })

	const stat = await lstat(linkPath).catch(() => null)
	if (stat) {
		if (!stat.isSymbolicLink()) {
			throw new Error(`Refusing to replace non-symlink path: ${linkPath}`)
		}

		const curTarget = await readlink(linkPath)
		const curTargetPath = resolve(dirname(linkPath), curTarget)
		if (curTargetPath === targetPath) {
			console.log('local theme link is already installed')
			return
		}

		await rm(linkPath, { recursive: true, force: true })
		console.log(`removed previous symlink: ${linkPath}`)
	}

	await symlink(targetPath, linkPath, 'dir')
	console.log('local theme link installed')
}