import { watch } from 'node:fs'
import { now, unmarshalCss, applyPaletteToTheme, type Palette } from '@/utils'

const palettePath = 'src/palette.css'
let prevPalette: Palette = {}

void syncThemePalette(true)
watch(palettePath, () => void syncThemePalette())

async function syncThemePalette(force = false) {
	const raw = await Bun.file(palettePath).text()
	const palette = unmarshalCss(raw)

	for (const theme in palette) {
		if (force || isPaletteChanged(theme, palette)) {
			console.log(`[${now()}] updating ${theme}`)
			void applyPaletteToTheme(theme, palette[theme])
		}
	}

	prevPalette = palette
}

const isPaletteChanged = (theme: string, palette: Palette) => {
	return JSON.stringify(prevPalette[theme]) !== JSON.stringify(palette[theme])
}