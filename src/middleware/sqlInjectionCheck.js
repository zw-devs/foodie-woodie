import { body, param, query } from 'express-validator';

export const sqlInjectionCheck = [
  body('*').not().matches(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT)\b)|(--|\/\*|\*\/|';|")/i),
  param('*').not().matches(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT)\b)|(--|\/\*|\*\/|';|")/i),
  query('*').not().matches(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT)\b)|(--|\/\*|\*\/|';|")/i),
];