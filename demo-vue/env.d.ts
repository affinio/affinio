/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare module "*.vue?raw" {
	const content: string
	export default content
}

declare module "*.tsx?raw" {
	const content: string
	export default content
}
