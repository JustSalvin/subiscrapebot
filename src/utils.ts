export function template(str: string, params: Record<string, unknown>) {
	return str.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
		const value = params[key];
		return value !== undefined && value !== null ? String(value) : "";
	});
}
