
import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats
} from '../controllers/admin.controller.js';
import {
  getAllProductsAdmin,
  getProductStats,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';
import {
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import {
  getAllOrders,
  getOrderStats,
  updateOrderStatus
} from '../controllers/order.controller.js';
import { uploadMultiple, uploadSingle } from '../middleware/upload.middleware.js';
import { uploadDebug } from '../config/cloudinary.js';

const router = Router();

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard stats route
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Import models
    const User = (await import('../models/User.model.js')).default;
    const Product = (await import('../models/Product.model.js')).default;
    const Category = (await import('../models/Category.model.js')).default;
    const Order = (await import('../models/Order.model.js')).default;
    
    const [
      totalUsers,
      totalProducts, 
      totalCategories,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'completed' }),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]).then(result => result[0]?.total || 0),
      Order.find()
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber total status createdAt user')
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalCategories,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue
        },
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard stats'
    });
  }
});

// Customer routes
router.route('/users')
  .get(getAllCustomers)
  .post(uploadSingle('avatar'), createCustomer);

router.route('/users/stats')
  .get(getCustomerStats);

router.route('/users/:id')
  .get(getCustomer)
  .patch(uploadSingle('avatar'), updateCustomer)
  .delete(deleteCustomer);

// Bulk user operations
router.route('/users/bulk/delete')
  .post(async (req, res): Promise<void> => {
    try {
      const { userIds } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        res.status(400).json({
          status: 'fail',
          message: 'User IDs array is required'
        });
        return;
      }

      const User = (await import('../models/User.model.js')).default;
      const Order = (await import('../models/Order.model.js')).default;
      
      // Check if any users have orders
      const usersWithOrders = await Promise.all(
        userIds.map(async (userId) => {
          const orderCount = await Order.countDocuments({ user: userId });
          return { userId, hasOrders: orderCount > 0 };
        })
      );
      
      const usersWithOrdersList = usersWithOrders.filter(u => u.hasOrders);
      
      if (usersWithOrdersList.length > 0) {
        res.status(400).json({
          status: 'fail',
          message: `Cannot delete users with existing orders: ${usersWithOrdersList.map(u => u.userId).join(', ')}`
        });
        return;
      }
      
      // Delete users and their avatars
      const users = await User.find({ _id: { $in: userIds } });
      
      // Delete avatars from Cloudinary
      const { deleteFromCloudinary } = await import('../config/cloudinary.js');
      await Promise.all(
        users.map(async (user) => {
          if (user.avatar) {
            try {
              const publicId = user.avatar.split('/').pop()?.split('.')[0];
              if (publicId) {
                await deleteFromCloudinary(publicId);
              }
            } catch (error) {
              console.log('Failed to delete avatar from Cloudinary:', error);
            }
          }
        })
      );
      
      const result = await User.deleteMany({ _id: { $in: userIds } });
      
      res.status(200).json({
        status: 'success',
        message: `Successfully deleted ${result.deletedCount} users`,
        data: {
          deletedCount: result.deletedCount
        }
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete users'
      });
    }
  });

router.route('/users/bulk/status')
  .patch(async (req, res): Promise<void> => {
    try {
      const { userIds, isActive } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        res.status(400).json({
          status: 'fail',
          message: 'User IDs array is required'
        });
        return;
      }
      
      if (typeof isActive !== 'boolean') {
        res.status(400).json({
          status: 'fail',
          message: 'isActive must be a boolean'
        });
        return;
      }

      const User = (await import('../models/User.model.js')).default;
      
      const result = await User.updateMany(
        { _id: { $in: userIds } },
        { isActive }
      );
      
      res.status(200).json({
        status: 'success',
        message: `Successfully ${isActive ? 'activated' : 'deactivated'} ${result.modifiedCount} users`,
        data: {
          modifiedCount: result.modifiedCount
        }
      });
    } catch (error) {
      console.error('Bulk status update error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update user status'
      });
    }
  });

