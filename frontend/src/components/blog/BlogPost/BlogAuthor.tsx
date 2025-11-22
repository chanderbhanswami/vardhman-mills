'use client';

import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Clock, Calendar, MapPin, Globe, Twitter, Linkedin, Github, Verified, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Types
interface Author {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  email?: string;
  website?: string;
  location?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  verified?: boolean;
  role?: string;
  followerCount?: number;
  postCount?: number;
  joinedAt?: string;
  expertise?: string[];
}

export interface BlogAuthorProps {
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  readingTime?: number;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'card' | 'profile' | 'inline';
  showAvatar?: boolean;
  showMeta?: boolean;
  showBio?: boolean;
  showStats?: boolean;
  showSocial?: boolean;
  showFollowButton?: boolean;
  showJoinedDate?: boolean;
  showExpertise?: boolean;
  className?: string;
  avatarSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onAuthorClick?: (author: Author) => void;
  onFollow?: (authorId: string, isFollowing: boolean) => void;
  isFollowing?: boolean;
  enableInteractions?: boolean;
}

export const BlogAuthor: React.FC<BlogAuthorProps> = ({
  author,
  publishedAt,
  updatedAt,
  readingTime,
  variant = 'default',
  showAvatar = true,
  showMeta = true,
  showBio = false,
  showStats = false,
  showSocial = false,
  showFollowButton = false,
  showJoinedDate = false,
  showExpertise = false,
  className,
  avatarSize = 'md',
  onAuthorClick,
  onFollow,
  isFollowing = false,
  enableInteractions = true
}) => {
  // Handle author click
  const handleAuthorClick = () => {
    if (onAuthorClick && enableInteractions) {
      onAuthorClick(author);
    }
  };

  // Handle follow
  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFollow && enableInteractions) {
      onFollow(author.id, !isFollowing);
    }
  };

  // Get avatar size classes
  const getAvatarSize = () => {
    switch (avatarSize) {
      case 'xs': return 'w-6 h-6';
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-10 h-10';
      case 'lg': return 'w-12 h-12';
      case 'xl': return 'w-16 h-16';
      default: return 'w-10 h-10';
    }
  };

  // Format dates
  const formatPublishedDate = (date: string) => {
    const publishDate = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 7) {
      return formatDistanceToNow(publishDate, { addSuffix: true });
    }
    return format(publishDate, 'MMM d, yyyy');
  };

  // Author name component
  const AuthorName = ({ clickable = true }: { clickable?: boolean }) => (
    <div
      className={cn(
        'flex items-center space-x-1',
        clickable && enableInteractions && 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
      )}
      onClick={clickable ? handleAuthorClick : undefined}
    >
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        {author.name}
      </span>
      {author.verified && (
        <Verified className="w-4 h-4 text-blue-500 fill-current" />
      )}
      {author.role && (
        <Badge variant="secondary" className="text-xs">
          {author.role}
        </Badge>
      )}
    </div>
  );

  // Author avatar component
  const AuthorAvatar = () => showAvatar ? (
    <Avatar 
      className={cn(getAvatarSize(), enableInteractions && 'cursor-pointer')}
      onClick={handleAuthorClick}
    >
      <AvatarImage src={author.avatar} alt={author.name} />
      <AvatarFallback>
        {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
      </AvatarFallback>
    </Avatar>
  ) : null;

  // Meta information component
  const MetaInfo = () => showMeta ? (
    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
      <TooltipProvider>
        <Tooltip content="Published date">
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatPublishedDate(publishedAt)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Published on {format(new Date(publishedAt), 'PPP')}</p>
            {updatedAt && (
              <p className="text-xs mt-1">
                Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {readingTime && (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{readingTime} min read</span>
        </div>
      )}

      {author.username && (
        <span className="text-gray-500">@{author.username}</span>
      )}
    </div>
  ) : null;

  // Stats component
  const Stats = () => showStats ? (
    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
      {author.followerCount !== undefined && (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4" />
          <span>{author.followerCount.toLocaleString()} followers</span>
        </div>
      )}
      {author.postCount !== undefined && (
        <div className="flex items-center space-x-1">
          <FileText className="w-4 h-4" />
          <span>{author.postCount} posts</span>
        </div>
      )}
    </div>
  ) : null;

  // Social links component
  const SocialLinks = () => showSocial && author.social ? (
    <div className="flex items-center space-x-2">
      {author.social.twitter && (
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`https://twitter.com/${author.social!.twitter}`, '_blank');
          }}
        >
          <Twitter className="w-4 h-4" />
        </Button>
      )}
      {author.social.linkedin && (
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            window.open(author.social!.linkedin, '_blank');
          }}
        >
          <Linkedin className="w-4 h-4" />
        </Button>
      )}
      {author.social.github && (
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`https://github.com/${author.social!.github}`, '_blank');
          }}
        >
          <Github className="w-4 h-4" />
        </Button>
      )}
      {author.website && (
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            window.open(author.website, '_blank');
          }}
        >
          <Globe className="w-4 h-4" />
        </Button>
      )}
    </div>
  ) : null;

  // Expertise tags
  const ExpertiseTags = () => showExpertise && author.expertise ? (
    <div className="flex flex-wrap gap-1">
      {author.expertise.slice(0, 3).map((skill, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {skill}
        </Badge>
      ))}
      {author.expertise.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{author.expertise.length - 3} more
        </Badge>
      )}
    </div>
  ) : null;

  // Follow button
  const FollowButton = () => showFollowButton ? (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleFollow}
      disabled={!enableInteractions}
      className="ml-auto"
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  ) : null;

  // Render based on variant
  switch (variant) {
    case 'minimal':
      return (
        <div className={cn('flex items-center space-x-2', className)}>
          <AuthorName />
          <span className="text-gray-400 dark:text-gray-600">·</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatPublishedDate(publishedAt)}
          </span>
        </div>
      );

    case 'compact':
      return (
        <div className={cn('flex items-center space-x-3', className)}>
          <AuthorAvatar />
          <div className="flex-1 min-w-0">
            <AuthorName />
            <MetaInfo />
          </div>
          <FollowButton />
        </div>
      );

    case 'inline':
      return (
        <div className={cn('flex items-center space-x-2 text-sm', className)}>
          <span className="text-gray-600 dark:text-gray-400">by</span>
          <AuthorName />
          <span className="text-gray-400 dark:text-gray-600">·</span>
          <span className="text-gray-600 dark:text-gray-400">
            {formatPublishedDate(publishedAt)}
          </span>
          {readingTime && (
            <>
              <span className="text-gray-400 dark:text-gray-600">·</span>
              <span className="text-gray-600 dark:text-gray-400">
                {readingTime} min read
              </span>
            </>
          )}
        </div>
      );

    case 'detailed':
      return (
        <motion.div 
          className={cn('space-y-4', className)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start space-x-4">
            <AuthorAvatar />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <AuthorName />
                  {author.location && (
                    <div className="flex items-center space-x-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{author.location}</span>
                    </div>
                  )}
                </div>
                <FollowButton />
              </div>
              
              {showBio && author.bio && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {author.bio}
                </p>
              )}
              
              <div className="mt-3 space-y-2">
                <MetaInfo />
                <Stats />
                <ExpertiseTags />
              </div>
            </div>
          </div>
          
          <SocialLinks />
        </motion.div>
      );

    case 'card':
      return (
        <Card className={cn('p-4', className)}>
          <CardContent className="p-0">
            <div className="flex items-start space-x-4">
              <AuthorAvatar />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <AuthorName />
                  <FollowButton />
                </div>
                
                {showBio && author.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {author.bio}
                  </p>
                )}
                
                <div className="space-y-2">
                  <MetaInfo />
                  <Stats />
                  <ExpertiseTags />
                  <SocialLinks />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case 'profile':
      return (
        <Card className={className}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback className="text-lg">
                  {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-2">
              <AuthorName clickable={false} />
              
              {author.username && (
                <p className="text-gray-600 dark:text-gray-400">@{author.username}</p>
              )}
              
              {showBio && author.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {author.bio}
                </p>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Stats />
            
            {showJoinedDate && author.joinedAt && (
              <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(author.joinedAt), 'MMM yyyy')}</span>
              </div>
            )}
            
            <ExpertiseTags />
            
            <Separator />
            
            <div className="flex justify-between">
              <SocialLinks />
              <FollowButton />
            </div>
          </CardContent>
        </Card>
      );

    default:
      return (
        <div className={cn('flex items-start space-x-3', className)}>
          <AuthorAvatar />
          <div className="flex-1">
            <AuthorName />
            <MetaInfo />
            {showBio && author.bio && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {author.bio}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Stats />
                <SocialLinks />
              </div>
              <FollowButton />
            </div>
          </div>
        </div>
      );
  }
};

export default BlogAuthor;