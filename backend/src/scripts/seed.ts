import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { IUser } from '../models/User.model.js';
import Category, { ICategory } from '../models/Category.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import Settings from '../models/Settings.model.js';
import Brand from '../models/brand.model.js';
import Coupon from '../models/Coupon.model.js';
import Deal from '../models/Deal.model.js';
import Review from '../models/Review.model.js';
import Wishlist from '../models/Wishlist.model.js';
import Cart from '../models/Cart.model.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.model.js';
import BlogCategory from '../models/BlogCategory.model.js';
import BlogPost from '../models/BlogPost.model.js';
import BlogComment from '../models/BlogComment.model.js';
import FAQ from '../models/FAQ.model.js';
import { CompanyInfo, HistoryEntry, TeamMember, Award, CompanyLocation, CompanyStats } from '../models/about.model.js';
import Announcement from '../models/Announcement.model.js';
import Bestseller from '../models/bestseller.model.js';
import Collection from '../models/collection.model.js';
import FavoriteSection from '../models/favorite-section.model.js';
import FeaturedContent from '../models/featured-content.model.js';
import GiftCard from '../models/GiftCard.model.js';
import HeroSection from '../models/hero-section.model.js';
import { InventoryItem, StockMovement, Warehouse, InventoryAlert } from '../models/inventory.model.js';
import { Location, Region } from '../models/location.model.js';
import Logo from '../models/Logo.model.js';
import MediaAsset from '../models/media-asset.model.js';
import NewArrival from '../models/new-arrival.model.js';
import Notification from '../models/Notification.model.js';
import NotificationTemplate from '../models/NotificationTemplate.model.js';
import NotificationPreference from '../models/NotificationPreference.model.js';
import ProductComparison from '../models/ProductComparison.model.js';
import Sale from '../models/Sale.model.js';
import SearchQuery from '../models/SearchQuery.model.js';
import { ShippingZone, ShippingMethod } from '../models/ShippingZone.model.js';
import SiteConfig from '../models/site-config.model.js';
import SocialLink from '../models/social-link.model.js';
import SupportTicket from '../models/SupportTicket.model.js';
import { SEOSettings, PageSEO, MetaTag, RedirectRule, SchemaMarkup, SEOAudit, Sitemap } from '../models/seo.model.js';
import { ReviewMedia } from '../models/review-media.model.js';
import { ReviewReply } from '../models/review-reply.model.js';
import AnalyticsEvent from '../models/AnalyticsEvent.model.js';
import Banner from '../models/banner.model.js';
import BannerGroup from '../models/banner-group.model.js';
import Address from '../models/Address.model.js';
import { FileUpload, UploadFolder } from '../models/upload.model.js';
import CMSMenu from '../models/cms-menu.model.js';
import CMSPage from '../models/cms-page.model.js';
import CMSSettings from '../models/cms-settings.model.js';
import CMSTemplate from '../models/cms-template.model.js';
import CMSWidget from '../models/cms-widget.model.js';
import Loyalty from '../models/loyalty.model.js';
import Refund from '../models/refund.model.js';
import slugify from 'slugify';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Create indexes first
    await createIndexes();

    // Clear existing data (only if not in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🗑️  Clearing existing data...');
      await clearAllCollections();
    }

    console.log('🌱 Creating comprehensive seed data...\n');

    // Create users (must be first - referenced by many other models)
    const users = await createUsers();
    console.log(`✅ Created ${users.length} users`);

    // Create brands
    const brands = await createBrands();
    console.log(`✅ Created ${brands.length} brands`);

    // Create categories
    const categories = await createCategories();
    console.log(`✅ Created ${categories.length} categories`);

    // Create products (depends on categories and brands)
    const products = await createProducts(categories, brands);
    console.log(`✅ Created ${products.length} products`);

    // Create collections
    const collections = await createCollections(users, products);
    console.log(`✅ Created ${collections.length} collections`);

    // Create deals
    const deals = await createDeals(users, products, categories, brands);
    console.log(`✅ Created ${deals.length} deals`);

    // Create coupons
    const coupons = await createCoupons(users, products, categories);
    console.log(`✅ Created ${coupons.length} coupons`);

    // Create sales
    const sales = await createSales(users, products, categories);
    console.log(`✅ Created ${sales.length} sales`);

    // Create reviews
    const reviews = await createReviews(users, products);
    console.log(`✅ Created ${reviews.length} reviews`);

    // Create inventory records
    const inventory = await createInventory(products);
    console.log(`✅ Created ${inventory.length} inventory records`);

    // Create carts
    const carts = await createCarts(users, products);
    console.log(`✅ Created ${carts.length} carts`);

    // Create wishlists
    const wishlists = await createWishlists(users, products);
    console.log(`✅ Created ${wishlists.length} wishlists`);

    // Create sample orders
    const orders = await createSampleOrders(users.slice(1), products);
    console.log(`✅ Created ${orders.length} sample orders`);

    // Create loyalty accounts
    const loyaltyAccounts = await createLoyaltyAccounts(users);
    console.log(`✅ Created ${loyaltyAccounts.length} loyalty accounts`);

    // Create refunds
    const refunds = await createRefunds(users, orders);
    console.log(`✅ Created ${refunds.length} refunds`);

    // Create shipping zones
    const shippingZones = await createShippingZones();
    console.log(`✅ Created ${shippingZones.length} shipping zones`);

    // Create gift cards
    const giftCards = await createGiftCards(users);
    console.log(`✅ Created ${giftCards.length} gift cards`);

    // Create blog categories and posts
    const blogCategories = await createBlogCategories();
    console.log(`✅ Created ${blogCategories.length} blog categories`);
    const blogPosts = await createBlogPosts(users, blogCategories);
    console.log(`✅ Created ${blogPosts.length} blog posts`);

    // Create FAQs
    const faqs = await createFAQs(users);
    console.log(`✅ Created ${faqs.length} FAQs`);

    // Create About page
    const about = await createAbout();
    console.log(`✅ Created about page`);

    // Create announcements
    const announcements = await createAnnouncements(users);
    console.log(`✅ Created ${announcements.length} announcements`);

    // Create hero sections
    const heroSections = await createHeroSections(users, products);
    console.log(`✅ Created ${heroSections.length} hero sections`);

    // Create bestsellers
    const bestsellers = await createBestsellers(products);
    console.log(`✅ Created ${bestsellers.length} bestsellers`);

    // Create new arrivals
    const newArrivals = await createNewArrivals(products);
    console.log(`✅ Created ${newArrivals.length} new arrivals`);

    // Create featured content
    const featuredContent = await createFeaturedContent(users, products, collections);
    console.log(`✅ Created ${featuredContent.length} featured content items`);

    // Create favorite sections
    const favoriteSections = await createFavoriteSections(users, products);
    console.log(`✅ Created ${favoriteSections.length} favorite sections`);

    // Create locations
    const locations = await createLocations(users);
    console.log(`✅ Created ${locations.length} locations`);

    // Create regions
    const regions = await createRegions(users);
    console.log(`✅ Created ${regions.length} regions`);

    // Create logos
    const logos = await createLogos(users);
    console.log(`✅ Created ${logos.length} logos`);

    // Create media assets
    const mediaAssets = await createMediaAssets(users);
    console.log(`✅ Created ${mediaAssets.length} media assets`);

    // Create newsletter subscribers
    const newsletterSubs = await createNewsletterSubscribers();
    console.log(`✅ Created ${newsletterSubs.length} newsletter subscribers`);

    // Create notifications (with order data for realistic notifications)
    const notifications = await createNotifications(users, orders);
    console.log(`✅ Created ${notifications.length} notifications`);

    // Create notification templates
    const notificationTemplates = await createNotificationTemplates();
    console.log(`✅ Created ${notificationTemplates.length} notification templates`);

    // Create product comparisons
    const comparisons = await createProductComparisons(users, products);
    console.log(`✅ Created ${comparisons.length} product comparisons`);

    // Create search queries
    const searchQueries = await createSearchQueries(users, products);
    console.log(`✅ Created ${searchQueries.length} search queries`);

    // Create site config
    const siteConfig = await createSiteConfig();
    console.log(`✅ Created site configuration`);

    // Create social links
    const socialLinks = await createSocialLinks();
    console.log(`✅ Created ${socialLinks.length} social links`);

    // Create support tickets
    const supportTickets = await createSupportTickets(users);
    console.log(`✅ Created ${supportTickets.length} support tickets`);

    // Create blog comments
    const blogComments = await createBlogComments(users, blogPosts);
    console.log(`✅ Created ${blogComments.length} blog comments`);

    // Create notification preferences
    const notificationPrefs = await createNotificationPreferences(users);
    console.log(`✅ Created ${notificationPrefs.length} notification preferences`);

    // Create review media
    const reviewMedia = await createReviewMedia(users, products, reviews);
    console.log(`✅ Created ${reviewMedia.length} review media items`);

    // Create review replies
    const reviewReplies = await createReviewReplies(users, products, reviews);
    console.log(`✅ Created ${reviewReplies.length} review replies`);

    // Create analytics events (with comparison and product data)
    const analyticsEvents = await createAnalyticsEvents(users, comparisons, products);
    console.log(`✅ Created ${analyticsEvents.length} analytics events`);

    // Create banners and banner groups
    const bannerGroups = await createBannerGroups(users);
    console.log(`✅ Created ${bannerGroups.length} banner groups`);
    const banners = await createBanners(users, bannerGroups, products);
    console.log(`✅ Created ${banners.length} banners`);

    // Create SEO content
    const seoSettings = await createSEOSettings();
    console.log(`✅ Created SEO settings`);
    const pageSEOs = await createPageSEOs();
    console.log(`✅ Created ${pageSEOs.length} page SEO records`);
    const metaTags = await createMetaTags();
    console.log(`✅ Created ${metaTags.length} meta tags`);
    const redirectRules = await createRedirectRules();
    console.log(`✅ Created ${redirectRules.length} redirect rules`);
    const schemaMarkups = await createSchemaMarkups();
    console.log(`✅ Created ${schemaMarkups.length} schema markups`);
    const seoAudits = await createSEOAudits();
    console.log(`✅ Created ${seoAudits.length} SEO audits`);
    const sitemaps = await createSitemaps();
    console.log(`✅ Created ${sitemaps.length} sitemaps`);

    // Create About/Company content
    const companyInfo = await createCompanyInfo();
    console.log(`✅ Created company information`);
    const historyEntries = await createHistoryEntries();
    console.log(`✅ Created ${historyEntries.length} history entries`);
    const teamMembers = await createTeamMembers(users);
    console.log(`✅ Created ${teamMembers.length} team members`);
    const awards = await createAwards(users);
    console.log(`✅ Created ${awards.length} awards`);
    const companyLocations = await createCompanyLocations(users);
    console.log(`✅ Created ${companyLocations.length} company locations`);
    const companyStats = await createCompanyStats();
    console.log(`✅ Created company statistics`);

    // Create Inventory/Warehouse content
    const warehouses = await createWarehouses(users);
    console.log(`✅ Created ${warehouses.length} warehouses`);
    const stockMovements = await createStockMovements(users, products, warehouses, inventory);
    console.log(`✅ Created ${stockMovements.length} stock movements`);
    const inventoryAlerts = await createInventoryAlerts(users, products, warehouses, inventory);
    console.log(`✅ Created ${inventoryAlerts.length} inventory alerts`);
    const shippingMethods = await createShippingMethods(shippingZones);
    console.log(`✅ Created ${shippingMethods.length} shipping methods`);

    // Create upload folders
    const uploadFolders = await createUploadFolders(users);
    console.log(`✅ Created ${uploadFolders.length} upload folders`);

    // Create addresses
    const addresses = await createAddresses(users);
    console.log(`✅ Created ${addresses.length} addresses`);

    // Create uploads
    const uploads = await createUploads(users);
    console.log(`✅ Created ${uploads.length} uploads`);

    // Create CMS content
    const cmsSettings = await createCMSSettings(users);
    console.log(`✅ Created CMS settings`);
    const cmsMenus = await createCMSMenus(users);
    console.log(`✅ Created ${cmsMenus.length} CMS menus`);
    const cmsTemplates = await createCMSTemplates(users);
    console.log(`✅ Created ${cmsTemplates.length} CMS templates`);
    const cmsPages = await createCMSPages(users, cmsTemplates);
    console.log(`✅ Created ${cmsPages.length} CMS pages`);
    const cmsWidgets = await createCMSWidgets(users);
    console.log(`✅ Created ${cmsWidgets.length} CMS widgets`);

    // Create default settings (must be last)
    const settings = await createDefaultSettings();
    console.log(`✅ Created ${settings.length} default settings`);

    console.log('\n🎉 ========================================');
    console.log('   SEED DATA CREATED SUCCESSFULLY!');
    console.log('========================================');
    console.log('\n📧 Admin User: admin@vardhmanmills.com');
    console.log('🔐 Password: Admin@123');
    console.log('\n� Test User 1: john@example.com');
    console.log('🔐 Password: User@123');
    console.log('\n📧 Test User 2: jane@example.com');
    console.log('🔐 Password: User@123');
    console.log('\n📊 DATABASE SUMMARY:');
    console.log('========================================');
    console.log(`✅ Users: ${users.length}`);
    console.log(`✅ Brands: ${brands.length}`);
    console.log(`✅ Categories: ${categories.length}`);
    console.log(`✅ Products: ${products.length}`);
    console.log(`✅ Collections: ${collections.length}`);
    console.log(`✅ Deals: ${deals.length}`);
    console.log(`✅ Coupons: ${coupons.length}`);
    console.log(`✅ Sales: ${sales.length}`);
    console.log(`✅ Reviews: ${reviews.length}`);
    console.log(`✅ Inventory: ${inventory.length}`);
    console.log(`✅ Carts: ${carts.length}`);
    console.log(`✅ Wishlists: ${wishlists.length}`);
    console.log(`✅ Orders: ${orders.length}`);
    console.log(`✅ Loyalty Accounts: ${loyaltyAccounts.length}`);
    console.log(`✅ Refunds: ${refunds.length}`);
    console.log(`✅ Shipping Zones: ${shippingZones.length}`);
    console.log(`✅ Gift Cards: ${giftCards.length}`);
    console.log(`✅ Blog Categories: ${blogCategories.length}`);
    console.log(`✅ Blog Posts: ${blogPosts.length}`);
    console.log(`✅ FAQs: ${faqs.length}`);
    console.log(`✅ Announcements: ${announcements.length}`);
    console.log(`✅ Hero Sections: ${heroSections.length}`);
    console.log(`✅ Bestsellers: ${bestsellers.length}`);
    console.log(`✅ New Arrivals: ${newArrivals.length}`);
    console.log(`✅ Featured Content: ${featuredContent.length}`);
    console.log(`✅ Favorite Sections: ${favoriteSections.length}`);
    console.log(`✅ Locations: ${locations.length}`);
    console.log(`✅ Regions: ${regions.length}`);
    console.log(`✅ Logos: ${logos.length}`);
    console.log(`✅ Media Assets: ${mediaAssets.length}`);
    console.log(`✅ Newsletter Subscribers: ${newsletterSubs.length}`);
    console.log(`✅ Notifications: ${notifications.length}`);
    console.log(`✅ Notification Templates: ${notificationTemplates.length}`);
    console.log(`✅ Product Comparisons: ${comparisons.length}`);
    console.log(`✅ Search Queries: ${searchQueries.length}`);
    console.log(`✅ Social Links: ${socialLinks.length}`);
    console.log(`✅ Support Tickets: ${supportTickets.length}`);
    console.log(`✅ Blog Comments: ${blogComments.length}`);
    console.log(`✅ Notification Preferences: ${notificationPrefs.length}`);
    console.log(`✅ Review Media: ${reviewMedia.length}`);
    console.log(`✅ Review Replies: ${reviewReplies.length}`);
    console.log(`✅ Analytics Events: ${analyticsEvents.length}`);
    console.log(`✅ Banner Groups: ${bannerGroups.length}`);
    console.log(`✅ Banners: ${banners.length}`);
    console.log(`✅ SEO Settings: 1`);
    console.log(`✅ Page SEOs: ${pageSEOs.length}`);
    console.log(`✅ Meta Tags: ${metaTags.length}`);
    console.log(`✅ Redirect Rules: ${redirectRules.length}`);
    console.log(`✅ Schema Markups: ${schemaMarkups.length}`);
    console.log(`✅ SEO Audits: ${seoAudits.length}`);
    console.log(`✅ Sitemaps: ${sitemaps.length}`);
    console.log(`✅ Company Info: 1`);
    console.log(`✅ History Entries: ${historyEntries.length}`);
    console.log(`✅ Team Members: ${teamMembers.length}`);
    console.log(`✅ Awards: ${awards.length}`);
    console.log(`✅ Company Locations: ${companyLocations.length}`);
    console.log(`✅ Company Stats: 1`);
    console.log(`✅ Warehouses: ${warehouses.length}`);
    console.log(`✅ Stock Movements: ${stockMovements.length}`);
    console.log(`✅ Inventory Alerts: ${inventoryAlerts.length}`);
    console.log(`✅ Shipping Methods: ${shippingMethods.length}`);
    console.log(`✅ Upload Folders: ${uploadFolders.length}`);
    console.log(`✅ Addresses: ${addresses.length}`);
    console.log(`✅ Uploads: ${uploads.length}`);
    console.log(`✅ CMS Settings: 1`);
    console.log(`✅ CMS Menus: ${cmsMenus.length}`);
    console.log(`✅ CMS Templates: ${cmsTemplates.length}`);
    console.log(`✅ CMS Pages: ${cmsPages.length}`);
    console.log(`✅ CMS Widgets: ${cmsWidgets.length}`);
    console.log(`✅ Settings: ${settings.length}`);
    console.log('========================================\n');
    
    console.log('💡 TIP: ALL collections have been fully populated!');
    console.log('📦 SEO Extended: MetaTags, Redirects, SchemaMarkup, SEOAudits, Sitemaps');
    console.log('🏢 About/Company: CompanyInfo, HistoryEntries, TeamMembers, Awards, CompanyLocations, CompanyStats');
    console.log('📦 Inventory/Warehouse: Warehouses, StockMovements, InventoryAlerts, ShippingMethods');
    console.log('🌍 Regions: India, Maharashtra, Delhi NCR, Karnataka');
    console.log('📁 Uploads: UploadFolders');
    console.log('💳 Payment Methods: Users now have card/UPI/netbanking options\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

const clearAllCollections = async () => {
  await User.deleteMany({});
  await Brand.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Collection.deleteMany({});
  await Deal.deleteMany({});
  await Coupon.deleteMany({});
  await Sale.deleteMany({});
  await Review.deleteMany({});
  await InventoryItem.deleteMany({});
  await StockMovement.deleteMany({});
  await Warehouse.deleteMany({});
  await InventoryAlert.deleteMany({});
  await Cart.deleteMany({});
  await Wishlist.deleteMany({});
  await Order.deleteMany({});
  await Loyalty.deleteMany({});
  await Refund.deleteMany({});
  await ShippingZone.deleteMany({});
  await ShippingMethod.deleteMany({});
  await GiftCard.deleteMany({});
  await BlogCategory.deleteMany({});
  await BlogPost.deleteMany({});
  await BlogComment.deleteMany({});
  await FAQ.deleteMany({});
  await CompanyInfo.deleteMany({});
  await HistoryEntry.deleteMany({});
  await TeamMember.deleteMany({});
  await Award.deleteMany({});
  await CompanyLocation.deleteMany({});
  await CompanyStats.deleteMany({});
  await Announcement.deleteMany({});
  await HeroSection.deleteMany({});
  await Bestseller.deleteMany({});
  await NewArrival.deleteMany({});
  await FeaturedContent.deleteMany({});
  await FavoriteSection.deleteMany({});
  await Location.deleteMany({});
  await Region.deleteMany({});
  await Logo.deleteMany({});
  await MediaAsset.deleteMany({});
  await NewsletterSubscriber.deleteMany({});
  await Notification.deleteMany({});
  await NotificationTemplate.deleteMany({});
  await NotificationPreference.deleteMany({});
  await ProductComparison.deleteMany({});
  await SearchQuery.deleteMany({});
  await SiteConfig.deleteMany({});
  await SocialLink.deleteMany({});
  await SupportTicket.deleteMany({});
  await ReviewMedia.deleteMany({});
  await ReviewReply.deleteMany({});
  await AnalyticsEvent.deleteMany({});
  await Banner.deleteMany({});
  await BannerGroup.deleteMany({});
  await SEOSettings.deleteMany({});
  await PageSEO.deleteMany({});
  await MetaTag.deleteMany({});
  await RedirectRule.deleteMany({});
  await SchemaMarkup.deleteMany({});
  await SEOAudit.deleteMany({});
  await Sitemap.deleteMany({});
  await Address.deleteMany({});
  await FileUpload.deleteMany({});
  await UploadFolder.deleteMany({});
  await CMSSettings.deleteMany({});
  await CMSMenu.deleteMany({});
  await CMSTemplate.deleteMany({});
  await CMSPage.deleteMany({});
  await CMSWidget.deleteMany({});
  await Settings.deleteMany({});
  console.log('✅ All collections cleared');
};

const createIndexes = async () => {
  try {
    // Indexes are already defined in the model schemas
    // This function is kept for compatibility but doesn't create duplicate indexes
    console.log('✅ Database indexes will be created automatically by Mongoose schemas');
  } catch (error) {
    console.log('⚠️  Index creation error:', (error as Error).message);
  }
};

const createUsers = async () => {
  const users = [
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@vardhmanmills.com',
      password: 'Admin@123',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      accountStatus: 'active',
      lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      addresses: [{
        type: 'work',
        firstName: 'Admin',
        lastName: 'User',
        addressLine1: 'Vardhman Mills Office',
        addressLine2: 'Industrial Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        mobile: '+91 9876543210',
        isDefault: true
      }],
      paymentMethods: [
        {
          type: 'card',
          card: {
            last4: '4242',
            brand: 'Visa',
            cardHolder: 'Admin User',
            expiryMonth: 12,
            expiryYear: 2026
          },
          isDefault: true,
          addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'upi',
          upi: {
            vpa: 'admin@paytm'
          },
          isDefault: false,
          addedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'User@123',
      role: 'user',
      mobile: '+91 9876543211',
      isEmailVerified: true,
      isActive: true,
      accountStatus: 'active',
      lastLoginAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      addresses: [{
        type: 'home',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main Street',
        addressLine2: 'Apartment 4B',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India',
        mobile: '+91 9876543211',
        isDefault: true
      }],
      paymentMethods: [
        {
          type: 'card',
          card: {
            last4: '1234',
            brand: 'Mastercard',
            cardHolder: 'John Doe',
            expiryMonth: 6,
            expiryYear: 2027
          },
          isDefault: true,
          addedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'upi',
          upi: {
            vpa: 'john@oksbi'
          },
          isDefault: false,
          addedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'netbanking',
          netbanking: {
            bank: 'HDFC Bank'
          },
          isDefault: false,
          addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: 'User@123',
      role: 'user',
      mobile: '+91 9876543212',
      isEmailVerified: true,
      isActive: true,
      accountStatus: 'active',
      lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      addresses: [{
        type: 'home',
        firstName: 'Jane',
        lastName: 'Smith',
        addressLine1: '456 Oak Avenue',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
        mobile: '+91 9876543212',
        isDefault: true
      }],
      paymentMethods: [
        {
          type: 'upi',
          upi: {
            vpa: 'jane@ybl'
          },
          isDefault: true,
          addedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
        }
      ]
    }
  ];

  // Use individual saves to trigger password hashing middleware
  const savedUsers = [];
  for (const userData of users) {
    const user = new User(userData);
    await user.save();
    savedUsers.push(user);
  }
  return savedUsers;
};

const createBrands = async () => {
  const brands = [
    {
      name: 'Vardhman Mills',
      slug: 'vardhman-mills',
      description: 'Premium textile manufacturer with over 50 years of excellence in quality fabrics',
      logo: 'https://via.placeholder.com/200x100?text=Vardhman+Mills',
      banner: 'https://via.placeholder.com/1200x400?text=Vardhman+Mills',
      website: 'https://vardhmanmills.com',
      establishedYear: 1965,
      country: 'India',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      productCount: 0,
      socialLinks: {
        facebook: 'https://facebook.com/vardhmanmills',
        instagram: 'https://instagram.com/vardhmanmills',
        twitter: 'https://twitter.com/vardhmanmills'
      }
    },
    {
      name: 'Royal Touch',
      slug: 'royal-touch',
      description: 'Luxury home textiles brand known for premium bedding and bath collections',
      logo: 'https://via.placeholder.com/200x100?text=Royal+Touch',
      establishedYear: 1985,
      country: 'India',
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
      productCount: 0
    },
    {
      name: 'ComfortCare',
      slug: 'comfortcare',
      description: 'Innovative comfort-focused textile solutions for modern homes',
      logo: 'https://via.placeholder.com/200x100?text=ComfortCare',
      establishedYear: 2005,
      country: 'India',
      isActive: true,
      isFeatured: false,
      sortOrder: 3,
      productCount: 0
    }
  ];

  return await Brand.insertMany(brands);
};

const createCategories = async () => {
  const categories = [
    {
      name: 'Bed Sheets',
      slug: 'bed-sheets',
      description: 'Premium quality bed sheets in various sizes and materials',
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Quilts & Comforters',
      slug: 'quilts-comforters',
      description: 'Comfortable quilts and comforters for all seasons',
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Pillows & Cushions',
      slug: 'pillows-cushions',
      description: 'Soft pillows and decorative cushions',
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'Towels',
      slug: 'towels',
      description: 'Absorbent and soft towels for bath and kitchen',
      isActive: true,
      sortOrder: 4
    },
    {
      name: 'Curtains & Drapes',
      slug: 'curtains-drapes',
      description: 'Beautiful curtains and drapes for home decoration',
      isActive: true,
      sortOrder: 5
    }
  ];

  // Create subcategories
  const mainCategories = await Category.insertMany(categories);
  
  const subcategories = [
    {
      name: 'Cotton Bed Sheets',
      slug: 'cotton-bed-sheets',
      description: '100% cotton bed sheets',
      parentCategory: mainCategories[0]._id,
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Satin Bed Sheets',
      slug: 'satin-bed-sheets',
      description: 'Silky smooth satin bed sheets',
      parentCategory: mainCategories[0]._id,
      isActive: true,
      sortOrder: 2
    }
  ];

  const subCats = await Category.insertMany(subcategories);
  return [...mainCategories, ...subCats];
};

const createProducts = async (categories: any[], brands: any[]) => {
  const bedSheetsCategory = categories.find((c: any) => c.slug === 'bed-sheets');
  const quiltsCategory = categories.find((c: any) => c.slug === 'quilts-comforters');
  const pillowsCategory = categories.find((c: any) => c.slug === 'pillows-cushions');
  const towelsCategory = categories.find((c: any) => c.slug === 'towels');

  if (!bedSheetsCategory || !quiltsCategory || !pillowsCategory || !towelsCategory) {
    throw new Error('Required categories not found');
  }

  const vardhmanBrand = brands.find((b: any) => b.slug === 'vardhman-mills');
  const royalTouchBrand = brands.find((b: any) => b.slug === 'royal-touch');
  const comfortCareBrand = brands.find((b: any) => b.slug === 'comfortcare');

  const products = [
    {
      name: 'Premium Cotton Bed Sheet Set',
      slug: 'premium-cotton-bed-sheet-set',
      description: 'Luxurious 300 thread count cotton bed sheet set with pillowcases. Made from finest quality cotton for ultimate comfort and durability. Perfect for year-round use with excellent breathability and softness.',
      shortDescription: 'Premium 300 thread count cotton bed sheet set',
      category: bedSheetsCategory._id,
      brand: vardhmanBrand?._id || 'Vardhman Mills',
      tags: ['cotton', 'premium', 'comfortable', 'breathable'],
      variants: [
        {
          size: 'Single',
          color: 'White',
          sku: 'VM-BS-001-S-W',
          price: 1999,
          comparePrice: 2499,
          stock: 50,
          images: ['https://via.placeholder.com/400x400?text=White+Single+Bed+Sheet'],
          isActive: true
        },
        {
          size: 'Double',
          color: 'White',
          sku: 'VM-BS-001-D-W',
          price: 2999,
          comparePrice: 3499,
          stock: 30,
          images: ['https://via.placeholder.com/400x400?text=White+Double+Bed+Sheet'],
          isActive: true
        },
        {
          size: 'Single',
          color: 'Blue',
          sku: 'VM-BS-001-S-B',
          price: 1999,
          comparePrice: 2499,
          stock: 35,
          images: ['https://via.placeholder.com/400x400?text=Blue+Single+Bed+Sheet'],
          isActive: true
        }
      ],
      images: ['https://via.placeholder.com/600x600?text=Cotton+Bed+Sheet'],
      specifications: new Map([
        ['Thread Count', '300'],
        ['Material', '100% Cotton'],
        ['Care', 'Machine Washable'],
        ['Package', 'Bed sheet + 2 Pillowcases'],
        ['Weave', 'Percale'],
        ['Origin', 'Made in India']
      ]),
      isActive: true,
      isFeatured: true,
      seoTitle: 'Premium Cotton Bed Sheet Set - 300 Thread Count',
      seoDescription: 'Buy premium 300 thread count cotton bed sheets. Soft, breathable, and durable. Available in multiple sizes and colors.'
    },
    {
      name: 'Luxury Satin Bed Sheet Set',
      slug: 'luxury-satin-bed-sheet-set',
      description: 'Silky smooth satin bed sheet set that provides ultimate luxury and comfort. The satin weave gives a lustrous finish and feels incredibly soft against the skin.',
      shortDescription: 'Luxury satin bed sheet set with silky finish',
      category: bedSheetsCategory._id,
      brand: royalTouchBrand?._id || 'Royal Touch',
      tags: ['satin', 'luxury', 'silky', 'smooth'],
      variants: [
        {
          size: 'Double',
          color: 'Champagne',
          sku: 'VM-BS-002-D-C',
          price: 3499,
          comparePrice: 4299,
          stock: 25,
          images: ['https://via.placeholder.com/400x400?text=Champagne+Satin+Bed+Sheet'],
          isActive: true
        },
        {
          size: 'King',
          color: 'Champagne',
          sku: 'VM-BS-002-K-C',
          price: 4499,
          comparePrice: 5299,
          stock: 15,
          images: ['https://via.placeholder.com/400x400?text=King+Champagne+Satin'],
          isActive: true
        }
      ],
      images: ['https://via.placeholder.com/600x600?text=Satin+Bed+Sheet'],
      specifications: new Map([
        ['Material', 'Satin Weave Polyester'],
        ['Care', 'Gentle Machine Wash'],
        ['Package', 'Bed sheet + 2 Pillowcases'],
        ['Finish', 'Lustrous Satin'],
        ['Origin', 'Made in India']
      ]),
      isActive: true,
      isFeatured: true
    },
    {
      name: 'All Season Microfiber Quilt',
      slug: 'all-season-microfiber-quilt',
      description: 'Versatile all-season quilt filled with premium microfiber. Lightweight yet warm, perfect for year-round comfort. Hypoallergenic and machine washable.',
      shortDescription: 'All-season microfiber quilt for year-round comfort',
      category: quiltsCategory._id,
      brand: comfortCareBrand?._id || 'ComfortCare',
      tags: ['microfiber', 'all-season', 'lightweight', 'hypoallergenic'],
      variants: [
        {
          size: 'Single',
          color: 'Cream',
          sku: 'VM-Q-001-S-C',
          price: 2299,
          comparePrice: 2799,
          stock: 40,
          images: ['https://via.placeholder.com/400x400?text=Cream+Single+Quilt'],
          isActive: true
        },
        {
          size: 'Double',
          color: 'Cream',
          sku: 'VM-Q-001-D-C',
          price: 3299,
          comparePrice: 3899,
          stock: 30,
          images: ['https://via.placeholder.com/400x400?text=Cream+Double+Quilt'],
          isActive: true
        }
      ],
      images: ['https://via.placeholder.com/600x600?text=Microfiber+Quilt'],
      specifications: new Map([
        ['Fill', 'Premium Microfiber'],
        ['Weight', '350 GSM'],
        ['Care', 'Machine Washable'],
        ['Season', 'All Season'],
        ['Features', 'Hypoallergenic']
      ]),
      isActive: true,
      isFeatured: false
    },
    {
      name: 'Memory Foam Pillow',
      slug: 'memory-foam-pillow',
      description: 'Ergonomic memory foam pillow that contours to your head and neck for optimal support. Helps maintain proper spinal alignment during sleep.',
      shortDescription: 'Ergonomic memory foam pillow for better sleep',
      category: pillowsCategory._id,
      brand: comfortCareBrand?._id || 'ComfortCare',
      tags: ['memory foam', 'ergonomic', 'support', 'comfort'],
      variants: [
        {
          size: 'Standard',
          color: 'White',
          sku: 'VM-P-001-ST-W',
          price: 1799,
          comparePrice: 2199,
          stock: 60,
          images: ['https://via.placeholder.com/400x400?text=Memory+Foam+Pillow'],
          isActive: true
        }
      ],
      images: ['https://via.placeholder.com/600x600?text=Memory+Foam+Pillow'],
      specifications: new Map([
        ['Fill', 'Memory Foam'],
        ['Cover', '100% Cotton'],
        ['Size', '24" x 16" x 5"'],
        ['Care', 'Spot Clean Only'],
        ['Warranty', '2 Years']
      ]),
      isActive: true,
      isFeatured: true
    },
    {
      name: 'Egyptian Cotton Bath Towel Set',
      slug: 'egyptian-cotton-bath-towel-set',
      description: 'Luxurious Egyptian cotton bath towel set. Ultra-absorbent and quick-drying with a plush feel. Set includes 2 bath towels, 2 hand towels, and 2 washcloths.',
      shortDescription: 'Luxurious Egyptian cotton towel set',
      category: towelsCategory._id,
      brand: royalTouchBrand?._id || 'Royal Touch',
      tags: ['egyptian cotton', 'luxury', 'absorbent', 'plush'],
      variants: [
        {
          color: 'Navy Blue',
          sku: 'VM-T-001-NB',
          price: 2499,
          comparePrice: 2999,
          stock: 35,
          images: ['https://via.placeholder.com/400x400?text=Navy+Blue+Towel+Set'],
          isActive: true
        },
        {
          color: 'Beige',
          sku: 'VM-T-001-BE',
          price: 2499,
          comparePrice: 2999,
          stock: 25,
          images: ['https://via.placeholder.com/400x400?text=Beige+Towel+Set'],
          isActive: true
        }
      ],
      images: ['https://via.placeholder.com/600x600?text=Egyptian+Cotton+Towels'],
      specifications: new Map([
        ['Material', '100% Egyptian Cotton'],
        ['Weight', '600 GSM'],
        ['Set Includes', '2 Bath + 2 Hand + 2 Wash'],
        ['Care', 'Machine Washable'],
        ['Origin', 'Made in India']
      ]),
      isActive: true,
      isFeatured: false
    }
  ];

  return await Product.insertMany(products);
};

const createSampleOrders = async (users: any[], products: any[]) => {
  const orders = [];
  
  for (let i = 0; i < 3; i++) {
    const user = users[i % users.length];
    const product = products[i % products.length];
    const variant = product.variants[0];
    
    const order = {
      orderNumber: `VM${Date.now()}${i}`,
      user: user._id,
      items: [{
        product: product._id,
        variant: variant._id,
        name: product.name,
        image: variant.images[0] || product.images[0],
        price: variant.price,
        quantity: Math.floor(Math.random() * 3) + 1,
        total: variant.price * (Math.floor(Math.random() * 3) + 1)
      }],
      subtotal: variant.price * (Math.floor(Math.random() * 3) + 1),
      shippingCost: 99,
      tax: Math.round((variant.price * 0.18) * 100) / 100,
      discount: 0,
      total: variant.price * (Math.floor(Math.random() * 3) + 1) + 99,
      status: ['pending', 'confirmed', 'processing'][Math.floor(Math.random() * 3)],
      paymentInfo: {
        method: Math.random() > 0.5 ? 'razorpay' : 'cod',
        status: 'pending'
      },
      shippingAddress: user.addresses[0],
      billingAddress: user.addresses[0]
    };
    
    orders.push(order);
  }
  
  return await Order.insertMany(orders);
};

// ============================================================================
// CREATE LOYALTY ACCOUNTS
// ============================================================================
const createLoyaltyAccounts = async (users: any[]) => {
  const loyaltyAccounts = [];
  
  // Skip admin user, create for regular users
  const regularUsers = users.slice(1); // Skip first user (admin)
  
  for (let i = 0; i < regularUsers.length; i++) {
    const user = regularUsers[i];
    
    // Generate different tier levels
    const tierLevels = ['bronze', 'silver', 'gold', 'platinum'];
    const currentTier = tierLevels[i % tierLevels.length];
    
    // Calculate points based on tier
    const tierPoints = {
      bronze: Math.floor(Math.random() * 900) + 100,
      silver: Math.floor(Math.random() * 3900) + 1100,
      gold: Math.floor(Math.random() * 9900) + 5100,
      platinum: Math.floor(Math.random() * 20000) + 15100
    };
    
    const lifetimePoints = tierPoints[currentTier as keyof typeof tierPoints];
    const currentBalance = Math.floor(lifetimePoints * 0.7); // 70% of lifetime points available
    
    // Create some transaction history
    const transactions = [];
    const transactionTypes = ['earn', 'redeem'];
    const sources = ['purchase', 'review', 'referral', 'signup', 'birthday'];
    
    for (let j = 0; j < 5; j++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const points = type === 'earn' ? Math.floor(Math.random() * 500) + 50 : -(Math.floor(Math.random() * 300) + 50);
      
      transactions.push({
        type,
        points,
        source: type === 'earn' ? source : 'redemption',
        description: type === 'earn' ? `Earned ${points} points from ${source}` : `Redeemed ${Math.abs(points)} points`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)), // Random date in last 90 days
        expiresAt: type === 'earn' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined // Expires in 1 year
      });
    }
    
    // Create referral code
    const referralCode = `VM${user._id.toString().slice(-6).toUpperCase()}`;
    
    // Some redemptions
    const redemptions = [];
    if (Math.random() > 0.5) {
      redemptions.push({
        rewardId: 'reward_1',
        pointsSpent: 500,
        couponCode: `LOYALTY${Date.now()}${i}`,
        redeemedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: Math.random() > 0.7 ? 'used' : 'active'
      });
    }
    
    // Some referrals
    const referrals = [];
    if (i > 0 && Math.random() > 0.6) {
      referrals.push({
        referredUser: regularUsers[(i - 1) % regularUsers.length]._id,
        status: Math.random() > 0.5 ? 'completed' : 'pending',
        pointsEarned: Math.random() > 0.5 ? 200 : 0,
        referredAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)),
        completedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) : undefined
      });
    }
    
    const loyaltyAccount = {
      user: user._id,
      totalPointsEarned: lifetimePoints,
      currentBalance,
      lifetimePoints,
      pointsExpiringSoon: Math.floor(Math.random() * 200),
      currentTier,
      tierProgress: {
        currentPoints: lifetimePoints,
        nextTierPoints: currentTier === 'platinum' ? lifetimePoints : (tierPoints[tierLevels[tierLevels.indexOf(currentTier) + 1] as keyof typeof tierPoints] || lifetimePoints),
        progressPercentage: currentTier === 'platinum' ? 100 : Math.min(100, Math.floor(Math.random() * 100))
      },
      tierUpgradedAt: new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)),
      transactions,
      redemptions,
      referrals,
      referralCode,
      notificationPreferences: {
        pointsEarned: true,
        tierUpgrade: true,
        pointsExpiring: true,
        rewardsAvailable: true
      },
      isActive: true,
      lastActivityAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
    };
    
    loyaltyAccounts.push(loyaltyAccount);
  }
  
  return await Loyalty.insertMany(loyaltyAccounts);
};

