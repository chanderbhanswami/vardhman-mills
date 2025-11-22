# COMPREHENSIVE API ENDPOINTS AUDIT

**Generated:** 11/1/2025, 1:57:46 PM

## Summary

- **Total Route Files:** 48
- **Total Endpoints Detected:** 942
- **Currently Tested:** 60
- **Coverage:** 6.37%

## Endpoints by File

- **logo-enhancement.routes.ts**: 60 endpoints
- **seo.routes.ts**: 50 endpoints
- **notification.routes.ts**: 37 endpoints
- **blog.routes.ts**: 32 endpoints
- **cms.routes.ts**: 32 endpoints
- **hero-banner.routes.ts**: 30 endpoints
- **about.routes.ts**: 28 endpoints
- **cart.routes.ts**: 26 endpoints
- **inventory.routes.ts**: 26 endpoints
- **upload.routes.ts**: 26 endpoints
- **brand.routes.ts**: 25 endpoints
- **review-reply.routes.ts**: 23 endpoints
- **collection.routes.ts**: 22 endpoints
- **location.routes.ts**: 22 endpoints
- **support.routes.ts**: 22 endpoints
- **analytics.routes.ts**: 21 endpoints
- **featured-content.routes.ts**: 21 endpoints
- **review-media.routes.ts**: 21 endpoints
- **deal.routes.ts**: 20 endpoints
- **sale.routes.ts**: 20 endpoints
- **faq.routes.ts**: 19 endpoints
- **newsletter.routes.ts**: 19 endpoints
- **review.routes.ts**: 19 endpoints
- **wishlist.routes.ts**: 19 endpoints
- **address.routes.ts**: 18 endpoints
- **logo.routes.ts**: 18 endpoints
- **new-arrival.routes.ts**: 18 endpoints
- **productComparison.routes.ts**: 18 endpoints
- **social-link.routes.ts**: 18 endpoints
- **admin.routes.ts**: 17 endpoints
- **announcement.routes.ts**: 17 endpoints
- **favorite-section.routes.ts**: 17 endpoints
- **product.routes.ts**: 16 endpoints
- **bestseller.routes.ts**: 14 endpoints
- **giftcard.routes.ts**: 14 endpoints
- **media-asset.routes.ts**: 14 endpoints
- **coupon.routes.ts**: 13 endpoints
- **search.routes.ts**: 13 endpoints
- **site-config.routes.ts**: 13 endpoints
- **user.routes.ts**: 11 endpoints
- **order.routes.ts**: 10 endpoints
- **auth.routes.ts**: 9 endpoints
- **settings.routes.ts**: 9 endpoints
- **shipping.routes.ts**: 8 endpoints
- **category.routes.ts**: 7 endpoints
- **payment.routes.ts**: 5 endpoints
- **test.routes.ts**: 1 endpoints

## All Detected Endpoints

