import Razorpay from 'razorpay';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpay: Razorpay | null = null;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn('Razorpay credentials not found in environment variables. Razorpay functionality will be disabled.');
} else {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
}

export default razorpay;