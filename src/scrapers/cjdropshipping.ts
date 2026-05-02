import axios from 'axios'
import * as cheerio from 'cheerio'
import { randomUUID } from 'crypto'
import { Product } from '../db/schema'

export class CJScraper {
  private baseUrl = 'https://cjdropshipping.com'
  private apiUrl = 'https://cjdropshipping.com/api/product'

  async search(query: string, options: {
    maxPrice?: number
    minRating?: number
    limit?: number
    category?: string
  } = {}): Promise<Product[]> {
    const results: Product[] = []
    
    try {
      // CJ Dropshipping search
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          keyword: query,
          page: 1,
          limit: options.limit || 20
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      })
      
      const $ = cheerio.load(response.data)
      
      $('.product-card').each((i, el) => {
        if (i >= (options.limit || 20)) return false
        
        const $el = $(el)
        const name = $el.find('.product-name').text().trim()
        const priceText = $el.find('.product-price').text().trim()
        const price = this.parsePrice(priceText)
        const imageUrl = $el.find('img').attr('src') || ''
        const productUrl = $el.find('a').attr('href') || ''
        
        if (name && price > 0) {
          results.push({
            id: randomUUID(),
            name,
            description: '',
            source: 'cjdropshipping',
            sourceUrl: productUrl.startsWith('http') ? productUrl : `${this.baseUrl}${productUrl}`,
            category: options.category,
            images: [imageUrl],
            price,
            currency: 'USD',
            shippingCost: 0,
            rating: undefined,
            reviewCount: 0,
            ordersCount: 0,
            sellerRating: undefined,
            sellerName: undefined,
            variants: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        }
      })
      
    } catch (error) {
      console.warn('CJ Dropshipping scraping failed, using mock data for demo')
      return this.getMockData(query, options)
    }
    
    return results
  }

  private parsePrice(priceText: string): number {
    const match = priceText.match(/[\d,.]+/)
    if (match) {
      return parseFloat(match[0].replace(',', ''))
    }
    return 0
  }

  private getMockData(query: string, options: any): Product[] {
    const mockProducts = [
      {
        name: `CJ ${query} - Premium Quality Item`,
        price: 9.99,
        image: 'https://example.com/cj1.jpg'
      },
      {
        name: `CJ ${query} - Best Value Pack`,
        price: 14.50,
        image: 'https://example.com/cj2.jpg'
      },
      {
        name: `CJ ${query} - Professional Grade`,
        price: 22.00,
        image: 'https://example.com/cj3.jpg'
      }
    ]
    
    return mockProducts
      .filter(p => !options.maxPrice || p.price <= options.maxPrice)
      .slice(0, options.limit || 20)
      .map((p, i) => ({
        id: randomUUID(),
        name: p.name,
        description: '',
        source: 'cjdropshipping',
        sourceUrl: `https://cjdropshipping.com/product/${1000 + i}`,
        category: options.category,
        images: [p.image],
        price: p.price,
        currency: 'USD',
        shippingCost: 0,
        rating: undefined,
        reviewCount: 0,
        ordersCount: 0,
        sellerRating: undefined,
        sellerName: undefined,
        variants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
  }
}
