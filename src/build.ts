import { watch } from 'node:fs'
import { now, unmarshalCss, updateTheme, type Palette } from './utils'

const palettePath = 'src/palette.css'
let prevPalette: Palette = {}

const syncThemePalette = async () => {
	const raw = await Bun.file(palettePath).text()
	const palette = unmarshalCss(raw)

	for (const theme in palette) {
		if (JSON.stringify(prevPalette[theme]) !== JSON.stringify(palette[theme])) {
			console.log(`[${now()}] updating ${theme}`)
			void updateTheme(theme, palette[theme])
		}
	}
	prevPalette = palette
}

watch(palettePath, () => void syncThemePalette())