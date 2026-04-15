import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { supabase } from './supabase.js';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '24h';

if (!JWT_SECRET) {
  console.warn('JWT_SECRET not set — auth will fail.');
}

export function signToken(userId, role) {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId, token) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('sessions').insert({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  });
}

export async function invalidateSession(token) {
  await supabase.from('sessions').delete().eq('token_hash', hashToken(token));
}

export async function invalidateAllUserSessions(userId) {
  await supabase.from('sessions').delete().eq('user_id', userId);
}

export async function isSessionValid(token) {
  const { data } = await supabase
    .from('sessions')
    .select('id')
    .eq('token_hash', hashToken(token))
    .gt('expires_at', new Date().toISOString())
    .limit(1);
  return data && data.length > 0;
}

function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
}

export async function requireAuth(req, res) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'No token provided', code: 'UNAUTHORIZED' });
    return null;
  }

  try {
    const payload = verifyToken(token);
    const valid = await isSessionValid(token);
    if (!valid) {
      res.status(401).json({ error: 'Session expired or invalidated', code: 'UNAUTHORIZED' });
      return null;
    }
    return { ...payload, token };
  } catch {
    res.status(401).json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' });
    return null;
  }
}

export async function requireAdmin(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
    return null;
  }
  return user;
}