// ============================================================================
// CREATE REFUNDS
// ============================================================================
const createRefunds = async (users: any[], orders: any[]) => {
  const refunds = [];
  
  // Create refunds for 30% of orders
  const refundOrders = orders.slice(0, Math.ceil(orders.length * 0.3));
  
  for (let i = 0; i < refundOrders.length; i++) {
    const order = refundOrders[i];
    const user = users.find(u => u._id.toString() === order.user.toString());
    
    if (!user) continue;
    
    const types = ['full', 'partial'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Valid enum values for main refund reason (from refund.model.ts)
    const refundReasons = [
      'defective',
      'damaged',
      'wrong_item',
      'not_as_described',
      'quality_issue',
      'size_issue',
      'color_mismatch',
      'late_delivery',
      'changed_mind',
      'order_cancellation',
      'payment_issue',
      'other'
    ];
    
    // Valid enum values for item-level reason (RefundItemSchema)
    const itemReasons = [
      'defective',
      'damaged',
      'wrong_item',
      'not_as_described',
      'quality_issue',
      'size_issue',
      'color_mismatch',
      'late_delivery',
      'changed_mind',
      'other'
    ];
    
    const reason = refundReasons[Math.floor(Math.random() * refundReasons.length)];
    
    const statuses = ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed', 'cancelled'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const refund = {
      order: order._id,
      user: user._id,
      refundNumber: `RF${Date.now()}${i}`,
      type,
      reason,
      detailedReason: `Customer requested refund due to: ${reason}. Customer reported dissatisfaction with the product quality/condition.`,
      items: type === 'full' ? order.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        reason: itemReasons[Math.floor(Math.random() * itemReasons.length)],
        condition: ['unopened', 'opened', 'damaged', 'defective'][Math.floor(Math.random() * 4)]
      })) : [order.items[0]].map((item: any) => ({
        product: item.product,
        quantity: Math.floor(item.quantity / 2) || 1,
        price: item.price,
        reason: itemReasons[Math.floor(Math.random() * itemReasons.length)],
        condition: ['unopened', 'opened', 'damaged', 'defective'][Math.floor(Math.random() * 4)]
      })),
      amount: {
        subtotal: type === 'full' ? order.subtotal : Math.floor(order.subtotal / 2),
        tax: type === 'full' ? order.tax : Math.floor(order.tax / 2),
        shipping: type === 'full' ? order.shippingCost : 0,
        discount: 0,
        total: type === 'full' ? order.total : Math.floor(order.total / 2),
        refundedAmount: type === 'full' ? order.total : Math.floor(order.total / 2),
        processingFee: 0
      },
      status,
      approvedBy: ['approved', 'processing', 'completed'].includes(status) ? users[0]._id : undefined,
      approvedAt: ['approved', 'processing', 'completed'].includes(status) ? new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)) : undefined,
      rejectedBy: status === 'rejected' ? users[0]._id : undefined,
      rejectedAt: status === 'rejected' ? new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)) : undefined,
      rejectionReason: status === 'rejected' ? 'Refund policy violation - product used beyond return window' : undefined,
      payment: {
        method: 'original',
        gatewayRefundId: status === 'completed' ? `rfnd_${Date.now()}${i}` : undefined,
        gatewayStatus: status === 'completed' ? 'success' : status === 'failed' ? 'failed' : 'pending'
      },
      processedAt: status === 'completed' ? new Date(Date.now() - Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000)) : undefined,
      requiresReturn: Math.random() > 0.3,
      returnStatus: Math.random() > 0.3 ? ['pending_pickup', 'picked_up', 'in_transit', 'received', 'inspected'][Math.floor(Math.random() * 5)] : undefined,
      returnTrackingNumber: Math.random() > 0.5 ? `RTN${Date.now()}${i}` : undefined,
      returnCarrier: Math.random() > 0.5 ? ['Delhivery', 'BlueDart', 'DTDC', 'Ekart'][Math.floor(Math.random() * 4)] : undefined,
      returnNotes: Math.random() > 0.5 ? 'Return pickup scheduled. Customer notified.' : undefined,
      timeline: [
        {
          status: 'pending',
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)),
          updatedBy: user._id,
          note: 'Refund request created by customer'
        },
        ...(['approved', 'processing', 'completed'].includes(status) ? [{
          status: 'approved',
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
          updatedBy: users[0]._id,
          note: 'Refund approved by admin'
        }] : []),
        ...(status === 'rejected' ? [{
          status: 'rejected',
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)),
          updatedBy: users[0]._id,
          note: 'Refund rejected - policy violation'
        }] : []),
        ...(status === 'completed' ? [{
          status: 'completed',
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000)),
          updatedBy: users[0]._id,
          note: 'Refund processed successfully'
        }] : [])
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        refundSource: i % 3 === 0 ? 'admin' : 'customer',
        notes: 'Auto-generated seed data'
      },
      requestedAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000))
    };
    
    refunds.push(refund);
  }
  
  return await Refund.insertMany(refunds);
};