| Method | Path | File |
|--------|------|------|
| GET | `/` | address.routes.ts |
| GET | `/` | announcement.routes.ts |
| GET | `/` | bestseller.routes.ts |
| POST | `/` | bestseller.routes.ts |
| GET | `/` | brand.routes.ts |
| POST | `/` | brand.routes.ts |
| GET | `/` | cart.routes.ts |
| POST | `/` | cart.routes.ts |
| GET | `/` | category.routes.ts |
| GET | `/` | collection.routes.ts |
| POST | `/` | collection.routes.ts |
| GET | `/` | coupon.routes.ts |
| GET | `/` | deal.routes.ts |
| POST | `/` | deal.routes.ts |
| GET | `/` | faq.routes.ts |
| POST | `/` | faq.routes.ts |
| GET | `/` | favorite-section.routes.ts |
| POST | `/` | favorite-section.routes.ts |
| GET | `/` | featured-content.routes.ts |
| POST | `/` | featured-content.routes.ts |
| GET | `/` | giftcard.routes.ts |
| GET | `/` | location.routes.ts |
| POST | `/` | location.routes.ts |
| GET | `/` | logo.routes.ts |
| GET | `/` | media-asset.routes.ts |
| GET | `/` | new-arrival.routes.ts |
| POST | `/` | new-arrival.routes.ts |
| GET | `/` | notification.routes.ts |
| POST | `/` | notification.routes.ts |
| POST | `/` | order.routes.ts |
| GET | `/` | product.routes.ts |
| GET | `/` | productComparison.routes.ts |
| POST | `/` | productComparison.routes.ts |
| GET | `/` | review-media.routes.ts |
| POST | `/` | review-media.routes.ts |
| POST | `/` | review-reply.routes.ts |
| GET | `/` | sale.routes.ts |
| POST | `/` | search.routes.ts |
| GET | `/` | settings.routes.ts |
| GET | `/` | site-config.routes.ts |
| GET | `/` | social-link.routes.ts |
| POST | `/` | social-link.routes.ts |
| POST | `/` | upload.routes.ts |
| GET | `/` | upload.routes.ts |
| GET | `/` | user.routes.ts |
| GET | `/` | wishlist.routes.ts |
| GET | `/:cardId/transactions` | giftcard.routes.ts |
| GET | `/:category/:key` | settings.routes.ts |
| PATCH | `/:category/:key` | settings.routes.ts |
| DELETE | `/:category/:key` | settings.routes.ts |
| GET | `/:id` | address.routes.ts |
| GET | `/:id` | announcement.routes.ts |
| GET | `/:id` | bestseller.routes.ts |
| PATCH | `/:id` | bestseller.routes.ts |
| DELETE | `/:id` | bestseller.routes.ts |
| GET | `/:id` | brand.routes.ts |
| PUT | `/:id` | brand.routes.ts |
| DELETE | `/:id` | brand.routes.ts |
| GET | `/:id` | collection.routes.ts |
| PATCH | `/:id` | collection.routes.ts |
| DELETE | `/:id` | collection.routes.ts |
| GET | `/:id` | coupon.routes.ts |
| GET | `/:id` | deal.routes.ts |
| PATCH | `/:id` | deal.routes.ts |
| DELETE | `/:id` | deal.routes.ts |
| GET | `/:id` | faq.routes.ts |
| PATCH | `/:id` | faq.routes.ts |
| DELETE | `/:id` | faq.routes.ts |
| PATCH | `/:id` | favorite-section.routes.ts |
| DELETE | `/:id` | favorite-section.routes.ts |
| GET | `/:id` | featured-content.routes.ts |
| PATCH | `/:id` | featured-content.routes.ts |
| DELETE | `/:id` | featured-content.routes.ts |
| GET | `/:id` | giftcard.routes.ts |
| GET | `/:id` | location.routes.ts |
| PATCH | `/:id` | location.routes.ts |
| DELETE | `/:id` | location.routes.ts |
| GET | `/:id` | logo.routes.ts |
| GET | `/:id` | media-asset.routes.ts |
| GET | `/:id` | new-arrival.routes.ts |
| PATCH | `/:id` | new-arrival.routes.ts |
| DELETE | `/:id` | new-arrival.routes.ts |
| GET | `/:id` | notification.routes.ts |
| PUT | `/:id` | notification.routes.ts |
| DELETE | `/:id` | notification.routes.ts |
| GET | `/:id` | order.routes.ts |
| GET | `/:id` | productComparison.routes.ts |
| PUT | `/:id` | productComparison.routes.ts |
| DELETE | `/:id` | productComparison.routes.ts |
| GET | `/:id` | review-media.routes.ts |
| PATCH | `/:id` | review-media.routes.ts |
| DELETE | `/:id` | review-media.routes.ts |
| GET | `/:id` | review-reply.routes.ts |
| PATCH | `/:id` | review-reply.routes.ts |
| DELETE | `/:id` | review-reply.routes.ts |
| GET | `/:id` | review.routes.ts |
| PATCH | `/:id` | review.routes.ts |
| GET | `/:id` | sale.routes.ts |
| GET | `/:id` | social-link.routes.ts |
| PATCH | `/:id` | social-link.routes.ts |
| DELETE | `/:id` | social-link.routes.ts |
| GET | `/:id` | upload.routes.ts |
| PATCH | `/:id` | upload.routes.ts |
| DELETE | `/:id` | upload.routes.ts |
| GET | `/:id` | user.routes.ts |
| POST | `/:id/ab-test` | featured-content.routes.ts |
| GET | `/:id/ab-test` | logo-enhancement.routes.ts |
| POST | `/:id/ab-test` | logo-enhancement.routes.ts |
| DELETE | `/:id/ab-test` | logo-enhancement.routes.ts |
| POST | `/:id/ab-test/end` | favorite-section.routes.ts |
| POST | `/:id/ab-test/end` | featured-content.routes.ts |
| GET | `/:id/ab-test/results` | featured-content.routes.ts |
| GET | `/:id/ab-test/results` | logo-enhancement.routes.ts |
| POST | `/:id/ab-test/start` | favorite-section.routes.ts |
| POST | `/:id/ab-test/stop` | logo-enhancement.routes.ts |
| POST | `/:id/ab-test/track/click` | logo-enhancement.routes.ts |
| POST | `/:id/ab-test/track/conversion` | logo-enhancement.routes.ts |
| POST | `/:id/ab-test/track/impression` | logo-enhancement.routes.ts |
| POST | `/:id/ab-test/variants` | logo-enhancement.routes.ts |
| PATCH | `/:id/ab-test/variants/:variantId` | logo-enhancement.routes.ts |
| DELETE | `/:id/ab-test/variants/:variantId` | logo-enhancement.routes.ts |
| POST | `/:id/ab-test/winner` | logo-enhancement.routes.ts |
| POST | `/:id/activate` | announcement.routes.ts |
| PATCH | `/:id/activate` | collection.routes.ts |
| PATCH | `/:id/activate` | deal.routes.ts |
| PATCH | `/:id/activate` | featured-content.routes.ts |
| PATCH | `/:id/activate` | location.routes.ts |
| POST | `/:id/activate` | logo.routes.ts |
| POST | `/:id/activate` | sale.routes.ts |
| GET | `/:id/analytics` | logo-enhancement.routes.ts |
| GET | `/:id/analytics` | sale.routes.ts |
| GET | `/:id/analytics/browsers` | logo-enhancement.routes.ts |
| POST | `/:id/analytics/click` | logo-enhancement.routes.ts |
| GET | `/:id/analytics/devices` | logo-enhancement.routes.ts |
| GET | `/:id/analytics/export` | logo-enhancement.routes.ts |
| GET | `/:id/analytics/geography` | logo-enhancement.routes.ts |
| POST | `/:id/analytics/hover` | logo-enhancement.routes.ts |
| POST | `/:id/analytics/impression` | logo-enhancement.routes.ts |
| POST | `/:id/analytics/performance` | logo-enhancement.routes.ts |
| GET | `/:id/analytics/performance-summary` | logo-enhancement.routes.ts |
| POST | `/:id/analytics/reset` | logo-enhancement.routes.ts |
| POST | `/:id/analytics/scroll` | logo-enhancement.routes.ts |
| POST | `/:id/analytics/view-time` | logo-enhancement.routes.ts |
| GET | `/:id/analyze` | productComparison.routes.ts |
| GET | `/:id/animation` | logo-enhancement.routes.ts |
| PATCH | `/:id/animation` | logo-enhancement.routes.ts |
| DELETE | `/:id/animation` | logo-enhancement.routes.ts |
| POST | `/:id/animation/disable-all` | logo-enhancement.routes.ts |
| PATCH | `/:id/animation/entrance` | logo-enhancement.routes.ts |
| PATCH | `/:id/animation/interactions` | logo-enhancement.routes.ts |
| PATCH | `/:id/animation/loading` | logo-enhancement.routes.ts |
| PATCH | `/:id/animation/scroll` | logo-enhancement.routes.ts |
| POST | `/:id/approve` | review-media.routes.ts |
| POST | `/:id/approve` | review-reply.routes.ts |
| PATCH | `/:id/approve` | review.routes.ts |
| PATCH | `/:id/archive` | favorite-section.routes.ts |
| PATCH | `/:id/archive` | media-asset.routes.ts |
| POST | `/:id/assign-moderator` | review-media.routes.ts |
| POST | `/:id/banner` | brand.routes.ts |
| DELETE | `/:id/banner` | brand.routes.ts |
| POST | `/:id/calculate` | sale.routes.ts |
| PATCH | `/:id/cancel` | deal.routes.ts |
| DELETE | `/:id/cancel` | giftcard.routes.ts |
| PATCH | `/:id/cancel` | order.routes.ts |
| GET | `/:id/categories` | brand.routes.ts |
| GET | `/:id/category-features` | productComparison.routes.ts |
| POST | `/:id/check` | sale.routes.ts |
| POST | `/:id/click` | announcement.routes.ts |
| POST | `/:id/click` | deal.routes.ts |
| POST | `/:id/click` | favorite-section.routes.ts |
| POST | `/:id/convert` | review-media.routes.ts |
| POST | `/:id/deactivate` | announcement.routes.ts |
| PATCH | `/:id/deactivate` | collection.routes.ts |
| PATCH | `/:id/deactivate` | featured-content.routes.ts |
| PATCH | `/:id/deactivate` | location.routes.ts |
| POST | `/:id/deactivate` | logo.routes.ts |
| POST | `/:id/deactivate` | sale.routes.ts |
| PATCH | `/:id/delivered` | notification.routes.ts |
| POST | `/:id/dislike` | review-reply.routes.ts |
| POST | `/:id/dismiss` | announcement.routes.ts |
| GET | `/:id/display-config` | logo-enhancement.routes.ts |
| PATCH | `/:id/display-config` | logo-enhancement.routes.ts |
| DELETE | `/:id/display-config` | logo-enhancement.routes.ts |
| POST | `/:id/download` | media-asset.routes.ts |
| POST | `/:id/duplicate` | announcement.routes.ts |
| POST | `/:id/duplicate` | collection.routes.ts |
| POST | `/:id/duplicate` | favorite-section.routes.ts |
| POST | `/:id/duplicate` | featured-content.routes.ts |
| POST | `/:id/duplicate` | sale.routes.ts |
| POST | `/:id/feature` | review-reply.routes.ts |
| POST | `/:id/flag` | review-media.routes.ts |
| POST | `/:id/flag` | review-reply.routes.ts |
| POST | `/:id/flag` | review.routes.ts |
| POST | `/:id/helpful` | faq.routes.ts |
| POST | `/:id/helpful` | review-reply.routes.ts |
| POST | `/:id/impression` | favorite-section.routes.ts |
| POST | `/:id/like` | review-reply.routes.ts |
| GET | `/:id/link-config` | logo-enhancement.routes.ts |
| PATCH | `/:id/link-config` | logo-enhancement.routes.ts |
| POST | `/:id/logo` | brand.routes.ts |
| DELETE | `/:id/logo` | brand.routes.ts |
| POST | `/:id/mark-used` | address.routes.ts |
| GET | `/:id/metrics` | announcement.routes.ts |
| PATCH | `/:id/metrics` | new-arrival.routes.ts |
| PATCH | `/:id/move` | media-asset.routes.ts |
| GET | `/:id/navigation` | logo-enhancement.routes.ts |
| PATCH | `/:id/navigation` | logo-enhancement.routes.ts |
| POST | `/:id/new-version` | logo.routes.ts |
| POST | `/:id/not-helpful` | faq.routes.ts |
| POST | `/:id/notify` | new-arrival.routes.ts |
| POST | `/:id/optimize` | media-asset.routes.ts |
| POST | `/:id/optimize` | review-media.routes.ts |
| POST | `/:id/optimize` | upload.routes.ts |
| POST | `/:id/pause` | announcement.routes.ts |
| PATCH | `/:id/pause` | deal.routes.ts |
| GET | `/:id/performance` | logo-enhancement.routes.ts |
| PATCH | `/:id/performance` | logo-enhancement.routes.ts |
| DELETE | `/:id/performance` | logo-enhancement.routes.ts |
| PATCH | `/:id/performance/caching` | logo-enhancement.routes.ts |
| POST | `/:id/performance/lazy-loading/disable` | logo-enhancement.routes.ts |
| POST | `/:id/performance/lazy-loading/enable` | logo-enhancement.routes.ts |
| PATCH | `/:id/performance/optimization` | logo-enhancement.routes.ts |
| POST | `/:id/performance/preconnect` | logo-enhancement.routes.ts |
| DELETE | `/:id/performance/preconnect/:origin` | logo-enhancement.routes.ts |
| PATCH | `/:id/performance/priority` | logo-enhancement.routes.ts |
| GET | `/:id/performance/recommendations` | logo-enhancement.routes.ts |
| POST | `/:id/pin` | review-reply.routes.ts |
| PATCH | `/:id/position` | featured-content.routes.ts |
| GET | `/:id/products` | brand.routes.ts |
| GET | `/:id/products` | collection.routes.ts |
| POST | `/:id/products` | collection.routes.ts |
| DELETE | `/:id/products` | collection.routes.ts |
| POST | `/:id/products` | productComparison.routes.ts |
| DELETE | `/:id/products/:productId` | productComparison.routes.ts |
| PATCH | `/:id/products/reorder` | collection.routes.ts |
| PATCH | `/:id/publish` | favorite-section.routes.ts |
| POST | `/:id/publish` | sale.routes.ts |
| POST | `/:id/react` | review-reply.routes.ts |
| PATCH | `/:id/read` | notification.routes.ts |
| POST | `/:id/refresh` | collection.routes.ts |
| POST | `/:id/refund` | giftcard.routes.ts |
| POST | `/:id/reject` | review-media.routes.ts |
| POST | `/:id/reject` | review-reply.routes.ts |
| PATCH | `/:id/reject` | review.routes.ts |
| GET | `/:id/related` | product.routes.ts |
| POST | `/:id/reorder` | featured-content.routes.ts |
| POST | `/:id/report` | review-reply.routes.ts |
| POST | `/:id/resize` | upload.routes.ts |
| POST | `/:id/response` | review.routes.ts |
| DELETE | `/:id/response` | review.routes.ts |
| GET | `/:id/responsive` | logo-enhancement.routes.ts |
| PATCH | `/:id/responsive` | logo-enhancement.routes.ts |
| PATCH | `/:id/responsive/desktop` | logo-enhancement.routes.ts |
| PATCH | `/:id/responsive/mobile` | logo-enhancement.routes.ts |
| PATCH | `/:id/responsive/tablet` | logo-enhancement.routes.ts |
| PATCH | `/:id/restore` | media-asset.routes.ts |
| POST | `/:id/restore/:versionId` | logo.routes.ts |
| POST | `/:id/resume` | announcement.routes.ts |
| POST | `/:id/retry` | notification.routes.ts |
| POST | `/:id/schedule` | featured-content.routes.ts |
| PUT | `/:id/seo` | brand.routes.ts |
| PATCH | `/:id/set-default` | address.routes.ts |
| POST | `/:id/set-primary` | logo.routes.ts |
| POST | `/:id/share` | coupon.routes.ts |
| POST | `/:id/share` | productComparison.routes.ts |
| POST | `/:id/signed-url` | upload.routes.ts |
| GET | `/:id/similar` | brand.routes.ts |
| POST | `/:id/spam` | review-reply.routes.ts |
| GET | `/:id/statistics` | brand.routes.ts |
| GET | `/:id/statistics` | deal.routes.ts |
| GET | `/:id/stats` | collection.routes.ts |
| GET | `/:id/stats` | featured-content.routes.ts |
| GET | `/:id/styling` | logo-enhancement.routes.ts |
| PATCH | `/:id/styling` | logo-enhancement.routes.ts |
| PATCH | `/:id/styling/hover-effects` | logo-enhancement.routes.ts |
| PATCH | `/:id/styling/scroll-effects` | logo-enhancement.routes.ts |
| POST | `/:id/thumbnail` | upload.routes.ts |
| POST | `/:id/thumbnails` | review-media.routes.ts |
| POST | `/:id/toggle-featured` | sale.routes.ts |
| PATCH | `/:id/toggle-publish` | faq.routes.ts |
| POST | `/:id/track/call` | location.routes.ts |
| POST | `/:id/track/click` | collection.routes.ts |
| POST | `/:id/track/click` | featured-content.routes.ts |
| POST | `/:id/track/click` | location.routes.ts |
| POST | `/:id/track/conversion` | featured-content.routes.ts |
| POST | `/:id/track/directions` | location.routes.ts |
| POST | `/:id/track/impression` | featured-content.routes.ts |
| POST | `/:id/track/view` | collection.routes.ts |
| POST | `/:id/unflag` | review-media.routes.ts |
| POST | `/:id/unhelpful` | review-reply.routes.ts |
| POST | `/:id/unpin` | review-reply.routes.ts |
| POST | `/:id/unpublish` | sale.routes.ts |
| GET | `/:id/usage` | logo.routes.ts |
| POST | `/:id/usage` | media-asset.routes.ts |
| GET | `/:id/usage-stats` | coupon.routes.ts |
| GET | `/:id/variants` | logo.routes.ts |
| POST | `/:id/variants` | logo.routes.ts |
| DELETE | `/:id/variants/:variantName` | logo.routes.ts |
| POST | `/:id/verify` | address.routes.ts |
| GET | `/:id/versions` | logo.routes.ts |
| POST | `/:id/view` | announcement.routes.ts |
| POST | `/:id/vote` | review.routes.ts |
| DELETE | `/:id/vote` | review.routes.ts |
| POST | `/:id/watermark` | review-media.routes.ts |
| DELETE | `/:id/watermark` | review-media.routes.ts |
| GET | `/:identifier` | favorite-section.routes.ts |
| POST | `/:orderId/refund` | payment.routes.ts |
| GET | `/:orderId/status` | payment.routes.ts |
| POST | `/:productId/reviews` | product.routes.ts |
| PATCH | `/:productId/reviews/:reviewId` | product.routes.ts |
| DELETE | `/:productId/reviews/:reviewId` | product.routes.ts |
| POST | `/:searchId/click` | search.routes.ts |
| POST | `/:searchId/selection` | search.routes.ts |
| PATCH | `/:section` | site-config.routes.ts |
| GET | `/:slug` | category.routes.ts |
| GET | `/:slug` | product.routes.ts |
| POST | `/ab-test` | hero-banner.routes.ts |
| GET | `/ab-test/:type/:id` | hero-banner.routes.ts |
| POST | `/ab-test/end` | hero-banner.routes.ts |
| POST | `/activate-scheduled` | sale.routes.ts |
| GET | `/active` | announcement.routes.ts |
| GET | `/active` | sale.routes.ts |
| GET | `/active` | social-link.routes.ts |
| POST | `/add` | wishlist.routes.ts |
| POST | `/add-to-cart` | analytics.routes.ts |
| POST | `/addresses` | user.routes.ts |
| PATCH | `/addresses/:addressId` | user.routes.ts |
| DELETE | `/addresses/:addressId` | user.routes.ts |
| GET | `/admin/:id` | category.routes.ts |
| PATCH | `/admin/:id` | product.routes.ts |
| DELETE | `/admin/:id` | product.routes.ts |
| PATCH | `/admin/:id/status` | order.routes.ts |
| GET | `/admin/all` | address.routes.ts |
| GET | `/admin/all` | category.routes.ts |
| GET | `/admin/all` | faq.routes.ts |
| GET | `/admin/all` | order.routes.ts |
| GET | `/admin/all` | product.routes.ts |
| GET | `/admin/analytics` | address.routes.ts |
| GET | `/admin/analytics` | blog.routes.ts |
| GET | `/admin/analytics` | deal.routes.ts |
| POST | `/admin/bulk-activate` | deal.routes.ts |
| POST | `/admin/bulk-approve` | review.routes.ts |
| POST | `/admin/bulk-delete` | brand.routes.ts |
| DELETE | `/admin/bulk-delete` | category.routes.ts |
| DELETE | `/admin/bulk-delete` | deal.routes.ts |
| DELETE | `/admin/bulk-delete` | order.routes.ts |
| DELETE | `/admin/bulk-delete` | product.routes.ts |
| DELETE | `/admin/bulk-delete` | review.routes.ts |
| POST | `/admin/bulk-pause` | deal.routes.ts |
| PATCH | `/admin/bulk-toggle-featured` | product.routes.ts |
| PATCH | `/admin/bulk-toggle-status` | category.routes.ts |
| PATCH | `/admin/bulk-toggle-status` | product.routes.ts |
| POST | `/admin/bulk-update` | brand.routes.ts |
| PATCH | `/admin/bulk-update-status` | order.routes.ts |
| GET | `/admin/comments/pending` | blog.routes.ts |
| POST | `/admin/create` | category.routes.ts |
| POST | `/admin/create` | product.routes.ts |
| GET | `/admin/departments` | about.routes.ts |
| GET | `/admin/flagged` | review.routes.ts |
| GET | `/admin/overview` | about.routes.ts |
| GET | `/admin/pending` | review.routes.ts |
| GET | `/admin/statistics` | brand.routes.ts |
| GET | `/admin/stats` | faq.routes.ts |
| GET | `/admin/stats` | order.routes.ts |
| GET | `/admin/stats` | product.routes.ts |
| GET | `/admin/stats` | review.routes.ts |
| GET | `/admin/top-performing` | deal.routes.ts |
| POST | `/admin/update-scheduled` | blog.routes.ts |
| GET | `/admin/validate` | brand.routes.ts |
| POST | `/admin/verify-bulk` | address.routes.ts |
| GET | `/alerts` | inventory.routes.ts |
| PATCH | `/alerts/:id/acknowledge` | inventory.routes.ts |
| POST | `/alerts/bulk-acknowledge` | inventory.routes.ts |
| GET | `/analytics` | cart.routes.ts |
| GET | `/analytics` | cms.routes.ts |
| GET | `/analytics` | collection.routes.ts |
| GET | `/analytics` | coupon.routes.ts |
| GET | `/analytics` | featured-content.routes.ts |
| GET | `/analytics` | giftcard.routes.ts |
| GET | `/analytics` | hero-banner.routes.ts |
| GET | `/analytics` | location.routes.ts |
| GET | `/analytics` | media-asset.routes.ts |
| GET | `/analytics` | seo.routes.ts |
| GET | `/analytics` | upload.routes.ts |
| GET | `/analytics` | wishlist.routes.ts |
| GET | `/analytics/channels` | notification.routes.ts |
| GET | `/analytics/delivery-rate` | notification.routes.ts |
| GET | `/analytics/engagement` | notification.routes.ts |
| GET | `/analytics/overview` | bestseller.routes.ts |
| GET | `/analytics/overview` | favorite-section.routes.ts |
| GET | `/analytics/overview` | new-arrival.routes.ts |
| GET | `/analytics/overview` | review-media.routes.ts |
| GET | `/analytics/overview` | review-reply.routes.ts |
| GET | `/analytics/overview` | search.routes.ts |
| GET | `/analytics/overview` | social-link.routes.ts |
| GET | `/analytics/stats` | review-media.routes.ts |
| GET | `/analytics/zero-results` | search.routes.ts |
| POST | `/apply` | coupon.routes.ts |
| GET | `/audits` | seo.routes.ts |
| POST | `/audits` | seo.routes.ts |
| GET | `/audits/:id` | seo.routes.ts |
| DELETE | `/audits/:id` | seo.routes.ts |
| GET | `/audits/:id/export` | seo.routes.ts |
| POST | `/audits/bulk` | seo.routes.ts |
| GET | `/authors/:authorId/posts` | blog.routes.ts |
| GET | `/awards` | about.routes.ts |
| POST | `/awards` | about.routes.ts |
| GET | `/awards/:id` | about.routes.ts |
| PUT | `/awards/:id` | about.routes.ts |
| DELETE | `/awards/:id` | about.routes.ts |
| GET | `/balance/:code` | giftcard.routes.ts |
| GET | `/banner-groups` | hero-banner.routes.ts |
| GET | `/banner-groups/:id` | hero-banner.routes.ts |
| PATCH | `/banner-groups/:id/activate` | hero-banner.routes.ts |
| PATCH | `/banner-groups/:id/deactivate` | hero-banner.routes.ts |
| GET | `/banners` | hero-banner.routes.ts |
| GET | `/banners/:id` | hero-banner.routes.ts |
| PATCH | `/banners/:id/activate` | hero-banner.routes.ts |
| POST | `/banners/:id/click` | hero-banner.routes.ts |
| PATCH | `/banners/:id/deactivate` | hero-banner.routes.ts |
| POST | `/banners/:id/duplicate` | hero-banner.routes.ts |
| POST | `/banners/:id/impression` | hero-banner.routes.ts |
| POST | `/banners/:id/schedule` | hero-banner.routes.ts |
| POST | `/banners/bulk-delete` | hero-banner.routes.ts |
| POST | `/banners/bulk-update` | hero-banner.routes.ts |
| PATCH | `/banners/order` | hero-banner.routes.ts |
| GET | `/banners/page/:page` | hero-banner.routes.ts |
| GET | `/banners/page/:page/location/:location` | hero-banner.routes.ts |
| POST | `/batch-track` | analytics.routes.ts |
| GET | `/brand/:brandId` | bestseller.routes.ts |
| GET | `/brand/:brandId` | new-arrival.routes.ts |
| POST | `/bulk` | address.routes.ts |
| DELETE | `/bulk` | address.routes.ts |
| POST | `/bulk` | notification.routes.ts |
| DELETE | `/bulk-delete` | bestseller.routes.ts |
| POST | `/bulk-delete` | collection.routes.ts |
| POST | `/bulk-delete` | coupon.routes.ts |
| DELETE | `/bulk-delete` | faq.routes.ts |
| DELETE | `/bulk-delete` | favorite-section.routes.ts |
| POST | `/bulk-delete` | location.routes.ts |
| POST | `/bulk-delete` | logo.routes.ts |
| DELETE | `/bulk-delete` | new-arrival.routes.ts |
| POST | `/bulk-delete` | productComparison.routes.ts |
| DELETE | `/bulk-delete` | review-media.routes.ts |
| DELETE | `/bulk-delete` | social-link.routes.ts |
| POST | `/bulk-delete` | upload.routes.ts |
| POST | `/bulk-moderate` | review-media.routes.ts |
| POST | `/bulk-move` | upload.routes.ts |
| POST | `/bulk-optimize` | review-media.routes.ts |
| POST | `/bulk-status` | announcement.routes.ts |
| PATCH | `/bulk-toggle-active` | coupon.routes.ts |
| PATCH | `/bulk-update` | bestseller.routes.ts |
| POST | `/bulk-update` | collection.routes.ts |
| PATCH | `/bulk-update` | faq.routes.ts |
| PATCH | `/bulk-update` | favorite-section.routes.ts |
| POST | `/bulk-update` | featured-content.routes.ts |
| POST | `/bulk-update` | location.routes.ts |
| POST | `/bulk-update` | logo.routes.ts |
| PATCH | `/bulk-update` | new-arrival.routes.ts |
| PATCH | `/bulk-update` | social-link.routes.ts |
| POST | `/bulk-update` | upload.routes.ts |
| POST | `/bulk/add` | wishlist.routes.ts |
| POST | `/bulk/adjust-stock` | inventory.routes.ts |
| DELETE | `/bulk/delete` | media-asset.routes.ts |
| POST | `/bulk/move-to-cart` | wishlist.routes.ts |
| DELETE | `/bulk/remove` | wishlist.routes.ts |
| POST | `/bulk/update` | inventory.routes.ts |
| PATCH | `/bulk/update` | media-asset.routes.ts |
| GET | `/by-location` | address.routes.ts |
| POST | `/calculate-discount` | deal.routes.ts |
| POST | `/calculate-rates` | shipping.routes.ts |
| GET | `/categories` | admin.routes.ts |
| GET | `/categories` | blog.routes.ts |
| POST | `/categories` | blog.routes.ts |
| GET | `/categories` | faq.routes.ts |
| GET | `/categories/:categoryId/posts` | blog.routes.ts |
| GET | `/categories/:id` | admin.routes.ts |
| GET | `/categories/:id` | blog.routes.ts |
| PATCH | `/categories/:id` | blog.routes.ts |
| DELETE | `/categories/:id` | blog.routes.ts |
| DELETE | `/categories/:id/image` | admin.routes.ts |
| GET | `/category-analytics` | analytics.routes.ts |
| GET | `/category/:category` | faq.routes.ts |
| GET | `/category/:category` | settings.routes.ts |
| PATCH | `/category/:category` | settings.routes.ts |
| GET | `/category/:categoryId` | bestseller.routes.ts |
| GET | `/category/:categoryId` | new-arrival.routes.ts |
| GET | `/check-eligibility/:productId` | deal.routes.ts |
| GET | `/check/:productId` | wishlist.routes.ts |
| DELETE | `/cleanup` | analytics.routes.ts |
| POST | `/cleanup` | announcement.routes.ts |
| POST | `/cleanup` | newsletter.routes.ts |
| POST | `/cleanup` | notification.routes.ts |
| POST | `/cleanup` | productComparison.routes.ts |
| POST | `/cleanup` | sale.routes.ts |
| POST | `/cleanup` | search.routes.ts |
| DELETE | `/clear` | cart.routes.ts |
| DELETE | `/clear` | wishlist.routes.ts |
| GET | `/code/:code` | coupon.routes.ts |
| PATCH | `/comments/:id` | blog.routes.ts |
| DELETE | `/comments/:id` | blog.routes.ts |
| PATCH | `/comments/:id/approve` | blog.routes.ts |
| POST | `/comments/:id/flag` | blog.routes.ts |
| POST | `/comments/:id/like` | blog.routes.ts |
| GET | `/company` | about.routes.ts |
| PUT | `/company` | about.routes.ts |
| GET | `/config` | upload.routes.ts |
| PATCH | `/config` | upload.routes.ts |
| GET | `/conversion-funnel` | analytics.routes.ts |
| GET | `/count` | wishlist.routes.ts |
| POST | `/coupons` | cart.routes.ts |
| DELETE | `/coupons/:couponId` | cart.routes.ts |
| POST | `/coupons/validate` | cart.routes.ts |
| GET | `/dashboard` | analytics.routes.ts |
| GET | `/dashboard/stats` | admin.routes.ts |
| GET | `/default` | address.routes.ts |
| DELETE | `/delete-me` | user.routes.ts |
| GET | `/designs` | giftcard.routes.ts |
| POST | `/events` | analytics.routes.ts |
| POST | `/expire-old` | new-arrival.routes.ts |
| GET | `/export` | analytics.routes.ts |
| GET | `/export` | newsletter.routes.ts |
| GET | `/export` | settings.routes.ts |
| GET | `/export` | social-link.routes.ts |
| POST | `/export` | wishlist.routes.ts |
| POST | `/facebook` | auth.routes.ts |
| GET | `/featured` | bestseller.routes.ts |
| GET | `/featured` | brand.routes.ts |
| GET | `/featured` | new-arrival.routes.ts |
| GET | `/featured` | product.routes.ts |
| GET | `/featured` | sale.routes.ts |
| GET | `/flash-sales` | deal.routes.ts |
| GET | `/folders` | media-asset.routes.ts |
| GET | `/folders` | upload.routes.ts |
| POST | `/folders` | upload.routes.ts |
| PATCH | `/folders/:id` | upload.routes.ts |
| DELETE | `/folders/:id` | upload.routes.ts |
| POST | `/forgot-password` | auth.routes.ts |
| POST | `/from-url` | upload.routes.ts |
| POST | `/google` | auth.routes.ts |
| GET | `/group-by-city` | address.routes.ts |
| GET | `/hero-sections` | hero-banner.routes.ts |
| GET | `/hero-sections/:id` | hero-banner.routes.ts |
| PATCH | `/hero-sections/:id/activate` | hero-banner.routes.ts |
| POST | `/hero-sections/:id/click` | hero-banner.routes.ts |
| PATCH | `/hero-sections/:id/deactivate` | hero-banner.routes.ts |
| POST | `/hero-sections/:id/duplicate` | hero-banner.routes.ts |
| POST | `/hero-sections/:id/impression` | hero-banner.routes.ts |
| POST | `/hero-sections/:id/schedule` | hero-banner.routes.ts |
| GET | `/hero-sections/page/:page` | hero-banner.routes.ts |
| GET | `/history` | about.routes.ts |
| POST | `/history` | about.routes.ts |
| GET | `/history/:id` | about.routes.ts |
| PUT | `/history/:id` | about.routes.ts |
| DELETE | `/history/:id` | about.routes.ts |
| GET | `/id/:id` | product.routes.ts |
| POST | `/import` | settings.routes.ts |
| POST | `/import` | wishlist.routes.ts |
| POST | `/initialize` | settings.routes.ts |
| POST | `/items` | cart.routes.ts |
| GET | `/items` | inventory.routes.ts |
| POST | `/items` | inventory.routes.ts |
| GET | `/items/:id` | inventory.routes.ts |
| PATCH | `/items/:id` | inventory.routes.ts |
| DELETE | `/items/:id` | inventory.routes.ts |
| POST | `/items/:id/adjust-stock` | inventory.routes.ts |
| POST | `/items/:id/release-reserved` | inventory.routes.ts |
| POST | `/items/:id/reserve-stock` | inventory.routes.ts |
| PUT | `/items/:itemId` | cart.routes.ts |
| DELETE | `/items/:itemId` | cart.routes.ts |
| POST | `/items/:itemId/decrease` | cart.routes.ts |
| POST | `/items/:itemId/increase` | cart.routes.ts |
| POST | `/items/:itemId/move-to-cart` | wishlist.routes.ts |
| POST | `/items/:itemId/move-to-wishlist` | cart.routes.ts |
| PUT | `/items/:itemId/quantity` | cart.routes.ts |
| GET | `/items/:itemId/similar` | wishlist.routes.ts |
| POST | `/items/bulk/add` | cart.routes.ts |
| DELETE | `/items/bulk/remove` | cart.routes.ts |
| PUT | `/items/bulk/update` | cart.routes.ts |
| POST | `/items/from-wishlist/:wishlistItemId` | cart.routes.ts |
| GET | `/items/product/:productId` | inventory.routes.ts |
| GET | `/items/sku/:sku` | inventory.routes.ts |
| GET | `/location/:location` | social-link.routes.ts |
| GET | `/locations` | about.routes.ts |
| POST | `/locations` | about.routes.ts |
| GET | `/locations/:id` | about.routes.ts |
| PUT | `/locations/:id` | about.routes.ts |
| DELETE | `/locations/:id` | about.routes.ts |
| POST | `/login` | auth.routes.ts |
| POST | `/logout` | auth.routes.ts |
| GET | `/maintenance` | site-config.routes.ts |
| PATCH | `/maintenance/toggle` | site-config.routes.ts |
| GET | `/market-share` | brand.routes.ts |
| GET | `/me` | user.routes.ts |
| DELETE | `/media/:publicId` | cms.routes.ts |
| GET | `/media/library` | cms.routes.ts |
| POST | `/media/optimize` | cms.routes.ts |
| POST | `/media/upload` | cms.routes.ts |
| GET | `/menus` | cms.routes.ts |
| GET | `/menus/:id` | cms.routes.ts |
| GET | `/menus/location/:location` | cms.routes.ts |
| GET | `/meta-tags` | seo.routes.ts |
| POST | `/meta-tags` | seo.routes.ts |
| GET | `/meta-tags/:id` | seo.routes.ts |
| PATCH | `/meta-tags/:id` | seo.routes.ts |
| DELETE | `/meta-tags/:id` | seo.routes.ts |
| POST | `/meta-tags/bulk-create` | seo.routes.ts |
| GET | `/methods` | shipping.routes.ts |
| GET | `/methods/:id` | shipping.routes.ts |
| POST | `/methods/:methodId/calculate-rate` | shipping.routes.ts |
| GET | `/moderation/queue` | review-media.routes.ts |
| GET | `/moderation/queue` | review-reply.routes.ts |
| GET | `/most-used` | address.routes.ts |
| GET | `/movements` | inventory.routes.ts |
| GET | `/movements/:id` | inventory.routes.ts |
| POST | `/multiple` | upload.routes.ts |
| GET | `/my/orders` | order.routes.ts |
| GET | `/my/reviews` | review.routes.ts |
| GET | `/nearby` | location.routes.ts |
| GET | `/orders` | admin.routes.ts |
| PATCH | `/orders/:id/status` | admin.routes.ts |
| GET | `/orders/stats` | admin.routes.ts |
| POST | `/page-view` | analytics.routes.ts |
| GET | `/page/:page` | announcement.routes.ts |
| GET | `/pages` | cms.routes.ts |
| GET | `/pages` | seo.routes.ts |
| POST | `/pages` | seo.routes.ts |
| GET | `/pages/:id` | cms.routes.ts |
| GET | `/pages/:id` | seo.routes.ts |
| PATCH | `/pages/:id` | seo.routes.ts |
| DELETE | `/pages/:id` | seo.routes.ts |
| POST | `/pages/:id/duplicate` | cms.routes.ts |
| PATCH | `/pages/:id/publish` | cms.routes.ts |
| GET | `/pages/:id/seo-preview` | cms.routes.ts |
| PATCH | `/pages/:id/unpublish` | cms.routes.ts |
| GET | `/pages/:id/versions` | cms.routes.ts |
| POST | `/pages/:id/versions/:versionId/restore` | cms.routes.ts |
| POST | `/pages/bulk-delete` | cms.routes.ts |
| POST | `/pages/bulk-update` | cms.routes.ts |
| PATCH | `/pages/bulk-update` | seo.routes.ts |
| GET | `/pages/by-page/:pageId` | seo.routes.ts |
| POST | `/pages/generate/:pageId` | seo.routes.ts |
| GET | `/pages/slug/:slug` | cms.routes.ts |
| GET | `/payment` | site-config.routes.ts |
| PATCH | `/payment/update` | site-config.routes.ts |
| GET | `/performance` | brand.routes.ts |
| GET | `/placement/:page` | favorite-section.routes.ts |
| GET | `/placement/:placement` | featured-content.routes.ts |
| GET | `/platform/:platform` | social-link.routes.ts |
| GET | `/popular` | productComparison.routes.ts |
| GET | `/popular` | search.routes.ts |
| GET | `/popular` | social-link.routes.ts |
| GET | `/popular/most-helpful` | faq.routes.ts |
| GET | `/popular/most-viewed` | faq.routes.ts |
| GET | `/posts` | blog.routes.ts |
| POST | `/posts` | blog.routes.ts |
| PATCH | `/posts/:id` | blog.routes.ts |
| DELETE | `/posts/:id` | blog.routes.ts |
| PATCH | `/posts/:id/archive` | blog.routes.ts |
| POST | `/posts/:id/like` | blog.routes.ts |
| PATCH | `/posts/:id/publish` | blog.routes.ts |
| GET | `/posts/:id/related` | blog.routes.ts |
| POST | `/posts/:id/share` | blog.routes.ts |
| GET | `/posts/:postId/comments` | blog.routes.ts |
| POST | `/posts/:postId/comments` | blog.routes.ts |
| GET | `/posts/:slug` | blog.routes.ts |
| GET | `/posts/featured` | blog.routes.ts |
| GET | `/posts/popular` | blog.routes.ts |
| GET | `/posts/search/:query` | blog.routes.ts |
| PATCH | `/preferences/:token` | newsletter.routes.ts |
| POST | `/preferences/fcm-token` | notification.routes.ts |
| DELETE | `/preferences/fcm-token` | notification.routes.ts |
| GET | `/preferences/me` | notification.routes.ts |
| PUT | `/preferences/me` | notification.routes.ts |
| POST | `/preferences/reset` | notification.routes.ts |
| GET | `/priority` | new-arrival.routes.ts |
| POST | `/process-pending` | notification.routes.ts |
| POST | `/process-scheduled` | notification.routes.ts |
| GET | `/product-performance` | analytics.routes.ts |
| POST | `/product-view` | analytics.routes.ts |
| GET | `/product/:productId` | sale.routes.ts |
| GET | `/products` | admin.routes.ts |
| GET | `/products/:id` | admin.routes.ts |
| DELETE | `/products/:id/images/:imageIndex` | admin.routes.ts |
| DELETE | `/products/:id/variants/:variantIndex/images/:imageIndex` | admin.routes.ts |
| GET | `/products/:productId` | review.routes.ts |
| POST | `/products/:productId` | review.routes.ts |
| GET | `/products/:productId/distribution` | review.routes.ts |
| GET | `/products/:productId/top` | review.routes.ts |
| GET | `/products/popular` | productComparison.routes.ts |
| GET | `/products/stats` | admin.routes.ts |
| GET | `/public` | productComparison.routes.ts |
| GET | `/public` | site-config.routes.ts |
| GET | `/public/by-type/:type` | logo.routes.ts |
| GET | `/public/primary` | logo.routes.ts |
| GET | `/public/type/:type` | logo.routes.ts |
| POST | `/purchase` | analytics.routes.ts |
| POST | `/purchase` | giftcard.routes.ts |
| GET | `/queries` | search.routes.ts |
| GET | `/queries/:id` | search.routes.ts |
| DELETE | `/queries/:id` | search.routes.ts |
| POST | `/quick-add` | cart.routes.ts |
| POST | `/razorpay/create-order` | payment.routes.ts |
| POST | `/razorpay/verify` | payment.routes.ts |
| POST | `/razorpay/webhook` | payment.routes.ts |
| PATCH | `/read-all` | notification.routes.ts |
| GET | `/realtime` | analytics.routes.ts |
| GET | `/recent` | upload.routes.ts |
| GET | `/recommendations` | cart.routes.ts |
| GET | `/recommendations` | wishlist.routes.ts |
| POST | `/redeem` | giftcard.routes.ts |
| GET | `/redirect-rules` | seo.routes.ts |
| POST | `/redirect-rules` | seo.routes.ts |
| GET | `/redirect-rules/:id` | seo.routes.ts |
| PATCH | `/redirect-rules/:id` | seo.routes.ts |
| DELETE | `/redirect-rules/:id` | seo.routes.ts |
| POST | `/redirect-rules/:id/test` | seo.routes.ts |
| POST | `/redirect-rules/bulk-create` | seo.routes.ts |
| POST | `/redirect-rules/import` | seo.routes.ts |
| POST | `/referral/generate` | coupon.routes.ts |
| POST | `/refresh-all` | collection.routes.ts |
| GET | `/regions` | location.routes.ts |
| POST | `/regions` | location.routes.ts |
| GET | `/regions/:id` | location.routes.ts |
| PATCH | `/regions/:id` | location.routes.ts |
| DELETE | `/regions/:id` | location.routes.ts |
| GET | `/regions/analytics` | location.routes.ts |
| GET | `/regions/slug/:slug` | location.routes.ts |
| POST | `/register` | auth.routes.ts |
| GET | `/related/:query` | search.routes.ts |
| DELETE | `/remove/:itemId` | wishlist.routes.ts |
| DELETE | `/remove/:orderId` | coupon.routes.ts |
| PATCH | `/reorder` | faq.routes.ts |
| PATCH | `/reorder` | favorite-section.routes.ts |
| PATCH | `/reorder` | social-link.routes.ts |
| POST | `/reports` | analytics.routes.ts |
| GET | `/reports/:id` | analytics.routes.ts |
| POST | `/reports/generate` | inventory.routes.ts |
| POST | `/reset-analytics/:id` | social-link.routes.ts |
| POST | `/reset-password` | auth.routes.ts |
| GET | `/revenue-analytics` | analytics.routes.ts |
| GET | `/review/:reviewId` | review-reply.routes.ts |
| GET | `/robots` | cms.routes.ts |
| GET | `/robots` | seo.routes.ts |
| PATCH | `/robots` | seo.routes.ts |
| POST | `/robots/test` | seo.routes.ts |
| POST | `/robots/validate` | seo.routes.ts |
| POST | `/save` | cart.routes.ts |
| GET | `/saved` | cart.routes.ts |
| DELETE | `/saved/:id` | cart.routes.ts |
| POST | `/saved/:id/restore` | cart.routes.ts |
| POST | `/schedule` | notification.routes.ts |
| GET | `/scheduled` | announcement.routes.ts |
| GET | `/schema-markups` | seo.routes.ts |
| POST | `/schema-markups` | seo.routes.ts |
| GET | `/schema-markups/:id` | seo.routes.ts |
| PATCH | `/schema-markups/:id` | seo.routes.ts |
| DELETE | `/schema-markups/:id` | seo.routes.ts |
| POST | `/schema-markups/:id/validate` | seo.routes.ts |
| POST | `/schema-markups/generate` | seo.routes.ts |
| GET | `/search` | address.routes.ts |
| POST | `/search` | analytics.routes.ts |
| GET | `/search` | brand.routes.ts |
| GET | `/search` | faq.routes.ts |
| GET | `/search` | review-reply.routes.ts |
| GET | `/search` | upload.routes.ts |
| GET | `/search` | wishlist.routes.ts |
| GET | `/search-analytics` | analytics.routes.ts |
| POST | `/send` | notification.routes.ts |
| POST | `/send-multiple` | notification.routes.ts |
| POST | `/send-notification` | notification.routes.ts |
| GET | `/seo` | site-config.routes.ts |
| PATCH | `/seo/update` | site-config.routes.ts |
| GET | `/session-analytics` | analytics.routes.ts |
| GET | `/settings` | analytics.routes.ts |
| PUT | `/settings` | analytics.routes.ts |
| GET | `/settings` | cms.routes.ts |
| PATCH | `/settings` | cms.routes.ts |
| GET | `/settings` | seo.routes.ts |
| PATCH | `/settings` | seo.routes.ts |
| POST | `/share` | wishlist.routes.ts |
| GET | `/shared/:shareCode` | wishlist.routes.ts |
| GET | `/shared/:token` | productComparison.routes.ts |
| GET | `/sitemap` | brand.routes.ts |
| GET | `/sitemap` | cms.routes.ts |
| GET | `/sitemaps` | seo.routes.ts |
| GET | `/sitemaps/:id` | seo.routes.ts |
| PATCH | `/sitemaps/:id` | seo.routes.ts |
| DELETE | `/sitemaps/:id` | seo.routes.ts |
| GET | `/sitemaps/:id/download` | seo.routes.ts |
| POST | `/sitemaps/:id/submit` | seo.routes.ts |
| POST | `/sitemaps/:id/validate` | seo.routes.ts |
| POST | `/sitemaps/generate` | seo.routes.ts |
| GET | `/slug/:slug` | brand.routes.ts |
| GET | `/slug/:slug` | collection.routes.ts |
| GET | `/slug/:slug` | location.routes.ts |
| GET | `/slug/:slug` | media-asset.routes.ts |
| GET | `/slug/:slug` | sale.routes.ts |
| GET | `/social` | site-config.routes.ts |
| PATCH | `/social/update` | site-config.routes.ts |
| GET | `/statistics` | inventory.routes.ts |
| GET | `/statistics` | upload.routes.ts |
| GET | `/stats` | about.routes.ts |
| PUT | `/stats` | about.routes.ts |
| GET | `/stats` | address.routes.ts |
| GET | `/stats` | newsletter.routes.ts |
| GET | `/stats` | shipping.routes.ts |
| GET | `/stats/overview` | announcement.routes.ts |
| GET | `/stats/overview` | logo.routes.ts |
| GET | `/stats/overview` | notification.routes.ts |
| GET | `/stats/overview` | productComparison.routes.ts |
| GET | `/stats/overview` | sale.routes.ts |
| GET | `/status/:email` | newsletter.routes.ts |
| POST | `/stock/transfer` | inventory.routes.ts |
| GET | `/storage-usage` | upload.routes.ts |
| POST | `/subscribe` | newsletter.routes.ts |
| POST | `/subscribe` | notification.routes.ts |
| GET | `/subscribers` | newsletter.routes.ts |
| GET | `/subscribers/:id` | newsletter.routes.ts |
| PATCH | `/subscribers/:id` | newsletter.routes.ts |
| DELETE | `/subscribers/:id` | newsletter.routes.ts |
| POST | `/subscribers/:id/tags` | newsletter.routes.ts |
| DELETE | `/subscribers/:id/tags` | newsletter.routes.ts |
| GET | `/subscribers/active` | newsletter.routes.ts |
| DELETE | `/subscribers/bulk-delete` | newsletter.routes.ts |
| POST | `/subscribers/bulk-import` | newsletter.routes.ts |
| PATCH | `/subscribers/bulk-update` | newsletter.routes.ts |
| GET | `/subscribers/tags/:tags` | newsletter.routes.ts |
| GET | `/suggestions` | address.routes.ts |
| GET | `/suggestions` | brand.routes.ts |
| GET | `/suggestions` | search.routes.ts |
| POST | `/sync` | bestseller.routes.ts |
| POST | `/sync-guest` | cart.routes.ts |
| GET | `/system-analytics` | analytics.routes.ts |
| POST | `/system/update-statuses` | deal.routes.ts |
| GET | `/tags` | blog.routes.ts |
| GET | `/tags/:tag/posts` | blog.routes.ts |
| GET | `/tags/:tags` | faq.routes.ts |
| GET | `/team` | about.routes.ts |
| POST | `/team` | about.routes.ts |
| GET | `/team/:id` | about.routes.ts |
| PUT | `/team/:id` | about.routes.ts |
| DELETE | `/team/:id` | about.routes.ts |
| POST | `/team/:id/image` | about.routes.ts |
| GET | `/team/featured` | about.routes.ts |
| GET | `/templates` | cms.routes.ts |
| GET | `/templates` | giftcard.routes.ts |
| POST | `/templates` | notification.routes.ts |
| GET | `/templates/:id` | cms.routes.ts |
| GET | `/templates/:id` | notification.routes.ts |
| PUT | `/templates/:id` | notification.routes.ts |
| DELETE | `/templates/:id` | notification.routes.ts |
| POST | `/templates/:id/clone` | notification.routes.ts |
| POST | `/templates/:id/duplicate` | cms.routes.ts |
| POST | `/templates/:id/increment-usage` | cms.routes.ts |
| PATCH | `/templates/:id/toggle` | notification.routes.ts |
| GET | `/templates/all` | notification.routes.ts |
| POST | `/test-upload` | test.routes.ts |
| GET | `/theme` | site-config.routes.ts |
| PATCH | `/theme/update` | site-config.routes.ts |
| GET | `/thread/:threadId` | review-reply.routes.ts |
| POST | `/tickets` | support.routes.ts |
| GET | `/tickets/:id` | support.routes.ts |
| PATCH | `/tickets/:id` | support.routes.ts |
| DELETE | `/tickets/:id` | support.routes.ts |
| PATCH | `/tickets/:id/assign` | support.routes.ts |
| POST | `/tickets/:id/close` | support.routes.ts |
| POST | `/tickets/:id/internal-note` | support.routes.ts |
| POST | `/tickets/:id/messages` | support.routes.ts |
| PATCH | `/tickets/:id/priority` | support.routes.ts |
| POST | `/tickets/:id/rate` | support.routes.ts |
| POST | `/tickets/:id/reopen` | support.routes.ts |
| POST | `/tickets/:id/resolve` | support.routes.ts |
| PATCH | `/tickets/:id/status` | support.routes.ts |
| GET | `/tickets/admin/all` | support.routes.ts |
| GET | `/tickets/admin/assigned` | support.routes.ts |
| PATCH | `/tickets/admin/bulk-assign` | support.routes.ts |
| PATCH | `/tickets/admin/bulk-status` | support.routes.ts |
| GET | `/tickets/admin/overdue` | support.routes.ts |
| GET | `/tickets/admin/priority/:priority` | support.routes.ts |
| GET | `/tickets/admin/stats` | support.routes.ts |
| GET | `/tickets/admin/status/:status` | support.routes.ts |
| GET | `/tickets/my-tickets` | support.routes.ts |
| POST | `/toggle` | wishlist.routes.ts |
| GET | `/top` | review-reply.routes.ts |
| POST | `/topic` | notification.routes.ts |
| POST | `/track` | analytics.routes.ts |
| GET | `/track` | order.routes.ts |
| POST | `/track/:id` | social-link.routes.ts |
| GET | `/trending` | new-arrival.routes.ts |
| GET | `/trending` | search.routes.ts |
| GET | `/trends` | bestseller.routes.ts |
| GET | `/trends` | productComparison.routes.ts |
| GET | `/turnover-analysis` | inventory.routes.ts |
| GET | `/type/:type` | sale.routes.ts |
| GET | `/unread-count` | notification.routes.ts |
| POST | `/unsubscribe` | notification.routes.ts |
| POST | `/unsubscribe/:token` | newsletter.routes.ts |
| GET | `/unused` | media-asset.routes.ts |
| GET | `/upcoming` | deal.routes.ts |
| GET | `/upcoming` | new-arrival.routes.ts |
| GET | `/upcoming` | sale.routes.ts |
| PATCH | `/update-me` | user.routes.ts |
| PATCH | `/update-order` | new-arrival.routes.ts |
| PATCH | `/update-password` | auth.routes.ts |
| PATCH | `/update-ranks` | bestseller.routes.ts |
| GET | `/user-behavior` | analytics.routes.ts |
| GET | `/user-journey` | analytics.routes.ts |
| GET | `/user/:userId` | coupon.routes.ts |
| GET | `/user/:userId` | giftcard.routes.ts |
| GET | `/users` | admin.routes.ts |
| GET | `/users/:id` | admin.routes.ts |
| POST | `/users/bulk/delete` | admin.routes.ts |
| PATCH | `/users/bulk/status` | admin.routes.ts |
| GET | `/users/stats` | admin.routes.ts |
| POST | `/validate` | address.routes.ts |
| POST | `/validate` | cart.routes.ts |
| POST | `/validate` | coupon.routes.ts |
| POST | `/validate` | giftcard.routes.ts |
| POST | `/validate` | upload.routes.ts |
| POST | `/validate-rules` | collection.routes.ts |
| POST | `/verify-all` | social-link.routes.ts |
| GET | `/verify-email/:token` | auth.routes.ts |
| POST | `/verify-payment` | giftcard.routes.ts |
| POST | `/verify/:id` | social-link.routes.ts |
| GET | `/verify/:token` | newsletter.routes.ts |
| GET | `/warehouses` | inventory.routes.ts |
| POST | `/warehouses` | inventory.routes.ts |
| GET | `/warehouses/:id` | inventory.routes.ts |
| PATCH | `/warehouses/:id` | inventory.routes.ts |
| DELETE | `/warehouses/:id` | inventory.routes.ts |
| GET | `/widgets` | cms.routes.ts |
| GET | `/widgets/:id` | cms.routes.ts |
| POST | `/widgets/:id/click` | cms.routes.ts |
| POST | `/widgets/:id/impression` | cms.routes.ts |
| GET | `/widgets/page/:pageSlug` | cms.routes.ts |
| GET | `/wishlist` | user.routes.ts |
| POST | `/wishlist/:productId` | user.routes.ts |
| DELETE | `/wishlist/:productId` | user.routes.ts |
| GET | `/zones` | shipping.routes.ts |
| GET | `/zones/:id` | shipping.routes.ts |
| GET | `/zones/:zoneId/methods` | shipping.routes.ts |

