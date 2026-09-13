import { env } from '$env/dynamic/private';
import { SignJWT, jwtVerify } from 'jose';

// Secret key for JWT. In production, this should come from env.
const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET || 'super_secret_minimarket_key_2026_xyz');

export interface SessionUser {
	id: string;
	username: string;
	role_id: number;
	store_id: string;
	full_name: string;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
	const jwt = await new SignJWT({ ...user })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('12h')
		.sign(JWT_SECRET);
	return jwt;
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
	try {
		const { payload } = await jwtVerify(token, JWT_SECRET);
		return payload as unknown as SessionUser;
	} catch (err) {
		return null;
	}
}
