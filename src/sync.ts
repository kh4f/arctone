import { watch } from 'node:fs'
import { parse } from 'node:path'
import { unmarshalCss, applyPaletteToTheme, type Palette } from '@/utils'

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