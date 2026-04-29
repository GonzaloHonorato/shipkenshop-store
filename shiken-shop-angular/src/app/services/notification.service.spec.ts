import { TestBed } from '@angular/core/testing';
import { NotificationService, NotificationType } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('estado inicial', () => {
    it('should start with no notifications', () => {
      expect(service.notifications()).toEqual([]);
    });
  });

  // ===================================
  // show()
  // ===================================

  describe('show()', () => {
    it('should add a notification with INFO type by default', () => {
      service.show('Test message');
      const notifications = service.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].message).toBe('Test message');
      expect(notifications[0].type).toBe(NotificationType.INFO);
    });

    it('should add notification with specified type ERROR', () => {
      service.show('Error message', NotificationType.ERROR);
      expect(service.notifications()[0].type).toBe(NotificationType.ERROR);
    });

    it('should add notification with type SUCCESS', () => {
      service.show('OK', NotificationType.SUCCESS);
      expect(service.notifications()[0].type).toBe(NotificationType.SUCCESS);
    });

    it('should add notification with type WARNING', () => {
      service.show('Warning', NotificationType.WARNING);
      expect(service.notifications()[0].type).toBe(NotificationType.WARNING);
    });

    it('should generate unique ids for each notification', () => {
      service.show('First');
      service.show('Second');
      const [a, b] = service.notifications();
      expect(a.id).not.toBe(b.id);
    });

    it('should set autoClose to true when duration > 0', () => {
      service.show('Test', NotificationType.INFO, 3000);
      expect(service.notifications()[0].autoClose).toBe(true);
    });

    it('should set autoClose to false when duration is 0', () => {
      service.show('Test', NotificationType.INFO, 0);
      expect(service.notifications()[0].autoClose).toBe(false);
    });

    it('should set the correct duration', () => {
      service.show('Test', NotificationType.INFO, 5000);
      expect(service.notifications()[0].duration).toBe(5000);
    });

    it('should accumulate multiple notifications', () => {
      service.show('First');
      service.show('Second');
      service.show('Third');
      expect(service.notifications().length).toBe(3);
    });
  });

  // ===================================
  // success()
  // ===================================

  describe('success()', () => {
    it('should add a SUCCESS notification', () => {
      service.success('Operación exitosa');
      const notifications = service.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].type).toBe(NotificationType.SUCCESS);
      expect(notifications[0].message).toBe('Operación exitosa');
    });

    it('should use default duration of 3000ms', () => {
      service.success('Done');
      expect(service.notifications()[0].duration).toBe(3000);
    });

    it('should allow custom duration', () => {
      service.success('Done', 1500);
      expect(service.notifications()[0].duration).toBe(1500);
    });
  });

  // ===================================
  // error()
  // ===================================

  describe('error()', () => {
    it('should add an ERROR notification', () => {
      service.error('Error ocurrido');
      const notifications = service.notifications();
      expect(notifications[0].type).toBe(NotificationType.ERROR);
      expect(notifications[0].message).toBe('Error ocurrido');
    });

    it('should use default duration of 5000ms', () => {
      service.error('Oops');
      expect(service.notifications()[0].duration).toBe(5000);
    });
  });

  // ===================================
  // info()
  // ===================================

  describe('info()', () => {
    it('should add an INFO notification', () => {
      service.info('Información importante');
      expect(service.notifications()[0].type).toBe(NotificationType.INFO);
    });

    it('should use default duration of 3000ms', () => {
      service.info('Info');
      expect(service.notifications()[0].duration).toBe(3000);
    });
  });

  // ===================================
  // warning()
  // ===================================

  describe('warning()', () => {
    it('should add a WARNING notification', () => {
      service.warning('Advertencia importante');
      expect(service.notifications()[0].type).toBe(NotificationType.WARNING);
    });

    it('should use default duration of 4000ms', () => {
      service.warning('Cuidado');
      expect(service.notifications()[0].duration).toBe(4000);
    });
  });

  // ===================================
  // remove()
  // ===================================

  describe('remove()', () => {
    it('should remove a notification by id', () => {
      service.show('First');
      service.show('Second');
      const idToRemove = service.notifications()[0].id;

      service.remove(idToRemove);

      expect(service.notifications().length).toBe(1);
      expect(service.notifications()[0].message).toBe('Second');
    });

    it('should not affect other notifications when removing one', () => {
      service.show('Keep this');
      service.show('Remove this');
      const idToRemove = service.notifications()[1].id;

      service.remove(idToRemove);

      expect(service.notifications().length).toBe(1);
      expect(service.notifications()[0].message).toBe('Keep this');
    });

    it('should handle removing a non-existent id gracefully', () => {
      service.show('Keep');
      service.remove('id-that-does-not-exist');
      expect(service.notifications().length).toBe(1);
    });

    it('should result in empty array when removing the only notification', () => {
      service.show('Solo');
      const id = service.notifications()[0].id;
      service.remove(id);
      expect(service.notifications()).toEqual([]);
    });
  });

  // ===================================
  // clear()
  // ===================================

  describe('clear()', () => {
    it('should remove all notifications', () => {
      service.show('First');
      service.show('Second');
      service.show('Third');

      service.clear();

      expect(service.notifications()).toEqual([]);
    });

    it('should work when notifications list is already empty', () => {
      service.clear();
      expect(service.notifications()).toEqual([]);
    });

    it('should work after partial removes', () => {
      service.show('A');
      service.show('B');
      service.remove(service.notifications()[0].id);
      service.clear();
      expect(service.notifications()).toEqual([]);
    });
  });

  // ===================================
  // Integration
  // ===================================

  describe('integration - combined operations', () => {
    it('should handle add, remove, clear sequence correctly', () => {
      service.success('Step 1 done');
      service.error('Step 2 failed');
      service.warning('Step 3 warning');

      expect(service.notifications().length).toBe(3);

      service.remove(service.notifications()[1].id);
      expect(service.notifications().length).toBe(2);
      expect(service.notifications().map(n => n.type)).toEqual([
        NotificationType.SUCCESS,
        NotificationType.WARNING
      ]);

      service.clear();
      expect(service.notifications()).toEqual([]);
    });
  });
});
