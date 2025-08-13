import { validate } from 'class-validator';
import { CreateUrlDto } from './create-url.dto';

describe('CreateUrlDto', () => {
  it('should validate a valid URL', async () => {
    const dto = new CreateUrlDto();
    dto.originalUrl = 'https://example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation for empty URL', async () => {
    const dto = new CreateUrlDto();
    dto.originalUrl = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation for invalid URL format', async () => {
    const dto = new CreateUrlDto();
    dto.originalUrl = 'not-a-valid-url';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isUrl');
  });

  it('should fail validation for missing URL', async () => {
    const dto = new CreateUrlDto();
    // originalUrl is undefined

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});