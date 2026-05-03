let PrismaClient: any = null
let prismaClientLoaded = false

try {
  if (process.env.DEMO_MODE !== "true") {
    const prismaModule = require("@prisma/client")
    PrismaClient = prismaModule.PrismaClient
    prismaClientLoaded = true
  }
} catch (error) {
  console.warn("[v0] Prisma not available, using DEMO_MODE", error instanceof Error ? error.message : String(error))
  process.env.DEMO_MODE = "true"
}

const globalForPrisma = globalThis as unknown as {
  prisma: any
}

export const prisma = globalForPrisma.prisma ?? (
  process.env.DEMO_MODE === "true" || !prismaClientLoaded
    ? null
    : new PrismaClient({
        log:
          process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      })
)

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma
}
