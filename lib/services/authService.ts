import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function registerUser(payload: { name: string; email: string; password: string; phone?: string }) {
  const existing = await User.findOne({ email: payload.email });
  if (existing) throw new Error('User already exists');
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(payload.password, salt);
  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
    phone: payload.phone,
  });
  
  return { user, accessToken: 'token', refreshToken: 'refresh' };
}

export async function loginUser(payload: { email: string; password: string }) {
  const user = await User.findOne({ email: payload.email });
  if (!user || !user.password) throw new Error('Invalid credentials');
  
  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');
  
  return { user, accessToken: 'token', refreshToken: 'refresh' };
}
