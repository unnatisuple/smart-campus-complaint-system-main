import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = Router();

// ─── Mock user store (replace with Prisma in production) ──────────────────────
const MOCK_USERS = [
  {
    id: 's1', name: 'Arjun Sharma', email: 'student@campus.edu',
    passwordHash: bcrypt.hashSync('Student@123', 12), role: 'student',
  },
  {
    id: 'st1', name: 'Rajesh Kumar', email: 'staff@campus.edu',
    passwordHash: bcrypt.hashSync('Staff@123', 12), role: 'staff',
  },
  {
    id: 'admin1', name: 'Dr. Anand Verma', email: 'admin@campus.edu',
    passwordHash: bcrypt.hashSync('Admin@123', 12), role: 'admin',
  },
];

const generateTokens = (userId: string, role: string, email: string) => {
  const accessToken = jwt.sign(
    { userId, role, email },
    process.env.JWT_SECRET ?? 'secret',
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, role, email },
    process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email, password } = req.body;
    const user = MOCK_USERS.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.email);

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  }
);

// POST /api/auth/register
router.post('/register',
  [
    body('name').isLength({ min: 3 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('enrollmentNo').matches(/^\d{4}-\d{2}-\d{5}$/),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { name, email, password, enrollmentNo, department, year, mobile } = req.body;

    // Check if email exists (mock check)
    const existing = MOCK_USERS.find((u) => u.email === email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // In production: create user in DB with Prisma
    const newUser = {
      id: `s${Date.now()}`,
      name,
      email,
      role: 'student',
      passwordHash,
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      userId: newUser.id,
    });
  }
);

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: any, res: any) => {
  const { otp, email } = req.body;
  // Demo: accept any OTP = 123456
  if (otp === '123456') {
    res.json({ success: true, message: 'Email verified successfully' });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', (req: any, res: any) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET ?? 'refresh-secret'
    ) as any;

    const { accessToken, refreshToken: newRefresh } = generateTokens(
      payload.userId, payload.role, payload.email
    );

    res.json({ accessToken, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password',
  body('email').isEmail(),
  (req: any, res: any) => {
    res.json({ success: true, message: 'Password reset email sent (if account exists)' });
  }
);

export default router;
