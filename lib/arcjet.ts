import arcjet, { protectSignup } from "@arcjet/next"

const aj = arcjet({
  key: process.env.ARCJET_KEY || "",
  rules: [
    protectSignup({
      bots: {
        allow: ["CATEGORY:SEARCH_ENGINE"],
      },
      email: {
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      rateLimit: {
        max: 5,
        interval: 3600, // 1 hour
      },
    }),
  ],
})

export default aj

