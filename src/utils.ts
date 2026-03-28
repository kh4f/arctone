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
	let content = await Bun.file(path).text()
	Object.entries(vars).forEach(([name, val]) => content = applyVar(content, name, val))
	await Bun.write(path, content)
}

export const applyVar = (content: string, name: string, val: string) => content.replaceAll(
	new RegExp(`(?<="#)(.{6})(.{2})?(?=",?//${name})`, 'g'),
	(_m, _rgb, alpha = '') => val.length > 6 ? val : `${val}${alpha}`,
)

export const now = () => {
	const d = new Date()
	const pad = (n: number, len = 2) => String(n).padStart(len, '0')

	return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`
}