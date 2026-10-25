import { jest } from '@jest/globals';

// Helper function to create a valid JWT token for testing
export function createJwtToken(payload) {
	const header = { alg: 'HS256', typ: 'JWT' };
	const encodedHeader = btoa(JSON.stringify(header));
	const encodedPayload = btoa(JSON.stringify(payload))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
	const signature = 'fake_signature';
	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Mock localStorage avec des jest.fn() pour pouvoir vérifier les appels
export function createLocalStorageMock() {
	let store = {};
	return {
		getItem: jest.fn((key) => store[key] || null),
		setItem: jest.fn((key, value) => {
			store[key] = value.toString();
		}),
		removeItem: jest.fn((key) => {
			delete store[key];
		}),
		clear: jest.fn(() => {
			store = {};
		})
	};
}