// Product routes
router.route('/products')
  .get(getAllProductsAdmin)
  .post(uploadDebug(), createProduct);

router.route('/products/stats')
  .get(getProductStats);

router.route('/products/:id')
  .get(async (req, res) => {
    try {
      const Product = (await import('../models/Product.model.js')).default;
      const product = await Product.findById(req.params.id).populate('category', 'name');
      
      if (!product) {
        return res.status(404).json({
          status: 'fail',
          message: 'Product not found'
        });
      }

      return res.json({
        status: 'success',
        data: {
          product
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch product'
      });
    }
  })
  .patch(uploadDebug(), updateProduct)
  .delete(deleteProduct);

// Product image deletion routes
router.delete('/products/:id/images/:imageIndex', async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const Product = (await import('../models/Product.model.js')).default;
    const { deleteFromCloudinary } = await import('../config/cloudinary.js');
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= product.images.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid image index'
      });
    }

    // Delete from Cloudinary
    const imageUrl = product.images[index];
    const publicId = imageUrl.split('/').pop()?.split('.')[0];
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    // Remove from database
    product.images.splice(index, 1);
    await product.save();

    res.json({
      status: 'success',
      message: 'Image deleted successfully'
    });
    return;
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete image'
    });
    return;
  }
});

router.delete('/products/:id/variants/:variantIndex/images/:imageIndex', async (req, res) => {
  try {
    const { id, variantIndex, imageIndex } = req.params;
    const Product = (await import('../models/Product.model.js')).default;
    const { deleteFromCloudinary } = await import('../config/cloudinary.js');
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    const vIndex = parseInt(variantIndex);
    const iIndex = parseInt(imageIndex);
    
    if (vIndex < 0 || vIndex >= product.variants.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid variant index'
      });
    }

    if (iIndex < 0 || iIndex >= product.variants[vIndex].images.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid image index'
      });
    }

    // Delete from Cloudinary
    const imageUrl = product.variants[vIndex].images[iIndex];
    const publicId = imageUrl.split('/').pop()?.split('.')[0];
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Error deleting variant image from Cloudinary:', error);
      }
    }

    // Remove from database
    product.variants[vIndex].images.splice(iIndex, 1);
    await product.save();

    res.json({
      status: 'success',
      message: 'Variant image deleted successfully'
    });
    return;
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete variant image'
    });
    return;
  }
});

// Category image deletion route
router.delete('/categories/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const Category = (await import('../models/Category.model.js')).default;
    const { deleteFromCloudinary } = await import('../config/cloudinary.js');
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found'
      });
    }

    if (!category.image) {
      return res.status(400).json({
        status: 'fail',
        message: 'Category has no image to delete'
      });
    }

    // Delete from Cloudinary
    const publicId = category.image.split('/').pop()?.split('.')[0];
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Error deleting category image from Cloudinary:', error);
      }
    }

    // Remove from database
    category.image = '';
    await category.save();

    res.json({
      status: 'success',
      message: 'Category image deleted successfully'
    });
    return;
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete category image'
    });
    return;
  }
});

// Category routes
router.route('/categories')
  .get(getAllCategoriesAdmin)
  .post(uploadSingle('image'), createCategory);

router.route('/categories/:id')
  .get(async (req, res) => {
    try {
      const Category = (await import('../models/Category.model.js')).default;
      const category = await Category.findById(req.params.id).populate('parentCategory', 'name');
      
      if (!category) {
        return res.status(404).json({
          status: 'fail',
          message: 'Category not found'
        });
      }

      return res.json({
        status: 'success',
        data: {
          category
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch category'
      });
    }
  })
  .patch(uploadSingle('image'), updateCategory)
  .delete(deleteCategory);

// Order routes
router.route('/orders')
  .get(getAllOrders);

router.route('/orders/stats')
  .get(getOrderStats);

router.route('/orders/:id/status')
  .patch(updateOrderStatus);

export default router;
