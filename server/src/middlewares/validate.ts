import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (
  schema: ZodSchema,
  target: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        res.status(400).json({
          success: false,
          alert: {
            type: 'error',
            title: 'Validation Error',
            message: issues || 'Invalid request payload format.',
          },
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  };
};
