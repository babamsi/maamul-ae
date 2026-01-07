"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  Shield,
  Cloud,
  Server,
  ArrowRight,
  BarChart,
  Users,
  Zap,
  Award,
  Calculator,
  Building2,
  Globe,
  DollarSign,
  Briefcase,
  MapPin,
  UserPlus,
  Database,
  Layers,
  PieChart,
  ShieldCheck,
  Workflow,
  Calendar,
  Coins,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import dynamic from "next/dynamic"

// Use dynamic import with ssr: false to prevent server-side rendering
const DynamicPlanAccessForm = dynamic(() => import("@/components/plan-access-form").then((mod) => mod.PlanAccessForm), {
  ssr: false,
})

// Add this type declaration at the top of the file, after the imports
declare global {
  interface Window {
    __questionnaire_data?: Record<string, any>
  }
}

// All plan tiers data
const allPlans = [
  {
    id: "tier1",
    name: "Starter",
    description: "For small businesses just getting started",
    monthlyPrice: 58,
    annualPrice: Math.round(58 * 12 * 0.85), // 15% discount on annual
    revenue: "< 10k",
    useCase: "Perfect for: New businesses with 1-3 employees handling up to 500 inventory items per month",
    features: [
      {
        name: "Inventory management - Track stock levels in real-time and set low stock alerts",
        category: "Core",
        highlight: true,
      },
      { name: "Expense tracking - Categorize and monitor all business expenses", category: "Core" },
      { name: "Customer management - Store customer information and purchase history", category: "Core" },
      { name: "Employee management - Track basic employee information and schedules", category: "Core" },
      { name: "Supply chain management - Manage suppliers and purchase orders", category: "Core" },
      { name: "Dashboard analytics - View key business metrics at a glance", category: "Analytics" },
      { name: "Payment solution - Process payments with popular local methods", category: "Payments", highlight: true },
      { name: "Purchasing & invoicing - Create and manage purchase orders and invoices", category: "Core" },
      { name: "POS system - Process sales and print receipts", category: "Sales", highlight: true },
      { name: "1-3 user accounts - Provide access to key team members", category: "Access" },
      { name: "Secure cloud option - Keep your data safe in the cloud", category: "Security" },
      { name: "Local storage option - Store data on your own devices", category: "Security" },
      { name: "Private cloud option - Deploy in your own cloud environment", category: "Security" },
    ],
    color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10",
    borderColor: "border-blue-200 dark:border-blue-800/30",
    icon: Zap,
  },
  {
    id: "tier2",
    name: "Growth",
    description: "For growing businesses with expanding needs",
    monthlyPrice: 145,
    annualPrice: Math.round(145 * 12 * 0.85), // 15% discount on annual
    revenue: "11k - 30k",
    useCase: "Ideal for: Established businesses with 4-10 employees managing 1,000+ monthly transactions",
    features: [
      { name: "All Starter features - Everything in the Starter plan plus more", category: "Core" },
      { name: "Up to 9 user accounts - Expand access to your growing team", category: "Access", highlight: true },
      {
        name: "Online ordering - Allow customers to place orders through your website",
        category: "Sales",
        highlight: true,
      },
      {
        name: "Multi-location support - Manage inventory across up to 3 locations",
        category: "Advanced",
        highlight: true,
      },
    ],
    color: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10",
    borderColor: "border-green-200 dark:border-green-800/30",
    icon: BarChart,
  },
  {
    id: "tier3",
    name: "Professional",
    description: "For established businesses with significant operations",
    monthlyPrice: 290,
    annualPrice: Math.round(290 * 12 * 0.85), // 15% discount on annual
    revenue: "31k - 60k",
    useCase: "Perfect for: Growing businesses with 11-25 employees needing advanced reporting and analytics",
    features: [
      { name: "All Growth features - Everything in the Growth plan plus more", category: "Core" },
      {
        name: "Advanced analytics - Gain deeper insights with custom reports and dashboards",
        category: "Analytics",
        highlight: true,
      },
      { name: "Enhanced security features - Additional protection for sensitive data", category: "Security" },
      {
        name: "Priority support - Get faster responses to your support requests",
        category: "Support",
        highlight: true,
      },
      { name: "Advanced inventory forecasting - Predict stock needs based on sales trends", category: "Advanced" },
    ],
    color: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10",
    borderColor: "border-purple-200 dark:border-purple-800/30",
    icon: PieChart,
  },
  {
    id: "tier4",
    name: "Business",
    description: "For larger businesses with complex requirements",
    monthlyPrice: 580,
    annualPrice: Math.round(580 * 12 * 0.85), // 15% discount on annual
    revenue: "61k - 99k",
    useCase: "Ideal for: Businesses with 26-50 employees operating across multiple locations",
    features: [], // Features will be dynamically generated based on selected needs
    color: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10",
    borderColor: "border-orange-200 dark:border-orange-800/30",
    icon: Briefcase,
  },
]

