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

export const updateTheme = async (name: string, vars: Record<string, string>) => {
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
	return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`
}