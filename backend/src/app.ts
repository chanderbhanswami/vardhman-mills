import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import globalErrorHandler from './middleware/error.middleware.js';
import { requestLogger } from './middleware/logger.middleware.js';
import AppError from './utils/appError.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import giftCardRoutes from './routes/giftcard.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import cartRoutes from './routes/cart.routes.js';
import addressRoutes from './routes/address.routes.js';
import reviewRoutes from './routes/review.routes.js';
import dealRoutes from './routes/deal.routes.js';
import blogRoutes from './routes/blog.routes.js';
import productComparisonRoutes from './routes/productComparison.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import logoRoutes from './routes/logo.routes.js';
import logoEnhancementRoutes from './routes/logo-enhancement.routes.js';
import saleRoutes from './routes/sale.routes.js';
import searchRoutes from './routes/search.routes.js';
import faqRoutes from './routes/faq.routes.js';
import supportRoutes from './routes/support.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import adminAnalyticsRoutes from './routes/admin/analytics.routes.js';
import shippingRoutes from './routes/shipping.routes.js';
import brandRoutes from './routes/brand.routes.js';
import aboutRoutes from './routes/about.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import cmsRoutes from './routes/cms.routes.js';
import heroBannerRoutes from './routes/hero-banner.routes.js';
import collectionRoutes from './routes/collection.routes.js';
import featuredContentRoutes from './routes/featured-content.routes.js';
import locationRoutes from './routes/location.routes.js';
import mediaAssetRoutes from './routes/media-asset.routes.js';
import siteConfigRoutes from './routes/site-config.routes.js';
import bestsellerRoutes from './routes/bestseller.routes.js';
import newArrivalRoutes from './routes/new-arrival.routes.js';
import favoriteSectionRoutes from './routes/favorite-section.routes.js';
import socialLinkRoutes from './routes/social-link.routes.js';
import seoRoutes from './routes/seo.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import reviewMediaRoutes from './routes/review-media.routes.js';
import reviewReplyRoutes from './routes/review-reply.routes.js';
import refundRoutes from './routes/refund.routes.js';
import loyaltyRoutes from './routes/loyalty.routes.js';



// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Register notification routes
app.use('/api/notifications', notificationRoutes);

// Trust proxy (for Heroku, etc.)
app.set('trust proxy', 1);

// Global Middlewares
// Custom request logger
app.use(requestLogger);

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Implement CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
    'http://192.168.1.7:3000',
    'http://192.168.1.7:3001'
  ],
  credentials: true
}));

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Limit requests from same API
const limiter = rateLimit({
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again in an hour!'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'price', 'rating']
}));

// Compression middleware
app.use(compression());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Vardhman Mills API! 🏭',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      documentation: process.env.NODE_ENV === 'development' ? '/api/docs' : null,
      authentication: '/api/v1/auth',
      categories: '/api/v1/categories',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      users: '/api/v1/users',
      payments: '/api/v1/payments',
      settings: '/api/v1/settings',
      admin: '/api/admin'
    },
    adminCredentials: {
      email: 'admin@vardhmanmills.com',
      password: 'Admin@123'
    }
  });
});

// API Documentation endpoint (for development)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/docs', (req, res) => {
    res.json({
      message: 'Vardhman Mills API Documentation',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        categories: '/api/v1/categories',
        products: '/api/v1/products',
        orders: '/api/v1/orders',
        users: '/api/v1/users',
        payments: '/api/v1/payments',
        admin: '/api/admin'
      },
      health: '/api/health'
    });
  });
}

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/giftcards', giftCardRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/deals', dealRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/comparisons', productComparisonRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/logos', logoRoutes);
app.use('/api/v1/logo-enhancements', logoEnhancementRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/faqs', faqRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/shipping', shippingRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/about', aboutRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/hero-banners', heroBannerRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/featured-content', featuredContentRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/media', mediaAssetRoutes);
app.use('/api/v1/site-config', siteConfigRoutes);
app.use('/api/v1/bestsellers', bestsellerRoutes);
app.use('/api/v1/new-arrivals', newArrivalRoutes);
app.use('/api/v1/favorite-sections', favoriteSectionRoutes);
app.use('/api/v1/social-links', socialLinkRoutes);
app.use('/api/v1/seo', seoRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/review-media', reviewMediaRoutes);
app.use('/api/v1/review-replies', reviewReplyRoutes);
app.use('/api/v1/refunds', refundRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.version,
    env: process.env.NODE_ENV
  });
});

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;