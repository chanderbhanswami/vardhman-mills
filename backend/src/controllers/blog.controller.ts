import { Request, Response, NextFunction } from 'express';
import BlogPost from '../models/BlogPost.model.js';
import BlogCategory from '../models/BlogCategory.model.js';
import BlogComment from '../models/BlogComment.model.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

// ==================== BLOG POST CONTROLLERS ====================

/**
 * @desc    Get all published blog posts
 * @route   GET /api/v1/blog/posts
 * @access  Public
 */
export const getPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = req.query.sort as string || '-publishedAt';
    const category = req.query.category as string;
    const tag = req.query.tag as string;
    const author = req.query.author as string;
    const featured = req.query.featured === 'true';
    
    const filters: any = {};
    if (category) filters.category = category;
    if (tag) filters.tags = tag;
    if (author) filters.author = author;
    if (featured) filters.isFeatured = true;
    
    const posts = await BlogPost.getPublishedPosts(filters, { page, limit, sort });
    
    const total = await BlogPost.countDocuments({
      status: 'published',
      publishedAt: { $lte: new Date() },
      deletedAt: { $exists: false },
      ...filters
    });
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single blog post by slug
 * @route   GET /api/v1/blog/posts/:slug
 * @access  Public
 */
export const getPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      status: 'published',
      publishedAt: { $lte: new Date() },
      deletedAt: { $exists: false }
    })
      .populate('author', 'name email avatar')
      .populate('category', 'name slug')
      .populate('relatedPosts', 'title slug excerpt featuredImage publishedAt readingTime');
    
    if (!post) {
      return next(new AppError('Blog post not found', 404));
    }
    
    // Increment views
    await post.incrementViews();
    
    res.status(200).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search blog posts
 * @route   GET /api/v1/blog/posts/search/:query
 * @access  Public
 */
export const searchPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.params.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const posts = await BlogPost.searchPosts(query, { page, limit });
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured blog posts
 * @route   GET /api/v1/blog/posts/featured
 * @access  Public
 */
export const getFeaturedPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const posts = await BlogPost.getFeaturedPosts(limit);
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get popular blog posts
 * @route   GET /api/v1/blog/posts/popular
 * @access  Public
 */
export const getPopularPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 30;
    
    const posts = await BlogPost.getPopularPosts(limit, days);
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get related posts
 * @route   GET /api/v1/blog/posts/:id/related
 * @access  Public
 */
export const getRelatedPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const posts = await BlogPost.getRelatedPosts(
      req.params.id as unknown as mongoose.Types.ObjectId,
      limit
    );
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get posts by category
 * @route   GET /api/v1/blog/categories/:categoryId/posts
 * @access  Public
 */
export const getPostsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const posts = await BlogPost.getPostsByCategory(
      req.params.categoryId as unknown as mongoose.Types.ObjectId,
      { page, limit }
    );
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get posts by tag
 * @route   GET /api/v1/blog/tags/:tag/posts
 * @access  Public
 */
export const getPostsByTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const posts = await BlogPost.getPostsByTag(req.params.tag, { page, limit });
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get posts by author
 * @route   GET /api/v1/blog/authors/:authorId/posts
 * @access  Public
 */
export const getPostsByAuthor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const posts = await BlogPost.getPostsByAuthor(
      req.params.authorId as unknown as mongoose.Types.ObjectId,
      { page, limit }
    );
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new blog post
 * @route   POST /api/v1/blog/posts
 * @access  Private (Admin/Author)
 */
export const createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postData = {
      ...req.body,
      author: req.user?._id
    };
    
    const post = await BlogPost.create(postData);
    
    // Update category posts count
    await BlogCategory.findByIdAndUpdate(
      post.category,
      { $inc: { postsCount: 1 } }
    );
    
    res.status(201).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update blog post
 * @route   PATCH /api/v1/blog/posts/:id
 * @access  Private (Admin/Author)
 */
export const updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    // Check if user is author or admin
    if (post.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError('You are not authorized to update this post', 403));
    }
    
    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: { post: updatedPost }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete blog post (soft delete)
 * @route   DELETE /api/v1/blog/posts/:id
 * @access  Private (Admin/Author)
 */
