# Entity Test Examples

This file contains complete examples of generated test files following the testing patterns.

## File Organization

**IMPORTANT**: All tests are created in the `__tests__` folder at package root (sibling to `/src`):

```
packages/
  my-package/
    src/
      IUserService.ts
      UserService.ts
      IReport.ts
      ReportTemplate.ts
    __tests__/                # Sibling to src/, NOT inside src/
      userService.spec.ts
      report.spec.ts
```

## Example 1: Simple Service Class

### Original Interface and Class

**Interface:**
```typescript
// src/IUserService.ts
export interface IUserService {
  login(username: string, password: string): Promise<boolean>;
  logout(): void;
  getCurrentUser(): string | null;
}
```

**Class:**
```typescript
// src/UserService.ts
import type { IUserService } from './IUserService';
import type { IAuthClient } from './IAuthClient';

export class UserService implements IUserService {
  private currentUser: string | null = null;

  constructor(private deps: { authClient: IAuthClient }) {}

  async login(username: string, password: string): Promise<boolean> {
    const isValid = await this.deps.authClient.validate(username, password);
    if (isValid) {
      this.currentUser = username;
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser = null;
  }

  getCurrentUser(): string | null {
    return this.currentUser;
  }
}
```

### Generated Test File

```typescript
// __tests__/userService.spec.ts
import { vi, describe, it, expect } from 'vitest';
import type { IUserService } from '../src/IUserService';
import { UserService } from '../src/UserService';
import { FakeAuthClientBuilder } from '../fakes';
import type { IAuthClient } from '../src/IAuthClient';

describe('UserService', () => {
  function createUserService(overrides?: {
    authClient?: IAuthClient;
  }) {
    const authClient = overrides?.authClient ?? new FakeAuthClientBuilder().build();

    const userService = new UserService({
      authClient
    });

    return {
      authClient,
      userService
    };
  }

  describe('login', () => {
    it('should return true when credentials are valid', async () => {
      const { userService } = createUserService({
        authClient: new FakeAuthClientBuilder()
          .withValidateReturnValue(Promise.resolve(true))
          .build()
      });

      const result = await userService.login('testuser', 'password123');

      expect(result).toBe(true);
    });

    it('should return false when credentials are invalid', async () => {
      const { userService } = createUserService({
        authClient: new FakeAuthClientBuilder()
          .withValidateReturnValue(Promise.resolve(false))
          .build()
      });

      const result = await userService.login('testuser', 'wrongpassword');

      expect(result).toBe(false);
    });

    it('should call authClient.validate with correct parameters', async () => {
      const { userService, authClient } = createUserService();

      await userService.login('john.doe', 'mypassword');

      expect(authClient.validate).toHaveBeenCalledWith('john.doe', 'mypassword');
    });

    it('should set current user when login succeeds', async () => {
      const { userService } = createUserService({
        authClient: new FakeAuthClientBuilder()
          .withValidateReturnValue(Promise.resolve(true))
          .build()
      });

      await userService.login('testuser', 'password123');

      expect(userService.getCurrentUser()).toBe('testuser');
    });

    it('should not set current user when login fails', async () => {
      const { userService } = createUserService({
        authClient: new FakeAuthClientBuilder()
          .withValidateReturnValue(Promise.resolve(false))
          .build()
      });

      await userService.login('testuser', 'wrongpassword');

      expect(userService.getCurrentUser()).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear current user', async () => {
      const { userService } = createUserService({
        authClient: new FakeAuthClientBuilder()
          .withValidateReturnValue(Promise.resolve(true))
          .build()
      });

      await userService.login('testuser', 'password123');
      userService.logout();

      expect(userService.getCurrentUser()).toBeNull();
    });

    it('should not throw when no user is logged in', () => {
      const { userService } = createUserService();

      expect(() => userService.logout()).not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', () => {
      const { userService } = createUserService();

      const result = userService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return username after successful login', async () => {
      const { userService } = createUserService({
        authClient: new FakeAuthClientBuilder()
          .withValidateReturnValue(Promise.resolve(true))
          .build()
      });

      await userService.login('john.doe', 'password');

      expect(userService.getCurrentUser()).toBe('john.doe');
    });

    it('should return null after logout', async () => {
      const { userService } = createUserService({
        authClient: new FakeAuthClientBuilder()
          .withValidateReturnValue(Promise.resolve(true))
          .build()
      });

      await userService.login('testuser', 'password');
      userService.logout();

      expect(userService.getCurrentUser()).toBeNull();
    });
  });
});
```

