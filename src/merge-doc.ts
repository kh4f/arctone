import { JSDOM } from 'jsdom'

void mergeThemeWithDoc('themes/arctic.json')

async function mergeThemeWithDoc(themePath: string) {
	const documentedColors = await parseDocColorTokens()
	const themeContent = await Bun.file(themePath).text()
	const themeColorSection = /"colors": {(.*?)}/s.exec(themeContent)?.[0] ?? ''

	const mergedColors = documentedColors.replace(/^\s*?"(.*?)": ".*?".*$/gm, (match, colorKey) => {
		const themeLine = new RegExp(`^\\s*?"${colorKey}":.*$`, 'm').exec(themeContent)?.[0]
		return themeLine ?? `\t\t// ${match.trimStart()}`
	})

	for (const line of themeColorSection.split('\n')) {
		const colorKey = /^.*?"(.*?)": "#.*$/.exec(line)?.[1]
		if (colorKey && !documentedColors.includes(`"${colorKey}":`)) {
			console.warn(`Token ${colorKey} is in theme but not in doc`)
		}
	}

	const nextThemeContent = themeContent.replace(/(?<="colors": {\n).*?(?=\n\t})/s, mergedColors)
	await Bun.write(themePath, nextThemeContent)
}

async function parseDocColorTokens() {
	const document = await fetchPage('https://code.visualstudio.com/api/references/theme-color')
	const main = document.querySelector('.docs-main-content')!
	const nodes = [...main.querySelectorAll(':scope > h2, :scope > p, :scope > ul')]

	let output = ''
	nodes.forEach(node => {
		switch (node.tagName) {
			case 'H2':
				output += `\n\n\t\t// ${node.textContent}`
				break
			case 'P':
				if (node.textContent) output += `\n\t\t// ${node.textContent.replace('\n', ' ')}`
				break
			case 'UL': {
				const liNodes = [...node.children]
				liNodes.forEach(li => {
					const colorKey = li.querySelector('code')?.textContent
					output += colorKey ? `\n\t\t"${colorKey}": "#ff0000",` : `\n\t\t// ${li.textContent}\n`
				})
				break
			}
		}
	})

	return output.slice(output.indexOf('\t\t// Contrast colors'), output.search(/,\s*?\/\/ Extension colors/))
}

async function fetchPage(url: string) {
	const response = await fetch(url)
	const html = await response.text()
	const jsdom = new JSDOM(html)
	return jsdom.window.document
}