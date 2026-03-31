export const log = (...args: unknown[]) => console.log(`[${now()}]`, ...args)

const now = () => {
	const d = new Date()
	const pad = (n: number, len = 2) => String(n).padStart(len, '0')

	return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`
}