## Example 2: Entity Class with Multiple Dependencies

### Original Interface and Class

**Interface:**
```typescript
// src/IReport.ts
import type { IEntity } from '@zdr-tools/zdr-entities';

export interface IReport extends IEntity {
  publish(): Promise<void>;
  archive(): Promise<void>;
  validate(): Promise<boolean>;
}
```

**Class:**
```typescript
// src/ReportTemplate.ts
import type { IReport } from './IReport';
import type { IReportValidator } from './IReportValidator';
import type { IReportPublisher } from './IReportPublisher';
import type { IReportRepository } from './IReportRepository';

export class ReportTemplate implements IReport {
  public id: string;
  public creationTime: number;

  constructor(
    private deps: {
      reportValidator: IReportValidator;
      reportPublisher: IReportPublisher;
      reportRepository: IReportRepository;
    },
    private data: {
      id: string;
      creationTime: number;
    }
  ) {
    this.id = data.id;
    this.creationTime = data.creationTime;
  }

  async publish(): Promise<void> {
    const isValid = await this.deps.reportValidator.validate(this.id);
    if (!isValid) {
      throw new Error('ReportTemplate validation failed');
    }
    await this.deps.reportPublisher.publish(this.id);
    await this.deps.reportRepository.markAsPublished(this.id);
  }

  async archive(): Promise<void> {
    await this.deps.reportRepository.archive(this.id);
  }

  async validate(): Promise<boolean> {
    return await this.deps.reportValidator.validate(this.id);
  }
}
```

### Generated Test File

```typescript
// __tests__/report.spec.ts
import { vi, describe, it, expect } from 'vitest';
import type { IReport } from '../src/IReport';
import { ReportTemplate } from '../src/ReportTemplate';
import { FakeReportValidatorBuilder, FakeReportPublisherBuilder, FakeReportRepositoryBuilder } from '../fakes';
import type { IReportValidator } from '../src/IReportValidator';
import type { IReportPublisher } from '../src/IReportPublisher';
import type { IReportRepository } from '../src/IReportRepository';

describe('ReportTemplate', () => {
  function createReport(
    params?: {
      id?: string;
      creationTime?: number;
    },
    overrides?: {
      reportValidator?: IReportValidator;
      reportPublisher?: IReportPublisher;
      reportRepository?: IReportRepository;
    }
  ) {
    const reportValidator = overrides?.reportValidator ?? new FakeReportValidatorBuilder().build();
    const reportPublisher = overrides?.reportPublisher ?? new FakeReportPublisherBuilder().build();
    const reportRepository = overrides?.reportRepository ?? new FakeReportRepositoryBuilder().build();

    const report = new ReportTemplate(
      {
        reportValidator,
        reportPublisher,
        reportRepository
      },
      {
        id: params?.id ?? 'report-123',
        creationTime: params?.creationTime ?? Date.now()
      }
    );

    return {
      reportValidator,
      reportPublisher,
      reportRepository,
      report
    };
  }

  describe('publish', () => {
    it('should validate report before publishing', async () => {
      const { report, reportValidator } = createReport(
        { id: 'report-456' },
        {
          reportValidator: new FakeReportValidatorBuilder()
            .withValidateReturnValue(Promise.resolve(true))
            .build()
        }
      );

      await report.publish();

      expect(reportValidator.validate).toHaveBeenCalledWith('report-456');
    });

    it('should publish report when validation succeeds', async () => {
      const { report, reportPublisher } = createReport(
        { id: 'report-789' },
        {
          reportValidator: new FakeReportValidatorBuilder()
            .withValidateReturnValue(Promise.resolve(true))
            .build()
        }
      );

      await report.publish();

      expect(reportPublisher.publish).toHaveBeenCalledWith('report-789');
    });

    it('should mark report as published in repository', async () => {
      const { report, reportRepository } = createReport(
        { id: 'report-111' },
        {
          reportValidator: new FakeReportValidatorBuilder()
            .withValidateReturnValue(Promise.resolve(true))
            .build()
        }
      );

      await report.publish();

      expect(reportRepository.markAsPublished).toHaveBeenCalledWith('report-111');
    });

    it('should throw error when validation fails', async () => {
      const { report } = createReport(
        undefined,
        {
          reportValidator: new FakeReportValidatorBuilder()
            .withValidateReturnValue(Promise.resolve(false))
            .build()
        }
      );

      await expect(report.publish()).rejects.toThrow('ReportTemplate validation failed');
    });

    it('should not publish when validation fails', async () => {
      const { report, reportPublisher } = createReport(
        undefined,
        {
          reportValidator: new FakeReportValidatorBuilder()
            .withValidateReturnValue(Promise.resolve(false))
            .build()
        }
      );

      try {
        await report.publish();
      } catch {
        // Expected to throw
      }

      expect(reportPublisher.publish).not.toHaveBeenCalled();
    });

    it('should not mark as published when validation fails', async () => {
      const { report, reportRepository } = createReport(
        undefined,
        {
          reportValidator: new FakeReportValidatorBuilder()
            .withValidateReturnValue(Promise.resolve(false))
            .build()
        }
      );

      try {
        await report.publish();
      } catch {
        // Expected to throw
      }

      expect(reportRepository.markAsPublished).not.toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('should call repository.archive with report ID', async () => {
      const { report, reportRepository } = createReport({ id: 'report-222' });

      await report.archive();

      expect(reportRepository.archive).toHaveBeenCalledWith('report-222');
    });

    it('should call repository.archive exactly once', async () => {
      const { report, reportRepository } = createReport();

      await report.archive();

      expect(reportRepository.archive).toHaveBeenCalledTimes(1);
    });
  });

  describe('validate', () => {
    it('should return true when validator returns true', async () => {
      const { report } = createReport(
        undefined,
        {
          reportValidator: new FakeReportValidatorBuilder()
            .withValidateReturnValue(Promise.resolve(true))
            .build()
        }
      );

      const result = await report.validate();

      expect(result).toBe(true);
    });

    it('should return false when validator returns false', async () => {
      const { report } = createReport(
        undefined,
        {
          reportValidator: new FakeReportValidatorBuilder()
            .withValidateReturnValue(Promise.resolve(false))
            .build()
        }
      );

      const result = await report.validate();

      expect(result).toBe(false);
    });

    it('should call validator with correct report ID', async () => {
      const { report, reportValidator } = createReport({ id: 'report-333' });

      await report.validate();

      expect(reportValidator.validate).toHaveBeenCalledWith('report-333');
    });
  });
});
```