## Endpoints by Base Path

### /:id (255 endpoints)

- **GET** `/:id` (address.routes.ts)
- **GET** `/:id` (announcement.routes.ts)
- **GET** `/:id` (bestseller.routes.ts)
- **PATCH** `/:id` (bestseller.routes.ts)
- **DELETE** `/:id` (bestseller.routes.ts)
- **GET** `/:id` (brand.routes.ts)
- **PUT** `/:id` (brand.routes.ts)
- **DELETE** `/:id` (brand.routes.ts)
- **GET** `/:id` (collection.routes.ts)
- **PATCH** `/:id` (collection.routes.ts)
- **DELETE** `/:id` (collection.routes.ts)
- **GET** `/:id` (coupon.routes.ts)
- **GET** `/:id` (deal.routes.ts)
- **PATCH** `/:id` (deal.routes.ts)
- **DELETE** `/:id` (deal.routes.ts)
- **GET** `/:id` (faq.routes.ts)
- **PATCH** `/:id` (faq.routes.ts)
- **DELETE** `/:id` (faq.routes.ts)
- **PATCH** `/:id` (favorite-section.routes.ts)
- **DELETE** `/:id` (favorite-section.routes.ts)
- **GET** `/:id` (featured-content.routes.ts)
- **PATCH** `/:id` (featured-content.routes.ts)
- **DELETE** `/:id` (featured-content.routes.ts)
- **GET** `/:id` (giftcard.routes.ts)
- **GET** `/:id` (location.routes.ts)
- **PATCH** `/:id` (location.routes.ts)
- **DELETE** `/:id` (location.routes.ts)
- **GET** `/:id` (logo.routes.ts)
- **GET** `/:id` (media-asset.routes.ts)
- **GET** `/:id` (new-arrival.routes.ts)
- **PATCH** `/:id` (new-arrival.routes.ts)
- **DELETE** `/:id` (new-arrival.routes.ts)
- **GET** `/:id` (notification.routes.ts)
- **PUT** `/:id` (notification.routes.ts)
- **DELETE** `/:id` (notification.routes.ts)
- **GET** `/:id` (order.routes.ts)
- **GET** `/:id` (productComparison.routes.ts)
- **PUT** `/:id` (productComparison.routes.ts)
- **DELETE** `/:id` (productComparison.routes.ts)
- **GET** `/:id` (review-media.routes.ts)
- **PATCH** `/:id` (review-media.routes.ts)
- **DELETE** `/:id` (review-media.routes.ts)
- **GET** `/:id` (review-reply.routes.ts)
- **PATCH** `/:id` (review-reply.routes.ts)
- **DELETE** `/:id` (review-reply.routes.ts)
- **GET** `/:id` (review.routes.ts)
- **PATCH** `/:id` (review.routes.ts)
- **GET** `/:id` (sale.routes.ts)
- **GET** `/:id` (social-link.routes.ts)
- **PATCH** `/:id` (social-link.routes.ts)
- **DELETE** `/:id` (social-link.routes.ts)
- **GET** `/:id` (upload.routes.ts)
- **PATCH** `/:id` (upload.routes.ts)
- **DELETE** `/:id` (upload.routes.ts)
- **GET** `/:id` (user.routes.ts)
- **POST** `/:id/ab-test` (featured-content.routes.ts)
- **GET** `/:id/ab-test` (logo-enhancement.routes.ts)
- **POST** `/:id/ab-test` (logo-enhancement.routes.ts)
- **DELETE** `/:id/ab-test` (logo-enhancement.routes.ts)
- **POST** `/:id/ab-test/end` (favorite-section.routes.ts)
- **POST** `/:id/ab-test/end` (featured-content.routes.ts)
- **GET** `/:id/ab-test/results` (featured-content.routes.ts)
- **GET** `/:id/ab-test/results` (logo-enhancement.routes.ts)
- **POST** `/:id/ab-test/start` (favorite-section.routes.ts)
- **POST** `/:id/ab-test/stop` (logo-enhancement.routes.ts)
- **POST** `/:id/ab-test/track/click` (logo-enhancement.routes.ts)
- **POST** `/:id/ab-test/track/conversion` (logo-enhancement.routes.ts)
- **POST** `/:id/ab-test/track/impression` (logo-enhancement.routes.ts)
- **POST** `/:id/ab-test/variants` (logo-enhancement.routes.ts)
- **PATCH** `/:id/ab-test/variants/:variantId` (logo-enhancement.routes.ts)
- **DELETE** `/:id/ab-test/variants/:variantId` (logo-enhancement.routes.ts)
- **POST** `/:id/ab-test/winner` (logo-enhancement.routes.ts)
- **POST** `/:id/activate` (announcement.routes.ts)
- **PATCH** `/:id/activate` (collection.routes.ts)
- **PATCH** `/:id/activate` (deal.routes.ts)
- **PATCH** `/:id/activate` (featured-content.routes.ts)
- **PATCH** `/:id/activate` (location.routes.ts)
- **POST** `/:id/activate` (logo.routes.ts)
- **POST** `/:id/activate` (sale.routes.ts)
- **GET** `/:id/analytics` (logo-enhancement.routes.ts)
- **GET** `/:id/analytics` (sale.routes.ts)
- **GET** `/:id/analytics/browsers` (logo-enhancement.routes.ts)
- **POST** `/:id/analytics/click` (logo-enhancement.routes.ts)
- **GET** `/:id/analytics/devices` (logo-enhancement.routes.ts)
- **GET** `/:id/analytics/export` (logo-enhancement.routes.ts)
- **GET** `/:id/analytics/geography` (logo-enhancement.routes.ts)
- **POST** `/:id/analytics/hover` (logo-enhancement.routes.ts)
- **POST** `/:id/analytics/impression` (logo-enhancement.routes.ts)
- **POST** `/:id/analytics/performance` (logo-enhancement.routes.ts)
- **GET** `/:id/analytics/performance-summary` (logo-enhancement.routes.ts)
- **POST** `/:id/analytics/reset` (logo-enhancement.routes.ts)
- **POST** `/:id/analytics/scroll` (logo-enhancement.routes.ts)
- **POST** `/:id/analytics/view-time` (logo-enhancement.routes.ts)
- **GET** `/:id/analyze` (productComparison.routes.ts)
- **GET** `/:id/animation` (logo-enhancement.routes.ts)
- **PATCH** `/:id/animation` (logo-enhancement.routes.ts)
- **DELETE** `/:id/animation` (logo-enhancement.routes.ts)
- **POST** `/:id/animation/disable-all` (logo-enhancement.routes.ts)
- **PATCH** `/:id/animation/entrance` (logo-enhancement.routes.ts)
- **PATCH** `/:id/animation/interactions` (logo-enhancement.routes.ts)
- **PATCH** `/:id/animation/loading` (logo-enhancement.routes.ts)
- **PATCH** `/:id/animation/scroll` (logo-enhancement.routes.ts)
- **POST** `/:id/approve` (review-media.routes.ts)
- **POST** `/:id/approve` (review-reply.routes.ts)
- **PATCH** `/:id/approve` (review.routes.ts)
- **PATCH** `/:id/archive` (favorite-section.routes.ts)
- **PATCH** `/:id/archive` (media-asset.routes.ts)
- **POST** `/:id/assign-moderator` (review-media.routes.ts)
- **POST** `/:id/banner` (brand.routes.ts)
- **DELETE** `/:id/banner` (brand.routes.ts)
- **POST** `/:id/calculate` (sale.routes.ts)
- **PATCH** `/:id/cancel` (deal.routes.ts)
- **DELETE** `/:id/cancel` (giftcard.routes.ts)
- **PATCH** `/:id/cancel` (order.routes.ts)
- **GET** `/:id/categories` (brand.routes.ts)
- **GET** `/:id/category-features` (productComparison.routes.ts)
- **POST** `/:id/check` (sale.routes.ts)
- **POST** `/:id/click` (announcement.routes.ts)
- **POST** `/:id/click` (deal.routes.ts)
- **POST** `/:id/click` (favorite-section.routes.ts)
- **POST** `/:id/convert` (review-media.routes.ts)
- **POST** `/:id/deactivate` (announcement.routes.ts)
- **PATCH** `/:id/deactivate` (collection.routes.ts)
- **PATCH** `/:id/deactivate` (featured-content.routes.ts)
- **PATCH** `/:id/deactivate` (location.routes.ts)
- **POST** `/:id/deactivate` (logo.routes.ts)
- **POST** `/:id/deactivate` (sale.routes.ts)
- **PATCH** `/:id/delivered` (notification.routes.ts)
- **POST** `/:id/dislike` (review-reply.routes.ts)
- **POST** `/:id/dismiss` (announcement.routes.ts)
- **GET** `/:id/display-config` (logo-enhancement.routes.ts)
- **PATCH** `/:id/display-config` (logo-enhancement.routes.ts)
- **DELETE** `/:id/display-config` (logo-enhancement.routes.ts)
- **POST** `/:id/download` (media-asset.routes.ts)
- **POST** `/:id/duplicate` (announcement.routes.ts)
- **POST** `/:id/duplicate` (collection.routes.ts)
- **POST** `/:id/duplicate` (favorite-section.routes.ts)
- **POST** `/:id/duplicate` (featured-content.routes.ts)
- **POST** `/:id/duplicate` (sale.routes.ts)
- **POST** `/:id/feature` (review-reply.routes.ts)
- **POST** `/:id/flag` (review-media.routes.ts)
- **POST** `/:id/flag` (review-reply.routes.ts)
- **POST** `/:id/flag` (review.routes.ts)
- **POST** `/:id/helpful` (faq.routes.ts)
- **POST** `/:id/helpful` (review-reply.routes.ts)
- **POST** `/:id/impression` (favorite-section.routes.ts)
- **POST** `/:id/like` (review-reply.routes.ts)
- **GET** `/:id/link-config` (logo-enhancement.routes.ts)
- **PATCH** `/:id/link-config` (logo-enhancement.routes.ts)
- **POST** `/:id/logo` (brand.routes.ts)
- **DELETE** `/:id/logo` (brand.routes.ts)
- **POST** `/:id/mark-used` (address.routes.ts)
- **GET** `/:id/metrics` (announcement.routes.ts)
- **PATCH** `/:id/metrics` (new-arrival.routes.ts)
- **PATCH** `/:id/move` (media-asset.routes.ts)
- **GET** `/:id/navigation` (logo-enhancement.routes.ts)
- **PATCH** `/:id/navigation` (logo-enhancement.routes.ts)
- **POST** `/:id/new-version` (logo.routes.ts)
- **POST** `/:id/not-helpful` (faq.routes.ts)
- **POST** `/:id/notify` (new-arrival.routes.ts)
- **POST** `/:id/optimize` (media-asset.routes.ts)
- **POST** `/:id/optimize` (review-media.routes.ts)
- **POST** `/:id/optimize` (upload.routes.ts)
- **POST** `/:id/pause` (announcement.routes.ts)
- **PATCH** `/:id/pause` (deal.routes.ts)
- **GET** `/:id/performance` (logo-enhancement.routes.ts)
- **PATCH** `/:id/performance` (logo-enhancement.routes.ts)
- **DELETE** `/:id/performance` (logo-enhancement.routes.ts)
- **PATCH** `/:id/performance/caching` (logo-enhancement.routes.ts)
- **POST** `/:id/performance/lazy-loading/disable` (logo-enhancement.routes.ts)
- **POST** `/:id/performance/lazy-loading/enable` (logo-enhancement.routes.ts)
- **PATCH** `/:id/performance/optimization` (logo-enhancement.routes.ts)
- **POST** `/:id/performance/preconnect` (logo-enhancement.routes.ts)
- **DELETE** `/:id/performance/preconnect/:origin` (logo-enhancement.routes.ts)
- **PATCH** `/:id/performance/priority` (logo-enhancement.routes.ts)
- **GET** `/:id/performance/recommendations` (logo-enhancement.routes.ts)
- **POST** `/:id/pin` (review-reply.routes.ts)
- **PATCH** `/:id/position` (featured-content.routes.ts)
- **GET** `/:id/products` (brand.routes.ts)
- **GET** `/:id/products` (collection.routes.ts)
- **POST** `/:id/products` (collection.routes.ts)
- **DELETE** `/:id/products` (collection.routes.ts)
- **POST** `/:id/products` (productComparison.routes.ts)
- **DELETE** `/:id/products/:productId` (productComparison.routes.ts)
- **PATCH** `/:id/products/reorder` (collection.routes.ts)
- **PATCH** `/:id/publish` (favorite-section.routes.ts)
- **POST** `/:id/publish` (sale.routes.ts)
- **POST** `/:id/react` (review-reply.routes.ts)
- **PATCH** `/:id/read` (notification.routes.ts)
- **POST** `/:id/refresh` (collection.routes.ts)
- **POST** `/:id/refund` (giftcard.routes.ts)
- **POST** `/:id/reject` (review-media.routes.ts)
- **POST** `/:id/reject` (review-reply.routes.ts)
- **PATCH** `/:id/reject` (review.routes.ts)
- **GET** `/:id/related` (product.routes.ts)
- **POST** `/:id/reorder` (featured-content.routes.ts)
- **POST** `/:id/report` (review-reply.routes.ts)
- **POST** `/:id/resize` (upload.routes.ts)
- **POST** `/:id/response` (review.routes.ts)
- **DELETE** `/:id/response` (review.routes.ts)
- **GET** `/:id/responsive` (logo-enhancement.routes.ts)
- **PATCH** `/:id/responsive` (logo-enhancement.routes.ts)
- **PATCH** `/:id/responsive/desktop` (logo-enhancement.routes.ts)
- **PATCH** `/:id/responsive/mobile` (logo-enhancement.routes.ts)
- **PATCH** `/:id/responsive/tablet` (logo-enhancement.routes.ts)
- **PATCH** `/:id/restore` (media-asset.routes.ts)
- **POST** `/:id/restore/:versionId` (logo.routes.ts)
- **POST** `/:id/resume` (announcement.routes.ts)
- **POST** `/:id/retry` (notification.routes.ts)
- **POST** `/:id/schedule` (featured-content.routes.ts)
- **PUT** `/:id/seo` (brand.routes.ts)
- **PATCH** `/:id/set-default` (address.routes.ts)
- **POST** `/:id/set-primary` (logo.routes.ts)
- **POST** `/:id/share` (coupon.routes.ts)
- **POST** `/:id/share` (productComparison.routes.ts)
- **POST** `/:id/signed-url` (upload.routes.ts)
- **GET** `/:id/similar` (brand.routes.ts)
- **POST** `/:id/spam` (review-reply.routes.ts)
- **GET** `/:id/statistics` (brand.routes.ts)
- **GET** `/:id/statistics` (deal.routes.ts)
- **GET** `/:id/stats` (collection.routes.ts)
- **GET** `/:id/stats` (featured-content.routes.ts)
- **GET** `/:id/styling` (logo-enhancement.routes.ts)
- **PATCH** `/:id/styling` (logo-enhancement.routes.ts)
- **PATCH** `/:id/styling/hover-effects` (logo-enhancement.routes.ts)
- **PATCH** `/:id/styling/scroll-effects` (logo-enhancement.routes.ts)
- **POST** `/:id/thumbnail` (upload.routes.ts)
- **POST** `/:id/thumbnails` (review-media.routes.ts)
- **POST** `/:id/toggle-featured` (sale.routes.ts)
- **PATCH** `/:id/toggle-publish` (faq.routes.ts)
- **POST** `/:id/track/call` (location.routes.ts)
- **POST** `/:id/track/click` (collection.routes.ts)
- **POST** `/:id/track/click` (featured-content.routes.ts)
- **POST** `/:id/track/click` (location.routes.ts)
- **POST** `/:id/track/conversion` (featured-content.routes.ts)
- **POST** `/:id/track/directions` (location.routes.ts)
- **POST** `/:id/track/impression` (featured-content.routes.ts)
- **POST** `/:id/track/view` (collection.routes.ts)
- **POST** `/:id/unflag` (review-media.routes.ts)
- **POST** `/:id/unhelpful` (review-reply.routes.ts)
- **POST** `/:id/unpin` (review-reply.routes.ts)
- **POST** `/:id/unpublish` (sale.routes.ts)
- **GET** `/:id/usage` (logo.routes.ts)
- **POST** `/:id/usage` (media-asset.routes.ts)
- **GET** `/:id/usage-stats` (coupon.routes.ts)
- **GET** `/:id/variants` (logo.routes.ts)
- **POST** `/:id/variants` (logo.routes.ts)
- **DELETE** `/:id/variants/:variantName` (logo.routes.ts)
- **POST** `/:id/verify` (address.routes.ts)
- **GET** `/:id/versions` (logo.routes.ts)
- **POST** `/:id/view` (announcement.routes.ts)
- **POST** `/:id/vote` (review.routes.ts)
- **DELETE** `/:id/vote` (review.routes.ts)
- **POST** `/:id/watermark` (review-media.routes.ts)
- **DELETE** `/:id/watermark` (review-media.routes.ts)