// Security options
const securityOptions = [
  {
    id: "secure",
    name: "Secure Cloud",
    description:
      "Your data is securely stored in our enterprise-grade cloud infrastructure with end-to-end encryption, regular backups, and strict access controls.",
    icon: Shield,
    features: [
      "End-to-end encryption",
      "Regular automated backups",
      "Strict access controls",
      "99.9% uptime guarantee",
      "Compliance with industry standards",
    ],
  },
  {
    id: "local",
    name: "Local Storage",
    description:
      "Keep your data on your own servers with our on-premises solution. You maintain complete control while still benefiting from our powerful software.",
    icon: Server,
    features: [
      "Complete data control",
      "No internet dependency",
      "Custom security policies",
      "Integration with existing systems",
      "Regular security updates",
    ],
  },
  {
    id: "private",
    name: "Private Cloud",
    description:
      "Deploy Maamul in your own private cloud environment. Ideal for businesses with specific compliance or regulatory requirements.",
    icon: Cloud,
    features: [
      "Dedicated cloud resources",
      "Custom compliance settings",
      "Enhanced security features",
      "Flexible deployment options",
      "Dedicated support team",
    ],
  },
]

// Business needs for the questionnaire
const businessNeeds = [
  {
    id: "inventory",
    label: "Inventory Management",
    description: "Track and manage product inventory, including data migration from legacy systems",
    icon: Layers,
    category: "Core",
  },
  {
    id: "pos",
    label: "Point of Sale (POS)",
    description: "Process sales and transactions with tailored hardware setup and configuration",
    icon: Zap,
    category: "Core",
  },
  {
    id: "customers",
    label: "Customer Management",
    description: "Manage customer information, relationships, and purchase history with custom data fields",
    icon: Users,
    category: "Core",
  },
  {
    id: "employees",
    label: "Employee Management",
    description: "Track employee information, performance, schedules, and role structures",
    icon: UserPlus,
    category: "Core",
  },
  {
    id: "expenses",
    label: "Expense Tracking",
    description: "Monitor, categorize, and import historical business expense data",
    icon: DollarSign,
    category: "Core",
  },
  {
    id: "reporting",
    label: "Advanced Reporting & Analytics",
    description: "Generate detailed business reports and analytics via custom dashboards with specific KPIs",
    icon: PieChart,
    category: "Advanced",
  },
  {
    id: "multi",
    label: "Multi-Location Management",
    description: "Operate and manage inventory, sales, and data across multiple business locations",
    icon: MapPin,
    category: "Advanced",
  },
  {
    id: "supply",
    label: "Supply Chain Management",
    description: "Optimize supply chain processes, including supplier data and purchase history migration",
    icon: Workflow,
    category: "Core",
  },
  {
    id: "purchasing",
    label: "Purchasing & Invoicing",
    description: "Manage purchase orders and invoicing with business-specific templates and workflows",
    icon: Briefcase,
    category: "Core",
  },
  {
    id: "payment",
    label: "Payment Processing Integration",
    description: "Accept and process payments through integrated systems (e.g., eDahab, WAAFI, Mpesa)",
    icon: DollarSign,
    category: "Core",
  },
  {
    id: "website",
    label: "Business Website",
    description: "Maintain a custom website for branding, information, and customer engagement",
    icon: Globe,
    category: "Advanced",
  },
  {
    id: "security",
    label: "Enhanced Security",
    description: "Implement advanced security features and protocols to protect sensitive business data",
    icon: ShieldCheck,
    category: "Advanced",
  },
  {
    id: "kra",
    label: "KRA (Tax Compliance)",
    description: "Generate and submit statutory reports, including VAT returns and income statements, in compliance with Kenya Revenue Authority regulations",
    icon: Shield,
    category: "Advanced",
  },
  {
    id: "api",
    label: "API Access",
    description: "Connect the core business system with other software and tools via API for extended functionality",
    icon: Database,
    category: "Advanced",
  },
]