const createDefaultSettings = async () => {
  const defaultSettings = [
    // General Settings
    {
      category: 'general',
      key: 'siteName',
      value: 'Vardhman Mills',
      type: 'string',
      description: 'The name of the website',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'siteTagline',
      value: 'Premium Textile Solutions',
      type: 'string',
      description: 'The tagline of the website',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'siteDescription',
      value: 'Premium textile manufacturing and trading company specializing in high-quality fabrics and garments',
      type: 'string',
      description: 'Description of the website',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'contactEmail',
      value: 'admin@vardhmanmills.com',
      type: 'string',
      description: 'Primary contact email address',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'supportEmail',
      value: 'support@vardhmanmills.com',
      type: 'string',
      description: 'Support email address',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'phoneNumber',
      value: '+91-9876543210',
      type: 'string',
      description: 'Primary phone number',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'websiteUrl',
      value: 'https://vardhmanmills.com',
      type: 'string',
      description: 'Website URL',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'itemsPerPage',
      value: 10,
      type: 'number',
      description: 'Number of items to display per page',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'dateFormat',
      value: 'dd/mm/yyyy',
      type: 'string',
      description: 'Date format for the application',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'maintenanceMode',
      value: false,
      type: 'boolean',
      description: 'Enable/disable maintenance mode',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'debugMode',
      value: false,
      type: 'boolean',
      description: 'Enable/disable debug mode',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'registrationEnabled',
      value: true,
      type: 'boolean',
      description: 'Allow new user registration',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'autoBackup',
      value: true,
      type: 'boolean',
      description: 'Enable automatic backups',
      isGlobal: true
    },
    
    // SEO Settings
    {
      category: 'general',
      key: 'metaTitle',
      value: 'Vardhman Mills - Premium Textile Solutions',
      type: 'string',
      description: 'Meta title for SEO',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'metaDescription',
      value: 'Leading textile manufacturer offering premium fabrics, garments, and textile solutions with exceptional quality and service.',
      type: 'string',
      description: 'Meta description for SEO',
      isGlobal: true
    },
    {
      category: 'general',
      key: 'metaKeywords',
      value: 'textile, fabric, garments, manufacturing, premium textiles',
      type: 'string',
      description: 'Meta keywords for SEO',
      isGlobal: true
    },

    // Notification Settings
    {
      category: 'notifications',
      key: 'emailNewOrder',
      value: true,
      type: 'boolean',
      description: 'Send email notifications for new orders',
      isGlobal: true
    },
    {
      category: 'notifications',
      key: 'emailOrderUpdate',
      value: true,
      type: 'boolean',
      description: 'Send email notifications for order updates',
      isGlobal: true
    },
    {
      category: 'notifications',
      key: 'emailLowStock',
      value: true,
      type: 'boolean',
      description: 'Send email notifications for low stock',
      isGlobal: true
    },
    {
      category: 'notifications',
      key: 'emailNewUser',
      value: false,
      type: 'boolean',
      description: 'Send email notifications for new user registration',
      isGlobal: true
    },
    {
      category: 'notifications',
      key: 'pushBrowser',
      value: true,
      type: 'boolean',
      description: 'Enable browser push notifications',
      isGlobal: true
    },
    {
      category: 'notifications',
      key: 'pushSound',
      value: false,
      type: 'boolean',
      description: 'Enable sound alerts for notifications',
      isGlobal: true
    },

    // Security Settings
    {
      category: 'security',
      key: 'twoFactorAuth',
      value: false,
      type: 'boolean',
      description: 'Enable two-factor authentication',
      isGlobal: true
    },
    {
      category: 'security',
      key: 'sessionTimeout',
      value: 60,
      type: 'number',
      description: 'Session timeout in minutes',
      isGlobal: true
    },
    {
      category: 'security',
      key: 'rememberDevice',
      value: true,
      type: 'boolean',
      description: 'Remember user on this device',
      isGlobal: true
    },

    // Payment Settings
    {
      category: 'payment',
      key: 'razorpayEnabled',
      value: true,
      type: 'boolean',
      description: 'Enable Razorpay payment gateway',
      isGlobal: true
    },
    {
      category: 'payment',
      key: 'codEnabled',
      value: true,
      type: 'boolean',
      description: 'Enable Cash on Delivery',
      isGlobal: true
    },

    // Shipping Settings
    {
      category: 'shipping',
      key: 'domesticZone',
      value: 'India',
      type: 'string',
      description: 'Domestic shipping zone',
      isGlobal: true
    },
    {
      category: 'shipping',
      key: 'standardShippingRate',
      value: 99,
      type: 'number',
      description: 'Standard shipping rate in rupees',
      isGlobal: true
    },
    {
      category: 'shipping',
      key: 'expressShippingRate',
      value: 199,
      type: 'number',
      description: 'Express shipping rate in rupees',
      isGlobal: true
    },
    {
      category: 'shipping',
      key: 'overnightShippingRate',
      value: 399,
      type: 'number',
      description: 'Overnight shipping rate in rupees',
      isGlobal: true
    },
    {
      category: 'shipping',
      key: 'freeShippingThreshold',
      value: 2000,
      type: 'number',
      description: 'Free shipping threshold amount in rupees',
      isGlobal: true
    },
    {
      category: 'shipping',
      key: 'freeShippingEnabled',
      value: true,
      type: 'boolean',
      description: 'Enable free shipping',
      isGlobal: true
    },
    {
      category: 'shipping',
      key: 'internationalShippingEnabled',
      value: false,
      type: 'boolean',
      description: 'Enable international shipping',
      isGlobal: true
    },
    {
      category: 'shipping',
      key: 'requireSignature',
      value: false,
      type: 'boolean',
      description: 'Require signature on delivery',
      isGlobal: true
    },

    // Store Settings
    {
      category: 'store',
      key: 'storeName',
      value: 'Vardhman Mills',
      type: 'string',
      description: 'Name of the store',
      isGlobal: true
    },
    {
      category: 'store',
      key: 'storeAddress',
      value: 'Industrial Area, Mumbai, Maharashtra, India',
      type: 'string',
      description: 'Store address',
      isGlobal: true
    },
    {
      category: 'store',
      key: 'businessHours',
      value: 'Monday - Saturday: 9:00 AM - 6:00 PM',
      type: 'string',
      description: 'Business operating hours',
      isGlobal: true
    },

    // Inventory Settings
    {
      category: 'inventory',
      key: 'lowStockThreshold',
      value: 10,
      type: 'number',
      description: 'Low stock alert threshold',
      isGlobal: true
    },
    {
      category: 'inventory',
      key: 'outOfStockAction',
      value: 'hide',
      type: 'string',
      description: 'Action to take when product is out of stock',
      isGlobal: true
    },
    {
      category: 'inventory',
      key: 'multiWarehouseEnabled',
      value: false,
      type: 'boolean',
      description: 'Enable multi-warehouse management',
      isGlobal: true
    },

    // Email Settings
    {
      category: 'email',
      key: 'smtpHost',
      value: 'smtp.gmail.com',
      type: 'string',
      description: 'SMTP server hostname',
      isGlobal: true
    },
    {
      category: 'email',
      key: 'smtpPort',
      value: 587,
      type: 'number',
      description: 'SMTP server port',
      isGlobal: true
    },
    {
      category: 'email',
      key: 'smtpSecure',
      value: true,
      type: 'boolean',
      description: 'Use secure SMTP connection',
      isGlobal: true
    },

    // Analytics Settings
    {
      category: 'analytics',
      key: 'googleAnalyticsEnabled',
      value: false,
      type: 'boolean',
      description: 'Enable Google Analytics',
      isGlobal: true
    },
    {
      category: 'analytics',
      key: 'googleAnalyticsId',
      value: '',
      type: 'string',
      description: 'Google Analytics tracking ID',
      isGlobal: true
    },

    // Backup Settings
    {
      category: 'backup',
      key: 'backupFrequency',
      value: 'daily',
      type: 'string',
      description: 'Backup frequency',
      isGlobal: true
    },
    {
      category: 'backup',
      key: 'backupTime',
      value: '02:00',
      type: 'string',
      description: 'Daily backup time',
      isGlobal: true
    },
    {
      category: 'backup',
      key: 'retentionPeriod',
      value: 30,
      type: 'number',
      description: 'Backup retention period in days',
      isGlobal: true
    },

    // Maintenance Settings
    {
      category: 'maintenance',
      key: 'cacheDuration',
      value: 24,
      type: 'number',
      description: 'Cache duration in hours',
      isGlobal: true
    }
  ];

  return await Settings.insertMany(defaultSettings);
};

// ============================================================================
// NEW SEED FUNCTIONS FOR ALL MODELS
// ============================================================================

const createCollections = async (users: any[], products: any[]) => {
  const collections = [
    {
      name: 'Summer Collection 2024',
      slug: 'summer-collection-2024',
      description: 'Light and breezy summer textiles perfect for warm weather',
      image: 'https://via.placeholder.com/800x400?text=Summer+Collection',
      products: products.slice(0, 3).map(p => p._id),
      createdBy: users[0]._id,
      isActive: true,
      isFeatured: true,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-08-31')
    },
    {
      name: 'Winter Warmth',
      slug: 'winter-warmth',
      description: 'Cozy and warm textiles for cold winter nights',
      image: 'https://via.placeholder.com/800x400?text=Winter+Collection',
      products: products.slice(2, 5).map(p => p._id),
      createdBy: users[0]._id,
      isActive: true,
      isFeatured: true,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-02-28')
    }
  ];
  return await Collection.insertMany(collections);
};

const createDeals = async (users: any[], products: any[], categories: any[], brands: any[]) => {
  const deals = [
    {
      name: 'Weekend Flash Sale',
      description: '50% off on selected bed sheets',
      type: 'percentage',
      discountValue: 50,
      applicableTo: 'specific',
      products: [products[0]._id, products[1]._id],
      createdBy: users[0]._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isFlashSale: true,
      status: 'active',
      isActive: true,
      isFeatured: true,
      priority: 1,
      badge: '50% OFF',
      views: 245,
      clicks: 89,
      conversions: 23,
      usageCount: 23
    },
    {
      name: 'Buy 2 Get 1 Free',
      description: 'Buy any 2 pillows and get 1 free',
      type: 'buy-x-get-y',
      discountValue: 0,
      buyQuantity: 2,
      getQuantity: 1,
      applicableTo: 'category',
      categories: [categories.find((c: any) => c.slug === 'pillows-cushions')?._id],
      createdBy: users[0]._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isFlashSale: false,
      status: 'active',
      isActive: true,
      isFeatured: true,
      priority: 2,
      badge: 'BOGO',
      views: 189,
      clicks: 67,
      conversions: 15,
      usageCount: 15
    }
  ];
  return await Deal.insertMany(deals);
};

const createCoupons = async (users: any[], products: any[], categories: any[]) => {
  const admin = users[0];
  const coupons = [
    {
      code: 'WELCOME10',
      description: '10% off for new customers',
      discountType: 'percentage',
      discountValue: 10,
      minimumOrderValue: 1000,
      maximumDiscount: 500,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
      usageLimitPerUser: 1,
      currentUsageCount: 45,
      combinableWithOtherCoupons: false,
      usageHistory: [],
      category: 'first_order',
      tags: ['new-customer', 'welcome'],
      isReferral: false,
      createdBy: admin._id,
      totalSavings: 3250,
      totalUsageCount: 45,
      conversionRate: 0.65
    },
    {
      code: 'SAVE500',
      description: 'Flat ₹500 off on orders above ₹3000',
      discountType: 'fixed_amount',
      discountValue: 500,
      minimumOrderValue: 3000,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      usageLimitPerUser: 3,
      currentUsageCount: 87,
      combinableWithOtherCoupons: true,
      usageHistory: [],
      category: 'promotional',
      tags: ['flat-discount', 'bestseller'],
      isReferral: false,
      createdBy: admin._id,
      totalSavings: 43500,
      totalUsageCount: 87,
      conversionRate: 0.72
    },
    {
      code: 'FREESHIP',
      description: 'Free shipping on all orders',
      discountType: 'free_shipping',
      discountValue: 0,
      minimumOrderValue: 1500,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      currentUsageCount: 234,
      combinableWithOtherCoupons: true,
      usageHistory: [],
      category: 'promotional',
      tags: ['free-shipping', 'popular'],
      isReferral: false,
      createdBy: admin._id,
      totalSavings: 23166,
      totalUsageCount: 234,
      conversionRate: 0.81
    }
  ];
  return await Coupon.insertMany(coupons);
};

