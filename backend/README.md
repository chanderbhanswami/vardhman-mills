# Vardhman Mills Backend API

A comprehensive e-commerce backend API built with Node.js, TypeScript, Express, and MongoDB Atlas. This backend powers the Vardhman Mills e-commerce platform with features for user management, product catalog, order processing, and payment integration.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Product Management** - Complete CRUD operations for products with variants
- **Category Management** - Hierarchical category structure
- **Order Processing** - Full order lifecycle management
- **Payment Integration** - Razorpay payment gateway integration
- **File Upload** - Cloudinary integration for image management
- **Email Services** - Automated email notifications
- **Search & Filtering** - Advanced product search with filters
- **Admin Dashboard** - Administrative operations and analytics

### Security Features
- **Rate Limiting** - API rate limiting to prevent abuse
- **Data Sanitization** - Protection against NoSQL injection and XSS
- **Helmet.js** - Security headers for HTTP requests
- **Password Hashing** - bcrypt for secure password storage
- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Comprehensive request validation with Joi

### Performance Features
- **Database Indexing** - Optimized database queries with proper indexing
- **Compression** - Response compression for better performance
- **Caching** - Strategic caching implementation
- **Logging** - Comprehensive logging system for monitoring

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server initialization
│   ├── config/             # Configuration files
│   │   ├── database.ts     # Database configuration
│   │   ├── jwt.ts         # JWT utilities
│   │   ├── cloudinary.ts  # Cloudinary configuration
│   │   └── razorpay.ts    # Razorpay configuration
│   ├── controllers/        # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── category.controller.ts
│   │   ├── order.controller.ts
│   │   ├── user.controller.ts
│   │   ├── payment.controller.ts
│   │   └── admin.controller.ts
│   ├── middleware/         # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logger.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/            # Mongoose models
│   │   ├── User.model.ts
│   │   ├── Product.model.ts
│   │   ├── Category.model.ts
│   │   ├── Order.model.ts
│   │   └── Review.model.ts
│   ├── routes/            # API routes
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── category.routes.ts
│   │   ├── order.routes.ts
│   │   ├── user.routes.ts
│   │   ├── payment.routes.ts
│   │   └── admin.routes.ts
│   ├── scripts/           # Utility scripts
│   │   ├── seed.ts        # Database seeding
│   │   ├── db-init.ts     # Database initialization
│   │   ├── create-indexes.ts # Index creation
│   │   ├── validate.ts    # Production validation
│   │   └── test-api.ts    # API testing
│   ├── services/          # Business logic services
│   │   ├── email.service.ts
│   │   ├── payment.service.ts
│   │   └── upload.service.ts
│   ├── utils/             # Utility functions
│   │   ├── appError.ts
│   │   ├── catchAsync.ts
│   │   ├── generateToken.ts
│   │   └── validators.ts
│   └── types/             # TypeScript type definitions
│       ├── index.ts
│       └── express.d.ts
├── logs/                  # Application logs
├── uploads/               # Local file uploads (if not using Cloudinary)
├── package.json
├── tsconfig.json
├── .env                   # Environment variables
├── .env.example          # Environment template
└── README.md
```

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+ (recommended: v22.17.1)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account (for image uploads)
- Razorpay account (for payments)

### 1. Clone and Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and update the values:

```env
# Application
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=Vardhman Mills

# Frontend URLs
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### 3. Database Setup
Initialize the database and create indexes:
```bash
# Initialize database and test connection
npm run db:init

# Create database indexes for optimal performance
npm run db:indexes

# Seed database with sample data (development only)
npm run seed:dev

# Or use the complete setup command
npm run setup
```

### 4. Validate Configuration
Ensure everything is properly configured:
```bash
npm run validate
```