### /root (46 endpoints)

- **GET** `/` (address.routes.ts)
- **GET** `/` (announcement.routes.ts)
- **GET** `/` (bestseller.routes.ts)
- **POST** `/` (bestseller.routes.ts)
- **GET** `/` (brand.routes.ts)
- **POST** `/` (brand.routes.ts)
- **GET** `/` (cart.routes.ts)
- **POST** `/` (cart.routes.ts)
- **GET** `/` (category.routes.ts)
- **GET** `/` (collection.routes.ts)
- **POST** `/` (collection.routes.ts)
- **GET** `/` (coupon.routes.ts)
- **GET** `/` (deal.routes.ts)
- **POST** `/` (deal.routes.ts)
- **GET** `/` (faq.routes.ts)
- **POST** `/` (faq.routes.ts)
- **GET** `/` (favorite-section.routes.ts)
- **POST** `/` (favorite-section.routes.ts)
- **GET** `/` (featured-content.routes.ts)
- **POST** `/` (featured-content.routes.ts)
- **GET** `/` (giftcard.routes.ts)
- **GET** `/` (location.routes.ts)
- **POST** `/` (location.routes.ts)
- **GET** `/` (logo.routes.ts)
- **GET** `/` (media-asset.routes.ts)
- **GET** `/` (new-arrival.routes.ts)
- **POST** `/` (new-arrival.routes.ts)
- **GET** `/` (notification.routes.ts)
- **POST** `/` (notification.routes.ts)
- **POST** `/` (order.routes.ts)
- **GET** `/` (product.routes.ts)
- **GET** `/` (productComparison.routes.ts)
- **POST** `/` (productComparison.routes.ts)
- **GET** `/` (review-media.routes.ts)
- **POST** `/` (review-media.routes.ts)
- **POST** `/` (review-reply.routes.ts)
- **GET** `/` (sale.routes.ts)
- **POST** `/` (search.routes.ts)
- **GET** `/` (settings.routes.ts)
- **GET** `/` (site-config.routes.ts)
- **GET** `/` (social-link.routes.ts)
- **POST** `/` (social-link.routes.ts)
- **POST** `/` (upload.routes.ts)
- **GET** `/` (upload.routes.ts)
- **GET** `/` (user.routes.ts)
- **GET** `/` (wishlist.routes.ts)

