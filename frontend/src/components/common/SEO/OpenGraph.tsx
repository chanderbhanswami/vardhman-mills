'use client';

import React from 'react';
import Head from 'next/head';

export interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export interface OpenGraphVideo {
  url: string;
  width?: number;
  height?: number;
  type?: string;
}

export interface OpenGraphAudio {
  url: string;
  type?: string;
}

export interface OpenGraphProps {
  title?: string;
  description?: string;
  type?: 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';
  url?: string;
  siteName?: string;
  locale?: string;
  alternateLocales?: string[];
  images?: OpenGraphImage[];
  videos?: OpenGraphVideo[];
  audio?: OpenGraphAudio[];
  
  // Article specific
  articleAuthor?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleExpirationTime?: string;
  articleSection?: string;
  articleTags?: string[];
  
  // Profile specific
  profileFirstName?: string;
  profileLastName?: string;
  profileUsername?: string;
  profileGender?: string;
  
  // Book specific
  bookAuthor?: string;
  bookIsbn?: string;
  bookReleaseDate?: string;
  bookTags?: string[];
  
  // Music specific
  musicDuration?: number;
  musicAlbum?: string;
  musicMusician?: string;
  
  // Video specific
  videoDuration?: number;
  videoReleaseDate?: string;
  videoTags?: string[];
  videoActor?: string;
  videoDirector?: string;
  videoWriter?: string;
  
  // App specific
  appId?: string;
  appUrl?: string;
}

const OpenGraph: React.FC<OpenGraphProps> = ({
  title,
  description,
  type = 'website',
  url,
  siteName,
  locale = 'en_US',
  alternateLocales = [],
  images = [],
  videos = [],
  audio = [],
  
  // Article
  articleAuthor,
  articlePublishedTime,
  articleModifiedTime,
  articleExpirationTime,
  articleSection,
  articleTags = [],
  
  // Profile
  profileFirstName,
  profileLastName,
  profileUsername,
  profileGender,
  
  // Book
  bookAuthor,
  bookIsbn,
  bookReleaseDate,
  bookTags = [],
  
  // Music
  musicDuration,
  musicAlbum,
  musicMusician,
  
  // Video
  videoDuration,
  videoReleaseDate,
  videoTags = [],
  videoActor,
  videoDirector,
  videoWriter,
  
  // App
  appId,
  appUrl,
}) => {
  return (
    <Head>
      {/* Basic OpenGraph Tags */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {siteName && <meta property="og:site_name" content={siteName} />}
      <meta property="og:locale" content={locale} />
      
      {/* Alternate Locales */}
      {alternateLocales.map((altLocale, index) => (
        <meta key={`alt-locale-${index}`} property="og:locale:alternate" content={altLocale} />
      ))}
      
      {/* Images */}
      {images.map((image, index) => (
        <React.Fragment key={`og-image-${index}`}>
          <meta property="og:image" content={image.url} />
          {image.width && <meta property="og:image:width" content={image.width.toString()} />}
          {image.height && <meta property="og:image:height" content={image.height.toString()} />}
          {image.alt && <meta property="og:image:alt" content={image.alt} />}
          {image.type && <meta property="og:image:type" content={image.type} />}
        </React.Fragment>
      ))}
      
      {/* Videos */}
      {videos.map((video, index) => (
        <React.Fragment key={`og-video-${index}`}>
          <meta property="og:video" content={video.url} />
          {video.width && <meta property="og:video:width" content={video.width.toString()} />}
          {video.height && <meta property="og:video:height" content={video.height.toString()} />}
          {video.type && <meta property="og:video:type" content={video.type} />}
        </React.Fragment>
      ))}
      
      {/* Audio */}
      {audio.map((audioFile, index) => (
        <React.Fragment key={`og-audio-${index}`}>
          <meta property="og:audio" content={audioFile.url} />
          {audioFile.type && <meta property="og:audio:type" content={audioFile.type} />}
        </React.Fragment>
      ))}
      
      {/* Article Properties */}
      {type === 'article' && (
        <>
          {articleAuthor && <meta property="article:author" content={articleAuthor} />}
          {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
          {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
          {articleExpirationTime && <meta property="article:expiration_time" content={articleExpirationTime} />}
          {articleSection && <meta property="article:section" content={articleSection} />}
          {articleTags.map((tag, index) => (
            <meta key={`article-tag-${index}`} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Profile Properties */}
      {type === 'profile' && (
        <>
          {profileFirstName && <meta property="profile:first_name" content={profileFirstName} />}
          {profileLastName && <meta property="profile:last_name" content={profileLastName} />}
          {profileUsername && <meta property="profile:username" content={profileUsername} />}
          {profileGender && <meta property="profile:gender" content={profileGender} />}
        </>
      )}
      
      {/* Book Properties */}
      {type === 'book' && (
        <>
          {bookAuthor && <meta property="book:author" content={bookAuthor} />}
          {bookIsbn && <meta property="book:isbn" content={bookIsbn} />}
          {bookReleaseDate && <meta property="book:release_date" content={bookReleaseDate} />}
          {bookTags.map((tag, index) => (
            <meta key={`book-tag-${index}`} property="book:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Music Properties */}
      {(type.startsWith('music.')) && (
        <>
          {musicDuration && <meta property="music:duration" content={musicDuration.toString()} />}
          {musicAlbum && <meta property="music:album" content={musicAlbum} />}
          {musicMusician && <meta property="music:musician" content={musicMusician} />}
        </>
      )}
      
      {/* Video Properties */}
      {(type.startsWith('video.')) && (
        <>
          {videoDuration && <meta property="video:duration" content={videoDuration.toString()} />}
          {videoReleaseDate && <meta property="video:release_date" content={videoReleaseDate} />}
          {videoActor && <meta property="video:actor" content={videoActor} />}
          {videoDirector && <meta property="video:director" content={videoDirector} />}
          {videoWriter && <meta property="video:writer" content={videoWriter} />}
          {videoTags.map((tag, index) => (
            <meta key={`video-tag-${index}`} property="video:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* App Properties */}
      {appId && <meta property="fb:app_id" content={appId} />}
      {appUrl && <meta property="al:web:url" content={appUrl} />}
    </Head>
  );
};

export default OpenGraph;