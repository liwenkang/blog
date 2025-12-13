// Basic test example to verify Jest is working
describe('Example tests', () => {
  test('should pass basic math test', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
  })

  test('should handle string operations', () => {
    expect('hello').toBe('hello')
    expect('hello world').toContain('world')
  })

  test('should handle array operations', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(arr).toHaveLength(5)
    expect(arr).toContain(3)
  })

  test('should handle object operations', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj).toHaveProperty('name', 'test')
    expect(obj).toEqual({ name: 'test', value: 42 })
  })

  test('should handle async operations', async () => {
    const promise = Promise.resolve('resolved')
    await expect(promise).resolves.toBe('resolved')
  })

  test('should handle boolean values', () => {
    expect(true).toBeTruthy()
    expect(false).toBeFalsy()
    expect(0).toBeFalsy()
    expect(1).toBeTruthy()
  })
})