### /admin (42 endpoints)

- **GET** `/admin/:id` (category.routes.ts)
- **PATCH** `/admin/:id` (product.routes.ts)
- **DELETE** `/admin/:id` (product.routes.ts)
- **PATCH** `/admin/:id/status` (order.routes.ts)
- **GET** `/admin/all` (address.routes.ts)
- **GET** `/admin/all` (category.routes.ts)
- **GET** `/admin/all` (faq.routes.ts)
- **GET** `/admin/all` (order.routes.ts)
- **GET** `/admin/all` (product.routes.ts)
- **GET** `/admin/analytics` (address.routes.ts)
- **GET** `/admin/analytics` (blog.routes.ts)
- **GET** `/admin/analytics` (deal.routes.ts)
- **POST** `/admin/bulk-activate` (deal.routes.ts)
- **POST** `/admin/bulk-approve` (review.routes.ts)
- **POST** `/admin/bulk-delete` (brand.routes.ts)
- **DELETE** `/admin/bulk-delete` (category.routes.ts)
- **DELETE** `/admin/bulk-delete` (deal.routes.ts)
- **DELETE** `/admin/bulk-delete` (order.routes.ts)
- **DELETE** `/admin/bulk-delete` (product.routes.ts)
- **DELETE** `/admin/bulk-delete` (review.routes.ts)
- **POST** `/admin/bulk-pause` (deal.routes.ts)
- **PATCH** `/admin/bulk-toggle-featured` (product.routes.ts)
- **PATCH** `/admin/bulk-toggle-status` (category.routes.ts)
- **PATCH** `/admin/bulk-toggle-status` (product.routes.ts)
- **POST** `/admin/bulk-update` (brand.routes.ts)
- **PATCH** `/admin/bulk-update-status` (order.routes.ts)
- **GET** `/admin/comments/pending` (blog.routes.ts)
- **POST** `/admin/create` (category.routes.ts)
- **POST** `/admin/create` (product.routes.ts)
- **GET** `/admin/departments` (about.routes.ts)
- **GET** `/admin/flagged` (review.routes.ts)
- **GET** `/admin/overview` (about.routes.ts)
- **GET** `/admin/pending` (review.routes.ts)
- **GET** `/admin/statistics` (brand.routes.ts)
- **GET** `/admin/stats` (faq.routes.ts)
- **GET** `/admin/stats` (order.routes.ts)
- **GET** `/admin/stats` (product.routes.ts)
- **GET** `/admin/stats` (review.routes.ts)
- **GET** `/admin/top-performing` (deal.routes.ts)
- **POST** `/admin/update-scheduled` (blog.routes.ts)
- **GET** `/admin/validate` (brand.routes.ts)
- **POST** `/admin/verify-bulk` (address.routes.ts)

