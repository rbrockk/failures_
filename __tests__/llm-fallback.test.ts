import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateResponse } from '@/lib/llm/fallback-chain'
import * as ai from 'ai'

vi.mock('ai', async () => {
  const actual = await vi.importActual<typeof import('ai')>('ai')
  return {
    ...actual,
    generateText: vi.fn(),
    convertToModelMessages: vi.fn().mockImplementation((m) => m),
  }
})

describe('LLM Fallback Chain', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GROQ_API_KEY', 'test-key')
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key')
    vi.stubEnv('LLM_PROVIDER_ORDER', 'groq,gemini,openrouter')
  })

  it('should use the first available provider', async () => {
    vi.mocked(ai.generateText).mockResolvedValue({ text: 'Groq response' } as any)

    const result = await generateResponse([{ role: 'user', id: '1', content: 'test' }] as any)
    
    expect(result.provider).toBe('groq')
    expect(result.fallbackLevel).toBe(0)
    expect(result.degradedMode).toBe(false)
    expect(result.text).toBe('Groq response')
    expect(ai.generateText).toHaveBeenCalledTimes(1)
  })

  it('should fall back to the next provider on failure', async () => {
    vi.mocked(ai.generateText)
      .mockRejectedValueOnce(new Error('Rate limited'))
      .mockResolvedValueOnce({ text: 'Gemini response' } as any)

    const result = await generateResponse([{ role: 'user', id: '1', content: 'test' }] as any)
    
    expect(result.provider).toBe('gemini')
    expect(result.fallbackLevel).toBe(1)
    expect(result.degradedMode).toBe(false)
    expect(result.text).toBe('Gemini response')
    expect(ai.generateText).toHaveBeenCalledTimes(2)
  })

  it('should drop to rules-only fallback when all providers fail', async () => {
    vi.mocked(ai.generateText)
      .mockRejectedValueOnce(new Error('Groq failed'))
      .mockRejectedValueOnce(new Error('Gemini failed'))
      .mockRejectedValueOnce(new Error('OpenRouter failed'))

    const result = await generateResponse([{ role: 'user', id: '1', content: 'How to fix INC-123' }] as any)
    
    expect(result.provider).toBe('none')
    expect(result.model).toBe('rules-engine')
    expect(result.fallbackLevel).toBe(3)
    expect(result.degradedMode).toBe(true)
    expect(result.text).toContain('Degraded mode (Rules-only)')
    expect(ai.generateText).toHaveBeenCalledTimes(3)
  })
})
