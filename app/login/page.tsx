"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, Users, Zap, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // States for controlling the generative sequence
  const [currentStep, setCurrentStep] = useState(0)
  const [headingText, setHeadingText] = useState("")
  const [descriptionText, setDescriptionText] = useState("")
  const [feature1Text, setFeature1Text] = useState("")
  const [feature2Text, setFeature2Text] = useState("")
  const [feature3Text, setFeature3Text] = useState("")
  const [feature4Text, setFeature4Text] = useState("")

  const [isTypingHeading, setIsTypingHeading] = useState(false)
  const [isTypingDescription, setIsTypingDescription] = useState(false)
  const [isTypingFeature1, setIsTypingFeature1] = useState(false)
  const [isTypingFeature2, setIsTypingFeature2] = useState(false)
  const [isTypingFeature3, setIsTypingFeature3] = useState(false)
  const [isTypingFeature4, setIsTypingFeature4] = useState(false)

  const fullHeading = "Streamline Your East African Business"
  const fullDescription =
    "Join thousands of businesses across East Africa who trust Maamul to manage their operations, payments, and growth."
  const fullFeature1 = "All-in-One Solution\nPOS, inventory, customer management, and analytics in one platform"
  const fullFeature2 = "Multi-Payment Integration\nAccept eDahab, WAAFI, and Mpesa payments seamlessly"
  const fullFeature3 = "Business Intelligence\nReal-time analytics and reporting to drive growth"
  const fullFeature4 = "Secure & Reliable\nBank-level security with 99.9% uptime guarantee"

  useEffect(() => {
    const sequence = [
      // Step 0: Show logo
      () => {
        setTimeout(() => setCurrentStep(1), 800)
      },
      // Step 1: Start typing heading
      () => {
        setIsTypingHeading(true)
      },
      // Step 2: Start typing description (after heading completes)
      () => {
        setIsTypingDescription(true)
      },
      // Step 3: Start typing feature 1
      () => {
        setIsTypingFeature1(true)
      },
      // Step 4: Start typing feature 2
      () => {
        setIsTypingFeature2(true)
      },
      // Step 5: Start typing feature 3
      () => {
        setIsTypingFeature3(true)
      },
      // Step 6: Start typing feature 4
      () => {
        setIsTypingFeature4(true)
      },
      // Step 7: Show trust badge
      () => {
        // Final step - no further progression
      },
    ]

    if (sequence[currentStep]) {
      sequence[currentStep]()
    }
  }, [currentStep])

  // Typing effect for heading - slowed down
  useEffect(() => {
    if (isTypingHeading && headingText.length < fullHeading.length) {
      const timeout = setTimeout(() => {
        setHeadingText(fullHeading.slice(0, headingText.length + 1))
      }, 100)
      return () => clearTimeout(timeout)
    } else if (isTypingHeading && headingText.length === fullHeading.length) {
      setTimeout(() => {
        setIsTypingHeading(false)
        setCurrentStep(2)
      }, 500)
    }
  }, [isTypingHeading, headingText])

  // Typing effect for description - slowed down
  useEffect(() => {
    if (isTypingDescription && descriptionText.length < fullDescription.length) {
      const timeout = setTimeout(() => {
        setDescriptionText(fullDescription.slice(0, descriptionText.length + 1))
      }, 60)
      return () => clearTimeout(timeout)
    } else if (isTypingDescription && descriptionText.length === fullDescription.length) {
      setTimeout(() => {
        setIsTypingDescription(false)
        setCurrentStep(3)
      }, 500)
    }
  }, [isTypingDescription, descriptionText])

  // Typing effect for feature 1 - slowed down
  useEffect(() => {
    if (isTypingFeature1 && feature1Text.length < fullFeature1.length) {
      const timeout = setTimeout(() => {
        setFeature1Text(fullFeature1.slice(0, feature1Text.length + 1))
      }, 70)
      return () => clearTimeout(timeout)
    } else if (isTypingFeature1 && feature1Text.length === fullFeature1.length) {
      setTimeout(() => {
        setIsTypingFeature1(false)
        setCurrentStep(4)
      }, 500)
    }
  }, [isTypingFeature1, feature1Text])

  // Typing effect for feature 2 - slowed down
  useEffect(() => {
    if (isTypingFeature2 && feature2Text.length < fullFeature2.length) {
      const timeout = setTimeout(() => {
        setFeature2Text(fullFeature2.slice(0, feature2Text.length + 1))
      }, 70)
      return () => clearTimeout(timeout)
    } else if (isTypingFeature2 && feature2Text.length === fullFeature2.length) {
      setTimeout(() => {
        setIsTypingFeature2(false)
        setCurrentStep(5)
      }, 500)
    }
  }, [isTypingFeature2, feature2Text])

  // Typing effect for feature 3 - slowed down
  useEffect(() => {
    if (isTypingFeature3 && feature3Text.length < fullFeature3.length) {
      const timeout = setTimeout(() => {
        setFeature3Text(fullFeature3.slice(0, feature3Text.length + 1))
      }, 70)
      return () => clearTimeout(timeout)
    } else if (isTypingFeature3 && feature3Text.length === fullFeature3.length) {
      setTimeout(() => {
        setIsTypingFeature3(false)
        setCurrentStep(6)
      }, 500)
    }
  }, [isTypingFeature3, feature3Text])

  // Typing effect for feature 4 - slowed down
  useEffect(() => {
    if (isTypingFeature4 && feature4Text.length < fullFeature4.length) {
      const timeout = setTimeout(() => {
        setFeature4Text(fullFeature4.slice(0, feature4Text.length + 1))
      }, 70)
      return () => clearTimeout(timeout)
    } else if (isTypingFeature4 && feature4Text.length === fullFeature4.length) {
      setTimeout(() => {
        setIsTypingFeature4(false)
        setCurrentStep(7)
      }, 500)
    }
  }, [isTypingFeature4, feature4Text])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate login process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For now, we'll just redirect to dashboard
      // In a real implementation, this would authenticate the user
      toast.success("Login successful! Welcome back to Maamul.")
      window.location.href = "/dashboard"
    } catch (error) {
      toast.error("Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderTypedText = (text: string) => {
    return text
      .split("\n")
      .map((line, index) => (
        <div key={index}>
          {index === 0 ? (
            <h3 className="font-semibold mb-1 text-white text-base drop-shadow-md">{line}</h3>
          ) : (
            <p className="text-white/95 leading-relaxed drop-shadow-sm text-sm">{line}</p>
          )}
        </div>
      ))
  }

  return (
    <div className="h-screen bg-background dark:bg-gray-900 flex relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-black/10 border-b border-white/20">
        <div className="container max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-white hover:text-white/80 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl font-sans text-white drop-shadow-lg">Maamul</span>
          </div>
        </div>
      </div>

      {/* Left Side - Video Background */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        {/* Video Background */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover scale-105">
          <source
            src="https://zl2dvipizibcvy5o.public.blob.vercel-storage.com/maamul%20login%20%281%29.mp4"
            type="video/mp4"
          />
        </video>

        {/* Balanced overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-black/15 to-black/35"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <div className="max-w-lg backdrop-blur-[10%] bg-black/10 p-6 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Messaging Platform Style Content */}
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
              {/* Logo */}
              {currentStep >= 0 && (
                <div className="transition-all duration-500 opacity-100 translate-y-0">
                  <div className="text-white text-5xl font-serif drop-shadow-2xl">𐒑</div>
                </div>
              )}

              {/* Heading - Typing Effect */}
              {currentStep >= 1 && (
                <div className="transition-all duration-500 opacity-100 translate-y-0">
                  <div className="flex items-start">
                    <div className="bg-primary/20 backdrop-blur-sm p-2 rounded-full mr-3 mt-1 flex-shrink-0">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="message-bubble bg-white/10 backdrop-blur-sm p-3 rounded-2xl rounded-tl-none border border-white/20 max-w-[85%]">
                      <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-xl leading-tight">
                        {headingText}
                        {isTypingHeading && <span className="animate-pulse">|</span>}
                      </h1>
                    </div>
                  </div>
                </div>
              )}

              {/* Description - Typing Effect */}
              {currentStep >= 2 && (
                <div className="transition-all duration-500 opacity-100 translate-y-0">
                  <div className="flex items-start justify-end">
                    <div className="message-bubble bg-primary/20 backdrop-blur-sm p-3 rounded-2xl rounded-tr-none border border-primary/30 max-w-[85%]">
                      <p className="text-base text-white leading-relaxed drop-shadow-sm">
                        {descriptionText}
                        {isTypingDescription && <span className="animate-pulse">|</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature 1 - Typing Effect */}
              {currentStep >= 3 && (
                <div className="transition-all duration-500 opacity-100 translate-y-0">
                  <div className="flex items-start">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl mr-3 border border-white/30 shadow-xl flex-shrink-0">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="message-bubble bg-white/10 backdrop-blur-sm p-3 rounded-2xl rounded-tl-none border border-white/20 max-w-[80%]">
                      {renderTypedText(feature1Text)}
                      {isTypingFeature1 && <span className="animate-pulse">|</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Feature 2 - Typing Effect */}
              {currentStep >= 4 && (
                <div className="transition-all duration-500 opacity-100 translate-y-0">
                  <div className="flex items-start justify-end">
                    <div className="message-bubble bg-primary/20 backdrop-blur-sm p-3 rounded-2xl rounded-tr-none border border-primary/30 max-w-[80%]">
                      {renderTypedText(feature2Text)}
                      {isTypingFeature2 && <span className="animate-pulse">|</span>}
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl ml-3 border border-white/30 shadow-xl flex-shrink-0">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Feature 3 - Typing Effect */}
              {currentStep >= 5 && (
                <div className="transition-all duration-500 opacity-100 translate-y-0">
                  <div className="flex items-start">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl mr-3 border border-white/30 shadow-xl flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div className="message-bubble bg-white/10 backdrop-blur-sm p-3 rounded-2xl rounded-tl-none border border-white/20 max-w-[80%]">
                      {renderTypedText(feature3Text)}
                      {isTypingFeature3 && <span className="animate-pulse">|</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Feature 4 - Typing Effect */}
              {currentStep >= 6 && (
                <div className="transition-all duration-500 opacity-100 translate-y-0">
                  <div className="flex items-start justify-end">
                    <div className="message-bubble bg-primary/20 backdrop-blur-sm p-3 rounded-2xl rounded-tr-none border border-primary/30 max-w-[80%]">
                      {renderTypedText(feature4Text)}
                      {isTypingFeature4 && <span className="animate-pulse">|</span>}
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl ml-3 border border-white/30 shadow-xl flex-shrink-0">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Trust Badge */}
              {currentStep >= 7 && (
                <div className="transition-all duration-700 opacity-100 scale-100">
                  <div className="mt-4 p-4 bg-white/15 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-400 animate-pulse" />
                      <span className="font-medium text-white drop-shadow-sm text-sm">Trusted by 58+ businesses</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/25 transition-colors text-xs"
                      >
                        Somalia
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/25 transition-colors text-xs"
                      >
                        Kenya
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/25 transition-colors text-xs"
                      >
                        Ethiopia
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/25 transition-colors text-xs"
                      >
                        Djibouti
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center px-6 py-16 bg-gradient-to-br from-background via-background to-muted/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden text-primary mx-auto mb-4 text-5xl font-serif">𐒑</div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">Sign in to your Maamul account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  required
                  className="mt-1 h-10 text-sm border-2 focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    className="h-10 text-sm pr-10 border-2 focus:border-primary/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/onboarding" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Get started with Maamul
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Contact us at{" "}
              <a href="mailto:support@maamul.com" className="text-primary hover:text-primary/80 transition-colors">
                support@maamul.com
              </a>
            </p>
          </div>

          {/* Mobile-only features showcase */}
          <div className="lg:hidden mt-6 p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50">
            <h3 className="font-semibold mb-3 text-center">Why Choose Maamul?</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center p-2 rounded-lg bg-background/50">
                <Zap className="h-4 w-4 text-primary mx-auto mb-1" />
                <span className="font-medium">All-in-One</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <Users className="h-4 w-4 text-primary mx-auto mb-1" />
                <span className="font-medium">Multi-Payment</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
                <span className="font-medium">Analytics</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <Shield className="h-4 w-4 text-primary mx-auto mb-1" />
                <span className="font-medium">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
