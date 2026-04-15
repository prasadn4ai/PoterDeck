import bcrypt from 'bcryptjs';
import { supabase } from '../../lib/supabase.js';
import { signToken, createSession } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(401).json({
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS',
    });
  }

  try {
    // Fetch user by email
    const { data: users } = await supabase
      .from('users')
      .select('id, email, password_hash, role, status')
      .eq('email', email.toLowerCase())
      .limit(1);

    const user = users?.[0];

    // Generic error — never reveal which field is wrong
    if (!user || !user.password_hash) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    if (user.status === 'suspended') {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Sign JWT and create session
    const token = signToken(user.id, user.role);
    await createSession(user.id, token);

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}