const createSales = async (users: any[], products: any[], categories: any[]) => {
  const sales = [
    {
      name: 'Mega Summer Sale',
      slug: 'mega-summer-sale',
      description: 'Up to 60% off on summer collection',
      type: 'seasonal',
      category: 'Summer Sale',
      discount: {
        type: 'percentage',
        value: 60,
        maxAmount: 5000
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      applicableTo: 'all',
      isActive: true,
      isFeatured: true,
      priority: 1,
      badge: { text: 'MEGA SALE', color: '#FF0000' },
      bannerImage: 'https://via.placeholder.com/1200x400?text=Summer+Sale',
      createdBy: users[0]._id
    },
    {
      name: 'Clearance Sale',
      slug: 'clearance-sale',
      description: 'Final clearance - up to 70% off',
      type: 'clearance',
      category: 'Clearance',
      discount: {
        type: 'percentage',
        value: 70,
        maxAmount: 3000
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      timezone: 'Asia/Kolkata',
      applicableTo: 'specific',
      products: [products[2]._id],
      isActive: true,
      isFeatured: false,
      priority: 2,
      badge: { text: 'CLEARANCE', color: '#FF6600' },
      bannerImage: 'https://via.placeholder.com/1200x400?text=Clearance+Sale',
      createdBy: users[0]._id
    }
  ];
  return await Sale.insertMany(sales);
};

const createReviews = async (users: any[], products: any[]) => {
  const reviews = [
    {
      user: users[1]._id,
      product: products[0]._id,
      rating: 5,
      title: 'Excellent Quality!',
      comment: 'The cotton bed sheets are absolutely amazing. Super soft and comfortable. Highly recommended!',
      isVerifiedPurchase: true,
      isApproved: true,
      helpful: 15,
      notHelpful: 1
    },
    {
      user: users[2]._id,
      product: products[0]._id,
      rating: 4,
      title: 'Good product',
      comment: 'Nice quality sheets, though a bit pricey. Worth it for the comfort.',
      isVerifiedPurchase: true,
      isApproved: true,
      helpful: 8,
      notHelpful: 0
    },
    {
      user: users[1]._id,
      product: products[3]._id,
      rating: 5,
      title: 'Best pillow ever!',
      comment: 'Memory foam is perfect. No more neck pain!',
      isVerifiedPurchase: true,
      isApproved: true,
      helpful: 23,
      notHelpful: 2
    }
  ];
  return await Review.insertMany(reviews);
};

const createInventory = async (products: any[]) => {
  const inventory = [];
  const warehouseId = new mongoose.Types.ObjectId(); // Create a sample warehouse ID
  for (const product of products) {
    for (const variant of product.variants) {
      inventory.push({
        productId: product._id,
        variantId: variant._id,
        sku: variant.sku,
        quantity: variant.stock,
        reserved: Math.floor(Math.random() * 5),
        available: variant.stock - Math.floor(Math.random() * 5),
        unitCost: variant.price * 0.6,
        reorderLevel: 10,
        reorderQuantity: 50,
        location: {
          warehouseId: warehouseId,
          warehouseName: 'Main Warehouse',
          zone: 'A',
          aisle: String(Math.floor(Math.random() * 10) + 1),
          shelf: String(Math.floor(Math.random() * 5) + 1),
          bin: `BIN-${Math.floor(Math.random() * 100)}`
        },
        lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: 'in_stock',
        isActive: true
      });
    }
  }
  return await InventoryItem.insertMany(inventory);
};

const createCarts = async (users: any[], products: any[]) => {
  const carts = [
    {
      user: users[1]._id,
      items: [
        {
          product: products[0]._id,
          variant: products[0].variants[0]._id,
          quantity: 2,
          price: products[0].variants[0].price,
          total: products[0].variants[0].price * 2
        }
      ],
      isActive: true
    },
    {
      user: users[2]._id,
      items: [
        {
          product: products[3]._id,
          variant: products[3].variants[0]._id,
          quantity: 1,
          price: products[3].variants[0].price,
          total: products[3].variants[0].price
        }
      ],
      isActive: true
    }
  ];
  return await Cart.insertMany(carts);
};

const createWishlists = async (users: any[], products: any[]) => {
  const wishlists = [
    {
      user: users[1]._id,
      products: [products[1]._id, products[4]._id],
      name: 'My Wishlist'
    },
    {
      user: users[2]._id,
      products: [products[0]._id, products[2]._id, products[3]._id],
      name: 'Favorites'
    }
  ];
  return await Wishlist.insertMany(wishlists);
};

const createShippingZones = async () => {
  const zones = [
    {
      name: 'North India',
      description: 'Shipping zone covering Northern states of India',
      countries: [{ code: 'IN', name: 'India' }],
      states: ['Delhi', 'Punjab', 'Haryana', 'Himachal Pradesh', 'Uttarakhand', 'Uttar Pradesh', 'Jammu and Kashmir'],
      cities: [],
      postalCodes: [],
      shippingRates: [
        {
          name: 'Standard Shipping',
          minWeight: 0,
          maxWeight: 10,
          minPrice: 0,
          maxPrice: 999999,
          rate: 99,
          estimatedDays: { min: 4, max: 6 },
          isActive: true
        },
        {
          name: 'Express Shipping',
          minWeight: 0,
          maxWeight: 10,
          minPrice: 0,
          maxPrice: 999999,
          rate: 199,
          estimatedDays: { min: 1, max: 2 },
          isActive: true
        }
      ],
      isActive: true,
      priority: 1
    },
    {
      name: 'South India',
      description: 'Shipping zone covering Southern states of India',
      countries: [{ code: 'IN', name: 'India' }],
      states: ['Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana'],
      cities: [],
      postalCodes: [],
      shippingRates: [
        {
          name: 'Standard Shipping',
          minWeight: 0,
          maxWeight: 10,
          minPrice: 0,
          maxPrice: 999999,
          rate: 99,
          estimatedDays: { min: 4, max: 6 },
          isActive: true
        },
        {
          name: 'Express Shipping',
          minWeight: 0,
          maxWeight: 10,
          minPrice: 0,
          maxPrice: 999999,
          rate: 199,
          estimatedDays: { min: 2, max: 3 },
          isActive: true
        }
      ],
      isActive: true,
      priority: 2
    },
    {
      name: 'West India',
      description: 'Shipping zone covering Western states of India',
      countries: [{ code: 'IN', name: 'India' }],
      states: ['Maharashtra', 'Gujarat', 'Goa', 'Rajasthan'],
      cities: [],
      postalCodes: [],
      shippingRates: [
        {
          name: 'Standard Shipping',
          minWeight: 0,
          maxWeight: 10,
          minPrice: 0,
          maxPrice: 999999,
          rate: 99,
          estimatedDays: { min: 3, max: 5 },
          isActive: true
        },
        {
          name: 'Express Shipping',
          minWeight: 0,
          maxWeight: 10,
          minPrice: 0,
          maxPrice: 999999,
          rate: 199,
          estimatedDays: { min: 1, max: 2 },
          isActive: true
        }
      ],
      isActive: true,
      priority: 3
    },
    {
      name: 'East India',
      description: 'Shipping zone covering Eastern states of India',
      countries: [{ code: 'IN', name: 'India' }],
      states: ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Assam'],
      cities: [],
      postalCodes: [],
      shippingRates: [
        {
          name: 'Standard Shipping',
          minWeight: 0,
          maxWeight: 10,
          minPrice: 0,
          maxPrice: 999999,
          rate: 99,
          estimatedDays: { min: 5, max: 7 },
          isActive: true
        },
        {
          name: 'Express Shipping',
          minWeight: 0,
          maxWeight: 10,
          minPrice: 0,
          maxPrice: 999999,
          rate: 249,
          estimatedDays: { min: 2, max: 4 },
          isActive: true
        }
      ],
      isActive: true,
      priority: 4
    }
  ];
  return await ShippingZone.insertMany(zones);
};

const createGiftCards = async (users: any[]) => {
  const giftCards = [
    {
      code: 'GIFT1000-' + Math.random().toString(36).substring(7).toUpperCase(),
      initialBalance: 1000,
      currentBalance: 1000,
      originalAmount: 1000,
      currency: 'INR',
      purchasedBy: users[0]._id,
      senderName: 'Admin User',
      senderEmail: 'admin@vardhmanmills.com',
      recipientName: 'Gift Recipient',
      recipientEmail: 'recipient@example.com',
      deliveryMethod: 'email',
      design: {
        designId: 'default-001',
        template: 'default',
        imageUrl: 'https://via.placeholder.com/400x250?text=Gift+Card',
        message: 'Enjoy your gift!'
      },
      isActive: true,
      status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    },
    {
      code: 'GIFT500-' + Math.random().toString(36).substring(7).toUpperCase(),
      initialBalance: 500,
      currentBalance: 350,
      originalAmount: 500,
      currency: 'INR',
      isActive: true,
      status: 'active',
      purchasedBy: users[1]._id,
      senderName: 'John Doe',
      senderEmail: 'john@example.com',
      recipientName: 'Friend',
      recipientEmail: 'friend@example.com',
      deliveryMethod: 'email',
      design: {
        designId: 'birthday-001',
        template: 'birthday',
        imageUrl: 'https://via.placeholder.com/400x250?text=Birthday+Gift',
        message: 'Happy Birthday!'
      },
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  ];
  return await GiftCard.insertMany(giftCards);
};

const createBlogCategories = async () => {
  const categories = [
    {
      name: 'Home Décor Tips',
      slug: 'home-decor-tips',
      description: 'Tips and tricks for beautiful home decoration',
      isActive: true
    },
    {
      name: 'Textile Care',
      slug: 'textile-care',
      description: 'How to care for your textile products',
      isActive: true
    },
    {
      name: 'Company News',
      slug: 'company-news',
      description: 'Latest news from Vardhman Mills',
      isActive: true
    }
  ];
  return await BlogCategory.insertMany(categories);
};

const createBlogPosts = async (users: any[], categories: any[]) => {
  const admin = users[0];
  const posts = [
    {
      title: '10 Tips for Choosing the Perfect Bed Sheets',
      slug: '10-tips-choosing-perfect-bed-sheets',
      excerpt: 'Learn how to select the best bed sheets for your comfort and style',
      content: 'When it comes to bed sheets, thread count isn\'t everything. Here are 10 essential tips to help you choose the perfect bed sheets...',
      category: categories[0]._id,
      author: admin._id,
      featuredImage: 'https://via.placeholder.com/800x400?text=Bed+Sheets+Tips',
      status: 'published',
      isPublished: true,
      publishedAt: new Date(),
      tags: ['bedding', 'tips', 'home-decor'],
      views: 542
    },
    {
      title: 'How to Care for Egyptian Cotton Towels',
      slug: 'how-to-care-egyptian-cotton-towels',
      excerpt: 'Keep your luxurious Egyptian cotton towels soft and fluffy with these care tips',
      content: 'Egyptian cotton towels are an investment in luxury. Here\'s how to keep them in pristine condition...',
      category: categories[1]._id,
      author: admin._id,
      featuredImage: 'https://via.placeholder.com/800x400?text=Towel+Care',
      status: 'published',
      isPublished: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tags: ['towels', 'care', 'maintenance'],
      views: 328
    }
  ];
  return await BlogPost.insertMany(posts);
};

const createFAQs = async (users: any[]) => {
  const faqs = [
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy on all products. Items must be unused and in original packaging.',
      category: 'orders',
      sortOrder: 1,
      isActive: true,
      views: 1245,
      createdBy: users[0]._id
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Currently, we ship within India only. International shipping will be available soon.',
      category: 'shipping',
      sortOrder: 2,
      isActive: true,
      views: 876,
      createdBy: users[0]._id
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order from your account dashboard.',
      category: 'orders',
      sortOrder: 3,
      isActive: true,
      views: 2134,
      createdBy: users[0]._id
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and cash on delivery (COD) for eligible orders.',
      category: 'payments',
      sortOrder: 4,
      isActive: true,
      views: 1567,
      createdBy: users[0]._id
    },
    {
      question: 'Are your products machine washable?',
      answer: 'Most of our products are machine washable. Please check the care instructions on the product page for specific guidelines.',
      category: 'products',
      sortOrder: 5,
      isActive: true,
      views: 987,
      createdBy: users[0]._id
    }
  ];
  return await FAQ.insertMany(faqs);
};

const createAbout = async () => {
  const about = new CompanyInfo({
    name: 'Vardhman Mills',
    description: 'Leading textile manufacturer specializing in premium home textiles and fabrics',
    foundedYear: 1965,
    founderName: 'Mr. S.P. Oswal',
    headquarters: 'Mumbai, Maharashtra, India',
    employeeCount: '500+',
    industry: 'Textile Manufacturing',
    specialization: ['Home Textiles', 'Bed Linens', 'Bath Linens', 'Fabrics'],
    certifications: ['ISO 9001:2015', 'OEKO-TEX Standard 100', 'GOTS Certified'],
    tagline: 'Premium Textile Solutions',
    vision: 'To be the most trusted and preferred textile brand globally',
    mission: 'To deliver exceptional quality textiles that enhance comfort and style in every home, while maintaining sustainable and ethical practices',
    values: ['Quality Excellence', 'Customer Satisfaction', 'Innovation', 'Sustainability', 'Integrity']
  });
  await about.save();
  return about;
};

const createAnnouncements = async (users: any[]) => {
  const announcements = [
    {
      title: 'Flash Sale This Weekend!',
      message: 'Get up to 50% off on selected bed sheets. Limited time offer!',
      type: 'promotion',
      priority: 1,
      isActive: true,
      createdBy: users[0]._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      displayLocation: ['homepage', 'products']
    },
    {
      title: 'New Summer Collection Launched',
      message: 'Check out our brand new summer collection with vibrant colors and lightweight fabrics.',
      type: 'info',
      priority: 2,
      isActive: true,
      createdBy: users[0]._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      displayLocation: ['homepage']
    }
  ];
  return await Announcement.insertMany(announcements);
};

const createHeroSections = async (users: any[], products: any[]) => {
  const heroSections = [
    {
      title: 'Premium Bed Sheets Collection',
      subtitle: 'Experience luxury and comfort',
      description: 'Discover our exclusive range of premium bed sheets crafted from the finest materials',
      backgroundImage: 'https://via.placeholder.com/1920x800?text=Premium+Bed+Sheets',
      mobileImage: 'https://via.placeholder.com/768x600?text=Premium+Bed+Sheets',
      position: {
        page: 'home',
        section: 'top',
        order: 1
      },
      cta: {
        primaryButton: {
          text: 'Shop Now',
          link: '/products/bed-sheets',
          style: 'primary'
        }
      },
      isActive: true,
      createdBy: users[0]._id
    },
    {
      title: 'Summer Sale',
      subtitle: 'Up to 60% Off',
      description: 'Limited time offer on selected items',
      backgroundImage: 'https://via.placeholder.com/1920x800?text=Summer+Sale',
      mobileImage: 'https://via.placeholder.com/768x600?text=Summer+Sale',
      position: {
        page: 'home',
        section: 'middle',
        order: 2
      },
      cta: {
        primaryButton: {
          text: 'Shop Sale',
          link: '/sale',
          style: 'primary'
        }
      },
      isActive: true,
      createdBy: users[0]._id
    }
  ];
  return await HeroSection.insertMany(heroSections);
};

const createBestsellers = async (products: any[]) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const bestsellers = [
    {
      productId: products[0]._id,
      rank: 1,
      salesCount: 456,
      revenue: 911544,
      period: 'monthly',
      periodStartDate: startOfMonth,
      periodEndDate: endOfMonth,
      isActive: true
    },
    {
      productId: products[3]._id,
      rank: 2,
      salesCount: 389,
      revenue: 699911,
      period: 'monthly',
      periodStartDate: startOfMonth,
      periodEndDate: endOfMonth,
      isActive: true
    },
    {
      productId: products[4]._id,
      rank: 3,
      salesCount: 234,
      revenue: 584766,
      period: 'monthly',
      periodStartDate: startOfMonth,
      periodEndDate: endOfMonth,
      isActive: true
    }
  ];
  return await Bestseller.insertMany(bestsellers);
};

const createNewArrivals = async (products: any[]) => {
  const now = new Date();
  const arrivalDate1 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
  const launchDate1 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
  const arrivalDate2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const launchDate2 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
  
  const newArrivals = [
    {
      productId: products[1]._id,
      arrivalDate: arrivalDate1,
      launchDate: launchDate1,
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
      badgeText: 'NEW',
      stockStatus: 'in-stock',
      metrics: {
        views: 0,
        clicks: 0,
        addToCart: 0,
        purchases: 0,
        wishlists: 0,
        shares: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        averageRating: 0,
        totalReviews: 0
      },
      trending: {
        isTrending: false,
        trendScore: 0,
        trendDirection: 'stable',
        velocityScore: 0
      },
      promotional: {
        isOnSale: false,
        hasDiscount: false,
        hasSpecialOffer: false,
        isExclusive: false,
        isLimitedEdition: false
      },
      visibility: {
        showOnHomepage: true,
        showOnCategoryPage: true,
        showOnBrandPage: true,
        showInNewsletter: false,
        showInNotifications: false,
        regions: [],
        customerSegments: [],
        deviceTypes: []
      },
      media: {
        images: [],
      },
      seo: {
        keywords: []
      },
      socialProof: {
        showViewCount: true,
        showSoldCount: true,
        showRating: true,
        showReviewCount: true,
        soldCount: 0,
        soldInLast24Hours: 0
      },
      notifications: {
        emailSent: false,
        pushSent: false,
        smsSent: false,
        notifiedUserCount: 0
      }
    },
    {
      productId: products[2]._id,
      arrivalDate: arrivalDate2,
      launchDate: launchDate2,
      displayOrder: 2,
      isActive: true,
      isFeatured: false,
      badgeText: 'JUST IN',
      stockStatus: 'in-stock',
      metrics: {
        views: 0,
        clicks: 0,
        addToCart: 0,
        purchases: 0,
        wishlists: 0,
        shares: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        averageRating: 0,
        totalReviews: 0
      },
      trending: {
        isTrending: false,
        trendScore: 0,
        trendDirection: 'stable',
        velocityScore: 0
      },
      promotional: {
        isOnSale: false,
        hasDiscount: false,
        hasSpecialOffer: false,
        isExclusive: false,
        isLimitedEdition: false
      },
      visibility: {
        showOnHomepage: true,
        showOnCategoryPage: true,
        showOnBrandPage: true,
        showInNewsletter: false,
        showInNotifications: false,
        regions: [],
        customerSegments: [],
        deviceTypes: []
      },
      media: {
        images: [],
      },
      seo: {
        keywords: []
      },
      socialProof: {
        showViewCount: true,
        showSoldCount: true,
        showRating: true,
        showReviewCount: true,
        soldCount: 0,
        soldInLast24Hours: 0
      },
      notifications: {
        emailSent: false,
        pushSent: false,
        smsSent: false,
        notifiedUserCount: 0
      }
    }
  ];
  return await NewArrival.insertMany(newArrivals);
};

const createFeaturedContent = async (users: any[], products: any[], collections: any[]) => {
  const featured = [
    {
      name: 'Featured Product',
      contentType: 'product',
      productId: products[0]._id,
      createdBy: users[0]._id,
      displaySettings: {
        placement: 'homepage',
        section: 'hero',
        position: 1,
        layout: 'card',
        size: 'large',
        showImage: true,
        showTitle: true,
        showDescription: true,
        showPrice: true,
        showCTA: true
      },
      targeting: {},
      status: 'active',
      isActive: true,
      publishAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: 100,
      analytics: {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        conversions: 0,
        revenue: 0
      }
    },
    {
      name: 'Summer Collection',
      contentType: 'collection',
      collectionId: collections[0]._id,
      createdBy: users[0]._id,
      displaySettings: {
        placement: 'homepage',
        section: 'featured',
        position: 2,
        layout: 'banner',
        size: 'medium',
        showImage: true,
        showTitle: true,
        showDescription: true,
        showCTA: true
      },
      targeting: {},
      status: 'active',
      isActive: true,
      publishAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      priority: 90,
      analytics: {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        conversions: 0,
        revenue: 0
      }
    }
  ];
  return await FeaturedContent.insertMany(featured);
};

const createFavoriteSections = async (users: any[], products: any[]) => {
  const favorites = [
    {
      title: 'Customer Favorites',
      slug: 'customer-favorites',
      description: 'Most loved products by our customers',
      createdBy: users[0]._id,
      contentType: 'products',
      contentIds: [products[0]._id, products[3]._id, products[4]._id],
      displayType: 'grid',
      itemsPerRow: 3,
      maxItems: 6,
      showTitle: true,
      showDescription: true,
      showViewAll: true,
      layout: {
        containerWidth: 'container',
        padding: { top: 20, bottom: 20, left: 0, right: 0 },
        margin: { top: 40, bottom: 40 },
        borderRadius: 0,
        shadow: 'none'
      },
      typography: {
        titleFont: 'Inter',
        titleSize: '2xl',
        titleWeight: 'bold',
        titleColor: '#000000',
        descriptionFont: 'Inter',
        descriptionSize: 'base',
        descriptionColor: '#666666'
      },
      autoUpdate: false,
      filters: {},
      sortBy: 'popularity',
      animation: {
        entrance: 'fade',
        hover: 'scale',
        loading: 'skeleton',
        stagger: true,
        duration: 300
      },
      responsive: {
        mobile: { itemsPerRow: 1, maxItems: 4, displayType: 'carousel' },
        tablet: { itemsPerRow: 2, maxItems: 6, displayType: 'grid' },
        desktop: { itemsPerRow: 3, maxItems: 6, displayType: 'grid' }
      },
      seo: {
        keywords: []
      },
      tracking: {
        enabled: true,
        events: ['view', 'click'],
        impressions: 0,
        clicks: 0,
        clickThroughRate: 0
      },
      personalization: {
        enabled: false,
        rules: []
      },
      status: 'published',
      visibility: 'public',
      priority: 100,
      displayOrder: 1,
      placement: {
        page: 'homepage',
        position: 'middle'
      },
      metadata: {},
      tags: ['favorites', 'popular'],
      version: 1
    }
  ];
  return await FavoriteSection.insertMany(favorites);
};

const createLocations = async (users: any[]) => {
  const locations = [
    {
      name: 'Mumbai Showroom',
      slug: 'mumbai-showroom',
      type: 'showroom',
      address: {
        street: 'Industrial Area, Phase 1',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001'
      },
      contactInfo: {
        phone: '+91 22 1234 5678',
        email: 'mumbai@vardhmanmills.com'
      },
      coordinates: { latitude: 19.0760, longitude: 72.8777 },
      hours: {},
      services: ['retail', 'bulk-orders', 'custom-designs'],
      features: ['parking', 'wifi', 'ac'],
      status: 'active',
      isActive: true,
      isFeatured: true,
      seo: {},
      analytics: {
        views: 0,
        clicks: 0,
        directions: 0,
        calls: 0
      },
      settings: {
        allowPickup: true,
        allowReturns: true,
        allowExchange: true,
        showOnStoreFinder: true,
        showOnWebsite: true
      },
      createdBy: users[0]._id
    },
    {
      name: 'Delhi Warehouse',
      slug: 'delhi-warehouse',
      type: 'warehouse',
      address: {
        street: 'Sector 18',
        city: 'Noida',
        state: 'Uttar Pradesh',
        country: 'India',
        postalCode: '201301'
      },
      contactInfo: {
        phone: '+91 11 9876 5432',
        email: 'delhi@vardhmanmills.com'
      },
      coordinates: { latitude: 28.5706, longitude: 77.3272 },
      hours: {},
      services: ['storage', 'distribution'],
      features: ['loading-dock', 'security'],
      status: 'active',
      isActive: true,
      seo: {},
      analytics: {
        views: 0,
        clicks: 0,
        directions: 0,
        calls: 0
      },
      settings: {
        allowPickup: false,
        showOnStoreFinder: false,
        showOnWebsite: false
      },
      createdBy: users[0]._id
    }
  ];
  return await Location.insertMany(locations);
};

const createRegions = async (users: any[]) => {
  const regions = [
    {
      name: 'India',
      slug: 'india',
      code: 'IN',
      type: 'country' as const,
      coverageArea: {
        center: {
          latitude: 20.5937,
          longitude: 78.9629
        }
      },
      settings: {
        currency: 'INR',
        language: 'en-IN',
        timezone: 'Asia/Kolkata',
        taxRate: 18,
        shippingZone: 'domestic',
        minOrderAmount: 499,
        freeShippingThreshold: 999
      },
      status: 'active' as const,
      isActive: true,
      displayOrder: 1,
      description: 'Serving customers across India with fast delivery and quality products',
      seo: {
        metaTitle: 'Vardhman Mills India - Premium Home Textiles',
        metaDescription: 'Shop premium quality bed sheets, towels, and home textiles across India with free shipping on orders above ₹999',
        metaKeywords: ['home textiles india', 'bed sheets india', 'towels india']
      },
      stats: {
        totalLocations: 4,
        totalOrders: 1250,
        totalRevenue: 5600000
      },
      createdBy: users[0]._id
    },
    {
      name: 'Maharashtra',
      slug: 'maharashtra',
      code: 'MH',
      type: 'state' as const,
      coverageArea: {
        center: {
          latitude: 19.7515,
          longitude: 75.7139
        }
      },
      settings: {
        currency: 'INR',
        language: 'mr-IN',
        timezone: 'Asia/Kolkata',
        taxRate: 18,
        shippingZone: 'west-india',
        minOrderAmount: 399,
        freeShippingThreshold: 799
      },
      status: 'active' as const,
      isActive: true,
      displayOrder: 1,
      description: 'Fast delivery across Maharashtra including Mumbai, Pune, and Nagpur',
      seo: {
        metaTitle: 'Premium Home Textiles in Maharashtra - Vardhman Mills',
        metaDescription: 'Buy quality bed linen and towels in Maharashtra with same-day delivery in Mumbai',
        metaKeywords: ['home textiles maharashtra', 'bed sheets mumbai', 'towels pune']
      },
      stats: {
        totalLocations: 2,
        totalOrders: 450,
        totalRevenue: 2100000
      },
      createdBy: users[0]._id
    },
    {
      name: 'Delhi NCR',
      slug: 'delhi-ncr',
      code: 'DL',
      type: 'state' as const,
      coverageArea: {
        center: {
          latitude: 28.6139,
          longitude: 77.2090
        },
        radius: 100
      },
      settings: {
        currency: 'INR',
        language: 'hi-IN',
        timezone: 'Asia/Kolkata',
        taxRate: 18,
        shippingZone: 'north-india',
        minOrderAmount: 399,
        freeShippingThreshold: 899
      },
      status: 'active' as const,
      isActive: true,
      displayOrder: 2,
      description: 'Covering Delhi, Noida, Gurgaon, and Faridabad with express delivery',
      seo: {
        metaTitle: 'Home Textiles in Delhi NCR - Vardhman Mills',
        metaDescription: 'Premium bed sheets, towels, and home textiles in Delhi NCR with next-day delivery',
        metaKeywords: ['home textiles delhi', 'bed sheets noida', 'towels gurgaon']
      },
      stats: {
        totalLocations: 1,
        totalOrders: 380,
        totalRevenue: 1800000
      },
      createdBy: users[0]._id
    },
    {
      name: 'Karnataka',
      slug: 'karnataka',
      code: 'KA',
      type: 'state' as const,
      coverageArea: {
        center: {
          latitude: 15.3173,
          longitude: 75.7139
        }
      },
      settings: {
        currency: 'INR',
        language: 'kn-IN',
        timezone: 'Asia/Kolkata',
        taxRate: 18,
        shippingZone: 'south-india',
        minOrderAmount: 399,
        freeShippingThreshold: 899
      },
      status: 'active' as const,
      isActive: true,
      displayOrder: 3,
      description: 'Serving Bangalore, Mysore, and other cities in Karnataka',
      seo: {
        metaTitle: 'Premium Home Textiles in Karnataka - Vardhman Mills',
        metaDescription: 'Shop quality bed linen and bath textiles in Karnataka with fast delivery',
        metaKeywords: ['home textiles karnataka', 'bed sheets bangalore', 'towels mysore']
      },
      stats: {
        totalLocations: 1,
        totalOrders: 420,
        totalRevenue: 1700000
      },
      createdBy: users[0]._id
    }
  ];
  return await Region.insertMany(regions);
};

const createLogos = async (users: any[]) => {
  const logos = [
    {
      name: 'Primary Logo',
      type: 'primary',
      altText: 'Vardhman Mills Logo',
      uploadedBy: users[0]._id,
      originalFile: {
        url: 'https://via.placeholder.com/300x100?text=Vardhman+Mills',
        filename: 'vardhman-logo-primary.png',
        size: 25600,
        mimeType: 'image/png',
        dimensions: {
          width: 300,
          height: 100
        }
      },
      variants: [
        {
          name: 'dark',
          url: 'https://via.placeholder.com/300x100?text=Vardhman+Mills+Dark',
          width: 300,
          height: 100,
          size: 24000,
          format: 'png'
        },
        {
          name: 'light',
          url: 'https://via.placeholder.com/300x100?text=Vardhman+Mills+Light',
          width: 300,
          height: 100,
          size: 24000,
          format: 'png'
        },
        {
          name: 'icon',
          url: 'https://via.placeholder.com/100x100?text=VM',
          width: 100,
          height: 100,
          size: 8000,
          format: 'png'
        }
      ],
      version: 1,
      usageLocations: [
        { location: 'header', description: 'Main header navigation' },
        { location: 'footer', description: 'Footer branding' }
      ],
      isActive: true,
      isPrimary: true,
      tags: ['logo', 'branding', 'primary']
    }
  ];
  return await Logo.insertMany(logos);
};

const createMediaAssets = async (users: any[]) => {
  const admin = users[0];
  const assets = [
    {
      name: 'Homepage Banner',
      slug: 'homepage-banner',
      originalName: 'homepage-banner-original.jpg',
      fileName: 'homepage-banner-1920x800.jpg',
      url: 'https://via.placeholder.com/1920x800?text=Homepage+Banner',
      mimeType: 'image/jpeg',
      fileSize: 245678,
      fileType: 'image',
      extension: 'jpg',
      dimensions: {
        width: 1920,
        height: 800
      },
      folder: 'banners',
      tags: ['homepage', 'banner', 'hero'],
      categories: ['marketing', 'banners'],
      seo: {},
      usageCount: 0,
      usedIn: [],
      isOptimized: false,
      status: 'active',
      isPublic: true,
      analytics: {
        views: 0,
        downloads: 0
      },
      uploadedBy: admin._id
    },
    {
      name: 'Product Catalog PDF',
      slug: 'product-catalog-pdf',
      originalName: 'product-catalog-2024.pdf',
      fileName: 'vardhman-catalog-2024.pdf',
      url: 'https://example.com/catalog.pdf',
      mimeType: 'application/pdf',
      fileSize: 5432100,
      fileType: 'document',
      extension: 'pdf',
      folder: 'documents',
      tags: ['catalog', 'products', 'pdf'],
      categories: ['documents', 'catalogs'],
      seo: {},
      usageCount: 0,
      usedIn: [],
      isOptimized: false,
      status: 'active',
      isPublic: true,
      analytics: {
        views: 0,
        downloads: 0
      },
      uploadedBy: admin._id
    }
  ];
  return await MediaAsset.insertMany(assets);
};

const createNewsletterSubscribers = async () => {
  const subscribers = [
    {
      email: 'subscriber1@example.com',
      firstName: 'Alex',
      lastName: 'Johnson',
      status: 'active',
      preferences: {
        frequency: 'weekly',
        categories: ['promotions', 'new-arrivals']
      },
      source: 'website',
      isVerified: true,
      unsubscribeToken: `unsub-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
      bounceCount: 0,
      metadata: {},
      tags: ['customer', 'interested'],
      customFields: new Map()
    },
    {
      email: 'subscriber2@example.com',
      status: 'active',
      preferences: {
        frequency: 'monthly',
        categories: ['blog', 'promotions']
      },
      source: 'popup',
      isVerified: true,
      unsubscribeToken: `unsub-${Math.random().toString(36).substr(2, 9)}-alex`,
      bounceCount: 0,
      metadata: {},
      tags: ['lead'],
      customFields: new Map()
    },
    {
      email: 'subscriber3@example.com',
      firstName: 'Sarah',
      status: 'unsubscribed',
      preferences: {
        frequency: 'weekly',
        categories: ['general']
      },
      source: 'website',
      isVerified: true,
      unsubscribeToken: `unsub-${Math.random().toString(36).substr(2, 9)}-sarah`,
      unsubscribedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      bounceCount: 0,
      metadata: {},
      tags: [],
      customFields: new Map()
    }
  ];
  return await NewsletterSubscriber.insertMany(subscribers);
};

const createNotifications = async (users: any[], orders: any[]) => {
  const now = Date.now();
  const notifications = [
    // === READ NOTIFICATIONS ===
    {
      user: users[1]._id,
      type: 'order',
      channel: 'in-app',
      title: 'Order Confirmed 📦',
      message: `Your order #${orders[0]?.orderNumber || 'ORD-12345'} has been confirmed and will be shipped soon`,
      status: 'read',
      isRead: true,
      readAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
      priority: 'high',
      link: `/orders/${orders[0]?._id || ''}`,
      icon: '📦',
      retryCount: 0,
      maxRetries: 3,
      deliveredAt: new Date(now - 5 * 24 * 60 * 60 * 1000 - 1000),
      metadata: {
        orderId: orders[0]?._id.toString() || '',
        orderTotal: 4999,
        orderNumber: orders[0]?.orderNumber || 'ORD-12345'
      }
    },
    {
      user: users[1]._id,
      type: 'system',
      channel: 'in-app',
      title: 'Welcome to Vardhman Mills 👋',
      message: 'Thank you for joining us! Explore our premium textile collections.',
      status: 'read',
      isRead: true,
      readAt: new Date(now - 10 * 24 * 60 * 60 * 1000),
      priority: 'low',
      link: '/collections',
      icon: '⚙️',
      retryCount: 0,
      maxRetries: 3,
      deliveredAt: new Date(now - 10 * 24 * 60 * 60 * 1000 - 1000)
    },
    
    // === UNREAD NOTIFICATIONS ===
    {
      user: users[1]._id,
      type: 'promotion',
      channel: 'in-app',
      title: 'Special Offer Just for You! 🎉',
      message: 'Get 20% off on your next purchase. Limited time offer!',
      status: 'delivered',
      isRead: false,
      priority: 'medium',
      link: '/deals',
      icon: '🎉',
      imageUrl: 'https://via.placeholder.com/600x300?text=20%+OFF',
      actions: [
        { label: 'Shop Now', action: '/deals', style: 'primary' },
        { label: 'View Terms', action: '/terms', style: 'secondary' }
      ],
      retryCount: 0,
      maxRetries: 3,
      deliveredAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(now + 5 * 24 * 60 * 60 * 1000),
      metadata: {
        couponCode: 'SAVE20',
        discountPercent: 20,
        validUntil: new Date(now + 5 * 24 * 60 * 60 * 1000)
      }
    },
    {
      user: users[2]._id,
      type: 'product',
      channel: 'in-app',
      title: 'Back in Stock! 🛍️',
      message: 'The Premium Cotton Bedsheet you wishlisted is now back in stock.',
      status: 'delivered',
      isRead: false,
      priority: 'medium',
      link: '/products/premium-cotton-bedsheet',
      icon: '🛍️',
      imageUrl: 'https://via.placeholder.com/400x400?text=Premium+Bedsheet',
      actions: [
        { label: 'Add to Cart', action: '/products/premium-cotton-bedsheet', style: 'primary' }
      ],
      retryCount: 0,
      maxRetries: 3,
      deliveredAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
      metadata: {
        productId: 'prod_12345',
        productName: 'Premium Cotton Bedsheet',
        price: 2499,
        stock: 15
      }
    },
    
    // === MULTI-CHANNEL NOTIFICATIONS ===
    {
      user: users[2]._id,
      type: 'order',
      channel: 'email',
      title: 'Order Shipped 📦',
      message: `Your order #${orders[1]?.orderNumber || 'ORD-67890'} has been shipped and is on its way!`,
      status: 'sent',
      isRead: false,
      priority: 'high',
      link: `/orders/${orders[1]?._id || ''}/track`,
      icon: '📦',
      retryCount: 0,
      maxRetries: 3,
      deliveredAt: new Date(now - 3 * 60 * 60 * 1000),
      metadata: {
        orderId: orders[1]?._id.toString() || '',
        trackingNumber: 'TRK1234567890',
        carrier: 'Delhivery',
        estimatedDelivery: new Date(now + 3 * 24 * 60 * 60 * 1000)
      }
    },
    
    // === SCHEDULED NOTIFICATION (FUTURE) ===
    {
      user: users[1]._id,
      type: 'promotion',
      channel: 'in-app',
      title: 'Upcoming Sale Alert 🎊',
      message: 'Our mega sale starts tomorrow! Get ready for amazing deals.',
      status: 'pending',
      isRead: false,
      priority: 'high',
      scheduledFor: new Date(now + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      link: '/sales/mega-sale',
      icon: '🎉',
      retryCount: 0,
      maxRetries: 3,
      metadata: {
        saleId: 'sale_mega_2024',
        saleStartDate: new Date(now + 1 * 24 * 60 * 60 * 1000),
        maxDiscount: 50
      }
    },
    
    // === FAILED NOTIFICATION (FOR RETRY TESTING) ===
    {
      user: users[2]._id,
      type: 'account',
      channel: 'push',
      title: 'Verify Your Email 📧',
      message: 'Please verify your email address to complete your account setup.',
      status: 'failed',
      isRead: false,
      priority: 'urgent',
      link: '/account/verify-email',
      icon: '👤',
      retryCount: 1,
      maxRetries: 3,
      lastError: 'FCM token not registered',
      failedAt: new Date(now - 2 * 60 * 60 * 1000),
      metadata: {
        verificationToken: 'VER_TOKEN_123',
        emailAddress: users[2]?.email || 'user@example.com'
      }
    }
  ];
  return await Notification.insertMany(notifications);
};

const createNotificationTemplates = async () => {
  const templates = [
    {
      name: 'Order Confirmation',
      type: 'order',
      channels: {
        email: {
          subject: 'Your Order #{{orderNumber}} has been confirmed',
          html: '<p>Dear {{customerName}},</p><p>Your order #{{orderNumber}} has been confirmed and will be processed shortly.</p><p>Thank you for shopping with us!</p>',
          text: 'Dear {{customerName}}, Your order #{{orderNumber}} has been confirmed and will be processed shortly. Thank you for shopping with us!'
        }
      },
      isActive: true,
      variables: ['orderNumber', 'customerName', 'orderTotal'],
      category: 'order',
      version: 1
    },
    {
      name: 'Shipping Notification',
      type: 'order',
      channels: {
        email: {
          subject: 'Your Order #{{orderNumber}} has been shipped',
          html: '<p>Your order is on its way! Track it here: <a href="{{trackingUrl}}">{{trackingUrl}}</a></p>',
          text: 'Your order is on its way! Track it here: {{trackingUrl}}'
        }
      },
      isActive: true,
      variables: ['orderNumber', 'trackingUrl', 'estimatedDelivery'],
      category: 'shipping',
      version: 1
    },
    {
      name: 'Welcome Email',
      type: 'account',
      channels: {
        email: {
          subject: 'Welcome to Vardhman Mills, {{firstName}}!',
          html: '<p>Welcome to our family! Use code WELCOME10 for 10% off your first order.</p>',
          text: 'Welcome to our family! Use code WELCOME10 for 10% off your first order.'
        }
      },
      isActive: true,
      variables: ['firstName', 'lastName'],
      category: 'welcome',
      version: 1
    }
  ];
  return await NotificationTemplate.insertMany(templates);
};

const createProductComparisons = async (users: any[], products: any[]) => {
  const crypto = await import('crypto');
  
  const comparisons = [
    {
      user: users[1]._id,
      products: [products[0]._id, products[1]._id],
      name: 'Premium Cotton Bed Sheets Comparison',
      description: 'Comparing thread count, fabric quality, and price points',
      category: 'Bed Sheets',
      isPublic: true,
      shareToken: crypto.randomBytes(16).toString('hex'),
      views: 45,
      lastViewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      comparisonData: {
        features: [
          {
            name: 'Thread Count',
            values: [600, 800],
            type: 'number'
          },
          {
            name: 'Material',
            values: ['100% Egyptian Cotton', '100% Pima Cotton'],
            type: 'text'
          },
          {
            name: 'Machine Washable',
            values: [true, true],
            type: 'boolean'
          },
          {
            name: 'Rating',
            values: [4.5, 4.7],
            type: 'rating'
          }
        ],
        winner: {
          productId: products[1]._id,
          score: 8.9,
          reasons: [
            'Higher thread count for superior comfort',
            'Better customer ratings',
            'Premium Pima cotton for durability'
          ]
        }
      }
    },
    {
      user: users[2]._id,
      products: [products[2]._id, products[3]._id],
      name: 'Memory Foam vs Down Pillows',
      description: 'Comparing support, comfort, and hypoallergenic properties',
      category: 'Pillows',
      isPublic: true,
      shareToken: crypto.randomBytes(16).toString('hex'),
      views: 28,
      lastViewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      comparisonData: {
        features: [
          {
            name: 'Support Level',
            values: ['Firm', 'Soft'],
            type: 'text'
          },
          {
            name: 'Hypoallergenic',
            values: [true, false],
            type: 'boolean'
          },
          {
            name: 'Price',
            values: [2999, 3999],
            type: 'number'
          },
          {
            name: 'Rating',
            values: [4.3, 4.6],
            type: 'rating'
          }
        ],
        winner: {
          productId: products[2]._id,
          score: 8.5,
          reasons: [
            'Better value for money',
            'Hypoallergenic properties',
            'Consistent support throughout the night'
          ]
        }
      }
    },
    {
      user: users[1]._id,
      products: [products[0]._id, products[2]._id, products[3]._id],
      name: 'Complete Bedroom Set Comparison',
      description: 'Comparing sheets, pillows, and quilts for overall value',
      category: 'Bedroom Essentials',
      isPublic: false,
      views: 12,
      lastViewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      comparisonData: {
        features: [
          {
            name: 'Overall Quality',
            values: ['Premium', 'Luxury', 'Premium'],
            type: 'text'
          },
          {
            name: 'Price',
            values: [4999, 2999, 3999],
            type: 'number'
          },
          {
            name: 'Rating',
            values: [4.5, 4.3, 4.6],
            type: 'rating'
          }
        ],
        winner: {
          productId: products[0]._id,
          score: 9.1,
          reasons: [
            'Best overall quality',
            'Consistent brand reputation',
            'Complete bedroom solution'
          ]
        }
      }
    }
  ];
  
  // Generate share URLs for public comparisons
  comparisons.forEach((comp: any) => {
    if (comp.isPublic && comp.shareToken) {
      comp.shareUrl = `https://vardhmanmills.com/compare/shared/${comp.shareToken}`;
    }
  });
  
  return await ProductComparison.insertMany(comparisons);
};

const createSearchQueries = async (users: any[], products: any[]) => {
  const queries = [
    {
      query: 'cotton bed sheets',
      normalizedQuery: 'cotton bed sheets',
      user: users[1]._id,
      filters: {},
      resultsCount: 15,
      resultsFound: true,
      topResults: [products[0]._id, products[1]._id],
      clicked: true,
      clickedResults: [products[0]._id],
      source: 'header',
      device: 'desktop',
      searchedAt: new Date()
    },
    {
      query: 'memory foam pillow',
      normalizedQuery: 'memory foam pillow',
      user: users[2]._id,
      filters: {},
      resultsCount: 8,
      resultsFound: true,
      topResults: [products[2]._id],
      clicked: true,
      clickedResults: [products[2]._id],
      source: 'header',
      device: 'mobile',
      searchedAt: new Date()
    },
    {
      query: 'towel set',
      normalizedQuery: 'towel set',
      filters: {},
      resultsCount: 12,
      resultsFound: true,
      topResults: [products[3]._id],
      clicked: false,
      source: 'page',
      device: 'desktop',
      searchedAt: new Date()
    }
  ];
  return await SearchQuery.insertMany(queries);
};

const createSiteConfig = async () => {
  const config = new SiteConfig({
    siteName: 'Vardhman Mills',
    siteUrl: 'https://vardhmanmills.com',
    siteDescription: 'Premium Textile Solutions',
    logo: 'https://via.placeholder.com/300x100?text=Vardhman+Mills',
    favicon: 'https://via.placeholder.com/32x32?text=VM',
    contactEmail: 'admin@vardhmanmills.com',
    supportEmail: 'support@vardhmanmills.com',
    contactPhone: '+91-9876543210',
    socialLinks: {
      facebook: 'https://facebook.com/vardhmanmills',
      twitter: 'https://twitter.com/vardhmanmills',
      instagram: 'https://instagram.com/vardhmanmills',
      linkedin: 'https://linkedin.com/company/vardhmanmills'
    },
    seo: {
      metaTitle: 'Vardhman Mills - Premium Textile Solutions',
      metaDescription: 'Leading textile manufacturer offering premium fabrics and home textiles',
      metaKeywords: ['textile', 'fabrics', 'bedsheets', 'home textiles']
    },
    isActive: true
  });
  await config.save();
  return config;
};

const createSocialLinks = async () => {
  const links = [
    {
      platform: 'facebook',
      title: 'Follow us on Facebook',
      url: 'https://facebook.com/vardhmanmills',
      displayName: 'Facebook',
      icon: 'fab fa-facebook',
      isActive: true,
      sortOrder: 1
    },
    {
      platform: 'instagram',
      title: 'Follow us on Instagram',
      url: 'https://instagram.com/vardhmanmills',
      displayName: 'Instagram',
      icon: 'fab fa-instagram',
      isActive: true,
      sortOrder: 2
    },
    {
      platform: 'twitter',
      title: 'Follow us on Twitter',
      url: 'https://twitter.com/vardhmanmills',
      displayName: 'Twitter',
      icon: 'fab fa-twitter',
      isActive: true,
      sortOrder: 3
    },
    {
      platform: 'linkedin',
      title: 'Connect on LinkedIn',
      url: 'https://linkedin.com/company/vardhmanmills',
      displayName: 'LinkedIn',
      icon: 'fab fa-linkedin',
      isActive: true,
      sortOrder: 4
    }
  ];
  return await SocialLink.insertMany(links);
};

const createSupportTickets = async (users: any[]) => {
  const tickets = [
    {
      ticketNumber: 'TKT-' + Date.now(),
      user: users[1]._id,
      subject: 'Product not received',
      description: 'I placed an order last week but haven\'t received it yet.',
      priority: 'high',
      status: 'open',
      category: 'shipping',
      messages: [
        {
          sender: users[1]._id,
          senderType: 'user',
          message: 'I placed an order last week but haven\'t received it yet.',
          attachments: [],
          isInternal: false
        }
      ]
    },
    {
      ticketNumber: 'TKT-' + (Date.now() + 1),
      user: users[2]._id,
      subject: 'Refund request',
      description: 'I would like to return my order and get a refund.',
      priority: 'medium',
      status: 'in-progress',
      category: 'return-refund',
      assignedTo: users[0]._id,
      messages: [
        {
          sender: users[2]._id,
          senderType: 'user',
          message: 'I would like to return my order and get a refund.',
          attachments: [],
          isInternal: false
        },
        {
          sender: users[0]._id,
          senderType: 'admin',
          message: 'We\'re processing your refund request. It will take 3-5 business days.',
          attachments: [],
          isInternal: false
        }
      ]
    }
  ];
  return await SupportTicket.insertMany(tickets);
};

const createBlogComments = async (users: any[], blogPosts: any[]) => {
  const comments = [
    {
      post: blogPosts[0]._id,
      user: users[1]._id,
      content: 'Great article! Very informative.',
      isApproved: true,
      isFlagged: false,
      likes: [users[2]._id],
      likesCount: 1,
      repliesCount: 0
    },
    {
      post: blogPosts[0]._id,
      user: users[2]._id,
      content: 'Thanks for sharing this information.',
      isApproved: true,
      isFlagged: false,
      parent: null,
      likes: [],
      likesCount: 0,
      repliesCount: 0
    },
    {
      post: blogPosts[1]._id,
      user: users[1]._id,
      content: 'Interesting perspective on fabric care.',
      isApproved: true,
      isFlagged: false,
      likes: [users[0]._id, users[2]._id],
      likesCount: 2,
      repliesCount: 0
    }
  ];
  return await BlogComment.insertMany(comments);
};

const createNotificationPreferences = async (users: any[]) => {
  const crypto = await import('crypto');
  
  const preferences = [
    // User 1 - Full preferences with FCM tokens and quiet hours
    {
      user: users[1]._id,
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: true
      },
      types: {
        order: {
          enabled: true,
          channels: ['in-app', 'email', 'push']
        },
        product: {
          enabled: true,
          channels: ['in-app', 'push']
        },
        promotion: {
          enabled: true,
          channels: ['in-app', 'email']
        },
        account: {
          enabled: true,
          channels: ['in-app', 'email']
        },
        system: {
          enabled: true,
          channels: ['in-app', 'email']
        }
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'Asia/Kolkata'
      },
      frequency: {
        maxPerDay: 50,
        maxPerHour: 10
      },
      fcmTokens: [
        `fcm_token_${crypto.randomBytes(16).toString('hex')}`,
        `fcm_token_${crypto.randomBytes(16).toString('hex')}`
      ],
      emailVerified: true,
      phoneVerified: false
    },
    // User 2 - Minimal preferences
    {
      user: users[2]._id,
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: false
      },
      types: {
        order: {
          enabled: true,
          channels: ['in-app', 'email']
        },
        product: {
          enabled: false,
          channels: []
        },
        promotion: {
          enabled: false,
          channels: []
        },
        account: {
          enabled: true,
          channels: ['in-app', 'email']
        },
        system: {
          enabled: true,
          channels: ['in-app']
        }
      },
      quietHours: {
        enabled: false
      },
      frequency: {
        maxPerDay: 20,
        maxPerHour: 5
      },
      fcmTokens: [],
      emailVerified: true,
      phoneVerified: false
    }
  ];
  
  return await NotificationPreference.insertMany(preferences);
};