export const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    // Check if user is author or admin
    if (post.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError('You are not authorized to delete this post', 403));
    }
    
    post.deletedAt = new Date();
    await post.save();
    
    // Decrement category posts count
    await BlogCategory.findByIdAndUpdate(
      post.category,
      { $inc: { postsCount: -1 } }
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish blog post
 * @route   PATCH /api/v1/blog/posts/:id/publish
 * @access  Private (Admin/Author)
 */
export const publishPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    await post.publish();
    
    res.status(200).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive blog post
 * @route   PATCH /api/v1/blog/posts/:id/archive
 * @access  Private (Admin)
 */
export const archivePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    await post.archive();
    
    res.status(200).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle like on post
 * @route   POST /api/v1/blog/posts/:id/like
 * @access  Private
 */
export const toggleLikePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    await post.toggleLike(req.user?._id as unknown as mongoose.Types.ObjectId);
    
    res.status(200).json({
      status: 'success',
      data: { likesCount: post.likesCount }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Increment share count
 * @route   POST /api/v1/blog/posts/:id/share
 * @access  Public
 */
export const sharePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { sharesCount: 1 } },
      { new: true }
    );
    
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: { sharesCount: post.sharesCount }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CATEGORY CONTROLLERS ====================

/**
 * @desc    Get all categories
 * @route   GET /api/v1/blog/categories
 * @access  Public
 */
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await BlogCategory.getActiveCategories();
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category
 * @route   GET /api/v1/blog/categories/:id
 * @access  Public
 */
export const getCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await BlogCategory.getCategoryWithPosts(
      req.params.id as unknown as mongoose.Types.ObjectId
    );
    
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create category
 * @route   POST /api/v1/blog/categories
 * @access  Private (Admin)
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await BlogCategory.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PATCH /api/v1/blog/categories/:id
 * @access  Private (Admin)
 */
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await BlogCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/v1/blog/categories/:id
 * @access  Private (Admin)
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await BlogCategory.findById(req.params.id);
    
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    
    // Check if category has posts
    if (category.postsCount > 0) {
      return next(new AppError('Cannot delete category with existing posts', 400));
    }
    
    category.deletedAt = new Date();
    await category.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== COMMENT CONTROLLERS ====================

/**
 * @desc    Get post comments
 * @route   GET /api/v1/blog/posts/:postId/comments
 * @access  Public
 */
export const getPostComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comments = await BlogComment.getPostComments(
      req.params.postId as unknown as mongoose.Types.ObjectId
    );
    
    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: { comments }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create comment
 * @route   POST /api/v1/blog/posts/:postId/comments
 * @access  Private
 */
export const createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    if (!post.allowComments) {
      return next(new AppError('Comments are disabled for this post', 403));
    }
    
    const comment = await BlogComment.create({
      post: req.params.postId,
      user: req.user?._id,
      content: req.body.content,
      parent: req.body.parent || null
    });
    
    await comment.populate('user', 'name email avatar');
    
    res.status(201).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update comment
 * @route   PATCH /api/v1/blog/comments/:id
 * @access  Private
 */
export const updateComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await BlogComment.findById(req.params.id);
    
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    if (comment.user.toString() !== req.user?._id.toString()) {
      return next(new AppError('You are not authorized to update this comment', 403));
    }
    
    comment.content = req.body.content;
    await comment.save();
    
    res.status(200).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete comment
 * @route   DELETE /api/v1/blog/comments/:id
 * @access  Private
 */
export const deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await BlogComment.findById(req.params.id);
    
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    if (comment.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError('You are not authorized to delete this comment', 403));
    }
    
    comment.deletedAt = new Date();
    await comment.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve comment
 * @route   PATCH /api/v1/blog/comments/:id/approve
 * @access  Private (Admin)
 */
export const approveComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await BlogComment.findById(req.params.id);
    
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    await comment.approve();
    
    res.status(200).json({
      status: 'success',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Flag comment
 * @route   POST /api/v1/blog/comments/:id/flag
 * @access  Private
 */
export const flagComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await BlogComment.findById(req.params.id);
    
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    await comment.flag(req.body.reason || 'Inappropriate content');
    
    res.status(200).json({
      status: 'success',
      message: 'Comment flagged successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle like on comment
 * @route   POST /api/v1/blog/comments/:id/like
 * @access  Private
 */
export const toggleLikeComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await BlogComment.findById(req.params.id);
    
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    await comment.toggleLike(req.user?._id as unknown as mongoose.Types.ObjectId);
    
    res.status(200).json({
      status: 'success',
      data: { likesCount: comment.likesCount }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pending comments
 * @route   GET /api/v1/blog/admin/comments/pending
 * @access  Private (Admin)
 */
export const getPendingComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comments = await BlogComment.getPendingComments();
    
    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: { comments }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ANALYTICS CONTROLLERS ====================

/**
 * @desc    Get blog analytics
 * @route   GET /api/v1/blog/admin/analytics
 * @access  Private (Admin)
 */
export const getBlogAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalPosts = await BlogPost.countDocuments({ deletedAt: { $exists: false } });
    const publishedPosts = await BlogPost.countDocuments({ 
      status: 'published',
      deletedAt: { $exists: false }
    });
    const draftPosts = await BlogPost.countDocuments({ status: 'draft' });
    const scheduledPosts = await BlogPost.countDocuments({ status: 'scheduled' });
    
    const totalViews = await BlogPost.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    
    const totalComments = await BlogComment.countDocuments({ 
      deletedAt: { $exists: false },
      isApproved: true
    });
    
    const pendingComments = await BlogComment.countDocuments({ 
      isApproved: false,
      deletedAt: { $exists: false }
    });
    
    const topPosts = await BlogPost.find({ deletedAt: { $exists: false } })
      .sort('-views')
      .limit(10)
      .select('title slug views likesCount commentsCount publishedAt')
      .populate('author', 'name');
    
    const topCategories = await BlogCategory.find({ deletedAt: { $exists: false } })
      .sort('-postsCount')
      .limit(10)
      .select('name postsCount');
    
    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalPosts,
          publishedPosts,
          draftPosts,
          scheduledPosts,
          totalViews: totalViews[0]?.total || 0,
          totalComments,
          pendingComments
        },
        topPosts,
        topCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tags
 * @route   GET /api/v1/blog/tags
 * @access  Public
 */
export const getAllTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tags = await BlogPost.aggregate([
      { $match: { status: 'published', deletedAt: { $exists: false } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);
    
    res.status(200).json({
      status: 'success',
      results: tags.length,
      data: { tags }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update scheduled posts status
 * @route   POST /api/v1/blog/admin/update-scheduled
 * @access  Private (Admin)
 */
export const updateScheduledPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await BlogPost.checkAndPublishScheduled();
    
    res.status(200).json({
      status: 'success',
      message: 'Scheduled posts updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
