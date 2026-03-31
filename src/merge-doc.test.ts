import { test, expect } from 'bun:test'

test('replace tokens', () => {
	const themeContent = `
	"colors": {
		"token1": "#000004",
		"token2": "#000200",
		"token3": "#000010",
		"token4": "#003000"
	}
`
	const replacement = `\t\t"token5": "#0000d0",\n\t\t"token6": "#000c00",`
	const replacedColors = themeContent.replace(/(?<="colors": {\n).*?(?=\n\t})/s, replacement)

	expect(replacedColors).toBe(`
	"colors": {
		"token5": "#0000d0",
		"token6": "#000c00",
	}
`)
})

test('merge theme with doc', () => {
	const themeContent = `
	"colors": {
		"token1": "#000004",
		"token2": "#000200",
		"token3": "#000010",
		"token5": "#00d010",
	}
`
	const documentedColors = `
		// Base colors
		"token1": "#001000",
		"token4": "#000200",
		"token3": "#000030",
		"token2": "#000004",
`
	const mergedColors = documentedColors.replace(/^\s*?"(.*?)": ".*?".*$/gm, (match, colorKey) => {
		const themeLine = new RegExp(`^.*?"${colorKey}":.*$`, 'm').exec(themeContent)?.[0]
		return themeLine ?? `\t\t// ${match.trimStart()}`
	})

	const themeTokenLines = themeContent.match(/^.*?".*?":.*$/gm)
	for (const line of themeTokenLines ?? []) {
		const colorKey = /^.*?"(.*?)": "#.*$/.exec(line)?.[1]
		if (colorKey && !documentedColors.includes(`"${colorKey}":`)) {
			console.warn(`Token ${colorKey} is in source but not in doc`)
		}
	}

	expect(mergedColors).toBe(`
		// Base colors
		"token1": "#000004",
		// "token4": "#000200",
		"token3": "#000010",
		"token2": "#000200",
`)
})