const createReviewMedia = async (users: any[], products: any[], reviews: any[]) => {
  const media = [
    {
      review: reviews[0]._id,
      user: users[1]._id,
      product: products[0]._id,
      type: 'image',
      url: 'https://res.cloudinary.com/vardhman/image/upload/reviews/review1.jpg',
      originalUrl: 'https://res.cloudinary.com/vardhman/image/upload/reviews/original_review1.jpg',
      filename: 'review1.jpg',
      metadata: {
        size: 245800,
        width: 1920,
        height: 1080,
        format: 'jpeg',
        quality: 'high' as const
      },
      analytics: {
        views: 120,
        likes: 15,
        shares: 3,
        downloads: 5,
        reports: 0,
        engagementRate: 12.5
      },
      moderation: {
        status: 'approved' as const,
        flags: [],
        autoModerationScore: 95,
        humanReviewRequired: false
      },
      optimization: {
        isOptimized: true,
        originalSize: 350000,
        compressedSize: 245800,
        compressionRatio: 0.70,
        formats: [],
        thumbnails: []
      },
      accessibility: {
        altText: 'Customer review photo of Premium Cotton Bedsheet',
        caption: 'High quality bedsheet in use'
      },
      seo: {
        title: 'Premium Cotton Bedsheet Review Photo',
        description: 'Customer submitted photo showing the quality of our Premium Cotton Bedsheet',
        keywords: ['bedsheet', 'cotton', 'review', 'customer photo']
      },
      usage: {
        featured: true,
        showcaseOrder: 1,
        categories: ['reviews', 'bedsheets'],
        tags: ['customer-photo', 'quality'],
        collections: []
      },
      storage: {
        provider: 'cloudinary' as const,
        bucket: 'vardhman-reviews',
        path: '/reviews/review1.jpg',
        cdn: true,
        cdnUrl: 'https://res.cloudinary.com/vardhman/image/upload/reviews/review1.jpg',
        backupUrls: []
      },
      processing: {
        status: 'completed' as const,
        progress: 100,
        tasks: [],
        priority: 1
      }
    },
    {
      review: reviews[1]._id,
      user: users[2]._id,
      product: products[1]._id,
      type: 'image',
      url: 'https://res.cloudinary.com/vardhman/image/upload/reviews/review2.jpg',
      originalUrl: 'https://res.cloudinary.com/vardhman/image/upload/reviews/original_review2.jpg',
      filename: 'review2.jpg',
      metadata: {
        size: 189500,
        width: 1920,
        height: 1080,
        format: 'jpeg',
        quality: 'high' as const
      },
      analytics: {
        views: 85,
        likes: 10,
        shares: 2,
        downloads: 3,
        reports: 0,
        engagementRate: 11.8
      },
      moderation: {
        status: 'approved' as const,
        flags: [],
        autoModerationScore: 92,
        humanReviewRequired: false
      },
      optimization: {
        isOptimized: true,
        originalSize: 280000,
        compressedSize: 189500,
        compressionRatio: 0.68,
        formats: [],
        thumbnails: []
      },
      accessibility: {
        altText: 'Customer review photo of Luxury Quilt',
        caption: 'Comfortable quilt showcasing warmth and quality'
      },
      seo: {
        title: 'Luxury Quilt Review Photo',
        description: 'Customer submitted photo demonstrating the quality and comfort of our Luxury Quilt',
        keywords: ['quilt', 'luxury', 'review', 'customer photo']
      },
      usage: {
        featured: false,
        categories: ['reviews', 'quilts'],
        tags: ['customer-photo', 'comfort'],
        collections: []
      },
      storage: {
        provider: 'cloudinary' as const,
        bucket: 'vardhman-reviews',
        path: '/reviews/review2.jpg',
        cdn: true,
        cdnUrl: 'https://res.cloudinary.com/vardhman/image/upload/reviews/review2.jpg',
        backupUrls: []
      },
      processing: {
        status: 'completed' as const,
        progress: 100,
        tasks: [],
        priority: 1
      }
    }
  ];
  return await ReviewMedia.insertMany(media);
};

const createReviewReplies = async (users: any[], products: any[], reviews: any[]) => {
  const replies = [
    {
      review: reviews[0]._id,
      user: users[0]._id,
      product: products[0]._id,
      content: 'Thank you for your feedback! We\'re glad you loved the product.',
      level: 0,
      path: '/',
      parentIds: [],
      metadata: {
        source: 'admin' as const,
        isEdited: false,
        editCount: 0
      },
      moderation: {
        status: 'approved' as const,
        flags: [],
        autoModerationScore: 98,
        humanReviewRequired: false,
        isHidden: false
      },
      engagement: {
        likes: 5,
        dislikes: 0,
        replies: 0,
        reports: 0,
        helpfulVotes: 5,
        unhelpfulVotes: 0
      },
      analytics: {
        views: 120,
        clickThroughs: 0,
        mentions: [],
        sentiment: 'positive' as const,
        topics: ['appreciation', 'support'],
        readingTime: 5,
        engagementRate: 4.2
      },
      notifications: {
        notifyAuthor: true,
        notifyModerators: false,
        notifyMentioned: false,
        emailSent: true,
        pushSent: false
      },
      verification: {
        isVerifiedPurchase: false,
        verificationLevel: 'email' as const
      },
      visibility: {
        isVisible: true,
        showInFeed: true,
        isPinned: false
      }
    },
    {
      review: reviews[1]._id,
      user: users[0]._id,
      product: products[1]._id,
      content: 'We appreciate your honest review and will work on improving.',
      level: 0,
      path: '/',
      parentIds: [],
      metadata: {
        source: 'admin' as const,
        isEdited: false,
        editCount: 0
      },
      moderation: {
        status: 'approved' as const,
        flags: [],
        autoModerationScore: 96,
        humanReviewRequired: false,
        isHidden: false
      },
      engagement: {
        likes: 3,
        dislikes: 0,
        replies: 0,
        reports: 0,
        helpfulVotes: 3,
        unhelpfulVotes: 0
      },
      analytics: {
        views: 85,
        clickThroughs: 0,
        mentions: [],
        sentiment: 'neutral' as const,
        topics: ['acknowledgment', 'improvement'],
        readingTime: 4,
        engagementRate: 3.5
      },
      notifications: {
        notifyAuthor: true,
        notifyModerators: false,
        notifyMentioned: false,
        emailSent: true,
        pushSent: false
      },
      verification: {
        isVerifiedPurchase: false,
        verificationLevel: 'email' as const
      },
      visibility: {
        isVisible: true,
        showInFeed: true,
        isPinned: false
      }
    }
  ];
  return await ReviewReply.insertMany(replies);
};

