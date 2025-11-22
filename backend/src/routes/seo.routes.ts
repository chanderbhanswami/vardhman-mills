/**
 * SEO Routes
 * Comprehensive SEO management endpoints
 */

import express from 'express';
import {
  // SEO Settings
  getSEOSettings,
  updateSEOSettings,

  // Page SEO
  getPagesSEO,
  getPageSEO,
  getPageSEOByPage,
  createPageSEO,
  updatePageSEO,
  deletePageSEO,
  bulkUpdatePagesSEO,
  generatePageSEO,

  // Sitemaps
  getSitemaps,
  getSitemap,
  generateSitemap,
  updateSitemap,
  deleteSitemap,
  downloadSitemap,
  validateSitemap,
  submitSitemap,

  // Robots.txt
  getRobotsTxt,
  updateRobotsTxt,
  validateRobotsTxt,
  testRobotsTxt,

  // Schema Markup
  getSchemaMarkups,
  getSchemaMarkup,
  createSchemaMarkup,
  updateSchemaMarkup,
  deleteSchemaMarkup,
  validateSchemaMarkup,
  generateSchemaMarkup,

  // Meta Tags
  getMetaTags,
  getMetaTag,
  createMetaTag,
  updateMetaTag,
  deleteMetaTag,
  bulkCreateMetaTags,

  // Redirect Rules
  getRedirectRules,
  getRedirectRule,
  createRedirectRule,
  updateRedirectRule,
  deleteRedirectRule,
  testRedirectRule,
  bulkCreateRedirectRules,
  importRedirectRules,

  // SEO Audits
  getAudits,
  getAudit,
  auditPage,
  bulkAuditPages,
  deleteAudit,
  exportAudit,

  // Analytics
  getSEOAnalytics
} from '../controllers/seo.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// SEO Settings (Public - read only)
router.get('/settings', getSEOSettings);

// Page SEO (Public - read only)
router.get('/pages/by-page/:pageId', getPageSEOByPage);
router.get('/pages/:id', getPageSEO);

// Sitemaps (Public)
router.get('/sitemaps', getSitemaps);
router.get('/sitemaps/:id', getSitemap);
router.get('/sitemaps/:id/download', downloadSitemap);

// Robots.txt (Public)
router.get('/robots', getRobotsTxt);

// Schema Markup (Public - for rendering)
router.get('/schema-markups/:id', getSchemaMarkup);

// Meta Tags (Public - for rendering)
router.get('/meta-tags/:id', getMetaTag);

// ============================================================================
// ADMIN ROUTES (Protected)
// ============================================================================

// SEO Settings (Admin)
router.patch('/settings', protect, restrictTo('admin', 'super_admin'), updateSEOSettings);

// Page SEO (Admin)
router.get('/pages', protect, restrictTo('admin', 'super_admin'), getPagesSEO);
router.post('/pages', protect, restrictTo('admin', 'super_admin'), createPageSEO);
router.patch('/pages/:id', protect, restrictTo('admin', 'super_admin'), updatePageSEO);
router.delete('/pages/:id', protect, restrictTo('admin', 'super_admin'), deletePageSEO);
router.patch('/pages/bulk-update', protect, restrictTo('admin', 'super_admin'), bulkUpdatePagesSEO);
router.post('/pages/generate/:pageId', protect, restrictTo('admin', 'super_admin'), generatePageSEO);

// Sitemaps (Admin)
router.post('/sitemaps/generate', protect, restrictTo('admin', 'super_admin'), generateSitemap);
router.patch('/sitemaps/:id', protect, restrictTo('admin', 'super_admin'), updateSitemap);
router.delete('/sitemaps/:id', protect, restrictTo('admin', 'super_admin'), deleteSitemap);
router.post('/sitemaps/:id/validate', protect, restrictTo('admin', 'super_admin'), validateSitemap);
router.post('/sitemaps/:id/submit', protect, restrictTo('admin', 'super_admin'), submitSitemap);

// Robots.txt (Admin)
router.patch('/robots', protect, restrictTo('admin', 'super_admin'), updateRobotsTxt);
router.post('/robots/validate', protect, restrictTo('admin', 'super_admin'), validateRobotsTxt);
router.post('/robots/test', protect, restrictTo('admin', 'super_admin'), testRobotsTxt);

// Schema Markup (Admin)
router.get('/schema-markups', protect, restrictTo('admin', 'super_admin'), getSchemaMarkups);
router.post('/schema-markups', protect, restrictTo('admin', 'super_admin'), createSchemaMarkup);
router.patch('/schema-markups/:id', protect, restrictTo('admin', 'super_admin'), updateSchemaMarkup);
router.delete('/schema-markups/:id', protect, restrictTo('admin', 'super_admin'), deleteSchemaMarkup);
router.post('/schema-markups/:id/validate', protect, restrictTo('admin', 'super_admin'), validateSchemaMarkup);
router.post('/schema-markups/generate', protect, restrictTo('admin', 'super_admin'), generateSchemaMarkup);

// Meta Tags (Admin)
router.get('/meta-tags', protect, restrictTo('admin', 'super_admin'), getMetaTags);
router.post('/meta-tags', protect, restrictTo('admin', 'super_admin'), createMetaTag);
router.patch('/meta-tags/:id', protect, restrictTo('admin', 'super_admin'), updateMetaTag);
router.delete('/meta-tags/:id', protect, restrictTo('admin', 'super_admin'), deleteMetaTag);
router.post('/meta-tags/bulk-create', protect, restrictTo('admin', 'super_admin'), bulkCreateMetaTags);

// Redirect Rules (Admin)
router.get('/redirect-rules', protect, restrictTo('admin', 'super_admin'), getRedirectRules);
router.get('/redirect-rules/:id', protect, restrictTo('admin', 'super_admin'), getRedirectRule);
router.post('/redirect-rules', protect, restrictTo('admin', 'super_admin'), createRedirectRule);
router.patch('/redirect-rules/:id', protect, restrictTo('admin', 'super_admin'), updateRedirectRule);
router.delete('/redirect-rules/:id', protect, restrictTo('admin', 'super_admin'), deleteRedirectRule);
router.post('/redirect-rules/:id/test', protect, restrictTo('admin', 'super_admin'), testRedirectRule);
router.post('/redirect-rules/bulk-create', protect, restrictTo('admin', 'super_admin'), bulkCreateRedirectRules);
router.post('/redirect-rules/import', protect, restrictTo('admin', 'super_admin'), importRedirectRules);

// SEO Audits (Admin)
router.get('/audits', protect, restrictTo('admin', 'super_admin'), getAudits);
router.get('/audits/:id', protect, restrictTo('admin', 'super_admin'), getAudit);
router.post('/audits', protect, restrictTo('admin', 'super_admin'), auditPage);
router.post('/audits/bulk', protect, restrictTo('admin', 'super_admin'), bulkAuditPages);
router.delete('/audits/:id', protect, restrictTo('admin', 'super_admin'), deleteAudit);
router.get('/audits/:id/export', protect, restrictTo('admin', 'super_admin'), exportAudit);

// SEO Analytics (Admin)
router.get('/analytics', protect, restrictTo('admin', 'super_admin'), getSEOAnalytics);

export default router;