## Example 3: Class with Conditional Logic

### Original Interface and Class

**Interface:**
```typescript
// src/IOrderProcessor.ts
export interface IOrderProcessor {
  processOrder(order: { id: string; urgent: boolean; total: number }): Promise<{ id: string; total: number; shipping: string }>;
  calculateDiscount(customerId: string): Promise<number>;
}
```

**Class:**
```typescript
// src/OrderProcessor.ts
import type { IOrderProcessor } from './IOrderProcessor';
import type { IShippingService } from './IShippingService';
import type { ICustomerService } from './ICustomerService';

export class OrderProcessor implements IOrderProcessor {
  constructor(
    private deps: {
      shippingService: IShippingService;
      customerService: ICustomerService;
    }
  ) {}

  async processOrder(order: { id: string; urgent: boolean; total: number }): Promise<{ id: string; total: number; shipping: string }> {
    const shippingMethod = order.urgent ? 'express' : 'standard';
    await this.deps.shippingService.ship(order.id, shippingMethod);

    return {
      id: order.id,
      total: order.total,
      shipping: shippingMethod
    };
  }

  async calculateDiscount(customerId: string): Promise<number> {
    const isPremium = await this.deps.customerService.isPremium(customerId);
    return isPremium ? 0.1 : 0;
  }
}
```

### Generated Test File