const createAnalyticsEvents = async (users: any[], comparisons: any[], products: any[]) => {
  const events = [
    {
      type: 'page_view',
      name: 'Homepage View',
      category: 'engagement',
      page: {
        url: 'https://vardhmanmills.com/',
        title: 'Homepage',
        referrer: 'https://google.com',
        path: '/'
      },
      user: users[1]._id,
      sessionId: 'sess_' + Date.now(),
      device: {
        type: 'desktop' as const,
        browser: 'Chrome',
        os: 'Windows',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      location: {
        country: 'India',
        city: 'Mumbai'
      },
      timestamp: new Date()
    },
    {
      type: 'product_view',
      name: 'Product View',
      category: 'product',
      product: {
        productId: products[0]._id.toString(),
        productName: 'Premium Cotton Bedsheet',
        price: 2499,
        brand: 'Vardhman Mills'
      },
      user: users[1]._id,
      sessionId: 'sess_' + (Date.now() + 1),
      device: {
        type: 'mobile' as const,
        browser: 'Safari',
        os: 'iOS',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      },
      location: {
        country: 'India',
        city: 'Delhi'
      },
      timestamp: new Date()
    },
    {
      type: 'add_to_cart',
      name: 'Add to Cart',
      category: 'conversion',
      product: {
        productId: products[1]._id.toString(),
        productName: 'Luxury Quilt',
        price: 3999,
        quantity: 2
      },
      user: users[2]._id,
      sessionId: 'sess_' + (Date.now() + 2),
      device: {
        type: 'desktop' as const,
        browser: 'Firefox',
        os: 'Windows'
      },
      location: {
        country: 'India',
        city: 'Bangalore'
      },
      timestamp: new Date()
    },
    // === COMPARISON-RELATED EVENTS (using 'custom' type) ===
    {
      type: 'custom',
      name: 'Comparison Viewed',
      category: 'comparison',
      action: 'view',
      label: 'Premium Cotton Bed Sheets Comparison',
      metadata: {
        eventType: 'comparison_view',
        comparisonId: comparisons[0]._id.toString(),
        comparisonName: 'Premium Cotton Bed Sheets Comparison',
        productCount: 2,
        productIds: [products[0]._id.toString(), products[1]._id.toString()],
        isPublic: true,
        shareToken: comparisons[0].shareToken
      },
      user: users[1]._id,
      sessionId: 'sess_' + (Date.now() + 3),
      device: {
        type: 'desktop' as const,
        browser: 'Chrome',
        os: 'Windows',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      location: {
        country: 'India',
        city: 'Mumbai'
      },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      type: 'custom',
      name: 'Comparison Exported as PDF',
      category: 'comparison',
      action: 'export',
      label: 'PDF Export',
      metadata: {
        eventType: 'comparison_export',
        comparisonId: comparisons[0]._id.toString(),
        exportFormat: 'pdf',
        productCount: 2,
        fileSize: '245KB'
      },
      user: users[1]._id,
      sessionId: 'sess_' + (Date.now() + 4),
      device: {
        type: 'desktop' as const,
        browser: 'Chrome',
        os: 'Windows'
      },
      location: {
        country: 'India',
        city: 'Mumbai'
      },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
    },
    {
      type: 'custom',
      name: 'Comparison Shared',
      category: 'comparison',
      action: 'share',
      label: 'Share via Link',
      metadata: {
        eventType: 'comparison_share',
        comparisonId: comparisons[0]._id.toString(),
        shareMethod: 'link',
        shareToken: comparisons[0].shareToken,
        shareUrl: comparisons[0].shareUrl
      },
      user: users[1]._id,
      sessionId: 'sess_' + (Date.now() + 5),
      device: {
        type: 'mobile' as const,
        browser: 'Safari',
        os: 'iOS'
      },
      location: {
        country: 'India',
        city: 'Delhi'
      },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000)
    },
    {
      type: 'custom',
      name: 'AI Insights Requested',
      category: 'comparison',
      action: 'ai_insights',
      label: 'Winner Analysis',
      metadata: {
        eventType: 'comparison_insight_requested',
        comparisonId: comparisons[0]._id.toString(),
        insightType: 'winner_analysis',
        productCount: 2,
        processingTime: '1.2s'
      },
      user: users[1]._id,
      sessionId: 'sess_' + (Date.now() + 6),
      device: {
        type: 'desktop' as const,
        browser: 'Chrome',
        os: 'Windows'
      },
      location: {
        country: 'India',
        city: 'Mumbai'
      },
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      type: 'custom',
      name: 'Products Compared',
      category: 'comparison',
      action: 'compare',
      label: 'Memory Foam vs Down Pillows',
      metadata: {
        eventType: 'product_compared',
        comparisonId: comparisons[1]._id.toString(),
        productIds: [products[2]._id.toString(), products[3]._id.toString()],
        productNames: ['Memory Foam Pillow', 'Down Pillow'],
        comparisonCategory: 'Pillows',
        featureCount: 4
      },
      user: users[2]._id,
      sessionId: 'sess_' + (Date.now() + 7),
      device: {
        type: 'mobile' as const,
        browser: 'Chrome',
        os: 'Android'
      },
      location: {
        country: 'India',
        city: 'Bangalore'
      },
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      type: 'custom',
      name: 'Recommendation Viewed',
      category: 'comparison',
      action: 'view_recommendation',
      label: 'Memory Foam Pillow Recommended',
      metadata: {
        eventType: 'comparison_recommendation_viewed',
        comparisonId: comparisons[1]._id.toString(),
        recommendedProductId: products[2]._id.toString(),
        recommendationScore: 8.5,
        reasons: ['Better value', 'Hypoallergenic', 'Consistent support']
      },
      user: users[2]._id,
      sessionId: 'sess_' + (Date.now() + 8),
      device: {
        type: 'mobile' as const,
        browser: 'Chrome',
        os: 'Android'
      },
      location: {
        country: 'India',
        city: 'Bangalore'
      },
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000)
    }
  ];
  return await AnalyticsEvent.insertMany(events);
};

const createBannerGroups = async (users: any[]) => {
  const groups = [
    {
      name: 'Homepage Hero',
      description: 'Main hero banners on homepage',
      type: 'carousel' as const,
      position: {
        page: 'homepage',
        location: 'hero',
        priority: 1
      },
      settings: {
        autoplay: true,
        autoplaySpeed: 5000,
        loop: true,
        arrows: true,
        dots: true,
        pauseOnHover: true,
        swipeable: true
      },
      display: {
        slidesToShow: 1,
        slidesToScroll: 1,
        gap: '0px',
        height: '600px',
        width: '100%'
      },
      status: 'active' as const,
      isActive: true,
      analytics: {
        totalImpressions: 0,
        totalClicks: 0
      },
      createdBy: users[0]._id
    },
    {
      name: 'Category Banners',
      description: 'Promotional banners for category pages',
      type: 'grid' as const,
      position: {
        page: 'category',
        location: 'top',
        priority: 2
      },
      settings: {
        autoplay: false,
        loop: false,
        arrows: false,
        dots: false
      },
      display: {
        gap: '20px',
        height: '300px',
        width: '100%'
      },
      status: 'active' as const,
      isActive: true,
      analytics: {
        totalImpressions: 0,
        totalClicks: 0
      },
      createdBy: users[0]._id
    },
    {
      name: 'Sidebar Promotions',
      description: 'Promotional banners in sidebar',
      type: 'stack' as const,
      position: {
        page: 'product',
        location: 'sidebar',
        priority: 3
      },
      settings: {
        autoplay: false,
        loop: false,
        arrows: false,
        dots: false
      },
      display: {
        gap: '15px',
        height: '250px',
        width: '300px'
      },
      status: 'active' as const,
      isActive: true,
      analytics: {
        totalImpressions: 0,
        totalClicks: 0
      },
      createdBy: users[0]._id
    }
  ];
  return await BannerGroup.insertMany(groups);
};

const createBanners = async (users: any[], bannerGroups: any[], products: any[]) => {
  const banners = [
    {
      name: 'Summer Sale 2024',
      title: 'Summer Sale 2024',
      description: 'Get amazing discounts on premium bedsheets and home textiles - Up to 50% off',
      type: 'promotional' as const,
      desktopImage: 'https://res.cloudinary.com/vardhman/image/upload/banners/summer-sale.jpg',
      mobileImage: 'https://res.cloudinary.com/vardhman/image/upload/banners/summer-sale-mobile.jpg',
      altText: 'Summer Sale 2024 - Up to 50% off on bedsheets',
      link: {
        url: '/collections/summer-sale',
        target: '_self' as const,
        title: 'Shop Now'
      },
      position: {
        page: 'homepage',
        location: 'top' as const,
        priority: 1
      },
      displaySettings: {
        width: '100%',
        height: '600px',
        aspectRatio: '16:9',
        objectFit: 'cover' as const,
        shadow: false
      },
      status: 'active' as const,
      isActive: true,
      publishAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      groupId: bannerGroups[0]._id,
      sortOrder: 1,
      analytics: {
        impressions: 0,
        clicks: 0
      },
      createdBy: users[0]._id
    },
    {
      name: 'New Arrivals',
      title: 'New Arrivals',
      description: 'Discover new designs and patterns in our latest collection',
      type: 'product' as const,
      desktopImage: 'https://res.cloudinary.com/vardhman/image/upload/banners/new-arrivals.jpg',
      mobileImage: 'https://res.cloudinary.com/vardhman/image/upload/banners/new-arrivals-mobile.jpg',
      altText: 'New Arrivals - Latest collection of bedsheets',
      link: {
        url: '/collections/new-arrivals',
        target: '_self' as const,
        title: 'Explore'
      },
      position: {
        page: 'homepage',
        location: 'middle' as const,
        priority: 2
      },
      displaySettings: {
        width: '100%',
        height: '500px',
        aspectRatio: '16:9',
        objectFit: 'cover' as const,
        shadow: true
      },
      status: 'active' as const,
      isActive: true,
      publishAt: new Date(),
      groupId: bannerGroups[0]._id,
      sortOrder: 2,
      analytics: {
        impressions: 0,
        clicks: 0
      },
      createdBy: users[0]._id
    },
    {
      name: 'Premium Bedsheets',
      title: 'Premium Bedsheets',
      description: 'Quality you can trust - Premium cotton bedsheets',
      type: 'category' as const,
      desktopImage: 'https://res.cloudinary.com/vardhman/image/upload/banners/premium-bedsheets.jpg',
      altText: 'Premium Bedsheets Collection',
      link: {
        url: '/categories/bed-sheets',
        target: '_self' as const,
        title: 'View Collection'
      },
      position: {
        page: 'category',
        location: 'top' as const,
        priority: 1
      },
      displaySettings: {
        width: '100%',
        height: '400px',
        objectFit: 'cover' as const
      },
      status: 'active' as const,
      isActive: true,
      publishAt: new Date(),
      groupId: bannerGroups[1]._id,
      sortOrder: 1,
      analytics: {
        impressions: 0,
        clicks: 0
      },
      createdBy: users[0]._id
    }
  ];
  return await Banner.insertMany(banners);
};

const createSEOSettings = async () => {
  const seoSettings = new SEOSettings({
    siteTitle: 'Vardhman Mills - Premium Home Textiles',
    siteDescription: 'Leading manufacturer of premium quality bedsheets, towels, and home textiles',
    defaultKeywords: ['textiles', 'bedsheets', 'home textiles', 'cotton fabrics', 'premium bedding'],
    robotsContent: 'index, follow',
    sitemapEnabled: true,
    openGraphEnabled: true,
    twitterCardsEnabled: true,
    structuredDataEnabled: true,
    canonicalUrlsEnabled: true,
    hreflangEnabled: false,
    metaRobotsDefault: 'index, follow',
    socialShareImages: {
      facebook: 'https://res.cloudinary.com/vardhman/image/upload/og-image.jpg',
      twitter: 'https://res.cloudinary.com/vardhman/image/upload/twitter-image.jpg'
    },
    analytics: {
      googleAnalyticsId: 'UA-XXXXXXXXX-X',
      googleTagManagerId: 'GTM-XXXXXXX'
    },
    verification: {},
    defaultOgType: 'website',
    siteName: 'Vardhman Mills',
    siteUrl: 'https://vardhmanmills.com',
    defaultImage: 'https://res.cloudinary.com/vardhman/image/upload/og-image.jpg',
    locale: 'en_IN',
    alternateLocales: ['hi_IN'],
    breadcrumbsEnabled: true,
    paginationEnabled: true,
    schemaAutoGenerate: true,
    imageAltAutoGenerate: false
  });
  await seoSettings.save();
  return seoSettings;
};

const createPageSEOs = async () => {
  const pageSEOs = [
    {
      pageId: 'home-page',
      pageType: 'home',
      slug: '/',
      title: 'Vardhman Mills - Premium Home Textiles & Bedding',
      description: 'Discover premium quality bedsheets, towels, and home textiles. Trusted manufacturer since decades.',
      keywords: ['home textiles', 'premium bedsheets', 'cotton bedding', 'quality towels'],
      ogTitle: 'Vardhman Mills - Premium Home Textiles',
      ogDescription: 'Leading manufacturer of premium home textiles',
      ogImage: 'https://res.cloudinary.com/vardhman/image/upload/og-home.jpg'
    },
    {
      pageId: 'bedsheets-category',
      pageType: 'category',
      slug: '/categories/bed-sheets',
      title: 'Premium Bedsheets - Vardhman Mills',
      description: 'Shop our collection of premium cotton bedsheets in various sizes and designs',
      keywords: ['bedsheets', 'cotton bedsheets', 'premium bedding']
    },
    {
      pageId: 'products-general',
      pageType: 'product',
      slug: '/products/*',
      title: 'Product Name - Vardhman Mills',
      description: 'Product description for SEO',
      keywords: ['product', 'vardhman mills']
    }
  ];
  return await PageSEO.insertMany(pageSEOs);
};

// ============================================
// SEO Extended Content
// ============================================

const createMetaTags = async () => {
  const metaTags = [
    // Home Page Meta Tags
    {
      name: 'description',
      content: 'Discover premium quality bedsheets, towels, and home textiles from Vardhman Mills',
      pages: ['home'],
      isGlobal: false,
      isActive: true,
      category: 'seo',
      description: 'Home page meta description'
    },
    {
      name: 'keywords',
      content: 'home textiles, bedsheets, towels, cotton bedding, premium quality',
      pages: ['home'],
      isGlobal: false,
      isActive: true,
      category: 'seo',
      description: 'Home page keywords'
    },
    {
      property: 'og:title',
      content: 'Vardhman Mills - Premium Home Textiles',
      pages: ['home'],
      isGlobal: false,
      isActive: true,
      category: 'social',
      description: 'Open Graph title for home page'
    },
    {
      property: 'og:description',
      content: 'Leading manufacturer of premium home textiles since decades',
      pages: ['home'],
      isGlobal: false,
      isActive: true,
      category: 'social',
      description: 'Open Graph description for home page'
    },
    {
      property: 'og:type',
      content: 'website',
      pages: ['home'],
      isGlobal: false,
      isActive: true,
      category: 'social',
      description: 'Open Graph type'
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
      pages: ['home'],
      isGlobal: false,
      isActive: true,
      category: 'social',
      description: 'Twitter card type'
    },
    // Products Page Meta Tags
    {
      name: 'description',
      content: 'Browse our wide range of premium home textile products',
      pages: ['products'],
      isGlobal: false,
      isActive: true,
      category: 'seo',
      description: 'Products page meta description'
    },
    {
      property: 'og:type',
      content: 'product.group',
      pages: ['products'],
      isGlobal: false,
      isActive: true,
      category: 'social',
      description: 'Open Graph type for products'
    },
    // About Page Meta Tags
    {
      name: 'description',
      content: 'Learn about Vardhman Mills - A legacy of quality in home textiles',
      pages: ['about'],
      isGlobal: false,
      isActive: true,
      category: 'seo',
      description: 'About page meta description'
    },
    {
      property: 'og:type',
      content: 'article',
      pages: ['about'],
      isGlobal: false,
      isActive: true,
      category: 'social',
      description: 'Open Graph type for about page'
    },
    // Global Meta Tags
    {
      charset: 'UTF-8',
      content: 'UTF-8',
      pages: [],
      isGlobal: true,
      isActive: true,
      category: 'general',
      description: 'Character encoding'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0',
      pages: [],
      isGlobal: true,
      isActive: true,
      category: 'general',
      description: 'Viewport settings for responsive design'
    },
    {
      name: 'author',
      content: 'Vardhman Mills',
      pages: [],
      isGlobal: true,
      isActive: true,
      category: 'general',
      description: 'Site author'
    },
    {
      property: 'og:site_name',
      content: 'Vardhman Mills',
      pages: [],
      isGlobal: true,
      isActive: true,
      category: 'social',
      description: 'Global Open Graph site name'
    }
  ];
  return await MetaTag.insertMany(metaTags);
};

const createRedirectRules = async () => {
  const redirectRules = [
    {
      sourceUrl: '/old-products',
      targetUrl: '/products',
      statusCode: 301,
      isActive: true,
      isRegex: false,
      preserveQuery: true,
      preserveHash: false,
      notes: 'Old products page redirect',
      tags: ['legacy', 'products'],
      hits: 45
    },
    {
      sourceUrl: '/bedsheet',
      targetUrl: '/categories/bed-sheets',
      statusCode: 301,
      isActive: true,
      isRegex: false,
      preserveQuery: true,
      preserveHash: false,
      notes: 'Bedsheet singular to plural redirect',
      tags: ['seo', 'categories'],
      hits: 123
    },
    {
      sourceUrl: '/shop',
      targetUrl: '/products',
      statusCode: 301,
      isActive: true,
      isRegex: false,
      preserveQuery: true,
      preserveHash: false,
      notes: 'Shop to products redirect',
      tags: ['legacy'],
      hits: 89
    },
    {
      sourceUrl: '/catalog',
      targetUrl: '/products',
      statusCode: 302,
      isActive: true,
      isRegex: false,
      preserveQuery: true,
      preserveHash: false,
      notes: 'Temporary catalog redirect',
      tags: ['temporary'],
      hits: 12
    },
    {
      sourceUrl: '^/product/(.*)$',
      targetUrl: '/products/$1',
      statusCode: 301,
      isActive: true,
      isRegex: true,
      preserveQuery: true,
      preserveHash: false,
      notes: 'Redirect old product URLs to new format',
      tags: ['regex', 'products'],
      hits: 67
    }
  ];
  return await RedirectRule.insertMany(redirectRules);
};

const createSchemaMarkups = async () => {
  const schemaMarkups = [
    {
      type: 'Organization',
      name: 'organization-schema',
      description: 'Organization structured data for the company',
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Vardhman Mills',
        url: 'https://vardhmanmills.com',
        logo: 'https://vardhmanmills.com/logo.png',
        description: 'Premium home textiles manufacturer',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Industrial Area',
          addressLocality: 'Mumbai',
          addressRegion: 'Maharashtra',
          postalCode: '400001',
          addressCountry: 'IN'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-22-12345678',
          contactType: 'Customer Service'
        },
        sameAs: [
          'https://facebook.com/vardhmanmills',
          'https://twitter.com/vardhmanmills',
          'https://instagram.com/vardhmanmills'
        ]
      },
      pages: ['home', 'about'],
      isGlobal: false,
      isActive: true,
      validationStatus: 'valid',
      validationErrors: [],
      validationWarnings: [],
      lastValidated: new Date(),
      richResultsEligible: true
    },
    {
      type: 'BreadcrumbList',
      name: 'breadcrumb-schema',
      description: 'Breadcrumb navigation structured data',
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://vardhmanmills.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: 'https://vardhmanmills.com/products'
          }
        ]
      },
      pages: ['products'],
      isGlobal: false,
      isActive: true,
      validationStatus: 'valid',
      validationErrors: [],
      validationWarnings: [],
      lastValidated: new Date(),
      richResultsEligible: true
    },
    {
      type: 'Product',
      name: 'product-schema-template',
      description: 'Product structured data template',
      schemaData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Product Name',
        description: 'Product Description',
        brand: {
          '@type': 'Brand',
          name: 'Vardhman Mills'
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: '0.00',
          availability: 'https://schema.org/InStock'
        }
      },
      pages: ['product-detail'],
      isGlobal: false,
      isActive: true,
      validationStatus: 'valid',
      validationErrors: [],
      validationWarnings: ['Price should be updated dynamically'],
      lastValidated: new Date(),
      richResultsEligible: true,
      testUrl: 'https://vardhmanmills.com/products/sample'
    }
  ];
  return await SchemaMarkup.insertMany(schemaMarkups);
};

const createSEOAudits = async () => {
  const seoAudits = [
    {
      url: 'https://vardhmanmills.com',
      pageId: 'home',
      score: 92,
      items: [
        {
          type: 'success',
          category: 'meta',
          title: 'Meta Description',
          description: 'Document has a meta description',
          impact: 'high',
          recommendation: 'Continue using descriptive meta descriptions',
          value: 'Discover premium quality bedsheets, towels, and home textiles',
          expected: 'Between 120-160 characters'
        },
        {
          type: 'warning',
          category: 'accessibility',
          title: 'Image Alt Text',
          description: 'Some images missing alt text',
          impact: 'medium',
          recommendation: 'Add descriptive alt text to all images',
          element: 'img.hero-banner',
          resources: ['https://vardhmanmills.com/images/banner1.jpg', 'https://vardhmanmills.com/images/banner2.jpg']
        },
        {
          type: 'info',
          category: 'performance',
          title: 'Image Optimization',
          description: 'Images could be further optimized',
          impact: 'low',
          recommendation: 'Use next-gen formats like WebP',
          value: '1.8MB total',
          expected: 'Under 1MB'
        }
      ],
      performance: {
        firstContentfulPaint: 1200,
        largestContentfulPaint: 2300,
        firstInputDelay: 50,
        cumulativeLayoutShift: 0.05,
        totalBlockingTime: 150,
        speedIndex: 2100,
        timeToInteractive: 3100
      },
      accessibility: {
        score: 88,
        issues: 2,
        passedAudits: 45,
        failedAudits: 2,
        warningAudits: 3
      },
      bestPractices: {
        score: 90,
        issues: 0,
        httpsEnabled: true,
        http2Enabled: true,
        imageOptimization: false,
        textCompression: true
      },
      seo: {
        score: 94,
        issues: 0,
        hasH1: true,
        hasMetaDescription: true,
        hasCanonical: true,
        hasRobots: true,
        hasOpenGraph: true,
        hasTwitterCards: true,
        hasStructuredData: true,
        mobileOptimized: true
      },
      metadata: {
        title: 'Vardhman Mills - Premium Home Textiles',
        description: 'Discover premium quality bedsheets, towels, and home textiles',
        keywords: ['home textiles', 'bedsheets', 'towels'],
        ogTitle: 'Vardhman Mills - Premium Home Textiles',
        ogDescription: 'Leading manufacturer of premium home textiles',
        ogImage: 'https://vardhmanmills.com/og-image.jpg'
      },
      contentAnalysis: {
        wordCount: 450,
        readabilityScore: 75,
        keywordDensity: { 'home textiles': 2.5, 'bedsheets': 1.8 },
        headingStructure: [
          { level: 1, text: 'Welcome to Vardhman Mills', count: 1 },
          { level: 2, text: 'Our Products', count: 1 },
          { level: 2, text: 'Why Choose Us', count: 1 }
        ],
        imageOptimization: {
          total: 10,
          withAlt: 8,
          optimized: 9,
          withTitle: 7,
          withLazyLoading: 10
        },
        linkAnalysis: {
          internal: 25,
          external: 5,
          broken: 0,
          noFollow: 2,
          withAnchorText: 28
        },
        paragraphCount: 15,
        sentenceCount: 45,
        averageWordsPerSentence: 10,
        fleschReadingEase: 65
      },
      technicalSEO: {
        hasH1: true,
        hasMetaDescription: true,
        hasCanonical: true,
        hasRobots: true,
        hasOpenGraph: true,
        hasTwitterCards: true,
        hasStructuredData: true,
        mobileOptimized: true,
        httpsEnabled: true,
        compressionEnabled: true,
        cachingEnabled: true,
        http2Enabled: true,
        hasServiceWorker: false,
        hasSitemap: true,
        hasRobotsTxt: true
      },
      mobile: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: {
        width: 1920,
        height: 1080
      },
      auditedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      duration: 12500
    },
    {
      url: 'https://vardhmanmills.com/products',
      pageId: 'products',
      score: 87,
      items: [
        {
          type: 'error',
          category: 'meta',
          title: 'Missing Canonical URL',
          description: 'Page does not have a canonical URL',
          impact: 'high',
          recommendation: 'Add canonical URL to prevent duplicate content issues',
          element: 'head',
          expected: '<link rel="canonical" href="https://vardhmanmills.com/products" />'
        },
        {
          type: 'warning',
          category: 'performance',
          title: 'Large Image Files',
          description: 'Product images are not optimized',
          impact: 'medium',
          recommendation: 'Compress and optimize product images',
          value: '2.4MB',
          expected: 'Under 1.5MB',
          resources: ['https://vardhmanmills.com/products/prod1.jpg', 'https://vardhmanmills.com/products/prod2.jpg']
        },
        {
          type: 'info',
          category: 'technical',
          title: 'Missing Twitter Cards',
          description: 'Twitter card meta tags not found',
          impact: 'low',
          recommendation: 'Add Twitter card tags for better social sharing',
          element: 'head'
        }
      ],
      performance: {
        firstContentfulPaint: 1500,
        largestContentfulPaint: 3100,
        firstInputDelay: 80,
        cumulativeLayoutShift: 0.08,
        totalBlockingTime: 250,
        speedIndex: 2800,
        timeToInteractive: 4200
      },
      accessibility: {
        score: 90,
        issues: 1,
        passedAudits: 48,
        failedAudits: 1,
        warningAudits: 1
      },
      bestPractices: {
        score: 88,
        issues: 1,
        httpsEnabled: true,
        http2Enabled: true,
        imageOptimization: false,
        textCompression: true
      },
      seo: {
        score: 85,
        issues: 2,
        hasH1: true,
        hasMetaDescription: true,
        hasCanonical: false,
        hasRobots: true,
        hasOpenGraph: true,
        hasTwitterCards: false,
        hasStructuredData: true,
        mobileOptimized: true
      },
      metadata: {
        title: 'Products - Vardhman Mills',
        description: 'Browse our wide range of premium home textile products',
        keywords: ['products', 'textiles', 'bedding'],
        ogTitle: 'Premium Home Textiles Products',
        ogDescription: 'Explore our collection of quality home textiles',
        ogImage: 'https://vardhmanmills.com/products-og.jpg'
      },
      contentAnalysis: {
        wordCount: 320,
        readabilityScore: 70,
        keywordDensity: { 'products': 3.1, 'textiles': 2.2 },
        headingStructure: [
          { level: 1, text: 'Our Products', count: 1 },
          { level: 2, text: 'Categories', count: 1 },
          { level: 3, text: 'Bedsheets', count: 1 },
          { level: 3, text: 'Towels', count: 1 }
        ],
        imageOptimization: {
          total: 25,
          withAlt: 23,
          optimized: 20,
          withTitle: 18,
          withLazyLoading: 25
        },
        linkAnalysis: {
          internal: 35,
          external: 2,
          broken: 0,
          noFollow: 0,
          withAnchorText: 37
        },
        paragraphCount: 10,
        sentenceCount: 32,
        averageWordsPerSentence: 10,
        fleschReadingEase: 68
      },
      technicalSEO: {
        hasH1: true,
        hasMetaDescription: true,
        hasCanonical: false,
        hasRobots: true,
        hasOpenGraph: true,
        hasTwitterCards: false,
        hasStructuredData: true,
        mobileOptimized: true,
        httpsEnabled: true,
        compressionEnabled: true,
        cachingEnabled: true,
        http2Enabled: true,
        hasServiceWorker: false,
        hasSitemap: true,
        hasRobotsTxt: true
      },
      mobile: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: {
        width: 1920,
        height: 1080
      },
      auditedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      duration: 15000
    }
  ];
  return await SEOAudit.insertMany(seoAudits);
};

