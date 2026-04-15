import bcrypt from 'bcryptjs';
import { supabase } from '../../lib/supabase.js';
import { signToken, createSession } from '../../lib/auth.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  if (!EMAIL_REGEX.test(email)) return false;
  const localPart = email.split('@')[0];
  if (localPart.includes('..')) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!validateEmail(email)) {
    return res.status(422).json({
      error: 'Invalid email format',
      code: 'VALIDATION_FAILED',
    });
  }

  if (!password || typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return res.status(422).json({
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      code: 'VALIDATION_FAILED',
    });
  }

  try {
    // Check for existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(409).json({
        error: 'An account with this email already exists',
        code: 'EMAIL_EXISTS',
      });
    }

    // Hash password (bcrypt cost 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        provider: 'email',
        role: 'user',
        status: 'active',
      })
      .select('id, email, role')
      .single();

    if (insertError) {
      console.error('User creation error:', insertError.message);
      return res.status(500).json({ error: 'Failed to create account', code: 'INTERNAL_ERROR' });
    }

    // Sign JWT and create session
    const token = signToken(user.id, user.role);
    await createSession(user.id, token);

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}
