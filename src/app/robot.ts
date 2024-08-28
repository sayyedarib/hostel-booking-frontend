import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/seo', '/about', '/tems-of-service', '/privacy-policy', '/contact'],
      disallow: ['/cart, /agreement-checkout', '/sign-in', '/sign-up', 'thanks', 'coming-soom', '/confirm', '/login', '/signup', '/payment-confirmed', '/rooms']
    },
    sitemap: 'https://www.aligarhhostel.com/sitemap.xml',
  }
}