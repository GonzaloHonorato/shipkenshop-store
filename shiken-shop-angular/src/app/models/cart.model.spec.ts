import { CartUtils } from './cart.model';
import { Product } from './product.model';

const mockProduct = {
  id: 'p1', name: 'Game', price: 29990, originalPrice: 39990, discount: 25,
  image: 'img.jpg', stock: 10, active: true, featured: true, category: 'accion',
  platform: ['PC'], rating: 4.5, reviews: 10, description: 'Desc',
  developer: 'Dev', tags: [], releaseDate: '2024-01-01', createdAt: '2024-01-01', updatedAt: '2024-01-01'
} as unknown as Product;

describe('CartUtils', () => {
  describe('createCartItemFromProduct()', () => {
    it('should create cart item with default quantity 1', () => {
      const item = CartUtils.createCartItemFromProduct(mockProduct);
      expect(item.id).toBe('p1');
      expect(item.quantity).toBe(1);
    });

    it('should create cart item with explicit quantity', () => {
      const item = CartUtils.createCartItemFromProduct(mockProduct, 3);
      expect(item.quantity).toBe(3);
    });
  });

  describe('calculateItemTotal()', () => {
    it('should calculate item total', () => {
      const item = CartUtils.createCartItemFromProduct(mockProduct, 2);
      const total = CartUtils.calculateItemTotal(item);
      expect(total).toBe(29990 * 2);
    });
  });

  describe('calculateCartSummary()', () => {
    it('should return summary with correct totals', () => {
      const items = [CartUtils.createCartItemFromProduct(mockProduct, 1)];
      const summary = CartUtils.calculateCartSummary(items);
      expect(summary.totalItems).toBe(1);
      expect(summary.subtotal).toBe(39990); // originalPrice * quantity
      expect(summary.total).toBe(29990);    // price * quantity
      expect(summary.totalDiscount).toBeGreaterThan(0);
    });

    it('should return zeros for empty cart', () => {
      const summary = CartUtils.calculateCartSummary([]);
      expect(summary.totalItems).toBe(0);
      expect(summary.subtotal).toBe(0);
    });
  });
});
