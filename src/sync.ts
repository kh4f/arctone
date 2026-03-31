import { watch } from 'node:fs'
import { parse } from 'node:path'
import { log } from '@/utils'

type Palette = Record<string, Record<string, string>>

const palettePath = 'src/palette.css'
const themesDir = 'themes'
let prevPalette: Palette = {}
let timer: Timer | undefined

void syncThemePalette('all')

watch(palettePath, () => {
	clearTimeout(timer)
	timer = setTimeout(() => void syncThemePalette(), 50)
})
watch(themesDir, (_, file) => {
	const { name } = parse(file ?? '')
	clearTimeout(timer)
	timer = setTimeout(() => void syncThemePalette(name), 50)
})

async function syncThemePalette(theme?: 'all' | (string & {})) {
	const raw = await Bun.file(palettePath).text()
	const palette = unmarshalCss(raw)

	for (const pltTheme in palette) {
		if (theme === 'all' || theme === pltTheme || isPaletteChanged(pltTheme, palette)) {
			void applyPaletteToTheme(pltTheme, palette[pltTheme])
		}
	}

	prevPalette = palette
}

const isPaletteChanged = (theme: string, palette: Palette) => {
	return JSON.stringify(prevPalette[theme]) !== JSON.stringify(palette[theme])
}

export const unmarshalCss = (css: string): Palette =>
	Object.fromEntries([...css.matchAll(/\.(.*?) \{([\s\S]*?)\}/g)]
		.map(m => [
			m[1],
			Object.fromEntries([...m[2].matchAll(/--(.*?): #(.*?);/g)]
				.map(m => ([m[1], m[2]])),
			),
		]),
	)

const applyPaletteToTheme = async (name: string, vars: Record<string, string>) => {
	const path = `themes/${name}.json`
	const content = await Bun.file(path).text()
	let next = content
	Object.entries(vars).forEach(([name, val]) => next = applyVar(next, name, val))
	if (content === next) return
	await Bun.write(path, next)
	log(`${path} updated`)
}

export const applyVar = (content: string, name: string, val: string) => {
	if (val.length !== 6 && val.length !== 8) return content
	return content.replaceAll(
		new RegExp(`(?<="#)(.{6})(.{2})?(?=",?//${name})`, 'g'),
		(_m, _rgb, alpha = '') => val.length > 6 ? val : `${val}${alpha}`,
	)
}