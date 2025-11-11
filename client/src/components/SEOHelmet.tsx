import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  product?: {
    price?: number;
    currency?: string;
    availability?: 'in stock' | 'out of stock' | 'preorder';
    brand?: string;
  };
  jsonLd?: Record<string, any>;
}

export function SEOHelmet({
  title = 'WEB4TG - Telegram Mini Apps для вашего бизнеса',
  description = 'Создайте свой бизнес в Telegram за 24 часа. Более 2,453 успешных предпринимателей уже запустили свои приложения. Рейтинг 4.9/5 ⭐',
  keywords = ['telegram mini app', 'telegram bot', 'веб приложение', 'бизнес в telegram', 'tma', 'web app'],
  image = 'https://web4tg.com/og-image.jpg',
  url,
  type = 'website',
  article,
  product,
  jsonLd
}: SEOHelmetProps) {
  const siteUrl = 'https://web4tg.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Default JSON-LD for Organization
  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WEB4TG',
    description: 'Платформа для создания Telegram Mini Apps',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['Russian', 'English']
    },
    sameAs: [
      'https://t.me/web4tg',
      'https://github.com/web4tg'
    ]
  };

  // Article JSON-LD
  const articleJsonLd = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: fullImage,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author || 'WEB4TG Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'WEB4TG',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    articleSection: article.section,
    keywords: article.tags?.join(', ')
  } : null;

  // Product JSON-LD
  const productJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: description,
    image: fullImage,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'WEB4TG'
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'RUB',
      availability: `https://schema.org/${product.availability === 'in stock' ? 'InStock' : 'OutOfStock'}`
    }
  } : null;

  const finalJsonLd = jsonLd || articleJsonLd || productJsonLd || defaultJsonLd;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <meta name="author" content="WEB4TG" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="WEB4TG" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Article specific OG tags */}
      {article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.section && (
            <meta property="article:section" content={article.section} />
          )}
          {article.tags && article.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@web4tg" />
      <meta name="twitter:creator" content="@web4tg" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="revisit-after" content="7 days" />
      <meta httpEquiv="Content-Language" content="ru" />
      
      {/* Mobile App Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="WEB4TG" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#10b981" />
      <meta name="msapplication-navbutton-color" content="#10b981" />
      <meta name="apple-mobile-web-app-status-bar-style" content="#10b981" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalJsonLd)}
      </script>
    </Helmet>
  );
}

// Preset SEO configurations
export const SEOPresets = {
  home: {
    title: 'WEB4TG - Запустите бизнес в Telegram за 24 часа',
    description: 'Создайте свой бизнес в Telegram за 24 часа. Более 2,453 успешных предпринимателей уже запустили свои приложения. Рейтинг 4.9/5 ⭐',
    keywords: ['telegram mini app', 'telegram бизнес', 'создать приложение telegram', 'tma', 'web app telegram'],
  },
  
  showcases: {
    title: 'Демо-приложения - WEB4TG',
    description: 'Изучите 30+ готовых демо-приложений для различных бизнесов: магазины одежды, рестораны, фитнес-центры и многое другое. Получите вдохновение для своего проекта.',
    keywords: ['демо приложения telegram', 'примеры tma', 'шаблоны telegram bot', 'готовые решения'],
  },
  
  projects: {
    title: 'Портфолио проектов - WEB4TG',
    description: 'Посмотрите реальные кейсы наших клиентов. 1200+ успешных проектов, +340% средний рост прибыли. Ваш проект может быть следующим!',
    keywords: ['портфолио telegram', 'кейсы tma', 'успешные проекты telegram', 'примеры работ'],
  },
  
  aiAgent: {
    title: 'AI Агент для бизнеса - WEB4TG',
    description: 'Умный AI ассистент для вашего бизнеса в Telegram. Автоматизация продаж, 24/7 поддержка, персонализация и аналитика. Увеличьте конверсию на 85%!',
    keywords: ['ai agent telegram', 'telegram chatbot', 'ai ассистент', 'автоматизация продаж', 'бизнес бот'],
  }
};
