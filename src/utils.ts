export function template(str: string, params: Record<string, unknown>) {
	return str.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
		const value = params[key];
		return value !== undefined && value !== null ? String(value) : "";
	});
}

export function timestamp() {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return (
		`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
		`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
	);
}
