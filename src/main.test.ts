import { describe, it, test, expect } from 'bun:test'
import { applyVar, unmarshalCss } from '@/utils'

describe('applyVar', () => {
	it('replaces RGB', () => {
		expect(applyVar('"#aabbcc",//1', '1', 'ddffee')).toBe('"#ddffee",//1')
	})

	it('keeps old alpha when val is RGB', () => {
		expect(applyVar('"#aabbcc10",//1', '1', 'ddffee')).toBe('"#ddffee10",//1')
	})

	it('uses alpha from val when val is RGBA', () => {
		expect(applyVar('"#aabbcc10",//1', '1', 'ddffee20')).toBe('"#ddffee20",//1')
	})
})

test('unmarshalCss', () => {
	expect(unmarshalCss(`
		.theme1 { --1: #abcdef; --2: #ghijkl; }
		.theme2 { --3: #mnopqr; --4: #stuvwx; }
	`)).toEqual({
		theme1: { 1: 'abcdef', 2: 'ghijkl' },
		theme2: { 3: 'mnopqr', 4: 'stuvwx' },
	})
})