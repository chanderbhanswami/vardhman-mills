'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  BookOpen, 
  TrendingUp, 
  MessageSquare, 
  Heart,
  Archive,
  Search,
  Mail,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Rss
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Types
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  description?: string;
  color?: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  count: number;
  color?: string;
}

export interface PopularPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  readTime: number;
  views: number;
  comments: number;
  likes: number;
  imageUrl?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  categories: string[];
}

export interface RecentPost {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  imageUrl?: string;
  readTime: number;
}

export interface AuthorInfo {
  id: string;
  name: string;
  bio: string;
  avatar?: string;
  website?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  stats: {
    posts: number;
    followers: number;
    likes: number;
  };
}

export interface BlogSidebarProps {
  className?: string;
  sticky?: boolean;
  showCategories?: boolean;
  showTags?: boolean;
  showPopularPosts?: boolean;
  showRecentPosts?: boolean;
  showAuthorInfo?: boolean;
  showNewsletterSignup?: boolean;
  showArchive?: boolean;
  showSocialLinks?: boolean;
  showSearch?: boolean;
  maxCategories?: number;
  maxTags?: number;
  maxPopularPosts?: number;
  maxRecentPosts?: number;
  categories?: BlogCategory[];
  tags?: BlogTag[];
  popularPosts?: PopularPost[];
  recentPosts?: RecentPost[];
  authorInfo?: AuthorInfo;
  onCategoryClick?: (category: BlogCategory) => void;
  onTagClick?: (tag: BlogTag) => void;
  onPostClick?: (post: PopularPost | RecentPost) => void;
  onNewsletterSubmit?: (email: string) => void;
  onSearch?: (query: string) => void;
  variant?: 'default' | 'minimal' | 'detailed' | 'compact';
}

// Sample data
const sampleCategories: BlogCategory[] = [
  { id: '1', name: 'Technology', slug: 'technology', count: 45, color: 'blue' },
  { id: '2', name: 'Web Development', slug: 'web-development', count: 32, color: 'green' },
  { id: '3', name: 'Design', slug: 'design', count: 28, color: 'purple' },
  { id: '4', name: 'Programming', slug: 'programming', count: 25, color: 'orange' },
  { id: '5', name: 'Tutorials', slug: 'tutorials', count: 22, color: 'red' }
];