const createSitemaps = async () => {
  const sitemaps = [
    {
      name: 'main-sitemap',
      type: 'index',
      url: 'https://vardhmanmills.com/sitemap.xml',
      path: '/sitemap.xml',
      urls: [
        {
          loc: 'https://vardhmanmills.com',
          changefreq: 'daily',
          priority: 1.0,
          lastmod: new Date()
        },
        {
          loc: 'https://vardhmanmills.com/about',
          changefreq: 'monthly',
          priority: 0.8,
          lastmod: new Date()
        },
        {
          loc: 'https://vardhmanmills.com/products',
          changefreq: 'daily',
          priority: 0.9,
          lastmod: new Date()
        },
        {
          loc: 'https://vardhmanmills.com/contact',
          changefreq: 'monthly',
          priority: 0.7,
          lastmod: new Date()
        },
        {
          loc: 'https://vardhmanmills.com/blog',
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: new Date()
        }
      ],
      isActive: true,
      lastGenerated: new Date(),
      autoGenerate: true,
      generateFrequency: 'daily'
    },
    {
      name: 'products-sitemap',
      type: 'products',
      url: 'https://vardhmanmills.com/sitemap-products.xml',
      path: '/sitemap-products.xml',
      urls: [
        {
          loc: 'https://vardhmanmills.com/products/bedsheets',
          changefreq: 'weekly',
          priority: 0.9,
          lastmod: new Date()
        },
        {
          loc: 'https://vardhmanmills.com/products/towels',
          changefreq: 'weekly',
          priority: 0.9,
          lastmod: new Date()
        }
      ],
      isActive: true,
      lastGenerated: new Date(),
      autoGenerate: true,
      generateFrequency: 'weekly'
    }
  ];
  return await Sitemap.insertMany(sitemaps);
};

// ============================================
// About/Company Content
// ============================================

const createCompanyInfo = async () => {
  const companyInfo = {
    name: 'Vardhman Mills',
    description: 'Vardhman Mills is a leading manufacturer of premium home textiles with over 50 years of excellence in quality fabrics. We specialize in bed linen, towels, and other home comfort products.',
    foundedYear: 1965,
    founderName: 'Late Shri Ram Kumar Gupta',
    headquarters: 'Mumbai, Maharashtra, India',
    employeeCount: '850+',
    industry: 'Textile Manufacturing',
    specialization: ['Home Textiles', 'Bed Linen', 'Towels', 'Bath Products', 'Cushions & Pillows'],
    certifications: ['ISO 9001:2015', 'OEKO-TEX Standard 100', 'GOTS Certified', 'Fair Trade Certified'],
    tagline: 'Weaving Comfort, Crafting Dreams',
    vision: 'To be the most trusted and innovative home textile manufacturer globally, delivering superior quality products that enhance comfort and lifestyle.',
    mission: 'Our mission is to manufacture world-class home textiles using sustainable practices, advanced technology, and skilled craftsmanship while maintaining the highest standards of quality and customer satisfaction.',
    values: [
      'Quality Excellence',
      'Customer Satisfaction',
      'Innovation & Technology',
      'Sustainability',
      'Employee Well-being',
      'Ethical Business Practices'
    ]
  };
  return await CompanyInfo.create(companyInfo);
};

const createHistoryEntries = async () => {
  const historyEntries = [
    {
      year: 1965,
      title: 'Foundation',
      description: 'Vardhman Mills was established by Late Shri Ram Kumar Gupta with a vision to manufacture quality textiles in Mumbai.',
      image: 'https://via.placeholder.com/600x400?text=Foundation+1965',
      sortOrder: 1,
      isActive: true
    },
    {
      year: 1980,
      title: 'Expansion to Home Textiles',
      description: 'Expanded operations to focus on premium home textiles including bed sheets, towels, and cushions.',
      image: 'https://via.placeholder.com/600x400?text=Expansion+1980',
      sortOrder: 2,
      isActive: true
    },
    {
      year: 1995,
      title: 'Export Market Entry',
      description: 'Successfully entered international markets, exporting to over 15 countries across Asia and Europe.',
      image: 'https://via.placeholder.com/600x400?text=Export+1995',
      sortOrder: 3,
      isActive: true
    },
    {
      year: 2005,
      title: 'ISO Certification',
      description: 'Achieved ISO 9001:2008 certification for quality management systems.',
      image: 'https://via.placeholder.com/600x400?text=ISO+2005',
      sortOrder: 4,
      isActive: true
    },
    {
      year: 2010,
      title: 'Sustainable Manufacturing',
      description: 'Introduced eco-friendly manufacturing processes and achieved GOTS certification for organic textiles.',
      image: 'https://via.placeholder.com/600x400?text=Sustainable+2010',
      sortOrder: 5,
      isActive: true
    },
    {
      year: 2015,
      title: '50 Years of Excellence',
      description: 'Celebrated 50 years of manufacturing excellence with presence in 25+ countries.',
      image: 'https://via.placeholder.com/600x400?text=50Years+2015',
      sortOrder: 6,
      isActive: true
    },
    {
      year: 2020,
      title: 'Digital Transformation',
      description: 'Launched e-commerce platform and digital manufacturing systems for enhanced efficiency.',
      image: 'https://via.placeholder.com/600x400?text=Digital+2020',
      sortOrder: 7,
      isActive: true
    },
    {
      year: 2025,
      title: 'Sustainability Goals',
      description: 'Committed to 100% renewable energy and zero-waste manufacturing by 2030.',
      image: 'https://via.placeholder.com/600x400?text=Future+2025',
      sortOrder: 8,
      isActive: true
    }
  ];
  return await HistoryEntry.insertMany(historyEntries);
};

const createTeamMembers = async (users: any[]) => {
  const teamMembers = [
    {
      name: 'Rajesh Kumar',
      designation: 'Chief Executive Officer',
      department: 'Management',
      bio: 'With over 25 years of experience in the textile industry, Rajesh leads Vardhman Mills with a vision for quality and innovation. His strategic leadership has positioned the company as a leading manufacturer in the home textiles sector.',
      email: 'rajesh.kumar@vardhmanmills.com',
      phone: '+91-22-12345601',
      image: 'https://res.cloudinary.com/vardhman/image/upload/team/ceo.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/rajeshkumar',
        twitter: 'https://twitter.com/rajeshkumar'
      },
      qualifications: ['MBA from IIM', 'B.Tech in Textile Engineering'],
      achievements: ['Industry Leader Award 2022', 'Excellence in Manufacturing 2020'],
      joinedDate: new Date('2010-01-15'),
      sortOrder: 1,
      isFeatured: true,
      isActive: true,
      createdBy: users[0]._id
    },
    {
      name: 'Priya Sharma',
      designation: 'Chief Operating Officer',
      department: 'Operations',
      bio: 'Priya oversees all operational aspects of manufacturing and quality control. Her expertise in lean manufacturing has improved efficiency by 40%.',
      email: 'priya.sharma@vardhmanmills.com',
      phone: '+91-22-12345602',
      image: 'https://res.cloudinary.com/vardhman/image/upload/team/coo.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/priyasharma'
      },
      qualifications: ['MBA Operations', 'Six Sigma Black Belt'],
      achievements: ['Operational Excellence Award 2021'],
      joinedDate: new Date('2012-06-01'),
      sortOrder: 2,
      isFeatured: true,
      isActive: true,
      createdBy: users[0]._id
    },
    {
      name: 'Amit Patel',
      designation: 'Head of Design',
      department: 'Design',
      bio: 'Amit brings creativity and innovation to our product designs. His team has won multiple design awards for their contemporary textile patterns.',
      email: 'amit.patel@vardhmanmills.com',
      phone: '+91-22-12345603',
      image: 'https://res.cloudinary.com/vardhman/image/upload/team/design-head.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/amitpatel',
        instagram: 'https://instagram.com/amitpatel_design'
      },
      qualifications: ['Master of Design', 'NID Graduate'],
      achievements: ['Best Design Award 2023', 'Innovation in Textiles 2022'],
      joinedDate: new Date('2015-03-20'),
      sortOrder: 3,
      isFeatured: true,
      isActive: true,
      createdBy: users[0]._id
    },
    {
      name: 'Sunita Reddy',
      designation: 'Quality Control Manager',
      department: 'Quality Assurance',
      bio: 'Sunita ensures that every product meets our stringent quality standards. Her attention to detail has maintained our 99.5% quality approval rate.',
      email: 'sunita.reddy@vardhmanmills.com',
      phone: '+91-22-12345604',
      image: 'https://res.cloudinary.com/vardhman/image/upload/team/qa-manager.jpg',
      qualifications: ['B.Tech Textile Technology', 'ISO 9001 Lead Auditor'],
      joinedDate: new Date('2014-08-10'),
      sortOrder: 4,
      isFeatured: false,
      isActive: true,
      createdBy: users[0]._id
    },
    {
      name: 'Vikram Singh',
      designation: 'Head of Sales & Marketing',
      department: 'Sales',
      bio: 'Vikram drives our sales strategy and market expansion. Under his leadership, sales have grown by 60% in the last three years.',
      email: 'vikram.singh@vardhmanmills.com',
      phone: '+91-22-12345605',
      image: 'https://res.cloudinary.com/vardhman/image/upload/team/sales-head.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/vikramsingh'
      },
      qualifications: ['MBA Marketing', 'B.Com'],
      achievements: ['Sales Excellence Award 2023'],
      joinedDate: new Date('2013-11-01'),
      sortOrder: 5,
      isFeatured: false,
      isActive: true,
      createdBy: users[0]._id
    }
  ];
  return await TeamMember.insertMany(teamMembers);
};

const createAwards = async (users: any[]) => {
  const awards = [
    {
      title: 'Excellence in Manufacturing',
      issuedBy: 'Indian Textile Association',
      category: 'award',
      description: 'Recognized for outstanding manufacturing practices and quality control standards in the home textiles sector.',
      issuedDate: new Date('2023-09-15'),
      image: 'https://res.cloudinary.com/vardhman/image/upload/awards/manufacturing-excellence.jpg',
      certificateUrl: 'https://res.cloudinary.com/vardhman/raw/upload/awards/manufacturing-cert.pdf',
      sortOrder: 1,
      isActive: true
    },
    {
      title: 'ISO 9001:2015 Certification',
      issuedBy: 'International Organization for Standardization',
      category: 'certification',
      description: 'Quality management system certification for consistent product quality and customer satisfaction.',
      issuedDate: new Date('2023-06-20'),
      image: 'https://res.cloudinary.com/vardhman/image/upload/awards/iso-9001.jpg',
      certificateUrl: 'https://res.cloudinary.com/vardhman/raw/upload/awards/iso-cert.pdf',
      sortOrder: 2,
      isActive: true
    },
    {
      title: 'Sustainability Champion',
      issuedBy: 'Green Textile Council',
      category: 'recognition',
      description: 'Recognized for implementing eco-friendly manufacturing processes and reducing carbon footprint by 35%.',
      issuedDate: new Date('2022-12-10'),
      image: 'https://res.cloudinary.com/vardhman/image/upload/awards/sustainability.jpg',
      certificateUrl: 'https://res.cloudinary.com/vardhman/raw/upload/awards/sustainability-cert.pdf',
      sortOrder: 3,
      isActive: true
    },
    {
      title: 'Best Design Innovation',
      issuedBy: 'National Design Institute',
      category: 'achievement',
      description: 'Achievement award for innovative textile designs and contemporary patterns in home furnishing.',
      issuedDate: new Date('2022-03-25'),
      image: 'https://res.cloudinary.com/vardhman/image/upload/awards/design-innovation.jpg',
      sortOrder: 4,
      isActive: true
    },
    {
      title: 'Export Excellence Award',
      issuedBy: 'Ministry of Commerce & Industry',
      category: 'award',
      description: 'National award for outstanding export performance and contribution to Indian economy.',
      issuedDate: new Date('2021-11-05'),
      image: 'https://res.cloudinary.com/vardhman/image/upload/awards/export-excellence.jpg',
      certificateUrl: 'https://res.cloudinary.com/vardhman/raw/upload/awards/export-cert.pdf',
      sortOrder: 5,
      isActive: true
    }
  ];
  return await Award.insertMany(awards);
};

const createCompanyLocations = async (users: any[]) => {
  const companyLocations = [
    {
      name: 'Vardhman Mills - Head Office & Manufacturing',
      type: 'headquarters' as const,
      address: {
        street: 'Plot No. 45, Industrial Area, Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400069'
      },
      phone: '+91-22-6789-1234',
      email: 'headoffice@vardhmanmills.com',
      coordinates: {
        lat: 19.1136,
        lng: 72.8697
      },
      operatingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '09:00', close: '14:00' }
      },
      image: 'https://via.placeholder.com/800x600?text=Mumbai+Head+Office',
      sortOrder: 1,
      isActive: true
    },
    {
      name: 'Vardhman Mills - Delhi Branch Office',
      type: 'office' as const,
      address: {
        street: '23, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        postalCode: '110001'
      },
      phone: '+91-11-2345-6789',
      email: 'delhi@vardhmanmills.com',
      coordinates: {
        lat: 28.6315,
        lng: 77.2167
      },
      operatingHours: {
        monday: { open: '09:30', close: '18:30' },
        tuesday: { open: '09:30', close: '18:30' },
        wednesday: { open: '09:30', close: '18:30' },
        thursday: { open: '09:30', close: '18:30' },
        friday: { open: '09:30', close: '18:30' },
        saturday: { open: '10:00', close: '15:00' }
      },
      image: 'https://via.placeholder.com/800x600?text=Delhi+Branch',
      sortOrder: 2,
      isActive: true
    },
    {
      name: 'Vardhman Mills - Surat Manufacturing Unit',
      type: 'factory' as const,
      address: {
        street: 'Survey No. 125, GIDC Estate',
        city: 'Surat',
        state: 'Gujarat',
        country: 'India',
        postalCode: '395008'
      },
      phone: '+91-261-234-5678',
      email: 'surat@vardhmanmills.com',
      coordinates: {
        lat: 21.1702,
        lng: 72.8311
      },
      operatingHours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '08:00', close: '17:00' }
      },
      image: 'https://via.placeholder.com/800x600?text=Surat+Factory',
      sortOrder: 3,
      isActive: true
    },
    {
      name: 'Vardhman Mills - Bangalore Showroom',
      type: 'showroom' as const,
      address: {
        street: '45, MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560001'
      },
      phone: '+91-80-4567-8901',
      email: 'bangalore@vardhmanmills.com',
      coordinates: {
        lat: 12.9716,
        lng: 77.5946
      },
      operatingHours: {
        monday: { open: '10:00', close: '20:00' },
        tuesday: { open: '10:00', close: '20:00' },
        wednesday: { open: '10:00', close: '20:00' },
        thursday: { open: '10:00', close: '20:00' },
        friday: { open: '10:00', close: '20:00' },
        saturday: { open: '10:00', close: '20:00' },
        sunday: { open: '11:00', close: '19:00' }
      },
      image: 'https://via.placeholder.com/800x600?text=Bangalore+Showroom',
      sortOrder: 4,
      isActive: true
    }
  ];
  return await CompanyLocation.insertMany(companyLocations);
};

const createCompanyStats = async () => {
  const stats = {
    yearFounded: 1965,
    yearsInBusiness: new Date().getFullYear() - 1965,
    employeeCount: 850,
    productionCapacity: '5 million units/year',
    exportCountries: 25,
    certifications: ['ISO 9001:2015', 'ISO 14001', 'OEKO-TEX Standard 100', 'GOTS'],
    annualRevenue: '₹250 Crores',
    marketShare: 12.5,
    manufacturingUnits: 3,
    warehouseSpace: '50,000 sq ft',
    customerBase: 5000,
    productsInCatalog: 500,
    sustainabilityMetrics: {
      waterSaved: '30%',
      energyFromRenewables: '45%',
      wasteReduction: '40%',
      carbonFootprintReduction: '35%'
    },
    qualityMetrics: {
      defectRate: 0.5,
      customerSatisfaction: 96.5,
      onTimeDelivery: 98.2
    },
    awards: 15,
    patents: 5
  };
  return await CompanyStats.create(stats);
};

// ============================================
// Inventory & Warehouse Content
// ============================================

const createWarehouses = async (users: any[]) => {
  const warehouses = [
    {
      code: 'WH-MUM-01',
      name: 'Mumbai Main Warehouse',
      address: {
        street: 'Plot No. 45, Industrial Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001',
        landmark: 'Near Eastern Express Highway'
      },
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      },
      contactInfo: {
        phone: '+91-22-12345610',
        email: 'mumbai.warehouse@vardhmanmills.com',
        manager: 'Suresh Iyer',
        managerPhone: '+91-22-12345611'
      },
      capacity: {
        totalArea: 25000,
        usedArea: 18000,
        availableArea: 7000,
        storageType: 'covered',
        maxWeight: 5000000
      },
      isPrimary: true,
      isActive: true,
      operatingHours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '08:00', close: '16:00' }
      },
      createdBy: users[0]._id
    },
    {
      code: 'WH-DEL-01',
      name: 'Delhi Distribution Center',
      address: {
        street: 'Sector 15, Industrial Zone',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        postalCode: '110001'
      },
      coordinates: {
        latitude: 28.7041,
        longitude: 77.1025
      },
      contactInfo: {
        phone: '+91-11-12345610',
        email: 'delhi.warehouse@vardhmanmills.com',
        manager: 'Arvind Kumar',
        managerPhone: '+91-11-12345611'
      },
      capacity: {
        totalArea: 15000,
        usedArea: 10000,
        availableArea: 5000,
        storageType: 'covered',
        maxWeight: 3000000
      },
      isPrimary: false,
      isActive: true,
      operatingHours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '19:00' },
        saturday: { open: '09:00', close: '15:00' }
      },
      createdBy: users[0]._id
    },
    {
      code: 'WH-BLR-01',
      name: 'Bangalore Regional Warehouse',
      address: {
        street: 'Electronic City Phase 2',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560100'
      },
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      },
      contactInfo: {
        phone: '+91-80-12345610',
        email: 'bangalore.warehouse@vardhmanmills.com',
        manager: 'Deepak Rao',
        managerPhone: '+91-80-12345611'
      },
      capacity: {
        totalArea: 12000,
        usedArea: 8000,
        availableArea: 4000,
        storageType: 'covered',
        maxWeight: 2500000
      },
      isPrimary: false,
      isActive: true,
      operatingHours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '19:00' },
        saturday: { open: '09:00', close: '14:00' }
      },
      createdBy: users[0]._id
    }
  ];
  return await Warehouse.insertMany(warehouses);
};

