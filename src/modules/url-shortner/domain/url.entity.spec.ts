import { Url } from './url.entity';

describe('Url Entity', () => {
  it('should create a valid URL entity', () => {
    const url = new Url();
    url.id = 'test-uuid';
    url.token = 'abc123';
    url.originalUrl = 'https://example.com';
    url.createdAt = new Date();
    url.clickCount = 0;

    expect(url).toBeDefined();
    expect(url.id).toBe('test-uuid');
    expect(url.token).toBe('abc123');
    expect(url.originalUrl).toBe('https://example.com');
    expect(url.createdAt).toBeInstanceOf(Date);
    expect(url.clickCount).toBe(0);
  });
});