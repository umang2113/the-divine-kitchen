import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/firebase';
import { generateOTP, sendOTP } from '../utils/otpUtils';
import { asyncHandler } from '../middlewares/errorMiddleware';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a user (Step 1: Send OTP)
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  // ReCAPTCHA BYPASS FOR TESTING
  console.log('[BYPASS] ReCAPTCHA check bypassed for testing');

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Check if user exists
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  if (!snapshot.empty) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const phoneSnapshot = await usersRef.where('phone', '==', phone).get();
  if (!phoneSnapshot.empty) {
    return res.status(400).json({ message: 'Phone number already registered' });
  }

  const otp = generateOTP();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Store verification data with 10 mins expiry
  await db.collection('otp_verifications').doc(email).set({
    type: 'signup',
    name,
    email,
    passwordHash,
    phone,
    role: role || 'customer',
    otp,
    expiresAt: new Date(Date.now() + 10 * 60000).toISOString()
  });

  await sendOTP(email, phone, otp);

  res.status(200).json({ 
    message: 'OTP sent to your mobile number',
    email 
  });
});

// @desc    Verify Signup OTP & Create User
// @route   POST /api/auth/verify-signup
export const verifySignupOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  // TEST BYPASS
  let data: any;
  if (otp === "000000") {
    console.log(`[BYPASS] OTP bypass used for signup: ${email}`);
    const doc = await db.collection('otp_verifications').doc(email).get();
    data = doc.data();
  } else {
    const otpDoc = await db.collection('otp_verifications').doc(email).get();
    if (!otpDoc.exists) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    data = otpDoc.data()!;
    if (data.type !== 'signup' || data.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date(data.expiresAt) < new Date()) {
      await db.collection('otp_verifications').doc(email).delete();
      return res.status(400).json({ message: 'OTP expired' });
    }
  }

  // OTP Valid -> Create User
  const userData = {
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    phone: data.phone,
    role: data.role,
    loyaltyPoints: 0,
    createdAt: new Date().toISOString()
  };

  const usersRef = db.collection('users');
  const docRef = await usersRef.add(userData);

  // Delete verification record
  await db.collection('otp_verifications').doc(email).delete();

  res.status(201).json({
    _id: docRef.id,
    name: data.name,
    email: data.email,
    role: data.role,
    token: generateToken(docRef.id, data.role),
  });
});

// @desc    Login user (Step 1: Verify Password & Send OTP)
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // ReCAPTCHA BYPASS FOR TESTING
  console.log('[BYPASS] ReCAPTCHA check bypassed for testing');

  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (snapshot.empty) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  if (!(await bcrypt.compare(password, userData.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const otp = generateOTP();
  
  // Store login verification
  await db.collection('otp_verifications').doc(email).set({
    type: 'login',
    userId: userDoc.id,
    email: userData.email,
    role: userData.role,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60000).toISOString() // 5 mins for login
  });

  await sendOTP(userData.email, userData.phone || '0000000000', otp);

  res.json({
    message: 'OTP sent for verification',
    email
  });
});

// @desc    Verify Login OTP
// @route   POST /api/auth/verify-login
export const verifyLoginOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  // TEST BYPASS
  let data: any;
  if (otp === "000000") {
    console.log(`[BYPASS] OTP bypass used for login: ${email}`);
    const doc = await db.collection('otp_verifications').doc(email).get();
    if (!doc.exists) return res.status(400).json({ message: 'No OTP session found' });
    data = doc.data();
  } else {
    const otpDoc = await db.collection('otp_verifications').doc(email).get();
    if (!otpDoc.exists) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    data = otpDoc.data()!;
    if (data.type !== 'login' || data.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date(data.expiresAt) < new Date()) {
      await db.collection('otp_verifications').doc(email).delete();
      return res.status(400).json({ message: 'OTP expired' });
    }
  }

  // Get user details
  const userDoc = await db.collection('users').doc(data.userId).get();
  const userData = userDoc.data()!;

  // Delete verification record
  await db.collection('otp_verifications').doc(email).delete();

  res.json({
    _id: userDoc.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    token: generateToken(userDoc.id, userData.role),
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    delete userData?.passwordHash;

    res.json({ id: userDoc.id, ...userData });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, phone } = req.body;

    const userRef = db.collection('users').doc(userId);
    await userRef.update({ 
      name: name || undefined,
      phone: phone || undefined,
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await userRef.get();
    const userData = updatedDoc.data();
    delete userData?.passwordHash;

    res.json({ id: updatedDoc.id, ...userData });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot Password (Step 1: Send OTP)
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (snapshot.empty) {
    return res.status(404).json({ message: 'User with this email does not exist' });
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();
  const otp = generateOTP();

  // Store verification data with 10 mins expiry
  await db.collection('otp_verifications').doc(email).set({
    type: 'forgot_password',
    email,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60000).toISOString()
  });

  await sendOTP(email, userData.phone || '', otp);

  res.status(200).json({ 
    message: 'Reset OTP sent to your registered email/phone',
    email 
  });
});

// @desc    Reset Password (Step 2: Verify OTP & Update Password)
// @route   POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  const otpDoc = await db.collection('otp_verifications').doc(email).get();
  if (!otpDoc.exists) {
    return res.status(400).json({ message: 'OTP expired or not found' });
  }

  const data = otpDoc.data()!;
  if (data.type !== 'forgot_password' || data.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (new Date(data.expiresAt) < new Date()) {
    await db.collection('otp_verifications').doc(email).delete();
    return res.status(400).json({ message: 'OTP expired' });
  }

  // OTP Valid -> Update Password
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (snapshot.empty) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userDoc = snapshot.docs[0];
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await userDoc.ref.update({
    passwordHash,
    updatedAt: new Date().toISOString()
  });

  // Delete verification record
  await db.collection('otp_verifications').doc(email).delete();

  res.status(200).json({ message: 'Password reset successful. You can now login with your new password.' });
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await userDoc.ref.update({
      otp,
      otpExpires
    });

    await sendOTP(email, userData.phone || '', otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
