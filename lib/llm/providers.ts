import { createGroq } from "@ai-sdk/groq"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import { LanguageModel } from "ai"

export type ProviderName = "groq" | "gemini" | "openrouter"

export interface ProviderConfig {
  name: ProviderName
  modelId: string
  modelInstance: LanguageModel
}

export function getConfiguredProviders(): ProviderConfig[] {
  const orderStr = process.env.LLM_PROVIDER_ORDER || "groq,gemini,openrouter"
  const order = orderStr.split(",").map((s) => s.trim().toLowerCase()) as ProviderName[]

  const providers: ProviderConfig[] = []

  for (const providerName of order) {
    if (providerName === "groq" && process.env.GROQ_API_KEY) {
      const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
      providers.push({
        name: "groq",
        modelId: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        modelInstance: groq(process.env.GROQ_MODEL || "llama-3.3-70b-versatile")
      })
    } else if (providerName === "gemini" && process.env.GEMINI_API_KEY) {
      const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })
      providers.push({
        name: "gemini",
        modelId: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        modelInstance: google(process.env.GEMINI_MODEL || "gemini-2.5-flash")
      })
    } else if (providerName === "openrouter" && process.env.OPENROUTER_API_KEY) {
      const openrouter = createOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
      })
      providers.push({
        name: "openrouter",
        modelId: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat:free",
        modelInstance: openrouter(process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat:free")
      })
    }
  }

  return providers
}
