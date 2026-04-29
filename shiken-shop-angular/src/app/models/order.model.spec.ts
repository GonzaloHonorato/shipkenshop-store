import { OrderUtils, OrderStatus } from './order.model';
import { CartItem } from './cart.model';

const mockItem: CartItem = {
  id: 'p1', name: 'Game', price: 29990, originalPrice: 39990,
  discount: 25, image: '', quantity: 2, maxStock: 10
};

describe('OrderUtils', () => {
  describe('generateOrderNumber()', () => {
    it('should generate a string starting with ORD-', () => {
      const num = OrderUtils.generateOrderNumber();
      expect(num).toMatch(/^ORD-/);
    });

    it('should generate unique order numbers', () => {
      const a = OrderUtils.generateOrderNumber();
      const b = OrderUtils.generateOrderNumber();
      expect(a).not.toBe(b);
    });
  });

  describe('calculateOrderTotal()', () => {
    it('should calculate total with default shipping and tax', () => {
      const total = OrderUtils.calculateOrderTotal([mockItem]);
      expect(total).toBe(29990 * 2);
    });

    it('should include shipping in total', () => {
      const total = OrderUtils.calculateOrderTotal([mockItem], 5000);
      expect(total).toBe(29990 * 2 + 5000);
    });

    it('should include tax in total', () => {
      const total = OrderUtils.calculateOrderTotal([mockItem], 0, 1000);
      expect(total).toBe(29990 * 2 + 1000);
    });

    it('should return 0 for empty items', () => {
      expect(OrderUtils.calculateOrderTotal([])).toBe(0);
    });
  });

  describe('getOrderSummary()', () => {
    it('should return summary with correct totals', () => {
      const order = {
        orderNumber: 'ORD-001',
        items: [mockItem],
        total: 59980,
        date: '2024-01-01',
        status: OrderStatus.DELIVERED,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      } as any;

      const summary = OrderUtils.getOrderSummary(order);
      expect(summary.totalItems).toBe(2);
      expect(summary.subtotal).toBe(59980);
    });
  });
});