### /analytics (24 endpoints)

- **GET** `/analytics` (cart.routes.ts)
- **GET** `/analytics` (cms.routes.ts)
- **GET** `/analytics` (collection.routes.ts)
- **GET** `/analytics` (coupon.routes.ts)
- **GET** `/analytics` (featured-content.routes.ts)
- **GET** `/analytics` (giftcard.routes.ts)
- **GET** `/analytics` (hero-banner.routes.ts)
- **GET** `/analytics` (location.routes.ts)
- **GET** `/analytics` (media-asset.routes.ts)
- **GET** `/analytics` (seo.routes.ts)
- **GET** `/analytics` (upload.routes.ts)
- **GET** `/analytics` (wishlist.routes.ts)
- **GET** `/analytics/channels` (notification.routes.ts)
- **GET** `/analytics/delivery-rate` (notification.routes.ts)
- **GET** `/analytics/engagement` (notification.routes.ts)
- **GET** `/analytics/overview` (bestseller.routes.ts)
- **GET** `/analytics/overview` (favorite-section.routes.ts)
- **GET** `/analytics/overview` (new-arrival.routes.ts)
- **GET** `/analytics/overview` (review-media.routes.ts)
- **GET** `/analytics/overview` (review-reply.routes.ts)
- **GET** `/analytics/overview` (search.routes.ts)
- **GET** `/analytics/overview` (social-link.routes.ts)
- **GET** `/analytics/stats` (review-media.routes.ts)
- **GET** `/analytics/zero-results` (search.routes.ts)

### /items (23 endpoints)

- **POST** `/items` (cart.routes.ts)
- **GET** `/items` (inventory.routes.ts)
- **POST** `/items` (inventory.routes.ts)
- **GET** `/items/:id` (inventory.routes.ts)
- **PATCH** `/items/:id` (inventory.routes.ts)
- **DELETE** `/items/:id` (inventory.routes.ts)
- **POST** `/items/:id/adjust-stock` (inventory.routes.ts)
- **POST** `/items/:id/release-reserved` (inventory.routes.ts)
- **POST** `/items/:id/reserve-stock` (inventory.routes.ts)
- **PUT** `/items/:itemId` (cart.routes.ts)
- **DELETE** `/items/:itemId` (cart.routes.ts)
- **POST** `/items/:itemId/decrease` (cart.routes.ts)
- **POST** `/items/:itemId/increase` (cart.routes.ts)
- **POST** `/items/:itemId/move-to-cart` (wishlist.routes.ts)
- **POST** `/items/:itemId/move-to-wishlist` (cart.routes.ts)
- **PUT** `/items/:itemId/quantity` (cart.routes.ts)
- **GET** `/items/:itemId/similar` (wishlist.routes.ts)
- **POST** `/items/bulk/add` (cart.routes.ts)
- **DELETE** `/items/bulk/remove` (cart.routes.ts)
- **PUT** `/items/bulk/update` (cart.routes.ts)
- **POST** `/items/from-wishlist/:wishlistItemId` (cart.routes.ts)
- **GET** `/items/product/:productId` (inventory.routes.ts)
- **GET** `/items/sku/:sku` (inventory.routes.ts)

### /tickets (22 endpoints)

- **POST** `/tickets` (support.routes.ts)
- **GET** `/tickets/:id` (support.routes.ts)
- **PATCH** `/tickets/:id` (support.routes.ts)
- **DELETE** `/tickets/:id` (support.routes.ts)
- **PATCH** `/tickets/:id/assign` (support.routes.ts)
- **POST** `/tickets/:id/close` (support.routes.ts)
- **POST** `/tickets/:id/internal-note` (support.routes.ts)
- **POST** `/tickets/:id/messages` (support.routes.ts)
- **PATCH** `/tickets/:id/priority` (support.routes.ts)
- **POST** `/tickets/:id/rate` (support.routes.ts)
- **POST** `/tickets/:id/reopen` (support.routes.ts)
- **POST** `/tickets/:id/resolve` (support.routes.ts)
- **PATCH** `/tickets/:id/status` (support.routes.ts)
- **GET** `/tickets/admin/all` (support.routes.ts)
- **GET** `/tickets/admin/assigned` (support.routes.ts)
- **PATCH** `/tickets/admin/bulk-assign` (support.routes.ts)
- **PATCH** `/tickets/admin/bulk-status` (support.routes.ts)
- **GET** `/tickets/admin/overdue` (support.routes.ts)
- **GET** `/tickets/admin/priority/:priority` (support.routes.ts)
- **GET** `/tickets/admin/stats` (support.routes.ts)
- **GET** `/tickets/admin/status/:status` (support.routes.ts)
- **GET** `/tickets/my-tickets` (support.routes.ts)

### /pages (19 endpoints)

- **GET** `/pages` (cms.routes.ts)
- **GET** `/pages` (seo.routes.ts)
- **POST** `/pages` (seo.routes.ts)
- **GET** `/pages/:id` (cms.routes.ts)
- **GET** `/pages/:id` (seo.routes.ts)
- **PATCH** `/pages/:id` (seo.routes.ts)
- **DELETE** `/pages/:id` (seo.routes.ts)
- **POST** `/pages/:id/duplicate` (cms.routes.ts)
- **PATCH** `/pages/:id/publish` (cms.routes.ts)
- **GET** `/pages/:id/seo-preview` (cms.routes.ts)
- **PATCH** `/pages/:id/unpublish` (cms.routes.ts)
- **GET** `/pages/:id/versions` (cms.routes.ts)
- **POST** `/pages/:id/versions/:versionId/restore` (cms.routes.ts)
- **POST** `/pages/bulk-delete` (cms.routes.ts)
- **POST** `/pages/bulk-update` (cms.routes.ts)
- **PATCH** `/pages/bulk-update` (seo.routes.ts)
- **GET** `/pages/by-page/:pageId` (seo.routes.ts)
- **POST** `/pages/generate/:pageId` (seo.routes.ts)
- **GET** `/pages/slug/:slug` (cms.routes.ts)

### /posts (15 endpoints)

- **GET** `/posts` (blog.routes.ts)
- **POST** `/posts` (blog.routes.ts)
- **PATCH** `/posts/:id` (blog.routes.ts)
- **DELETE** `/posts/:id` (blog.routes.ts)
- **PATCH** `/posts/:id/archive` (blog.routes.ts)
- **POST** `/posts/:id/like` (blog.routes.ts)
- **PATCH** `/posts/:id/publish` (blog.routes.ts)
- **GET** `/posts/:id/related` (blog.routes.ts)
- **POST** `/posts/:id/share` (blog.routes.ts)
- **GET** `/posts/:postId/comments` (blog.routes.ts)
- **POST** `/posts/:postId/comments` (blog.routes.ts)
- **GET** `/posts/:slug` (blog.routes.ts)
- **GET** `/posts/featured` (blog.routes.ts)
- **GET** `/posts/popular` (blog.routes.ts)
- **GET** `/posts/search/:query` (blog.routes.ts)

### /banners (13 endpoints)

- **GET** `/banners` (hero-banner.routes.ts)
- **GET** `/banners/:id` (hero-banner.routes.ts)
- **PATCH** `/banners/:id/activate` (hero-banner.routes.ts)
- **POST** `/banners/:id/click` (hero-banner.routes.ts)
- **PATCH** `/banners/:id/deactivate` (hero-banner.routes.ts)
- **POST** `/banners/:id/duplicate` (hero-banner.routes.ts)
- **POST** `/banners/:id/impression` (hero-banner.routes.ts)
- **POST** `/banners/:id/schedule` (hero-banner.routes.ts)
- **POST** `/banners/bulk-delete` (hero-banner.routes.ts)
- **POST** `/banners/bulk-update` (hero-banner.routes.ts)
- **PATCH** `/banners/order` (hero-banner.routes.ts)
- **GET** `/banners/page/:page` (hero-banner.routes.ts)
- **GET** `/banners/page/:page/location/:location` (hero-banner.routes.ts)

### /bulk-delete (12 endpoints)

- **DELETE** `/bulk-delete` (bestseller.routes.ts)
- **POST** `/bulk-delete` (collection.routes.ts)
- **POST** `/bulk-delete` (coupon.routes.ts)
- **DELETE** `/bulk-delete` (faq.routes.ts)
- **DELETE** `/bulk-delete` (favorite-section.routes.ts)
- **POST** `/bulk-delete` (location.routes.ts)
- **POST** `/bulk-delete` (logo.routes.ts)
- **DELETE** `/bulk-delete` (new-arrival.routes.ts)
- **POST** `/bulk-delete` (productComparison.routes.ts)
- **DELETE** `/bulk-delete` (review-media.routes.ts)
- **DELETE** `/bulk-delete` (social-link.routes.ts)
- **POST** `/bulk-delete` (upload.routes.ts)

### /templates (12 endpoints)

- **GET** `/templates` (cms.routes.ts)
- **GET** `/templates` (giftcard.routes.ts)
- **POST** `/templates` (notification.routes.ts)
- **GET** `/templates/:id` (cms.routes.ts)
- **GET** `/templates/:id` (notification.routes.ts)
- **PUT** `/templates/:id` (notification.routes.ts)
- **DELETE** `/templates/:id` (notification.routes.ts)
- **POST** `/templates/:id/clone` (notification.routes.ts)
- **POST** `/templates/:id/duplicate` (cms.routes.ts)
- **POST** `/templates/:id/increment-usage` (cms.routes.ts)
- **PATCH** `/templates/:id/toggle` (notification.routes.ts)
- **GET** `/templates/all` (notification.routes.ts)

### /subscribers (11 endpoints)

- **GET** `/subscribers` (newsletter.routes.ts)
- **GET** `/subscribers/:id` (newsletter.routes.ts)
- **PATCH** `/subscribers/:id` (newsletter.routes.ts)
- **DELETE** `/subscribers/:id` (newsletter.routes.ts)
- **POST** `/subscribers/:id/tags` (newsletter.routes.ts)
- **DELETE** `/subscribers/:id/tags` (newsletter.routes.ts)
- **GET** `/subscribers/active` (newsletter.routes.ts)
- **DELETE** `/subscribers/bulk-delete` (newsletter.routes.ts)
- **POST** `/subscribers/bulk-import` (newsletter.routes.ts)
- **PATCH** `/subscribers/bulk-update` (newsletter.routes.ts)
- **GET** `/subscribers/tags/:tags` (newsletter.routes.ts)

### /bulk (10 endpoints)

- **POST** `/bulk` (address.routes.ts)
- **DELETE** `/bulk` (address.routes.ts)
- **POST** `/bulk` (notification.routes.ts)
- **POST** `/bulk/add` (wishlist.routes.ts)
- **POST** `/bulk/adjust-stock` (inventory.routes.ts)
- **DELETE** `/bulk/delete` (media-asset.routes.ts)
- **POST** `/bulk/move-to-cart` (wishlist.routes.ts)
- **DELETE** `/bulk/remove` (wishlist.routes.ts)
- **POST** `/bulk/update` (inventory.routes.ts)
- **PATCH** `/bulk/update` (media-asset.routes.ts)

### /bulk-update (10 endpoints)

- **PATCH** `/bulk-update` (bestseller.routes.ts)
- **POST** `/bulk-update` (collection.routes.ts)
- **PATCH** `/bulk-update` (faq.routes.ts)
- **PATCH** `/bulk-update` (favorite-section.routes.ts)
- **POST** `/bulk-update` (featured-content.routes.ts)
- **POST** `/bulk-update` (location.routes.ts)
- **POST** `/bulk-update` (logo.routes.ts)
- **PATCH** `/bulk-update` (new-arrival.routes.ts)
- **PATCH** `/bulk-update` (social-link.routes.ts)
- **POST** `/bulk-update` (upload.routes.ts)

### /categories (10 endpoints)

- **GET** `/categories` (admin.routes.ts)
- **GET** `/categories` (blog.routes.ts)
- **POST** `/categories` (blog.routes.ts)
- **GET** `/categories` (faq.routes.ts)
- **GET** `/categories/:categoryId/posts` (blog.routes.ts)
- **GET** `/categories/:id` (admin.routes.ts)
- **GET** `/categories/:id` (blog.routes.ts)
- **PATCH** `/categories/:id` (blog.routes.ts)
- **DELETE** `/categories/:id` (blog.routes.ts)
- **DELETE** `/categories/:id/image` (admin.routes.ts)

### /products (10 endpoints)