// Industry options
const industryOptions = [
  { id: "retail", label: "Retail", icon: Building2 },
  { id: "wholesale", label: "Wholesale", icon: Briefcase },
  { id: "manufacturing", label: "Manufacturing", icon: Layers },
  { id: "logistics", label: "Logistics & Distribution", icon: Workflow },
  { id: "hospitality", label: "Hospitality", icon: Users },
  { id: "healthcare", label: "Healthcare", icon: Shield },
  { id: "agriculture", label: "Agriculture", icon: Globe },
  { id: "other", label: "Other", icon: Building2 },
]

// Currency conversion rate
const USD_TO_KES = 129

// Questions for the typeform-like experience
const questions = [
  {
    id: "welcome",
    type: "welcome",
    title: "Find Your Perfect Enterprise Solution",
    description: "Answer a few questions to get a tailored plan recommendation for your business.",
  },
  {
    id: "currency",
    type: "single-select",
    title: "Select your preferred currency",
    description: "Choose the currency you'd like to see prices in.",
    options: [
      { id: "USD", label: "US Dollar (USD)", icon: DollarSign },
      { id: "KES", label: "Kenyan Shilling (KES)", icon: Coins },
    ],
  },
  {
    id: "industry",
    type: "single-select",
    title: "What industry is your business in?",
    description: "This helps us understand your specific needs.",
    options: industryOptions,
  },
  {
    id: "company-size",
    type: "single-select",
    title: "How many employees does your company have?",
    description: "This helps us determine the scale of your operations.",
    options: [
      { id: "micro", label: "1-3 employees", icon: Users },
      { id: "small", label: "4-10 employees", icon: Users },
      { id: "medium", label: "11-19 employees", icon: Users },
      { id: "enterprise", label: "20+ employees", icon: Users },
    ],
  },
  {
    id: "revenue",
    type: "single-select",
    title: "What is your monthly revenue?",
    description: "This helps us recommend the right plan tier.",
    options: [], // Will be populated dynamically based on currency
  },
  {
    id: "locations",
    type: "slider",
    title: "How many locations does your business operate in?",
    description: "This helps us determine your multi-location needs.",
    min: 1,
    max: 20,
    step: 1,
    defaultValue: 1,
  },
  {
    id: "needs",
    type: "multi-select",
    title: "What are your primary business needs?",
    description: "Select all that apply.",
    options: businessNeeds,
  },
  {
    id: "security",
    type: "single-select",
    title: "What type of data storage solution do you prefer?",
    description: "This helps us determine your security and compliance needs.",
    options: [
      { id: "secure", label: "Secure Cloud", description: "Enterprise-grade cloud infrastructure", icon: Shield },
      { id: "local", label: "Local Storage", description: "On-premises solution", icon: Server },
      { id: "private", label: "Private Cloud", description: "Your own private cloud environment", icon: Cloud },
    ],
  },
  {
    id: "users",
    type: "slider",
    title: "How many user accounts do you need?",
    description: "This helps us determine your access requirements.",
    min: 1,
    max: 15,
    step: 1,
    defaultValue: 5,
  },
  {
    id: "implementation-timeline",
    type: "single-select",
    title: "What is your preferred implementation timeline?",
    description: "This helps us plan resources for your onboarding.",
    options: [
      { id: "immediate", label: "Immediate (1-2 weeks)", icon: Calendar },
      { id: "1-3months", label: "1-3 months", icon: Calendar },
      { id: "3-6months", label: "3-6 months", icon: Calendar },
      { id: "6+months", label: "6+ months", icon: Calendar },
    ],
  },
  {
    id: "billing",
    type: "single-select",
    title: "Which billing cycle do you prefer?",
    description: "Annual billing saves 15% compared to quarterly.",
    options: [
      { id: "quarterly", label: "Quarterly Billing", icon: Calculator },
      { id: "annual", label: "Annual Billing (Save 15%)", icon: Calculator },
    ],
  },
]

