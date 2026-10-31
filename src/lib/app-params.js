export const appParams = {
	appId: 'local-app-id',
	token: null,
	functionsVersion: 'v1',
	appBaseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
};