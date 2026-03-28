export type Palette = Record<string, Record<string, string>>

export const unmarshalCss = (css: string): Palette =>
	Object.fromEntries([...css.matchAll(/\.(.*?) \{([\s\S]*?)\}/g)]
		.map(m => [
			m[1],
			Object.fromEntries([...m[2].matchAll(/--(.*?): #(.*?);/g)]
				.map(m => ([m[1], m[2]])),
			),
		]),
	)

export const applyPaletteToTheme = async (name: string, vars: Record<string, string>) => {
	const path = `themes/${name}.json`
	const content = await Bun.file(path).text()
	let next = content
	Object.entries(vars).forEach(([name, val]) => next = applyVar(next, name, val))
	if (content === next) return
	await Bun.write(path, next)
	log(`${path} updated`)
}

export const applyVar = (content: string, name: string, val: string) => content.replaceAll(
	new RegExp(`(?<="#)(.{6})(.{2})?(?=",?//${name})`, 'g'),
	(_m, _rgb, alpha = '') => val.length > 6 ? val : `${val}${alpha}`,
)

export const log = (...args: unknown[]) => console.log(`[${now()}]`, ...args)

export const now = () => {
	const d = new Date()
	const pad = (n: number, len = 2) => String(n).padStart(len, '0')

	return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`
}