```typescript
// __tests__/orderProcessor.spec.ts
import { vi, describe, it, expect } from 'vitest';
import type { IOrderProcessor } from '../src/IOrderProcessor';
import { OrderProcessor } from '../src/OrderProcessor';
import { FakeShippingServiceBuilder, FakeCustomerServiceBuilder } from '../fakes';
import type { IShippingService } from '../src/IShippingService';
import type { ICustomerService } from '../src/ICustomerService';

describe('OrderProcessor', () => {
  function createOrderProcessor(overrides?: {
    shippingService?: IShippingService;
    customerService?: ICustomerService;
  }) {
    const shippingService = overrides?.shippingService ?? new FakeShippingServiceBuilder().build();
    const customerService = overrides?.customerService ?? new FakeCustomerServiceBuilder().build();

    const orderProcessor = new OrderProcessor({
      shippingService,
      customerService
    });

    return {
      shippingService,
      customerService,
      orderProcessor
    };
  }

  describe('processOrder', () => {
    it('should use express shipping when order is urgent', async () => {
      const { orderProcessor, shippingService } = createOrderProcessor();

      await orderProcessor.processOrder({ id: 'order-1', urgent: true, total: 100 });

      expect(shippingService.ship).toHaveBeenCalledWith('order-1', 'express');
    });

    it('should use standard shipping when order is not urgent', async () => {
      const { orderProcessor, shippingService } = createOrderProcessor();

      await orderProcessor.processOrder({ id: 'order-2', urgent: false, total: 100 });

      expect(shippingService.ship).toHaveBeenCalledWith('order-2', 'standard');
    });

    it('should return order with express shipping method when urgent', async () => {
      const { orderProcessor } = createOrderProcessor();

      const result = await orderProcessor.processOrder({ id: 'order-3', urgent: true, total: 200 });

      expect(result).toEqual({
        id: 'order-3',
        total: 200,
        shipping: 'express'
      });
    });

    it('should return order with standard shipping method when not urgent', async () => {
      const { orderProcessor } = createOrderProcessor();

      const result = await orderProcessor.processOrder({ id: 'order-4', urgent: false, total: 150 });

      expect(result).toEqual({
        id: 'order-4',
        total: 150,
        shipping: 'standard'
      });
    });

    it('should preserve order total in result', async () => {
      const { orderProcessor } = createOrderProcessor();

      const result = await orderProcessor.processOrder({ id: 'order-5', urgent: true, total: 500 });

      expect(result.total).toBe(500);
    });

    it('should preserve order ID in result', async () => {
      const { orderProcessor } = createOrderProcessor();

      const result = await orderProcessor.processOrder({ id: 'order-6', urgent: false, total: 100 });

      expect(result.id).toBe('order-6');
    });
  });

  describe('calculateDiscount', () => {
    it('should return 0.1 discount for premium customers', async () => {
      const { orderProcessor } = createOrderProcessor({
        customerService: new FakeCustomerServiceBuilder()
          .withIsPremiumReturnValue(Promise.resolve(true))
          .build()
      });

      const result = await orderProcessor.calculateDiscount('customer-123');

      expect(result).toBe(0.1);
    });

    it('should return 0 discount for regular customers', async () => {
      const { orderProcessor } = createOrderProcessor({
        customerService: new FakeCustomerServiceBuilder()
          .withIsPremiumReturnValue(Promise.resolve(false))
          .build()
      });

      const result = await orderProcessor.calculateDiscount('customer-456');

      expect(result).toBe(0);
    });

    it('should check if customer is premium', async () => {
      const { orderProcessor, customerService } = createOrderProcessor();

      await orderProcessor.calculateDiscount('customer-789');

      expect(customerService.isPremium).toHaveBeenCalledWith('customer-789');
    });
  });
});
```

## Example 4: Testing Error Handling

### Original Interface and Class

**Interface:**
```typescript
// src/IDataFetcher.ts
export interface IDataFetcher {
  fetchData(id: string): Promise<{ id: string; data: any }>;
  fetchAll(): Promise<Array<{ id: string; data: any }>>;
}
```

**Class:**
```typescript
// src/DataFetcher.ts
import type { IDataFetcher } from './IDataFetcher';
import type { IApiClient } from './IApiClient';

export class DataFetcher implements IDataFetcher {
  constructor(private deps: { apiClient: IApiClient }) {}

  async fetchData(id: string): Promise<{ id: string; data: any }> {
    if (!id) {
      throw new Error('ID is required');
    }

    try {
      const response = await this.deps.apiClient.get(`/data/${id}`);
      return { id, data: response };
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }

  async fetchAll(): Promise<Array<{ id: string; data: any }>> {
    const response = await this.deps.apiClient.get('/data');
    return response.items || [];
  }
}
```

### Generated Test File