const sampleTags: BlogTag[] = [
  { id: '1', name: 'React', slug: 'react', count: 15 },
  { id: '2', name: 'JavaScript', slug: 'javascript', count: 12 },
  { id: '3', name: 'TypeScript', slug: 'typescript', count: 10 },
  { id: '4', name: 'CSS', slug: 'css', count: 8 },
  { id: '5', name: 'Next.js', slug: 'nextjs', count: 7 },
  { id: '6', name: 'Node.js', slug: 'nodejs', count: 6 },
  { id: '7', name: 'Python', slug: 'python', count: 5 },
  { id: '8', name: 'API', slug: 'api', count: 4 }
];

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  className,
  sticky = true,
  showCategories = true,
  showTags = true,
  showPopularPosts = true,
  showRecentPosts = true,
  showAuthorInfo = false,
  showNewsletterSignup = true,
  showArchive = false,
  showSocialLinks = false,
  showSearch = false,
  maxCategories = 10,
  maxTags = 15,
  maxPopularPosts = 5,
  maxRecentPosts = 5,
  categories = sampleCategories,
  tags = sampleTags,
  popularPosts = [],
  recentPosts = [],
  authorInfo,
  onCategoryClick,
  onTagClick,
  onPostClick,
  onNewsletterSubmit,
  onSearch,
  variant = 'default'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    tags: true,
    popular: true,
    recent: true,
    archive: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && onNewsletterSubmit) {
      onNewsletterSubmit(newsletterEmail.trim());
      setNewsletterEmail('');
    }
  };

  const getCategoryColor = (color?: string) => {
    const colors = {
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
      orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
      red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
      default: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'
    };
    return colors[color as keyof typeof colors] || colors.default;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Sidebar section component
  const SidebarSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    sectionKey: string;
    collapsible?: boolean;
    children: React.ReactNode;
  }> = ({ title, icon, sectionKey, collapsible = true, children }) => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection(sectionKey)}
              className="h-6 w-6 p-0"
            >
              {expandedSections[sectionKey] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <AnimatePresence>
        {(!collapsible || expandedSections[sectionKey]) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              {children}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );

  // Render search section
  const renderSearch = () => (
    <SidebarSection
      title="Search"
      icon={<Search size={18} />}
      sectionKey="search"
      collapsible={false}
    >
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm">
          <Search size={16} />
        </Button>
      </form>
    </SidebarSection>
  );

  // Render categories section
  const renderCategories = () => (
    <SidebarSection
      title="Categories"
      icon={<BookOpen size={18} />}
      sectionKey="categories"
    >
      <div className="space-y-2">
        {categories.slice(0, maxCategories).map((category) => (
          <div
            key={category.id}
            onClick={() => onCategoryClick?.(category)}
            className={cn(
              'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
              getCategoryColor(category.color)
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="truncate font-medium">{category.name}</span>
            </div>
            <Badge variant="secondary" className="ml-2 text-xs">
              {category.count}
            </Badge>
          </div>
        ))}
        {categories.length > maxCategories && (
          <Link href="/categories" className="block text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-2">
            View all categories →
          </Link>
        )}
      </div>
    </SidebarSection>
  );

  // Render tags section
  const renderTags = () => (
    <SidebarSection
      title="Popular Tags"
      icon={<Tag size={18} />}
      sectionKey="tags"
    >
      <div className="flex flex-wrap gap-1.5">
        {tags.slice(0, maxTags).map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-xs"
            onClick={() => onTagClick?.(tag)}
          >
            {tag.name} ({tag.count})
          </Badge>
        ))}
      </div>
      {tags.length > maxTags && (
        <Link href="/tags" className="block text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-3">
          View all tags →
        </Link>
      )}
    </SidebarSection>
  );

  // Render popular posts section
  const renderPopularPosts = () => (
    <SidebarSection
      title="Popular Posts"
      icon={<TrendingUp size={18} />}
      sectionKey="popular"
    >
      <div className="space-y-4">
        {popularPosts.slice(0, maxPopularPosts).map((post, index) => (
          <div
            key={post.id}
            onClick={() => onPostClick?.(post)}
            className="flex gap-3 cursor-pointer group"
          >
            {post.imageUrl && (
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                  #{index + 1}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Heart size={12} />
                  {formatNumber(post.likes)}
                </div>
              </div>
              
              <h4 className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h4>
              
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {post.readTime}m
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={10} />
                  {post.comments}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SidebarSection>
  );

  // Render recent posts section
  const renderRecentPosts = () => (
    <SidebarSection
      title="Recent Posts"
      icon={<Clock size={18} />}
      sectionKey="recent"
    >
      <div className="space-y-3">
        {recentPosts.slice(0, maxRecentPosts).map((post) => (
          <div
            key={post.id}
            onClick={() => onPostClick?.(post)}
            className="flex gap-3 cursor-pointer group"
          >
            {post.imageUrl && (
              <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h4>
              
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Calendar size={10} />
                {formatDate(post.publishedAt)}
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {post.readTime}m
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SidebarSection>
  );

  // Render author info section
  const renderAuthorInfo = () => {
    if (!authorInfo) return null;

    return (
      <SidebarSection
        title="About the Author"
        icon={<User size={18} />}
        sectionKey="author"
        collapsible={false}
      >
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src={authorInfo.avatar} alt={authorInfo.name} />
            <AvatarFallback>{authorInfo.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <h3 className="font-semibold text-lg mb-2">{authorInfo.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{authorInfo.bio}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="font-semibold text-lg">{formatNumber(authorInfo.stats.posts)}</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div>
              <div className="font-semibold text-lg">{formatNumber(authorInfo.stats.followers)}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div>
              <div className="font-semibold text-lg">{formatNumber(authorInfo.stats.likes)}</div>
              <div className="text-xs text-gray-500">Likes</div>
            </div>
          </div>
          
          {authorInfo.website && (
            <Button variant="outline" size="sm" className="mb-3" asChild>
              <Link href={authorInfo.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} className="mr-1" />
                Website
              </Link>
            </Button>
          )}
          
          {authorInfo.social && (
            <div className="flex justify-center gap-2">
              {Object.entries(authorInfo.social).map(([platform, url]) => (
                <Button key={platform} variant="ghost" size="sm" asChild>
                  <Link href={url} target="_blank" rel="noopener noreferrer">
                    {platform}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </SidebarSection>
    );
  };

  // Render newsletter signup section
  const renderNewsletterSignup = () => (
    <SidebarSection
      title="Newsletter"
      icon={<Mail size={18} />}
      sectionKey="newsletter"
      collapsible={false}
    >
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Subscribe to get the latest posts delivered right to your inbox.
        </p>
        
        <form onSubmit={handleNewsletterSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Subscribe
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2">
          No spam, unsubscribe anytime.
        </p>
      </div>
    </SidebarSection>
  );

  // Render archive section
  const renderArchive = () => (
    <SidebarSection
      title="Archive"
      icon={<Archive size={18} />}
      sectionKey="archive"
    >
      <div className="space-y-2">
        {/* This would typically be generated from actual blog data */}
        <Link href="/archive/2024" className="flex items-center justify-between text-sm hover:text-blue-600 dark:hover:text-blue-400">
          <span>2024</span>
          <span className="text-gray-500">(24)</span>
        </Link>
        <Link href="/archive/2023" className="flex items-center justify-between text-sm hover:text-blue-600 dark:hover:text-blue-400">
          <span>2023</span>
          <span className="text-gray-500">(18)</span>
        </Link>
        <Link href="/archive/2022" className="flex items-center justify-between text-sm hover:text-blue-600 dark:hover:text-blue-400">
          <span>2022</span>
          <span className="text-gray-500">(12)</span>
        </Link>
      </div>
    </SidebarSection>
  );

  // Render social links section
  const renderSocialLinks = () => (
    <SidebarSection
      title="Follow Us"
      icon={<Rss size={18} />}
      sectionKey="social"
      collapsible={false}
    >
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/rss" target="_blank">
            <Rss size={14} />
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="https://twitter.com" target="_blank">
            Twitter
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="https://facebook.com" target="_blank">
            Facebook
          </Link>
        </Button>
      </div>
    </SidebarSection>
  );

  const sidebarClass = cn(
    'w-full',
    sticky && 'sticky top-4',
    variant === 'compact' && 'max-w-xs',
    variant === 'minimal' && 'space-y-4',
    className
  );

  return (
    <aside className={sidebarClass}>
      {showSearch && renderSearch()}
      {showAuthorInfo && renderAuthorInfo()}
      {showCategories && categories.length > 0 && renderCategories()}
      {showTags && tags.length > 0 && renderTags()}
      {showPopularPosts && popularPosts.length > 0 && renderPopularPosts()}
      {showRecentPosts && recentPosts.length > 0 && renderRecentPosts()}
      {showNewsletterSignup && renderNewsletterSignup()}
      {showArchive && renderArchive()}
      {showSocialLinks && renderSocialLinks()}
    </aside>
  );
};

// Utility components
export const CategorySidebar: React.FC<{
  categories: BlogCategory[];
  onCategoryClick?: (category: BlogCategory) => void;
  className?: string;
}> = ({ categories, onCategoryClick, className }) => (
  <BlogSidebar
    categories={categories}
    onCategoryClick={onCategoryClick}
    showCategories={true}
    showTags={false}
    showPopularPosts={false}
    showRecentPosts={false}
    showNewsletterSignup={false}
    showArchive={false}
    showSocialLinks={false}
    showSearch={false}
    variant="minimal"
    className={className}
  />
);

export const PopularPostsSidebar: React.FC<{
  posts: PopularPost[];
  onPostClick?: (post: PopularPost) => void;
  className?: string;
}> = ({ posts, onPostClick, className }) => {
  const handlePostClick = (post: PopularPost | RecentPost) => {
    // Type guard to ensure we only call onPostClick with PopularPost
    if ('views' in post && 'comments' in post && 'likes' in post && 'author' in post && 'categories' in post) {
      onPostClick?.(post as PopularPost);
    }
  };

  return (
    <BlogSidebar
      popularPosts={posts}
      onPostClick={handlePostClick}
      showCategories={false}
      showTags={false}
      showPopularPosts={true}
      showRecentPosts={false}
      showNewsletterSignup={false}
      showArchive={false}
      showSocialLinks={false}
      showSearch={false}
      variant="minimal"
      className={className}
    />
  );
};

export const CompactSidebar: React.FC<BlogSidebarProps> = (props) => (
  <BlogSidebar
    {...props}
    variant="compact"
    showAuthorInfo={false}
    showArchive={false}
    maxCategories={5}
    maxTags={10}
    maxPopularPosts={3}
    maxRecentPosts={3}
  />
);

export default BlogSidebar;