### 5. Start the Server
```bash
# Development mode with hot reload
npm run dev

# Production build and start
npm run build
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📊 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  firstName: string,
  lastName: string,
  email: string (unique),
  password: string (hashed),
  mobile?: string,
  role: 'user' | 'admin',
  isEmailVerified: boolean,
  avatar?: string,
  addresses: IAddress[],
  wishlist: ObjectId[],
  isActive: boolean,
  lastLoginAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```typescript
{
  _id: ObjectId,
  name: string,
  slug: string (unique),
  description: string,
  shortDescription?: string,
  category: ObjectId,
  subcategory?: ObjectId,
  brand?: string,
  tags: string[],
  variants: IProductVariant[],
  images: string[],
  specifications: Map<string, string>,
  isActive: boolean,
  isFeatured: boolean,
  averageRating: number,
  totalReviews: number,
  reviews: IProductReview[],
  seoTitle?: string,
  seoDescription?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```typescript
{
  _id: ObjectId,
  orderNumber: string (unique),
  user?: ObjectId,
  guestEmail?: string,
  items: IOrderItem[],
  subtotal: number,
  shippingCost: number,
  tax: number,
  discount: number,
  total: number,
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  paymentInfo: IPaymentInfo,
  shippingAddress: IShippingAddress,
  billingAddress: IShippingAddress,
  trackingNumber?: string,
  estimatedDelivery?: Date,
  deliveredAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset
- `GET /api/v1/auth/verify-email/:token` - Email verification
- `PATCH /api/v1/auth/update-password` - Update password (protected)

### Product Endpoints
- `GET /api/v1/products` - Get all products (with filtering, sorting, pagination)
- `GET /api/v1/products/:slug` - Get single product by slug
- `POST /api/v1/products` - Create product (admin only)
- `PATCH /api/v1/products/:id` - Update product (admin only)
- `DELETE /api/v1/products/:id` - Delete product (admin only)
- `POST /api/v1/products/:id/reviews` - Add product review (authenticated)

### Category Endpoints
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:slug` - Get single category
- `POST /api/v1/categories` - Create category (admin only)
- `PATCH /api/v1/categories/:id` - Update category (admin only)
- `DELETE /api/v1/categories/:id` - Delete category (admin only)

### Order Endpoints
- `GET /api/v1/orders` - Get user orders (authenticated)
- `GET /api/v1/orders/:id` - Get single order
- `POST /api/v1/orders` - Create order
- `PATCH /api/v1/orders/:id` - Update order status (admin only)

### User Endpoints
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update user profile
- `POST /api/v1/users/addresses` - Add address
- `PATCH /api/v1/users/addresses/:id` - Update address
- `DELETE /api/v1/users/addresses/:id` - Delete address

### Payment Endpoints
- `POST /api/v1/payments/create-order` - Create Razorpay order
- `POST /api/v1/payments/verify` - Verify payment
- `POST /api/v1/payments/webhook` - Payment webhook handler

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/:id/status` - Update order status

### Utility Endpoints
- `GET /api/health` - Health check
- `GET /api/docs` - API documentation (development only)

## 🧪 Testing

### API Testing
```bash
# Test all API endpoints
npm run test:api

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Manual Testing
The seeded database includes:
- **Admin User**: `admin@vardhmanmills.com` / `Admin@123`
- **Test Users**: `john@example.com` / `User@123`, `jane@example.com` / `User@123`
- **Sample Products**: 5 products across different categories
- **Sample Orders**: 3 test orders

## 📦 Available Scripts

### Development Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run watch` - Watch TypeScript files and rebuild

### Database Scripts
- `npm run db:init` - Initialize database and test connection
- `npm run db:indexes` - Create database indexes
- `npm run seed` - Run database seeding
- `npm run seed:dev` - Seed with development data
- `npm run setup` - Complete development setup

### Utility Scripts
- `npm run validate` - Validate production configuration
- `npm run test:api` - Test API endpoints
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run clean` - Clean build directory

## 🚀 Production Deployment

### Production Checklist
1. **Environment Variables**: Set `NODE_ENV=production`
2. **Database**: Ensure MongoDB Atlas is configured with proper security
3. **Security**: Update JWT secrets and API keys
4. **Performance**: Enable database indexes and compression
5. **Monitoring**: Set up logging and error tracking
6. **SSL**: Configure HTTPS for secure communication

### Production Validation
```bash
# Set production environment
export NODE_ENV=production

# Validate production setup
npm run validate

# Build and start
npm run build
npm start
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | development |
| `PORT` | Server port | Yes | 5000 |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | Yes | 7d |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | - |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Yes | - |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | Yes | - |
| `EMAIL_HOST` | SMTP host | Yes | - |
| `EMAIL_USER` | SMTP username | Yes | - |
| `EMAIL_PASSWORD` | SMTP password | Yes | - |
| `FRONTEND_URL` | Frontend application URL | Yes | - |
| `ADMIN_URL` | Admin panel URL | Yes | - |

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB Atlas connection string
   - Verify network access and IP whitelist
   - Ensure database user has proper permissions

2. **JWT Token Issues**
   - Verify JWT_SECRET is properly set
   - Check token expiration settings
   - Ensure consistent JWT configuration

3. **File Upload Problems**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure proper CORS configuration

4. **Email Service Not Working**
   - Verify SMTP credentials
   - Check email provider settings
   - Test with different email providers

### Debug Mode
Set `DEBUG=app:*` environment variable for detailed logging.

## 📋 Performance Optimization

- **Database Indexing**: All collections have optimized indexes
- **Query Optimization**: Efficient database queries with population
- **Caching**: Strategic caching for frequently accessed data
- **Compression**: Response compression enabled
- **Rate Limiting**: API rate limiting to prevent abuse

## 🔒 Security Features

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive request validation
- **Data Sanitization**: Protection against injection attacks
- **Security Headers**: Helmet.js for HTTP security headers
- **Rate Limiting**: Request rate limiting
- **Password Security**: bcrypt hashing with salt

## 🤝 Contributing

1. Follow TypeScript and ESLint configurations
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Follow conventional commit messages

## 📄 License

This project is licensed under the ISC License.

## 🎯 Current Status

✅ **Complete Features:**
- User authentication and authorization
- Product management with variants
- Category management
- Order processing
- Payment integration setup
- File upload with Cloudinary
- Email services
- Database seeding and indexing
- Production-ready configuration
- Comprehensive logging
- Security middleware
- API validation

🚀 **Production Ready:**
- Database properly indexed and seeded
- Environment variables configured
- Security measures implemented
- Error handling and logging in place
- Performance optimizations applied
- Validation scripts confirm readiness

---

**Server Status:** ✅ Running successfully on port 5000  
**Database Status:** ✅ Connected to MongoDB Atlas  
**Seeding Status:** ✅ Database populated with sample data  
**Validation Status:** ✅ All production checks passed  

The backend is now fully functional and production-ready!