```typescript
// __tests__/dataFetcher.spec.ts
import { vi, describe, it, expect } from 'vitest';
import type { IDataFetcher } from '../src/IDataFetcher';
import { DataFetcher } from '../src/DataFetcher';
import { FakeApiClientBuilder } from '../fakes';
import type { IApiClient } from '../src/IApiClient';

describe('DataFetcher', () => {
  function createDataFetcher(overrides?: {
    apiClient?: IApiClient;
  }) {
    const apiClient = overrides?.apiClient ?? new FakeApiClientBuilder().build();

    const dataFetcher = new DataFetcher({
      apiClient
    });

    return {
      apiClient,
      dataFetcher
    };
  }

  describe('fetchData', () => {
    it('should return data when fetch succeeds', async () => {
      const mockData = { value: 'test' };
      const { dataFetcher } = createDataFetcher({
        apiClient: new FakeApiClientBuilder()
          .withGetReturnValue(Promise.resolve(mockData))
          .build()
      });

      const result = await dataFetcher.fetchData('123');

      expect(result).toEqual({ id: '123', data: mockData });
    });

    it('should call apiClient.get with correct URL', async () => {
      const { dataFetcher, apiClient } = createDataFetcher({
        apiClient: new FakeApiClientBuilder()
          .withGetReturnValue(Promise.resolve({ value: 'test' }))
          .build()
      });

      await dataFetcher.fetchData('456');

      expect(apiClient.get).toHaveBeenCalledWith('/data/456');
    });

    it('should throw error when ID is empty string', async () => {
      const { dataFetcher } = createDataFetcher();

      await expect(dataFetcher.fetchData('')).rejects.toThrow('ID is required');
    });

    it('should throw error when ID is null', async () => {
      const { dataFetcher } = createDataFetcher();

      await expect(dataFetcher.fetchData(null as any)).rejects.toThrow('ID is required');
    });

    it('should throw error when ID is undefined', async () => {
      const { dataFetcher } = createDataFetcher();

      await expect(dataFetcher.fetchData(undefined as any)).rejects.toThrow('ID is required');
    });

    it('should throw error with message when API call fails', async () => {
      const { dataFetcher } = createDataFetcher({
        apiClient: new FakeApiClientBuilder()
          .withGetReturnValue(Promise.reject(new Error('Network error')))
          .build()
      });

      await expect(dataFetcher.fetchData('123')).rejects.toThrow('Failed to fetch data: Network error');
    });

    it('should not call apiClient when ID is invalid', async () => {
      const { dataFetcher, apiClient } = createDataFetcher();

      try {
        await dataFetcher.fetchData('');
      } catch {
        // Expected to throw
      }

      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('fetchAll', () => {
    it('should return all items when fetch succeeds', async () => {
      const mockItems = [
        { id: '1', data: { value: 'a' } },
        { id: '2', data: { value: 'b' } }
      ];
      const { dataFetcher } = createDataFetcher({
        apiClient: new FakeApiClientBuilder()
          .withGetReturnValue(Promise.resolve({ items: mockItems }))
          .build()
      });

      const result = await dataFetcher.fetchAll();

      expect(result).toEqual(mockItems);
    });

    it('should call apiClient.get with correct URL', async () => {
      const { dataFetcher, apiClient } = createDataFetcher({
        apiClient: new FakeApiClientBuilder()
          .withGetReturnValue(Promise.resolve({ items: [] }))
          .build()
      });

      await dataFetcher.fetchAll();

      expect(apiClient.get).toHaveBeenCalledWith('/data');
    });

    it('should return empty array when response has no items', async () => {
      const { dataFetcher } = createDataFetcher({
        apiClient: new FakeApiClientBuilder()
          .withGetReturnValue(Promise.resolve({}))
          .build()
      });

      const result = await dataFetcher.fetchAll();

      expect(result).toEqual([]);
    });

    it('should return empty array when items is null', async () => {
      const { dataFetcher } = createDataFetcher({
        apiClient: new FakeApiClientBuilder()
          .withGetReturnValue(Promise.resolve({ items: null }))
          .build()
      });

      const result = await dataFetcher.fetchAll();

      expect(result).toEqual([]);
    });
  });
});
```

## Example 5: Using mockReturnValue When Necessary

This example shows when it's acceptable to use `mockReturnValue` as a last resort.

### Original Interface and Class

**Interface:**
```typescript
// src/IRetryHandler.ts
export interface IRetryHandler {
  executeWithRetry<T>(operation: () => Promise<T>): Promise<T>;
}
```