const createStockMovements = async (users: any[], products: any[], warehouses: any[], inventory: any[]) => {
  const stockMovements = [
    {
      inventoryItemId: inventory[0]._id,
      productId: products[0]._id,
      sku: 'VM-BS-001-S-W',
      type: 'purchase',
      quantity: 500,
      previousQuantity: 0,
      newQuantity: 500,
      fromWarehouse: warehouses[0]._id,
      toWarehouse: warehouses[0]._id,
      reason: 'New stock purchase',
      unitCost: 450,
      totalCost: 225000,
      userId: users[0]._id,
      userName: users[0].name,
      notes: 'First batch of premium bedsheets',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    },
    {
      inventoryItemId: inventory[1]._id,
      productId: products[1]._id,
      sku: 'VM-BS-002-D-C',
      type: 'purchase',
      quantity: 300,
      previousQuantity: 0,
      newQuantity: 300,
      fromWarehouse: warehouses[0]._id,
      toWarehouse: warehouses[0]._id,
      reason: 'Stock replenishment',
      unitCost: 380,
      totalCost: 114000,
      userId: users[0]._id,
      userName: users[0].name,
      notes: 'Luxury satin bed sheets restock',
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
    },
    {
      inventoryItemId: inventory[0]._id,
      productId: products[0]._id,
      sku: 'VM-BS-001-S-W',
      type: 'sale',
      quantity: 50,
      previousQuantity: 500,
      newQuantity: 450,
      fromWarehouse: warehouses[0]._id,
      toWarehouse: warehouses[0]._id,
      reason: 'Customer order',
      referenceType: 'order',
      unitCost: 450,
      totalCost: 22500,
      userId: users[1]._id,
      userName: users[1].name,
      notes: 'Bulk order shipped',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    },
    {
      inventoryItemId: inventory[0]._id,
      productId: products[0]._id,
      sku: 'VM-BS-001-D-W',
      type: 'transfer',
      quantity: 100,
      previousQuantity: 450,
      newQuantity: 350,
      fromWarehouse: warehouses[0]._id,
      toWarehouse: warehouses[1]._id,
      reason: 'Inter-warehouse transfer',
      referenceType: 'transfer',
      unitCost: 450,
      totalCost: 45000,
      userId: users[0]._id,
      userName: users[0].name,
      notes: 'Transfer to Delhi warehouse for regional distribution',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    },
    {
      inventoryItemId: inventory[2]._id,
      productId: products[2]._id,
      sku: 'VM-TW-001-BT-W',
      type: 'adjustment',
      quantity: 5,
      previousQuantity: 100,
      newQuantity: 95,
      fromWarehouse: warehouses[0]._id,
      toWarehouse: warehouses[0]._id,
      reason: 'Damaged goods',
      referenceType: 'adjustment',
      unitCost: 280,
      totalCost: 1400,
      userId: users[0]._id,
      userName: users[0].name,
      notes: 'Damaged during handling, written off',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      inventoryItemId: inventory[1]._id,
      productId: products[1]._id,
      sku: 'VM-BS-002-K-C',
      type: 'return',
      quantity: 10,
      previousQuantity: 300,
      newQuantity: 310,
      fromWarehouse: warehouses[0]._id,
      toWarehouse: warehouses[0]._id,
      reason: 'Customer return',
      referenceType: 'return',
      unitCost: 380,
      totalCost: 3800,
      userId: users[1]._id,
      userName: users[1].name,
      notes: 'Customer return - items in good condition',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      inventoryItemId: inventory[3]._id,
      productId: products[3]._id,
      sku: 'VM-QT-001-S-BG',
      type: 'purchase',
      quantity: 200,
      previousQuantity: 0,
      newQuantity: 200,
      fromWarehouse: warehouses[2]._id,
      toWarehouse: warehouses[2]._id,
      reason: 'New product launch',
      unitCost: 520,
      totalCost: 104000,
      userId: users[0]._id,
      userName: users[0].name,
      notes: 'New designer collection',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      inventoryItemId: inventory[0]._id,
      productId: products[0]._id,
      sku: 'VM-BS-001-S-B',
      type: 'sale',
      quantity: 30,
      previousQuantity: 350,
      newQuantity: 320,
      fromWarehouse: warehouses[1]._id,
      toWarehouse: warehouses[1]._id,
      reason: 'Customer order',
      referenceType: 'order',
      unitCost: 450,
      totalCost: 13500,
      userId: users[1]._id,
      userName: users[1].name,
      notes: 'Delhi region order',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      inventoryItemId: inventory[4]._id,
      productId: products[4]._id,
      sku: 'VM-PL-001-STD-W',
      type: 'purchase',
      quantity: 150,
      previousQuantity: 0,
      newQuantity: 150,
      fromWarehouse: warehouses[0]._id,
      toWarehouse: warehouses[0]._id,
      reason: 'Seasonal stock',
      unitCost: 350,
      totalCost: 52500,
      userId: users[0]._id,
      userName: users[0].name,
      notes: 'Summer collection stock',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      inventoryItemId: inventory[1]._id,
      productId: products[1]._id,
      sku: 'VM-BS-002-D-C',
      type: 'sale',
      quantity: 25,
      previousQuantity: 310,
      newQuantity: 285,
      fromWarehouse: warehouses[0]._id,
      toWarehouse: warehouses[0]._id,
      reason: 'Customer order',
      referenceType: 'order',
      unitCost: 380,
      totalCost: 9500,
      userId: users[1]._id,
      userName: users[1].name,
      notes: 'Regular customer order',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];
  return await StockMovement.insertMany(stockMovements);
};

const createInventoryAlerts = async (users: any[], products: any[], warehouses: any[], inventory: any[]) => {
  const inventoryAlerts = [
    {
      type: 'low_stock',
      severity: 'high',
      inventoryItemId: inventory[2]._id,
      productId: products[2]._id,
      sku: 'VM-TW-001-BT-W',
      productName: products[2].name,
      warehouseId: warehouses[0]._id,
      warehouseName: warehouses[0].name,
      currentQuantity: 15,
      threshold: 20,
      message: 'Stock level critically low for Cotton Bath Towels',
      status: 'active',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      type: 'out_of_stock',
      severity: 'critical',
      inventoryItemId: inventory[4]._id,
      productId: products[4]._id,
      sku: 'VM-PL-001-STD-W',
      productName: products[4].name,
      warehouseId: warehouses[1]._id,
      warehouseName: warehouses[1].name,
      currentQuantity: 0,
      threshold: 10,
      message: 'Product out of stock in Delhi warehouse',
      status: 'active',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      type: 'reorder_point',
      severity: 'medium',
      inventoryItemId: inventory[0]._id,
      productId: products[0]._id,
      sku: 'VM-BS-001-S-W',
      productName: products[0].name,
      warehouseId: warehouses[0]._id,
      warehouseName: warehouses[0].name,
      currentQuantity: 320,
      threshold: 300,
      message: 'Stock reached reorder point - consider replenishment',
      status: 'acknowledged',
      acknowledgedBy: users[0]._id,
      acknowledgedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      type: 'expiry_warning',
      severity: 'medium',
      inventoryItemId: inventory[3]._id,
      productId: products[3]._id,
      sku: 'VM-QT-001-S-BG',
      productName: products[3].name,
      warehouseId: warehouses[2]._id,
      warehouseName: warehouses[2].name,
      currentQuantity: 180,
      threshold: 150,
      message: 'Seasonal product nearing end of season',
      status: 'resolved',
      acknowledgedBy: users[0]._id,
      acknowledgedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      type: 'low_stock',
      severity: 'medium',
      inventoryItemId: inventory[1]._id,
      productId: products[1]._id,
      sku: 'VM-BS-002-D-C',
      productName: products[1].name,
      warehouseId: warehouses[1]._id,
      warehouseName: warehouses[1].name,
      currentQuantity: 25,
      threshold: 30,
      message: 'Stock approaching minimum threshold',
      status: 'active',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
    }
  ];
  return await InventoryAlert.insertMany(inventoryAlerts);
};

const createShippingMethods = async (shippingZones: any[]) => {
  const shippingMethods = [
    {
      zoneId: shippingZones[0]._id,
      name: 'Standard Shipping',
      description: 'Standard delivery within 5-7 business days',
      type: 'flat_rate',
      status: 'active',
      priority: 1,
      rateCalculation: {
        method: 'fixed',
        baseRate: 50
      },
      deliveryEstimate: {
        minDays: 5,
        maxDays: 7,
        businessDaysOnly: true
      },
      requirements: {
        minOrderValue: 0,
        maxWeight: 30000
      },
      features: {
        tracking: true,
        insurance: false,
        signature: false
      }
    },
    {
      zoneId: shippingZones[0]._id,
      name: 'Express Shipping',
      description: 'Fast delivery within 2-3 business days',
      type: 'express',
      status: 'active',
      priority: 2,
      rateCalculation: {
        method: 'fixed',
        baseRate: 150
      },
      deliveryEstimate: {
        minDays: 2,
        maxDays: 3,
        businessDaysOnly: true
      },
      requirements: {
        minOrderValue: 500,
        maxWeight: 20000
      },
      features: {
        tracking: true,
        insurance: true,
        signature: false
      }
    },
    {
      zoneId: shippingZones[0]._id,
      name: 'Next Day Delivery',
      description: 'Next business day delivery',
      type: 'express',
      status: 'active',
      priority: 3,
      rateCalculation: {
        method: 'fixed',
        baseRate: 250
      },
      deliveryEstimate: {
        minDays: 1,
        maxDays: 1,
        businessDaysOnly: true
      },
      requirements: {
        minOrderValue: 1000,
        maxWeight: 10000
      },
      features: {
        tracking: true,
        insurance: true,
        signature: true
      }
    },
    {
      zoneId: shippingZones[0]._id,
      name: 'Free Shipping',
      description: 'Free standard shipping on orders above ₹1500',
      type: 'free',
      status: 'active',
      priority: 4,
      rateCalculation: {
        method: 'fixed',
        baseRate: 0
      },
      deliveryEstimate: {
        minDays: 5,
        maxDays: 7,
        businessDaysOnly: true
      },
      requirements: {
        minOrderValue: 1500,
        maxWeight: 30000
      },
      features: {
        tracking: true,
        insurance: false,
        signature: false
      }
    },
    {
      zoneId: shippingZones[1] ? shippingZones[1]._id : shippingZones[0]._id,
      name: 'Metropolitan Express',
      description: 'Same-day or next-day delivery in metro cities',
      type: 'express',
      status: 'active',
      priority: 1,
      rateCalculation: {
        method: 'fixed',
        baseRate: 100
      },
      deliveryEstimate: {
        minDays: 0,
        maxDays: 1,
        businessDaysOnly: false
      },
      requirements: {
        minOrderValue: 500,
        maxWeight: 15000
      },
      features: {
        tracking: true,
        insurance: true,
        signature: false
      }
    },
    {
      zoneId: shippingZones[2] ? shippingZones[2]._id : shippingZones[0]._id,
      name: 'Bulk Order Shipping',
      description: 'Special rates for bulk orders',
      type: 'calculated',
      status: 'active',
      priority: 5,
      rateCalculation: {
        method: 'weight_based',
        baseRate: 30,
        weightRates: [
          { minWeight: 0, maxWeight: 5000, rate: 30 },
          { minWeight: 5000, maxWeight: 10000, rate: 50 },
          { minWeight: 10000, maxWeight: 20000, rate: 80 },
          { minWeight: 20000, rate: 120 }
        ]
      },
      deliveryEstimate: {
        minDays: 7,
        maxDays: 10,
        businessDaysOnly: true
      },
      requirements: {
        minOrderValue: 5000,
        maxWeight: 100000
      },
      features: {
        tracking: true,
        insurance: true,
        signature: true
      }
    }
  ];
  return await ShippingMethod.insertMany(shippingMethods);
};

// ============================================
// Upload Folders
// ============================================

const createUploadFolders = async (users: any[]) => {
  const uploadFolders = [
    {
      name: 'Products',
      description: 'Product images and related media',
      path: '/uploads/products',
      parentId: undefined,
      depth: 0,
      isPublic: true,
      color: '#4CAF50',
      icon: 'shopping-bag',
      createdBy: users[0]._id,
      permissions: [
        { userId: users[0]._id, role: 'admin' as const },
        { userId: users[1]._id, role: 'editor' as const }
      ],
      fileCount: 0,
      totalSize: 0
    },
    {
      name: 'Brands',
      description: 'Brand logos and assets',
      path: '/uploads/brands',
      parentId: undefined,
      depth: 0,
      isPublic: true,
      color: '#2196F3',
      icon: 'award',
      createdBy: users[0]._id,
      permissions: [
        { userId: users[0]._id, role: 'admin' as const }
      ],
      fileCount: 0,
      totalSize: 0
    },
    {
      name: 'Users',
      description: 'User profile pictures and documents',
      path: '/uploads/users',
      parentId: undefined,
      depth: 0,
      isPublic: false,
      color: '#9C27B0',
      icon: 'users',
      createdBy: users[0]._id,
      permissions: [
        { userId: users[0]._id, role: 'admin' as const },
        { userId: users[1]._id, role: 'editor' as const },
        { userId: users[2]._id, role: 'viewer' as const }
      ],
      fileCount: 0,
      totalSize: 0
    },
    {
      name: 'CMS',
      description: 'CMS content and page assets',
      path: '/uploads/cms',
      parentId: undefined,
      depth: 0,
      isPublic: true,
      color: '#FF9800',
      icon: 'file-text',
      createdBy: users[0]._id,
      permissions: [
        { userId: users[0]._id, role: 'admin' as const },
        { userId: users[1]._id, role: 'editor' as const }
      ],
      fileCount: 0,
      totalSize: 0
    },
    {
      name: 'Documents',
      description: 'PDFs and document files',
      path: '/uploads/documents',
      parentId: undefined,
      depth: 0,
      isPublic: false,
      color: '#F44336',
      icon: 'file',
      createdBy: users[0]._id,
      permissions: [
        { userId: users[0]._id, role: 'admin' as const }
      ],
      fileCount: 0,
      totalSize: 0
    },
    {
      name: 'Temporary',
      description: 'Temporary uploads (auto-deleted after 24 hours)',
      path: '/uploads/temp',
      parentId: undefined,
      depth: 0,
      isPublic: false,
      color: '#607D8B',
      icon: 'clock',
      createdBy: users[0]._id,
      permissions: [
        { userId: users[0]._id, role: 'admin' as const },
        { userId: users[1]._id, role: 'editor' as const },
        { userId: users[2]._id, role: 'viewer' as const }
      ],
      fileCount: 0,
      totalSize: 0
    }
  ];
  return await UploadFolder.insertMany(uploadFolders);
};

const createAddresses = async (users: any[]) => {
  const addresses = [
    {
      user: users[1]._id,
      type: 'both' as const,
      isDefault: true,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '9876543210',
      addressLine1: '123, MG Road',
      addressLine2: 'Near Central Mall',
      landmark: 'Opposite HDFC Bank',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      isVerified: true,
      verifiedAt: new Date(),
      verificationMethod: 'manual' as const,
      usageCount: 5,
      lastUsedAt: new Date(),
      label: 'Home',
      deliveryInstructions: 'Call before delivery',
      isActive: true
    },
    {
      user: users[2]._id,
      type: 'shipping' as const,
      isDefault: true,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '9876543211',
      addressLine1: '456, Park Street',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001',
      isVerified: false,
      usageCount: 2,
      label: 'Office',
      isActive: true
    },
    {
      user: users[1]._id,
      type: 'billing' as const,
      isDefault: false,
      firstName: 'John',
      lastName: 'Doe',
      phone: '9876543210',
      addressLine1: '789, Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
      isVerified: true,
      usageCount: 1,
      label: 'Parents House',
      isActive: true
    }
  ];
  return await Address.insertMany(addresses);
};

const createUploads = async (users: any[]) => {
  const uploads = [
    {
      originalName: 'summer-collection-banner.jpg',
      fileName: 'product-banner.jpg',
      filePath: '/uploads/products/product-banner.jpg',
      url: 'https://res.cloudinary.com/vardhman/image/upload/products/product-banner.jpg',
      publicId: 'vardhman/products/product-banner',
      mimeType: 'image/jpeg',
      size: 2456789,
      type: 'image' as const,
      status: 'completed' as const,
      progress: 100,
      uploadedBy: users[0]._id,
      uploadedAt: new Date(),
      metadata: {
        width: 1920,
        height: 1080
      },
      thumbnails: [],
      versions: [],
      tags: ['product', 'banner', 'summer-collection'],
      isPublic: true,
      downloadCount: 0,
      storageProvider: 'cloudinary' as const,
      cdnUrl: 'https://res.cloudinary.com/vardhman/image/upload/products/product-banner.jpg'
    },
    {
      originalName: 'complete-product-catalog-2024.pdf',
      fileName: 'product-catalog.pdf',
      filePath: '/uploads/documents/product-catalog.pdf',
      url: 'https://res.cloudinary.com/vardhman/raw/upload/documents/product-catalog.pdf',
      publicId: 'vardhman/documents/product-catalog',
      mimeType: 'application/pdf',
      size: 5678901,
      type: 'document' as const,
      status: 'completed' as const,
      progress: 100,
      uploadedBy: users[0]._id,
      uploadedAt: new Date(),
      metadata: {},
      thumbnails: [],
      versions: [],
      tags: ['catalog', 'products', '2024'],
      category: 'marketing-material',
      isPublic: true,
      downloadCount: 0,
      storageProvider: 'cloudinary' as const,
      cdnUrl: 'https://res.cloudinary.com/vardhman/raw/upload/documents/product-catalog.pdf'
    }
  ];
  return await FileUpload.insertMany(uploads);
};

const createCMSSettings = async (users: any[]) => {
  const cmsSettings = new CMSSettings({
    siteTitle: 'Vardhman Mills',
    siteTagline: 'Quality Textiles Since 1985',
    siteDescription: 'Premium Home Textiles',
    contactEmail: 'info@vardhmanmills.com',
    contactPhone: '9876543210',
    socialMedia: {
      facebook: 'https://facebook.com/vardhmanmills',
      instagram: 'https://instagram.com/vardhmanmills',
      twitter: 'https://twitter.com/vardhmanmills'
    },
    seo: {
      defaultMetaTitle: 'Vardhman Mills - Premium Home Textiles',
      defaultMetaDescription: 'Leading manufacturer of premium home textiles',
      googleAnalyticsId: 'UA-XXXXXXXXX'
    },
    general: {
      timezone: 'Asia/Kolkata',
      language: 'en',
      currency: 'INR',
      maintenanceMode: false
    }
  });
  await cmsSettings.save();
  return cmsSettings;
};

const createCMSMenus = async (users: any[]) => {
  const menus = [
    {
      name: 'Main Navigation',
      slug: 'main-nav',
      location: 'header' as const,
      status: 'active' as const,
      settings: {
        maxDepth: 2,
        showIcons: true,
        orientation: 'horizontal' as const
      },
      items: [
        {
          id: 'home-1',
          label: 'Home',
          url: '/',
          type: 'page' as const,
          sortOrder: 1,
          isActive: true
        },
        {
          id: 'products-1',
          label: 'Products',
          url: '/products',
          type: 'page' as const,
          sortOrder: 2,
          isActive: true,
          children: [
            {
              id: 'bedsheets-1',
              label: 'Bedsheets',
              url: '/products/bedsheets',
              type: 'category' as const,
              sortOrder: 1,
              isActive: true
            },
            {
              id: 'towels-1',
              label: 'Towels',
              url: '/products/towels',
              type: 'category' as const,
              sortOrder: 2,
              isActive: true
            }
          ]
        },
        {
          id: 'about-1',
          label: 'About Us',
          url: '/about',
          type: 'page' as const,
          sortOrder: 3,
          isActive: true
        },
        {
          id: 'contact-1',
          label: 'Contact',
          url: '/contact',
          type: 'page' as const,
          sortOrder: 4,
          isActive: true
        }
      ],
      createdBy: users[0]._id
    },
    {
      name: 'Footer Links',
      slug: 'footer-links',
      location: 'footer' as const,
      status: 'active' as const,
      settings: {
        maxDepth: 1,
        showIcons: false,
        orientation: 'vertical' as const
      },
      items: [
        {
          id: 'privacy-1',
          label: 'Privacy Policy',
          url: '/privacy-policy',
          type: 'page' as const,
          sortOrder: 1,
          isActive: true
        },
        {
          id: 'terms-1',
          label: 'Terms & Conditions',
          url: '/terms',
          type: 'page' as const,
          sortOrder: 2,
          isActive: true
        }
      ],
      createdBy: users[0]._id
    }
  ];
  return await CMSMenu.insertMany(menus);
};

const createCMSTemplates = async (users: any[]) => {
  const templates = [
    {
      name: 'Homepage Template',
      slug: 'homepage',
      description: 'Default template for homepage',
      type: 'page' as const,
      content: '<div class="homepage">{{content}}</div>',
      fields: [
        {
          name: 'hero_title',
          type: 'text' as const,
          label: 'Hero Title',
          required: true,
          order: 1
        },
        {
          name: 'hero_subtitle',
          type: 'textarea' as const,
          label: 'Hero Subtitle',
          required: false,
          order: 2
        }
      ],
      isActive: true,
      createdBy: users[0]._id
    },
    {
      name: 'Product Page Template',
      slug: 'product-page',
      description: 'Template for product pages',
      type: 'page' as const,
      content: '<div class="product-page">{{content}}</div>',
      fields: [
        {
          name: 'product_name',
          type: 'text' as const,
          label: 'Product Name',
          required: true,
          order: 1
        }
      ],
      isActive: true,
      createdBy: users[0]._id
    }
  ];
  return await CMSTemplate.insertMany(templates);
};

const createCMSPages = async (users: any[], templates: any[]) => {
  const pages = [
    {
      title: 'Home',
      slug: 'home',
      template: templates[0]._id,
      content: '<h1>Welcome to Vardhman Mills</h1><p>Premium home textiles manufacturer</p>',
      excerpt: 'Welcome to our homepage',
      type: 'page' as const,
      status: 'published' as const,
      visibility: 'public' as const,
      blocks: [],
      layout: {
        template: 'default',
        theme: 'default',
        sidebar: 'none' as const,
        header: true,
        footer: true,
        breadcrumbs: true
      },
      seo: {
        metaTitle: 'Vardhman Mills - Home',
        metaDescription: 'Premium home textiles',
        metaKeywords: ['home', 'textiles', 'bedsheets']
      },
      accessControl: {
        requireLogin: false
      },
      analytics: {
        views: 0,
        uniqueViews: 0
      },
      version: 1,
      publishedAt: new Date(),
      author: users[0]._id
    },
    {
      title: 'About Us',
      slug: 'about',
      template: templates[0]._id,
      content: '<h1>About Vardhman Mills</h1><p>We are a leading textile manufacturer...</p>',
      excerpt: 'Learn about our company',
      type: 'page' as const,
      status: 'published' as const,
      visibility: 'public' as const,
      blocks: [],
      layout: {
        template: 'default',
        theme: 'default',
        sidebar: 'none' as const,
        header: true,
        footer: true,
        breadcrumbs: true
      },
      seo: {
        metaTitle: 'About Us - Vardhman Mills',
        metaDescription: 'Learn about our textile manufacturing heritage',
        metaKeywords: ['about', 'company', 'manufacturer']
      },
      accessControl: {
        requireLogin: false
      },
      analytics: {
        views: 0,
        uniqueViews: 0
      },
      version: 1,
      publishedAt: new Date(),
      author: users[0]._id
    }
  ];
  return await CMSPage.insertMany(pages);
};

const createCMSWidgets = async (users: any[]) => {
  const widgets = [
    {
      name: 'Newsletter Signup',
      slug: 'newsletter-widget',
      description: 'Newsletter subscription widget',
      type: 'newsletter' as const,
      content: {
        title: 'Subscribe to our newsletter',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
        successMessage: 'Thank you for subscribing!'
      },
      settings: {
        position: 'footer' as const,
        priority: 1,
        width: '100%',
        alignment: 'center' as const
      },
      displayRules: {
        devices: ['desktop', 'tablet', 'mobile'],
        requireAuth: false
      },
      status: 'active' as const,
      isGlobal: true,
      createdBy: users[0]._id
    },
    {
      name: 'Featured Products',
      slug: 'featured-products-widget',
      description: 'Display featured products',
      type: 'custom' as const,
      content: {
        title: 'Featured Products',
        limit: 4,
        category: 'featured',
        showPrice: true,
        showRating: true
      },
      settings: {
        position: 'sidebar' as const,
        priority: 1,
        width: '100%',
        alignment: 'left' as const
      },
      displayRules: {
        pages: ['home', 'products'],
        devices: ['desktop', 'tablet', 'mobile'],
        requireAuth: false
      },
      status: 'active' as const,
      isGlobal: false,
      createdBy: users[0]._id
    }
  ];
  return await CMSWidget.insertMany(widgets);
};

seedData();