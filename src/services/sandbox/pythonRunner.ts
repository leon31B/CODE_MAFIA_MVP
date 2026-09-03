import { TestCase } from '../../types/game';

export async function runPythonTests(code: string, packId: string, testSuite: TestCase[]): Promise<TestCase[]> {
  const results: TestCase[] = [];

  for (const test of testSuite) {
    const startTime = performance.now();
    try {
      const testPassed = executePythonInventoryTest(code, test.id);
      const duration = Math.round(performance.now() - startTime);
      results.push({
        ...test,
        status: testPassed ? 'PASS' : 'FAIL',
        durationMs: duration,
        errorMessage: testPassed ? undefined : getPyFailureReason(test.id)
      });
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      results.push({
        ...test,
        status: 'ERROR',
        durationMs: duration,
        errorMessage: err.message || 'Python SyntaxError or Runtime Exception'
      });
    }
  }

  return results;
}

function executePythonInventoryTest(code: string, testId: string): boolean {
  // Static AST & Regex evaluation + Python logic simulation
  if (testId === 'test-py-1') {
    // Tax Calculation Precision
    // Fix requires round(..., 2) instead of int(...)
    return (code.includes('round(') || code.includes(': .2f') || code.includes('Decimal')) && !code.includes('int(raw_total)');
  }

  if (testId === 'test-py-2') {
    // Negative Inventory Protection
    // Fix requires checking if quantity > stock quantity
    return (code.includes('quantity >') || code.includes('< quantity') || code.includes('not in self.stock or')) && code.includes('deduct_stock');
  }

  if (testId === 'test-py-3') {
    // Boundary Discount Tier ($100 Exact)
    // Fix requires order_total >= 100.0 instead of order_total > 100.0
    return code.includes('order_total >= 100') || code.includes('100.0 <= order_total') || code.includes('order_total >= 100.0');
  }

  if (testId === 'test-py-4') {
    // Stock Update Integrity
    return !code.includes('self.stock = {}') && code.includes('def add_item');
  }

  return false;
}

function getPyFailureReason(testId: string): string {
  switch (testId) {
    case 'test-py-1':
      return 'AssertionError: calculate_total_with_tax("Widget", 1) returned 20.0 instead of 20.99 (int truncation bug)';
    case 'test-py-2':
      return 'AssertionError: deduct_stock returned True for quantity 50 when stock was 10 (Inventory dropped to -40)';
    case 'test-py-3':
      return 'AssertionError: calculate_discount(100.0) returned 5.0 instead of 10.0 (Strict inequality > 100 failed exact boundary)';
    case 'test-py-4':
      return 'AssertionError: stock dictionary lost keys during updates';
    default:
      return 'Assertion failed';
  }
}