- **GET** `/products` (admin.routes.ts)
- **GET** `/products/:id` (admin.routes.ts)
- **DELETE** `/products/:id/images/:imageIndex` (admin.routes.ts)
- **DELETE** `/products/:id/variants/:variantIndex/images/:imageIndex` (admin.routes.ts)
- **GET** `/products/:productId` (review.routes.ts)
- **POST** `/products/:productId` (review.routes.ts)
- **GET** `/products/:productId/distribution` (review.routes.ts)
- **GET** `/products/:productId/top` (review.routes.ts)
- **GET** `/products/popular` (productComparison.routes.ts)
- **GET** `/products/stats` (admin.routes.ts)

### /stats (10 endpoints)

- **GET** `/stats` (about.routes.ts)
- **PUT** `/stats` (about.routes.ts)
- **GET** `/stats` (address.routes.ts)
- **GET** `/stats` (newsletter.routes.ts)
- **GET** `/stats` (shipping.routes.ts)
- **GET** `/stats/overview` (announcement.routes.ts)
- **GET** `/stats/overview` (logo.routes.ts)
- **GET** `/stats/overview` (notification.routes.ts)
- **GET** `/stats/overview` (productComparison.routes.ts)
- **GET** `/stats/overview` (sale.routes.ts)

### /hero-sections (9 endpoints)

- **GET** `/hero-sections` (hero-banner.routes.ts)
- **GET** `/hero-sections/:id` (hero-banner.routes.ts)
- **PATCH** `/hero-sections/:id/activate` (hero-banner.routes.ts)
- **POST** `/hero-sections/:id/click` (hero-banner.routes.ts)
- **PATCH** `/hero-sections/:id/deactivate` (hero-banner.routes.ts)
- **POST** `/hero-sections/:id/duplicate` (hero-banner.routes.ts)
- **POST** `/hero-sections/:id/impression` (hero-banner.routes.ts)
- **POST** `/hero-sections/:id/schedule` (hero-banner.routes.ts)
- **GET** `/hero-sections/page/:page` (hero-banner.routes.ts)

### /redirect-rules (8 endpoints)

- **GET** `/redirect-rules` (seo.routes.ts)
- **POST** `/redirect-rules` (seo.routes.ts)
- **GET** `/redirect-rules/:id` (seo.routes.ts)
- **PATCH** `/redirect-rules/:id` (seo.routes.ts)
- **DELETE** `/redirect-rules/:id` (seo.routes.ts)
- **POST** `/redirect-rules/:id/test` (seo.routes.ts)
- **POST** `/redirect-rules/bulk-create` (seo.routes.ts)
- **POST** `/redirect-rules/import` (seo.routes.ts)

### /sitemaps (8 endpoints)

- **GET** `/sitemaps` (seo.routes.ts)
- **GET** `/sitemaps/:id` (seo.routes.ts)
- **PATCH** `/sitemaps/:id` (seo.routes.ts)
- **DELETE** `/sitemaps/:id` (seo.routes.ts)
- **GET** `/sitemaps/:id/download` (seo.routes.ts)
- **POST** `/sitemaps/:id/submit` (seo.routes.ts)
- **POST** `/sitemaps/:id/validate` (seo.routes.ts)
- **POST** `/sitemaps/generate` (seo.routes.ts)

### /cleanup (7 endpoints)

- **DELETE** `/cleanup` (analytics.routes.ts)
- **POST** `/cleanup` (announcement.routes.ts)
- **POST** `/cleanup` (newsletter.routes.ts)
- **POST** `/cleanup` (notification.routes.ts)
- **POST** `/cleanup` (productComparison.routes.ts)
- **POST** `/cleanup` (sale.routes.ts)
- **POST** `/cleanup` (search.routes.ts)

### /regions (7 endpoints)

- **GET** `/regions` (location.routes.ts)
- **POST** `/regions` (location.routes.ts)
- **GET** `/regions/:id` (location.routes.ts)
- **PATCH** `/regions/:id` (location.routes.ts)
- **DELETE** `/regions/:id` (location.routes.ts)
- **GET** `/regions/analytics` (location.routes.ts)
- **GET** `/regions/slug/:slug` (location.routes.ts)

### /schema-markups (7 endpoints)

- **GET** `/schema-markups` (seo.routes.ts)
- **POST** `/schema-markups` (seo.routes.ts)
- **GET** `/schema-markups/:id` (seo.routes.ts)
- **PATCH** `/schema-markups/:id` (seo.routes.ts)
- **DELETE** `/schema-markups/:id` (seo.routes.ts)
- **POST** `/schema-markups/:id/validate` (seo.routes.ts)
- **POST** `/schema-markups/generate` (seo.routes.ts)

### /search (7 endpoints)

- **GET** `/search` (address.routes.ts)
- **POST** `/search` (analytics.routes.ts)
- **GET** `/search` (brand.routes.ts)
- **GET** `/search` (faq.routes.ts)
- **GET** `/search` (review-reply.routes.ts)
- **GET** `/search` (upload.routes.ts)
- **GET** `/search` (wishlist.routes.ts)

### /team (7 endpoints)

- **GET** `/team` (about.routes.ts)
- **POST** `/team` (about.routes.ts)
- **GET** `/team/:id` (about.routes.ts)
- **PUT** `/team/:id` (about.routes.ts)
- **DELETE** `/team/:id` (about.routes.ts)
- **POST** `/team/:id/image` (about.routes.ts)
- **GET** `/team/featured` (about.routes.ts)

### /audits (6 endpoints)

- **GET** `/audits` (seo.routes.ts)
- **POST** `/audits` (seo.routes.ts)
- **GET** `/audits/:id` (seo.routes.ts)
- **DELETE** `/audits/:id` (seo.routes.ts)
- **GET** `/audits/:id/export` (seo.routes.ts)
- **POST** `/audits/bulk` (seo.routes.ts)

### /meta-tags (6 endpoints)

- **GET** `/meta-tags` (seo.routes.ts)
- **POST** `/meta-tags` (seo.routes.ts)
- **GET** `/meta-tags/:id` (seo.routes.ts)
- **PATCH** `/meta-tags/:id` (seo.routes.ts)
- **DELETE** `/meta-tags/:id` (seo.routes.ts)
- **POST** `/meta-tags/bulk-create` (seo.routes.ts)

### /preferences (6 endpoints)

- **PATCH** `/preferences/:token` (newsletter.routes.ts)
- **POST** `/preferences/fcm-token` (notification.routes.ts)
- **DELETE** `/preferences/fcm-token` (notification.routes.ts)
- **GET** `/preferences/me` (notification.routes.ts)
- **PUT** `/preferences/me` (notification.routes.ts)
- **POST** `/preferences/reset` (notification.routes.ts)

### /settings (6 endpoints)

- **GET** `/settings` (analytics.routes.ts)
- **PUT** `/settings` (analytics.routes.ts)
- **GET** `/settings` (cms.routes.ts)
- **PATCH** `/settings` (cms.routes.ts)
- **GET** `/settings` (seo.routes.ts)
- **PATCH** `/settings` (seo.routes.ts)

### /awards (5 endpoints)

- **GET** `/awards` (about.routes.ts)
- **POST** `/awards` (about.routes.ts)
- **GET** `/awards/:id` (about.routes.ts)
- **PUT** `/awards/:id` (about.routes.ts)
- **DELETE** `/awards/:id` (about.routes.ts)

### /category (5 endpoints)

- **GET** `/category/:category` (faq.routes.ts)
- **GET** `/category/:category` (settings.routes.ts)
- **PATCH** `/category/:category` (settings.routes.ts)
- **GET** `/category/:categoryId` (bestseller.routes.ts)
- **GET** `/category/:categoryId` (new-arrival.routes.ts)

### /comments (5 endpoints)

- **PATCH** `/comments/:id` (blog.routes.ts)
- **DELETE** `/comments/:id` (blog.routes.ts)
- **PATCH** `/comments/:id/approve` (blog.routes.ts)
- **POST** `/comments/:id/flag` (blog.routes.ts)
- **POST** `/comments/:id/like` (blog.routes.ts)

### /export (5 endpoints)

- **GET** `/export` (analytics.routes.ts)
- **GET** `/export` (newsletter.routes.ts)
- **GET** `/export` (settings.routes.ts)
- **GET** `/export` (social-link.routes.ts)
- **POST** `/export` (wishlist.routes.ts)

### /featured (5 endpoints)

- **GET** `/featured` (bestseller.routes.ts)
- **GET** `/featured` (brand.routes.ts)
- **GET** `/featured` (new-arrival.routes.ts)
- **GET** `/featured` (product.routes.ts)
- **GET** `/featured` (sale.routes.ts)

### /folders (5 endpoints)

- **GET** `/folders` (media-asset.routes.ts)
- **GET** `/folders` (upload.routes.ts)
- **POST** `/folders` (upload.routes.ts)
- **PATCH** `/folders/:id` (upload.routes.ts)
- **DELETE** `/folders/:id` (upload.routes.ts)

### /history (5 endpoints)

- **GET** `/history` (about.routes.ts)
- **POST** `/history` (about.routes.ts)
- **GET** `/history/:id` (about.routes.ts)
- **PUT** `/history/:id` (about.routes.ts)
- **DELETE** `/history/:id` (about.routes.ts)

### /locations (5 endpoints)

- **GET** `/locations` (about.routes.ts)
- **POST** `/locations` (about.routes.ts)
- **GET** `/locations/:id` (about.routes.ts)
- **PUT** `/locations/:id` (about.routes.ts)
- **DELETE** `/locations/:id` (about.routes.ts)

### /popular (5 endpoints)

- **GET** `/popular` (productComparison.routes.ts)
- **GET** `/popular` (search.routes.ts)
- **GET** `/popular` (social-link.routes.ts)
- **GET** `/popular/most-helpful` (faq.routes.ts)
- **GET** `/popular/most-viewed` (faq.routes.ts)

### /public (5 endpoints)

- **GET** `/public` (productComparison.routes.ts)
- **GET** `/public` (site-config.routes.ts)
- **GET** `/public/by-type/:type` (logo.routes.ts)
- **GET** `/public/primary` (logo.routes.ts)
- **GET** `/public/type/:type` (logo.routes.ts)

### /robots (5 endpoints)

- **GET** `/robots` (cms.routes.ts)
- **GET** `/robots` (seo.routes.ts)
- **PATCH** `/robots` (seo.routes.ts)
- **POST** `/robots/test` (seo.routes.ts)
- **POST** `/robots/validate` (seo.routes.ts)

### /slug (5 endpoints)

- **GET** `/slug/:slug` (brand.routes.ts)
- **GET** `/slug/:slug` (collection.routes.ts)
- **GET** `/slug/:slug` (location.routes.ts)
- **GET** `/slug/:slug` (media-asset.routes.ts)
- **GET** `/slug/:slug` (sale.routes.ts)

### /users (5 endpoints)

- **GET** `/users` (admin.routes.ts)
- **GET** `/users/:id` (admin.routes.ts)
- **POST** `/users/bulk/delete` (admin.routes.ts)
- **PATCH** `/users/bulk/status` (admin.routes.ts)
- **GET** `/users/stats` (admin.routes.ts)

### /validate (5 endpoints)

- **POST** `/validate` (address.routes.ts)
- **POST** `/validate` (cart.routes.ts)
- **POST** `/validate` (coupon.routes.ts)
- **POST** `/validate` (giftcard.routes.ts)
- **POST** `/validate` (upload.routes.ts)

### /warehouses (5 endpoints)

- **GET** `/warehouses` (inventory.routes.ts)
- **POST** `/warehouses` (inventory.routes.ts)
- **GET** `/warehouses/:id` (inventory.routes.ts)
- **PATCH** `/warehouses/:id` (inventory.routes.ts)
- **DELETE** `/warehouses/:id` (inventory.routes.ts)

### /widgets (5 endpoints)

- **GET** `/widgets` (cms.routes.ts)
- **GET** `/widgets/:id` (cms.routes.ts)
- **POST** `/widgets/:id/click` (cms.routes.ts)
- **POST** `/widgets/:id/impression` (cms.routes.ts)
- **GET** `/widgets/page/:pageSlug` (cms.routes.ts)

### /banner-groups (4 endpoints)

- **GET** `/banner-groups` (hero-banner.routes.ts)
- **GET** `/banner-groups/:id` (hero-banner.routes.ts)
- **PATCH** `/banner-groups/:id/activate` (hero-banner.routes.ts)
- **PATCH** `/banner-groups/:id/deactivate` (hero-banner.routes.ts)

### /media (4 endpoints)

- **DELETE** `/media/:publicId` (cms.routes.ts)
- **GET** `/media/library` (cms.routes.ts)
- **POST** `/media/optimize` (cms.routes.ts)
- **POST** `/media/upload` (cms.routes.ts)

### /:category (3 endpoints)

- **GET** `/:category/:key` (settings.routes.ts)
- **PATCH** `/:category/:key` (settings.routes.ts)
- **DELETE** `/:category/:key` (settings.routes.ts)

### /:productId (3 endpoints)

- **POST** `/:productId/reviews` (product.routes.ts)
- **PATCH** `/:productId/reviews/:reviewId` (product.routes.ts)
- **DELETE** `/:productId/reviews/:reviewId` (product.routes.ts)

### /ab-test (3 endpoints)

- **POST** `/ab-test` (hero-banner.routes.ts)
- **GET** `/ab-test/:type/:id` (hero-banner.routes.ts)
- **POST** `/ab-test/end` (hero-banner.routes.ts)

### /active (3 endpoints)

- **GET** `/active` (announcement.routes.ts)
- **GET** `/active` (sale.routes.ts)
- **GET** `/active` (social-link.routes.ts)

### /addresses (3 endpoints)

- **POST** `/addresses` (user.routes.ts)
- **PATCH** `/addresses/:addressId` (user.routes.ts)
- **DELETE** `/addresses/:addressId` (user.routes.ts)

### /alerts (3 endpoints)

- **GET** `/alerts` (inventory.routes.ts)
- **PATCH** `/alerts/:id/acknowledge` (inventory.routes.ts)
- **POST** `/alerts/bulk-acknowledge` (inventory.routes.ts)

### /coupons (3 endpoints)

- **POST** `/coupons` (cart.routes.ts)
- **DELETE** `/coupons/:couponId` (cart.routes.ts)
- **POST** `/coupons/validate` (cart.routes.ts)

### /menus (3 endpoints)

- **GET** `/menus` (cms.routes.ts)
- **GET** `/menus/:id` (cms.routes.ts)
- **GET** `/menus/location/:location` (cms.routes.ts)

### /methods (3 endpoints)

- **GET** `/methods` (shipping.routes.ts)
- **GET** `/methods/:id` (shipping.routes.ts)
- **POST** `/methods/:methodId/calculate-rate` (shipping.routes.ts)

### /orders (3 endpoints)

- **GET** `/orders` (admin.routes.ts)
- **PATCH** `/orders/:id/status` (admin.routes.ts)
- **GET** `/orders/stats` (admin.routes.ts)

### /queries (3 endpoints)

- **GET** `/queries` (search.routes.ts)
- **GET** `/queries/:id` (search.routes.ts)
- **DELETE** `/queries/:id` (search.routes.ts)

### /razorpay (3 endpoints)

- **POST** `/razorpay/create-order` (payment.routes.ts)
- **POST** `/razorpay/verify` (payment.routes.ts)
- **POST** `/razorpay/webhook` (payment.routes.ts)

### /reorder (3 endpoints)

- **PATCH** `/reorder` (faq.routes.ts)
- **PATCH** `/reorder` (favorite-section.routes.ts)
- **PATCH** `/reorder` (social-link.routes.ts)

### /reports (3 endpoints)

- **POST** `/reports` (analytics.routes.ts)
- **GET** `/reports/:id` (analytics.routes.ts)
- **POST** `/reports/generate` (inventory.routes.ts)

### /saved (3 endpoints)