export default function PlansPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({
    currency: "USD",
    industry: "",
    "company-size": "",
    revenue: "",
    locations: 1,
    needs: [] as string[],
    security: "",
    users: 5,
    "implementation-timeline": "",
    billing: "quarterly",
  })
  const [showBetaForm, setShowBetaForm] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [totalCost, setTotalCost] = useState({
    monthly: 0,
    annual: 0,
    oneTime: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Currency conversion helper functions
  const convertPrice = (usdPrice: number): number => {
    if (answers.currency === "KES") {
      return Math.round(usdPrice * USD_TO_KES)
    }
    return usdPrice
  }

  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price)
    if (answers.currency === "KES") {
      return convertedPrice.toLocaleString("en-KE")
    }
    return convertedPrice.toString()
  }

  const getCurrencySymbol = (): string => {
    return answers.currency === "KES" ? "KES" : "$"
  }

  // Get revenue options based on selected currency
  const getRevenueOptions = () => {
    const currency = answers.currency || "USD"
    if (currency === "KES") {
      return [
        { id: "tier1", label: `Less than ${formatPrice(10000)}`, icon: Coins },
        { id: "tier2", label: `${formatPrice(11000)} - ${formatPrice(30000)}`, icon: Coins },
        { id: "tier3", label: `${formatPrice(31000)} - ${formatPrice(60000)}`, icon: Coins },
        { id: "tier4", label: `${formatPrice(61000)} - ${formatPrice(99000)}`, icon: Coins },
      ]
    }
    return [
      { id: "tier1", label: "Less than $10K", icon: DollarSign },
      { id: "tier2", label: "$11K - $30K", icon: DollarSign },
      { id: "tier3", label: "$31K - $60K", icon: DollarSign },
      { id: "tier4", label: "$61K - $99K", icon: DollarSign },
    ]
  }

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Calculate progress percentage
  const progressPercentage = (currentQuestionIndex / questions.length) * 100

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      window.scrollTo(0, 0)
    } else {
      // Process answers and show results
      processAnswers()
    }
  }

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      window.scrollTo(0, 0)
    }
  }

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  // Generate features dynamically based on selected needs and tier
  const generateFeatures = (selectedNeeds: string[], tierId: string, locations: number, users: number) => {
    const tier = Number.parseInt(tierId.replace("tier", ""))
    const features: Array<{ name: string; category: string; highlight?: boolean }> = []
    
    // Apply tier-specific limits
    let processedNeeds = selectedNeeds
    let processedLocations = locations
    let processedUsers = users
    
    // Tier1: Max 3 needs, Max 1 Locations, Max 3 users, no advanced features
    if (tier === 1) {
      processedNeeds = selectedNeeds.slice(0, 3)
      processedLocations = Math.min(locations, 1)
      processedUsers = Math.min(users, 3)
    }
    // Tier2: Max 6 needs, Max 2 Locations, Max 6 users, available advanced features
    else if (tier === 2) {
      processedNeeds = selectedNeeds.slice(0, 6)
      processedLocations = Math.min(locations, 2)
      processedUsers = Math.min(users, 6)
    }
    // Tier3: Max 9 needs, Max 3 Locations, Max 9 users, available advanced features
    else if (tier === 3) {
      processedNeeds = selectedNeeds.slice(0, 9)
      processedLocations = Math.min(locations, 3)
      processedUsers = Math.min(users, 9)
    }
    // Tier4: All features available, Max 5 Locations, Max 15 users
    else if (tier === 4) {
      processedLocations = Math.min(locations, 5)
      processedUsers = Math.min(users, 15)
    }
    
    // Filter out advanced features for tier1 only
    const allowedNeeds = processedNeeds.filter((needId) => {
      const need = businessNeeds.find((n) => n.id === needId)
      if (!need) return false
      // Tier1 cannot have advanced features
      if (tier === 1 && need.category === "Advanced") {
        return false
      }
      return true
    })

    // Generate features from selected needs
    allowedNeeds.forEach((needId) => {
      const need = businessNeeds.find((n) => n.id === needId)
      if (need) {
        features.push({
          name: need.description || need.label,
          category: need.category || "Core",
          highlight: need.category === "Advanced" || ["inventory", "pos", "payment"].includes(needId),
        })
      }
    })

    // Add location and user limits as features
    if (processedLocations > 1) {
      features.push({
        name: `Multi-location support - Manage up to ${processedLocations} location${processedLocations > 1 ? 's' : ''}`,
        category: "Advanced",
        highlight: true,
      })
    }
    
    features.push({
      name: `Up to ${processedUsers} user account${processedUsers > 1 ? 's' : ''} - Provide access to your team`,
      category: "Access",
    })

    // Add tier-specific base features
    if (tier >= 1) {
      features.push({
        name: "Secure cloud storage - Keep your data safe in the cloud",
        category: "Security",
      })
    }
    if (tier >= 3) {
      features.push({
        name: "Priority support - Get faster responses to your support requests",
        category: "Support",
        highlight: true,
      })
    }
    if (tier >= 4) {
      features.push({
        name: "Dedicated account manager - Get personalized support from a dedicated representative",
        category: "Support",
        highlight: true,
      })
    }

    return features
  }

  // Determine tier based on business needs (primary factor)
  // Business needs is the PRIMARY tier determinant, with locations and users as constraints
  const determineTierFromNeeds = (needsCount: number, locations: number, users: number): string => {
    // Determine required tier based on each factor, then take the highest
    let tierFromNeeds = "tier1"
    let tierFromLocations = "tier1"
    let tierFromUsers = "tier1"
    
    // Business needs (PRIMARY) - determines base tier
    if (needsCount <= 3) {
      tierFromNeeds = "tier1"
    } else if (needsCount <= 6) {
      tierFromNeeds = "tier2"
    } else if (needsCount <= 9) {
      tierFromNeeds = "tier3"
    } else {
      tierFromNeeds = "tier4"
    }
    
    // Locations (constraint)
    if (locations <= 1) {
      tierFromLocations = "tier1"
    } else if (locations <= 2) {
      tierFromLocations = "tier2"
    } else if (locations <= 3) {
      tierFromLocations = "tier3"
    } else if (locations <= 5) {
      tierFromLocations = "tier4"
    } else {
      tierFromLocations = "tier4" // Max 5 locations for tier4
    }
    
    // Users (constraint)
    // Tier1: 1-3 users, Tier2: 4-6 users, Tier3: 7-9 users, Tier4: 10-15 users
    if (users >= 1 && users <= 3) {
      tierFromUsers = "tier1"
    } else if (users >= 4 && users <= 6) {
      tierFromUsers = "tier2"
    } else if (users >= 7 && users <= 9) {
      tierFromUsers = "tier3"
    } else if (users >= 10 && users <= 15) {
      tierFromUsers = "tier4"
    } else {
      tierFromUsers = "tier4" // Max 15 users for tier4
    }
    
    // Return the highest tier required (business needs is primary, but must satisfy all constraints)
    const tiers = [tierFromNeeds, tierFromLocations, tierFromUsers]
    const tierNumbers = tiers.map(t => Number.parseInt(t.replace("tier", "")))
    const maxTierNum = Math.max(...tierNumbers)
    
    return `tier${maxTierNum}`
  }

  // Process answers to determine recommended plan
  const processAnswers = () => {
    setIsSubmitting(true)

    // Simulate processing delay
    setTimeout(() => {
      // Determine plan based on business needs (PRIMARY FACTOR)
      const needsCount = answers.needs?.length || 0
      const locations = answers.locations || 1
      const users = answers.users || 5
      
      let recommendedPlanId = determineTierFromNeeds(needsCount, locations, users)

      // Revenue can still influence the tier as a secondary factor
      // If revenue suggests a higher tier, upgrade if within limits
      if (answers.revenue) {
        const revenueTier = answers.revenue
        const revenueTierNum = Number.parseInt(revenueTier.replace("tier", ""))
        const currentTierNum = Number.parseInt(recommendedPlanId.replace("tier", ""))
        
        // If revenue suggests higher tier and it's within 1 tier difference, consider upgrade
        if (revenueTierNum > currentTierNum && revenueTierNum - currentTierNum <= 1) {
          // Only upgrade if the needs/locations/users still fit the higher tier limits
          const higherTier = revenueTier
          const higherTierNum = Number.parseInt(higherTier.replace("tier", ""))
          
          // Check if requirements fit the higher tier
          let canUpgrade = true
          if (higherTierNum === 2 && (needsCount > 6 || locations > 2 || users > 6)) canUpgrade = false
          if (higherTierNum === 3 && (needsCount > 9 || locations > 3 || users > 9)) canUpgrade = false
          if (higherTierNum === 4 && (locations > 5 || users > 15)) canUpgrade = false
          
          if (canUpgrade) {
            recommendedPlanId = higherTier
          }
        }
      }

      // Company size (enterprise) can upgrade by 1 tier if requirements allow
      if (answers["company-size"] === "enterprise" && recommendedPlanId !== "tier4") {
        const currentTierNum = Number.parseInt(recommendedPlanId.replace("tier", ""))
        const nextTier = `tier${Math.min(currentTierNum + 1, 4)}`
        const nextTierNum = Number.parseInt(nextTier.replace("tier", ""))
        
        // Check if requirements fit the next tier
        let canUpgrade = true
        if (nextTierNum === 2 && (needsCount > 6 || locations > 2 || users > 6)) canUpgrade = false
        if (nextTierNum === 3 && (needsCount > 9 || locations > 3 || users > 9)) canUpgrade = false
        if (nextTierNum === 4 && (locations > 5 || users > 15)) canUpgrade = false
        
        if (canUpgrade) {
          recommendedPlanId = nextTier
        }
      }

      // Ensure we only have tier1-4
      if (!["tier1", "tier2", "tier3", "tier4"].includes(recommendedPlanId)) {
        recommendedPlanId = "tier1"
      }

      // Calculate costs
      const plan = allPlans.find((p) => p.id === recommendedPlanId)
      if (!plan) return

      // Generate dynamic features based on selected needs, locations, and users
      const dynamicFeatures = generateFeatures(
        answers.needs || [], 
        recommendedPlanId,
        answers.locations || 1,
        answers.users || 5
      )
      
      // Update plan with dynamic features
      const planWithFeatures = {
        ...plan,
        features: dynamicFeatures,
      }

      // Calculate monthly and annual costs
      const monthlyCost = plan.monthlyPrice
      const annualCost = plan.annualPrice

      // Set recommended plan and costs (no one-time costs)
      setRecommendedPlan(recommendedPlanId)
      setTotalCost({
        monthly: monthlyCost,
        annual: annualCost,
        oneTime: 0,
      })

      // Store questionnaire data for the beta access form
      if (typeof window !== "undefined") {
        window.__questionnaire_data = {
          recommendedPlan: recommendedPlanId,
          currency: answers.currency || "USD",
          industry: answers.industry,
          companySize: answers["company-size"],
          revenue: answers.revenue,
          locations: answers.locations,
          needs: answers.needs.join(", "),
          security: answers.security,
          users: answers.users,
          implementationTimeline: answers["implementation-timeline"],
          billingPreference: answers.billing,
          monthlyPrice: monthlyCost,
          annualPrice: annualCost,
          oneTimeCost: 0,
          selectedFeatures: dynamicFeatures.map((f) => f.name).join(", "),
        }
      }

      setIsSubmitting(false)
      setShowResults(true)
    }, 1500)
  }

  // Reset the questionnaire
  const resetQuestionnaire = () => {
    setCurrentQuestionIndex(0)
    setAnswers({
      industry: "",
      "company-size": "",
      revenue: "",
      currency: "USD",
      locations: 1,
      needs: [] as string[],
      security: "",
      users: 5,
      "implementation-timeline": "",
      billing: "quarterly",
    })
    setRecommendedPlan(null)
    setShowResults(false)
    setTotalCost({
      monthly: 0,
      annual: 0,
      oneTime: 0,
    })
  }

  // Get current question
  const currentQuestion = questions[currentQuestionIndex]

  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return true

    switch (currentQuestion.type) {
      case "welcome":
        return true
      case "single-select":
        return !!answers[currentQuestion.id]
      case "multi-select":
        return Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length > 0
      case "slider":
        return answers[currentQuestion.id] !== undefined
      default:
        return true
    }
  }

  // Render question based on type
  const renderQuestion = () => {
    if (!currentQuestion) return null

    switch (currentQuestion.type) {
      case "welcome":
        return (
          <div key="welcome" className="text-center max-w-2xl mx-auto animate-fade-in">
            <div className="mb-8">
              <div className="text-primary mx-auto mb-4 text-6xl font-serif">𐒑</div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">{currentQuestion.title}</h1>
              <p className="text-lg text-muted-foreground">{currentQuestion.description}</p>
            </div>
            <Button
              size="lg"
              onClick={handleNextQuestion}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )

      case "single-select":
        // Get dynamic options for revenue question
        const displayOptions = currentQuestion.id === "revenue" ? getRevenueOptions() : currentQuestion.options
        
        return (
          <div key={currentQuestion.id} className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">{currentQuestion.title}</h2>
            <p className="text-muted-foreground mb-6">{currentQuestion.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {displayOptions?.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all duration-200
                    ${
                      answers[currentQuestion.id] === option.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {React.createElement(option.icon, { className: "h-5 w-5 text-primary" })}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      {("description" in option && option.description) ? (
                        <div className="text-xs text-muted-foreground mt-1">{String(option.description)}</div>
                      ) : null}
                    </div>
                    {answers[currentQuestion.id] === option.id && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "multi-select":
        return (
          <div key={currentQuestion.id} className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">{currentQuestion.title}</h2>
            <p className="text-muted-foreground mb-6">{currentQuestion.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {currentQuestion.options?.map((option) => {
                const isSelected =
                  Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option.id)

                return (
                  <div
                    key={option.id}
                    onClick={() => {
                      const currentAnswers = Array.isArray(answers[currentQuestion.id])
                        ? [...answers[currentQuestion.id]]
                        : []

                      if (isSelected) {
                        handleAnswerChange(
                          currentQuestion.id,
                          currentAnswers.filter((id) => id !== option.id),
                        )
                      } else {
                        handleAnswerChange(currentQuestion.id, [...currentAnswers, option.id])
                      }
                    }}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        {React.createElement(option.icon, { className: "h-5 w-5 text-primary" })}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        {"description" in option && option.description && (
                          <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                        )}
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-primary" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case "slider":
        return (
          <div key={currentQuestion.id} className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">{currentQuestion.title}</h2>
            <p className="text-muted-foreground mb-6">{currentQuestion.description}</p>

            <div className="space-y-8 mt-8">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{currentQuestion.min}</span>
                <span>{currentQuestion.max}</span>
              </div>

              <Slider
                value={[answers[currentQuestion.id] || currentQuestion.defaultValue]}
                min={currentQuestion.min}
                max={currentQuestion.max}
                step={currentQuestion.step}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value[0])}
              />

              <div className="text-center text-2xl font-bold">
                {answers[currentQuestion.id] || currentQuestion.defaultValue}
                {currentQuestion.id === "locations" && ` location${answers[currentQuestion.id] !== 1 ? "s" : ""}`}
                {currentQuestion.id === "users" && ` user${answers[currentQuestion.id] !== 1 ? "s" : ""}`}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Render results
  const renderResults = () => {
    if (!recommendedPlan) return null

    const plan = allPlans.find((p) => p.id === recommendedPlan)
    if (!plan) return null

    // Generate features dynamically based on selected needs
    const dynamicFeatures = generateFeatures(
      answers.needs || [], 
      recommendedPlan,
      answers.locations || 1,
      answers.users || 5
    )
    const planWithFeatures = {
      ...plan,
      features: dynamicFeatures,
    }

    const billingCycle = answers.billing || "quarterly"
    const monthlyDisplayPriceUSD = billingCycle === "quarterly" ? plan.monthlyPrice : Math.round(plan.annualPrice / 12)
    const monthlyDisplayPrice = convertPrice(monthlyDisplayPriceUSD)
    const annualPriceConverted = convertPrice(plan.annualPrice)
    const monthlyPriceConverted = convertPrice(plan.monthlyPrice)
    const savingsConverted = convertPrice(plan.monthlyPrice * 12 - plan.annualPrice)
    const currencySymbol = getCurrencySymbol()

    return (
      <div className="max-w-4xl mx-auto animate-fade-in px-4 sm:px-0">
        {/* Header Section */}
        <div className="text-center mb-6">
          <Badge className="mb-2 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium">
            Recommended Solution
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{plan.name} Plan</h2>
          <p className="text-muted-foreground">{plan.description}</p>
        </div>

        {/* Plan Card */}
        <div className="mb-8 bg-background rounded-xl shadow-md border border-primary/20 overflow-hidden">
          <div className="p-6">
            {/* Plan Details */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                {React.createElement(plan.icon, { className: "h-5 w-5 text-primary" })}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{plan.useCase}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3 min-w-0">
                <h4 className="font-semibold text-base mb-3 flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Key Features
                </h4>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {planWithFeatures.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="text-primary mr-2 mt-1 flex-shrink-0">
                        <Check className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm break-words">{feature.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Details */}
              <div className="md:w-1/3 bg-muted/20 p-4 sm:p-5 rounded-lg flex-shrink-0 md:min-w-[280px]">
                <div className="mb-4">
                  <div className="mb-3">
                    <div className="flex flex-wrap items-baseline gap-2 mb-2">
                      <div className="flex items-baseline flex-wrap gap-1 min-w-0">
                        <span className="text-xl sm:text-2xl font-bold whitespace-nowrap">
                          {currencySymbol === "KES" ? "KES " : "$"}{formatPrice(monthlyDisplayPriceUSD)}
                        </span>
                        <span className="text-sm sm:text-base text-muted-foreground whitespace-nowrap">/month</span>
                      </div>
                    </div>
                    <Badge 
                      variant={billingCycle === "annual" ? "default" : "outline"} 
                      className="font-normal text-xs w-fit"
                    >
                      {billingCycle === "annual" ? "Annual Billing" : "Quarterly Billing"}
                    </Badge>
                  </div>

                  {billingCycle === "annual" && (
                    <div className="bg-primary/5 rounded-lg p-2 sm:p-3 border border-primary/10 text-xs mt-2">
                      <div className="flex justify-between items-center gap-2 font-medium mb-1">
                        <span className="whitespace-nowrap">Annual payment:</span>
                        <span className="text-right whitespace-nowrap">{currencySymbol === "KES" ? "KES " : "$"}{formatPrice(plan.annualPrice)}/year</span>
                      </div>
                      <div className="flex justify-between items-center gap-2 text-muted-foreground">
                        <span className="whitespace-nowrap">You save:</span>
                        <span className="text-right whitespace-nowrap">{currencySymbol === "KES" ? "KES " : "$"}{formatPrice(plan.monthlyPrice * 12 - plan.annualPrice)}/year</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {answers.needs && answers.needs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border/40">
                <h4 className="font-semibold text-base mb-3 flex items-center">
                  <Layers className="h-4 w-4 text-primary mr-2" />
                  Selected Business Needs
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {answers.needs.map((needId: string) => {
                    const need = businessNeeds.find((n) => n.id === needId)
                    if (!need) return null
                    return (
                      <div
                        key={needId}
                        className="bg-muted/40 rounded-lg p-2 flex items-center gap-2 border border-border/50 text-sm"
                      >
                        {React.createElement(need.icon, {
                          className: "h-4 w-4 text-primary flex-shrink-0",
                        })}
                        <span className="font-medium">{need.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => {
              // Make sure questionnaire data is available
              if (typeof window !== "undefined" && !window.__questionnaire_data) {
                window.__questionnaire_data = {
                  recommendedPlan: recommendedPlan,
                  monthlyPrice: totalCost.monthly,
                  annualPrice: totalCost.annual,
                  oneTimeCost: 0,
                  billingPreference: answers.billing || "quarterly",
                  selectedNeeds: answers.needs.join(", "),
                }
              }
              setShowBetaForm(true)
            }}
          >
            Request This Plan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={resetQuestionnaire}>
            Restart Questionnaire
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Sticky header with navigation */}
      <header
        className={`sticky top-0 z-40 w-full backdrop-blur-sm transition-all duration-200 ${
          isScrolled ? "bg-background/80 dark:bg-gray-900/80 border-b shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center space-x-4">
            <Tabs
              value={answers.billing || "quarterly"}
              onValueChange={(value) => handleAnswerChange("billing", value)}
              className="hidden sm:block"
            >
              <TabsList className="h-8">
                <TabsTrigger value="quarterly" className="text-xs px-3">
                  Quarterly
                </TabsTrigger>
                <TabsTrigger value="annual" className="text-xs px-3">
                  Annual (Save 15%)
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" onClick={() => setShowBetaForm(true)} className="text-xs">
              Contact Sales
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 pt-12 pb-24">
        {!showResults ? (
          <>
            {/* Progress bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Start</span>
                <span>Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Question content */}
            <div className="min-h-[50vh] flex items-center justify-center py-8">
              <React.Fragment>{renderQuestion()}</React.Fragment>
            </div>

            {/* Navigation buttons */}
            {currentQuestion.type !== "welcome" && (
              <div className="max-w-2xl mx-auto flex justify-between mt-8">
                <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                  Back
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={!isCurrentQuestionAnswered() || isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {currentQuestionIndex === questions.length - 1 ? (
                    isSubmitting ? (
                      <>
                        <span className="mr-2">Processing</span>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </>
                    ) : (
                      "See Your Plan"
                    )
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          // Results section
          renderResults()
        )}
      </main>

      {/* Beta form dialog */}
      {showBetaForm && <DynamicPlanAccessForm onClose={() => setShowBetaForm(false)} />}
    </div>
  )
}
