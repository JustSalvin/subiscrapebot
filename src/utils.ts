export function template(str: string, params: any) {
  return str.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    return params[key] !== undefined ? params[key] : "";
  });
}