**Class:**
```typescript
// src/RetryHandler.ts
import type { IRetryHandler } from './IRetryHandler';
import type { ILogger } from './ILogger';

export class RetryHandler implements IRetryHandler {
  constructor(
    private deps: { logger: ILogger },
    private config: { maxRetries: number }
  ) {}

  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.deps.logger.warn(`Attempt ${attempt} failed: ${error.message}`);

        if (attempt === this.config.maxRetries) {
          break;
        }
      }
    }

    throw new Error(`Operation failed after ${this.config.maxRetries} retries: ${lastError!.message}`);
  }
}
```

### Generated Test File (with mockReturnValue)

```typescript
// __tests__/retryHandler.spec.ts
import { vi, describe, it, expect } from 'vitest';
import type { IRetryHandler } from '../src/IRetryHandler';
import { RetryHandler } from '../src/RetryHandler';
import { FakeLoggerBuilder } from '../fakes';
import type { ILogger } from '../src/ILogger';

describe('RetryHandler', () => {
  function createRetryHandler(
    params?: {
      maxRetries?: number;
    },
    overrides?: {
      logger?: ILogger;
    }
  ) {
    const logger = overrides?.logger ?? new FakeLoggerBuilder().build();

    const retryHandler = new RetryHandler(
      { logger },
      { maxRetries: params?.maxRetries ?? 3 }
    );

    return {
      logger,
      retryHandler
    };
  }

  describe('executeWithRetry', () => {
    it('should return result when operation succeeds on first attempt', async () => {
      const { retryHandler } = createRetryHandler();
      const operation = vi.fn().mockResolvedValue('success');

      const result = await retryHandler.executeWithRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry when operation fails then succeeds', async () => {
      const { retryHandler } = createRetryHandler();
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockResolvedValue('success');

      const result = await retryHandler.executeWithRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should retry up to maxRetries times', async () => {
      const { retryHandler } = createRetryHandler({ maxRetries: 3 });
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const result = await retryHandler.executeWithRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw error when all retries fail', async () => {
      const { retryHandler } = createRetryHandler({ maxRetries: 2 });
      const operation = vi.fn()
        .mockRejectedValue(new Error('Network error'));

      await expect(retryHandler.executeWithRetry(operation)).rejects.toThrow(
        'Operation failed after 2 retries: Network error'
      );
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should log warning on each failed attempt', async () => {
      const { retryHandler, logger } = createRetryHandler({ maxRetries: 3 });
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockRejectedValueOnce(new Error('Second fail'))
        .mockResolvedValue('success');

      await retryHandler.executeWithRetry(operation);

      expect(logger.warn).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenNthCalledWith(1, 'Attempt 1 failed: First fail');
      expect(logger.warn).toHaveBeenNthCalledWith(2, 'Attempt 2 failed: Second fail');
    });

    it('should not log warning when operation succeeds on first attempt', async () => {
      const { retryHandler, logger } = createRetryHandler();
      const operation = vi.fn().mockResolvedValue('success');

      await retryHandler.executeWithRetry(operation);

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should respect custom maxRetries value', async () => {
      const { retryHandler } = createRetryHandler({ maxRetries: 5 });
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(retryHandler.executeWithRetry(operation)).rejects.toThrow(
        'Operation failed after 5 retries'
      );
      expect(operation).toHaveBeenCalledTimes(5);
    });
  });
});
```

**Note:** In this example, we use `vi.fn().mockRejectedValueOnce()` and `mockResolvedValue()` because we're testing sequential behavior where the operation needs to return different values on different calls. This is an acceptable use case for mock functions since we're testing the function passed to the method, not a dependency that could be faked.

## Key Patterns Summary

1. **Test Location**: Always in `__tests__/` folder (sibling to `src/`)
2. **File Naming**: camelCase, e.g., `userService.spec.ts`
3. **Imports**: Import vitest utilities, interface (with `type`), class, and Fake builders
4. **Main Structure**: One main describe → `createMyClass` helper → method describes → test cases
5. **createMyClass**: Accepts overrides, returns object with dependencies AND class instance
6. **Test Independence**: Each test uses `createMyClass`, no shared instances
7. **Fake Usage**: Configure fakes in `createMyClass` call using builder pattern
8. **Assertions**: One assertion per test when possible, descriptive test names
9. **Error Testing**: Use `expect().rejects.toThrow()` for async errors
10. **mockReturnValue**: Use only when absolutely necessary (testing sequences, etc.)
