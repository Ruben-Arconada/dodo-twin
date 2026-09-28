// Enlaces públicos del proyecto. La documentación se lee en GitHub, que
// renderiza Markdown; la web estática solo publica la aplicación y ejemplos.
export const REPO_URL = 'https://github.com/Ruben-Arconada/dodo-twin';
export const docUrl = (file: string) => `${REPO_URL}/blob/main/docs/${file}`;
export const appHome = () => (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
