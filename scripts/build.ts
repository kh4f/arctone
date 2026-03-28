const css = (tpl: TemplateStringsArray) => tpl[0]
const vars = css`
	--1: #00ffea;
	--2: #201f2d;
`

const path = 'themes/twilight.json'
let content = await Bun.file(path).text()

for (const m of vars.matchAll(/--(.*?): (.*?);/g)) {
	const [name, value] = m.slice(1)
	content = content.replaceAll(new RegExp(`(?<=")#.*(?=",?//${name})`, 'g'), value)
}

await Bun.write(path, content)