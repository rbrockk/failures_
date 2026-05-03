# Integration Failure Detective

## Multi-Provider LLM Copilot Configuration

This project uses a multi-provider fallback strategy to ensure the Copilot remains available by utilizing various free-tier LLM APIs. If one provider rate-limits or fails, the system automatically falls back to the next one in the chain. If all providers fail, the system drops into a "degraded mode" and returns rules-only, deterministic answers using the available incident tools.

### Getting Free API Keys

You can obtain free-tier API keys from the following providers:

1. **Groq**: Provides extremely fast inference for Llama models.
   - Sign up at [console.groq.com](https://console.groq.com)
   - Create an API key in the Keys section.
   - Recommended model: `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`

2. **Google Gemini (AI Studio)**: Provides generous free tiers for Gemini models.
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create an API key.
   - Recommended model: `gemini-1.5-flash`

3. **OpenRouter**: Aggregates many models, including several free ones.
   - Sign up at [openrouter.ai](https://openrouter.ai)
   - Go to Keys to create one.
   - Recommended free model: `deepseek/deepseek-chat:free`

### Recommended Setup Order

Copy `.env.example` to `.env` (or `.env.local`) and configure your keys. 
The system is configured by default to try them in the following order:
`LLM_PROVIDER_ORDER=groq,gemini,openrouter`

1. **Groq** is preferred first due to its high speed.
2. **Gemini** acts as a robust secondary fallback with generous rate limits.
3. **OpenRouter** is a tertiary fallback (useful for specific free models).

### Troubleshooting

- **401 Unauthorized**: Double-check your API key in your environment variables. Ensure you restarted your dev server after changing the `.env` file.
- **429 Too Many Requests**: You have hit the rate limit for the current provider. The system should automatically fall back to the next provider. If you see the "Degraded: Rules-only" badge, all providers are rate-limited or failed.
- **Model not found**: Ensure the model string specified in your `.env` (e.g., `GROQ_MODEL`) matches exactly what the provider expects. Providers frequently deprecate or rename models.
