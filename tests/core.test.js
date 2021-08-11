import { calc, calculatemaxcharge, calculatemincharge, calculateweeklimit } from '../core.js';
import config from '../configs/index.js';

test('calculatemaxcharge', () => {
  expect(calculatemaxcharge(200, 0.03, 5)).toBe('0.06');
});

test('calculatemincharge', () => {
  expect(calculatemincharge(300, 0.3, 0.5)).toBe('0.90');
});

test('calculateweeklimit', () => {
  expect(calculateweeklimit(30000, 0.3, 1000, 30000)).toBe('87.00');
});

test('calc', () => {
  expect(
    calc(
      [
        {
          date: '2016-01-05',
          user_id: 1,
          user_type: 'natural',
          type: 'cash_in',
          operation: { amount: 200, currency: 'EUR' },
        },
        {
          date: '2016-01-06',
          user_id: 2,
          user_type: 'juridical',
          type: 'cash_out',
          operation: { amount: 300, currency: 'EUR' },
        },
        {
          date: '2016-01-06',
          user_id: 1,
          user_type: 'natural',
          type: 'cash_out',
          operation: { amount: 30000, currency: 'EUR' },
        },
      ],
      config
    )
  ).toStrictEqual(['0.06', '0.90', '87.00']);
});