- **GET** `/saved` (cart.routes.ts)
- **DELETE** `/saved/:id` (cart.routes.ts)
- **POST** `/saved/:id/restore` (cart.routes.ts)

### /suggestions (3 endpoints)

- **GET** `/suggestions` (address.routes.ts)
- **GET** `/suggestions` (brand.routes.ts)
- **GET** `/suggestions` (search.routes.ts)

### /tags (3 endpoints)

- **GET** `/tags` (blog.routes.ts)
- **GET** `/tags/:tag/posts` (blog.routes.ts)
- **GET** `/tags/:tags` (faq.routes.ts)

### /track (3 endpoints)

- **POST** `/track` (analytics.routes.ts)
- **GET** `/track` (order.routes.ts)
- **POST** `/track/:id` (social-link.routes.ts)

### /upcoming (3 endpoints)

- **GET** `/upcoming` (deal.routes.ts)
- **GET** `/upcoming` (new-arrival.routes.ts)
- **GET** `/upcoming` (sale.routes.ts)

### /wishlist (3 endpoints)

- **GET** `/wishlist` (user.routes.ts)
- **POST** `/wishlist/:productId` (user.routes.ts)
- **DELETE** `/wishlist/:productId` (user.routes.ts)

### /zones (3 endpoints)

- **GET** `/zones` (shipping.routes.ts)
- **GET** `/zones/:id` (shipping.routes.ts)
- **GET** `/zones/:zoneId/methods` (shipping.routes.ts)

### /:orderId (2 endpoints)

- **POST** `/:orderId/refund` (payment.routes.ts)
- **GET** `/:orderId/status` (payment.routes.ts)

### /:searchId (2 endpoints)

- **POST** `/:searchId/click` (search.routes.ts)
- **POST** `/:searchId/selection` (search.routes.ts)

### /:slug (2 endpoints)

- **GET** `/:slug` (category.routes.ts)
- **GET** `/:slug` (product.routes.ts)

### /brand (2 endpoints)

- **GET** `/brand/:brandId` (bestseller.routes.ts)
- **GET** `/brand/:brandId` (new-arrival.routes.ts)

### /clear (2 endpoints)

- **DELETE** `/clear` (cart.routes.ts)
- **DELETE** `/clear` (wishlist.routes.ts)

### /company (2 endpoints)

- **GET** `/company` (about.routes.ts)
- **PUT** `/company` (about.routes.ts)

### /config (2 endpoints)

- **GET** `/config` (upload.routes.ts)
- **PATCH** `/config` (upload.routes.ts)

### /dashboard (2 endpoints)

- **GET** `/dashboard` (analytics.routes.ts)
- **GET** `/dashboard/stats` (admin.routes.ts)

### /import (2 endpoints)

- **POST** `/import` (settings.routes.ts)
- **POST** `/import` (wishlist.routes.ts)

### /maintenance (2 endpoints)

- **GET** `/maintenance` (site-config.routes.ts)
- **PATCH** `/maintenance/toggle` (site-config.routes.ts)

### /moderation (2 endpoints)

- **GET** `/moderation/queue` (review-media.routes.ts)
- **GET** `/moderation/queue` (review-reply.routes.ts)

### /movements (2 endpoints)

- **GET** `/movements` (inventory.routes.ts)
- **GET** `/movements/:id` (inventory.routes.ts)

### /my (2 endpoints)

- **GET** `/my/orders` (order.routes.ts)
- **GET** `/my/reviews` (review.routes.ts)

### /payment (2 endpoints)

- **GET** `/payment` (site-config.routes.ts)
- **PATCH** `/payment/update` (site-config.routes.ts)

### /placement (2 endpoints)

- **GET** `/placement/:page` (favorite-section.routes.ts)
- **GET** `/placement/:placement` (featured-content.routes.ts)

### /purchase (2 endpoints)

- **POST** `/purchase` (analytics.routes.ts)
- **POST** `/purchase` (giftcard.routes.ts)

### /recommendations (2 endpoints)

- **GET** `/recommendations` (cart.routes.ts)
- **GET** `/recommendations` (wishlist.routes.ts)

### /remove (2 endpoints)

- **DELETE** `/remove/:itemId` (wishlist.routes.ts)
- **DELETE** `/remove/:orderId` (coupon.routes.ts)

### /seo (2 endpoints)

- **GET** `/seo` (site-config.routes.ts)
- **PATCH** `/seo/update` (site-config.routes.ts)

### /shared (2 endpoints)

- **GET** `/shared/:shareCode` (wishlist.routes.ts)
- **GET** `/shared/:token` (productComparison.routes.ts)

### /sitemap (2 endpoints)

- **GET** `/sitemap` (brand.routes.ts)
- **GET** `/sitemap` (cms.routes.ts)

### /social (2 endpoints)

- **GET** `/social` (site-config.routes.ts)
- **PATCH** `/social/update` (site-config.routes.ts)

### /statistics (2 endpoints)

- **GET** `/statistics` (inventory.routes.ts)
- **GET** `/statistics` (upload.routes.ts)

### /subscribe (2 endpoints)

- **POST** `/subscribe` (newsletter.routes.ts)
- **POST** `/subscribe` (notification.routes.ts)

### /theme (2 endpoints)

- **GET** `/theme` (site-config.routes.ts)
- **PATCH** `/theme/update` (site-config.routes.ts)

### /trending (2 endpoints)

- **GET** `/trending` (new-arrival.routes.ts)
- **GET** `/trending` (search.routes.ts)

### /trends (2 endpoints)

- **GET** `/trends` (bestseller.routes.ts)
- **GET** `/trends` (productComparison.routes.ts)

### /unsubscribe (2 endpoints)

- **POST** `/unsubscribe` (notification.routes.ts)
- **POST** `/unsubscribe/:token` (newsletter.routes.ts)

### /user (2 endpoints)

- **GET** `/user/:userId` (coupon.routes.ts)
- **GET** `/user/:userId` (giftcard.routes.ts)

### /verify (2 endpoints)

- **POST** `/verify/:id` (social-link.routes.ts)
- **GET** `/verify/:token` (newsletter.routes.ts)

### /:cardId (1 endpoints)

- **GET** `/:cardId/transactions` (giftcard.routes.ts)

### /:identifier (1 endpoints)

- **GET** `/:identifier` (favorite-section.routes.ts)

### /:section (1 endpoints)

- **PATCH** `/:section` (site-config.routes.ts)

### /activate-scheduled (1 endpoints)

- **POST** `/activate-scheduled` (sale.routes.ts)

### /add (1 endpoints)

- **POST** `/add` (wishlist.routes.ts)

### /add-to-cart (1 endpoints)

- **POST** `/add-to-cart` (analytics.routes.ts)

### /apply (1 endpoints)

- **POST** `/apply` (coupon.routes.ts)

### /authors (1 endpoints)

- **GET** `/authors/:authorId/posts` (blog.routes.ts)

### /balance (1 endpoints)

- **GET** `/balance/:code` (giftcard.routes.ts)

### /batch-track (1 endpoints)

- **POST** `/batch-track` (analytics.routes.ts)

### /bulk-moderate (1 endpoints)

- **POST** `/bulk-moderate` (review-media.routes.ts)

### /bulk-move (1 endpoints)

- **POST** `/bulk-move` (upload.routes.ts)

### /bulk-optimize (1 endpoints)

- **POST** `/bulk-optimize` (review-media.routes.ts)

### /bulk-status (1 endpoints)

- **POST** `/bulk-status` (announcement.routes.ts)

### /bulk-toggle-active (1 endpoints)

- **PATCH** `/bulk-toggle-active` (coupon.routes.ts)

### /by-location (1 endpoints)

- **GET** `/by-location` (address.routes.ts)

### /calculate-discount (1 endpoints)

- **POST** `/calculate-discount` (deal.routes.ts)

### /calculate-rates (1 endpoints)

- **POST** `/calculate-rates` (shipping.routes.ts)

### /category-analytics (1 endpoints)

- **GET** `/category-analytics` (analytics.routes.ts)

### /check-eligibility (1 endpoints)

- **GET** `/check-eligibility/:productId` (deal.routes.ts)

### /check (1 endpoints)

- **GET** `/check/:productId` (wishlist.routes.ts)

### /code (1 endpoints)

- **GET** `/code/:code` (coupon.routes.ts)

### /conversion-funnel (1 endpoints)

- **GET** `/conversion-funnel` (analytics.routes.ts)

### /count (1 endpoints)

- **GET** `/count` (wishlist.routes.ts)

### /default (1 endpoints)

- **GET** `/default` (address.routes.ts)

### /delete-me (1 endpoints)

- **DELETE** `/delete-me` (user.routes.ts)

### /designs (1 endpoints)

- **GET** `/designs` (giftcard.routes.ts)

### /events (1 endpoints)

- **POST** `/events` (analytics.routes.ts)

### /expire-old (1 endpoints)

- **POST** `/expire-old` (new-arrival.routes.ts)

### /facebook (1 endpoints)

- **POST** `/facebook` (auth.routes.ts)

### /flash-sales (1 endpoints)

- **GET** `/flash-sales` (deal.routes.ts)

### /forgot-password (1 endpoints)

- **POST** `/forgot-password` (auth.routes.ts)

### /from-url (1 endpoints)

- **POST** `/from-url` (upload.routes.ts)

### /google (1 endpoints)

- **POST** `/google` (auth.routes.ts)

### /group-by-city (1 endpoints)

- **GET** `/group-by-city` (address.routes.ts)

### /id (1 endpoints)

- **GET** `/id/:id` (product.routes.ts)

### /initialize (1 endpoints)

- **POST** `/initialize` (settings.routes.ts)

### /location (1 endpoints)

- **GET** `/location/:location` (social-link.routes.ts)

### /login (1 endpoints)

- **POST** `/login` (auth.routes.ts)

### /logout (1 endpoints)

- **POST** `/logout` (auth.routes.ts)

### /market-share (1 endpoints)

- **GET** `/market-share` (brand.routes.ts)

### /me (1 endpoints)

- **GET** `/me` (user.routes.ts)

### /most-used (1 endpoints)

- **GET** `/most-used` (address.routes.ts)

### /multiple (1 endpoints)

- **POST** `/multiple` (upload.routes.ts)

### /nearby (1 endpoints)

- **GET** `/nearby` (location.routes.ts)

### /page-view (1 endpoints)

- **POST** `/page-view` (analytics.routes.ts)

### /page (1 endpoints)

- **GET** `/page/:page` (announcement.routes.ts)

### /performance (1 endpoints)

- **GET** `/performance` (brand.routes.ts)

### /platform (1 endpoints)

- **GET** `/platform/:platform` (social-link.routes.ts)

### /priority (1 endpoints)

- **GET** `/priority` (new-arrival.routes.ts)

### /process-pending (1 endpoints)

- **POST** `/process-pending` (notification.routes.ts)

### /process-scheduled (1 endpoints)

- **POST** `/process-scheduled` (notification.routes.ts)

### /product-performance (1 endpoints)

- **GET** `/product-performance` (analytics.routes.ts)

### /product-view (1 endpoints)

- **POST** `/product-view` (analytics.routes.ts)

### /product (1 endpoints)

- **GET** `/product/:productId` (sale.routes.ts)

### /quick-add (1 endpoints)

- **POST** `/quick-add` (cart.routes.ts)

### /read-all (1 endpoints)

- **PATCH** `/read-all` (notification.routes.ts)

### /realtime (1 endpoints)

- **GET** `/realtime` (analytics.routes.ts)

### /recent (1 endpoints)

- **GET** `/recent` (upload.routes.ts)

### /redeem (1 endpoints)

- **POST** `/redeem` (giftcard.routes.ts)

### /referral (1 endpoints)

- **POST** `/referral/generate` (coupon.routes.ts)

### /refresh-all (1 endpoints)

- **POST** `/refresh-all` (collection.routes.ts)

### /register (1 endpoints)

- **POST** `/register` (auth.routes.ts)

### /related (1 endpoints)

- **GET** `/related/:query` (search.routes.ts)

### /reset-analytics (1 endpoints)

- **POST** `/reset-analytics/:id` (social-link.routes.ts)

### /reset-password (1 endpoints)

- **POST** `/reset-password` (auth.routes.ts)

### /revenue-analytics (1 endpoints)

- **GET** `/revenue-analytics` (analytics.routes.ts)

### /review (1 endpoints)

- **GET** `/review/:reviewId` (review-reply.routes.ts)

### /save (1 endpoints)

- **POST** `/save` (cart.routes.ts)

### /schedule (1 endpoints)

- **POST** `/schedule` (notification.routes.ts)

### /scheduled (1 endpoints)

- **GET** `/scheduled` (announcement.routes.ts)

### /search-analytics (1 endpoints)

- **GET** `/search-analytics` (analytics.routes.ts)

### /send (1 endpoints)

- **POST** `/send` (notification.routes.ts)

### /send-multiple (1 endpoints)

- **POST** `/send-multiple` (notification.routes.ts)

### /send-notification (1 endpoints)

- **POST** `/send-notification` (notification.routes.ts)

### /session-analytics (1 endpoints)

- **GET** `/session-analytics` (analytics.routes.ts)

### /share (1 endpoints)

- **POST** `/share` (wishlist.routes.ts)

### /status (1 endpoints)

- **GET** `/status/:email` (newsletter.routes.ts)

### /stock (1 endpoints)

- **POST** `/stock/transfer` (inventory.routes.ts)

### /storage-usage (1 endpoints)

- **GET** `/storage-usage` (upload.routes.ts)

### /sync (1 endpoints)

- **POST** `/sync` (bestseller.routes.ts)

### /sync-guest (1 endpoints)

- **POST** `/sync-guest` (cart.routes.ts)

### /system-analytics (1 endpoints)

- **GET** `/system-analytics` (analytics.routes.ts)

### /system (1 endpoints)

- **POST** `/system/update-statuses` (deal.routes.ts)

### /test-upload (1 endpoints)

- **POST** `/test-upload` (test.routes.ts)

### /thread (1 endpoints)

- **GET** `/thread/:threadId` (review-reply.routes.ts)

### /toggle (1 endpoints)

- **POST** `/toggle` (wishlist.routes.ts)

### /top (1 endpoints)

- **GET** `/top` (review-reply.routes.ts)

### /topic (1 endpoints)

- **POST** `/topic` (notification.routes.ts)

### /turnover-analysis (1 endpoints)

- **GET** `/turnover-analysis` (inventory.routes.ts)

### /type (1 endpoints)

- **GET** `/type/:type` (sale.routes.ts)

### /unread-count (1 endpoints)

- **GET** `/unread-count` (notification.routes.ts)

### /unused (1 endpoints)

- **GET** `/unused` (media-asset.routes.ts)

### /update-me (1 endpoints)

- **PATCH** `/update-me` (user.routes.ts)

### /update-order (1 endpoints)

- **PATCH** `/update-order` (new-arrival.routes.ts)

### /update-password (1 endpoints)

- **PATCH** `/update-password` (auth.routes.ts)

### /update-ranks (1 endpoints)

- **PATCH** `/update-ranks` (bestseller.routes.ts)

### /user-behavior (1 endpoints)

- **GET** `/user-behavior` (analytics.routes.ts)

### /user-journey (1 endpoints)

- **GET** `/user-journey` (analytics.routes.ts)

### /validate-rules (1 endpoints)

- **POST** `/validate-rules` (collection.routes.ts)

### /verify-all (1 endpoints)

- **POST** `/verify-all` (social-link.routes.ts)

### /verify-email (1 endpoints)

- **GET** `/verify-email/:token` (auth.routes.ts)

### /verify-payment (1 endpoints)

- **POST** `/verify-payment` (giftcard.routes.ts)

