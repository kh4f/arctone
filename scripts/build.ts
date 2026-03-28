const css = (tpl: TemplateStringsArray) => tpl[0]
interface Var { name: string, value: string }
const extractVars = (vars: string): Var[] =>
	[...vars.matchAll(/--(.*?): #(.*?);/g).map(m => ({ name: m[1], value: m[2] }))]

const rawVars = css`
	--1: #00ffea;
	--2: #201f2d;
`
const vars = extractVars(rawVars)
const path = 'themes/twilight.json'

export const applyVar = (content: string, name: string, val: string) => content.replaceAll(
	new RegExp(`(?<="#)(.{6})(.{2})?(?=",?//${name})`, 'g'),
	(_m, _rgb, alpha = '') => val.length > 6 ? val : `${val}${alpha}`,
)

const updateTheme = async (path: string, vars: Var[]) => {
	let content = await Bun.file(path).text()
	vars.forEach(({ name, value }) => content = applyVar(content, name, value))
	await Bun.write(path, content)
}

void updateTheme(path, vars)