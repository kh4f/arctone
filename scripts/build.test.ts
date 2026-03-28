import { describe, it, expect } from 'bun:test'
import { applyVar } from './build'

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