"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  Briefcase,
  Layers,
  Workflow,
  Users,
  Shield,
  Globe,
  DollarSign,
  UserPlus,
  Zap,
  PieChart,
  Mail,
  Lock,
  User,
  Building,
  Phone,
  MapPin,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Settings,
  CheckCircle,
  Star,
  UtensilsCrossed,
  ChefHat,
  Menu,
  ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Type definitions
interface BaseOption {
  id: string
  label: string
  icon: React.ComponentType<any>
}

interface BusinessModuleOption extends BaseOption {
  description: string
  essential: boolean
}

interface SingleSelectOption extends BaseOption {
  // No additional properties needed
}

interface BaseQuestion {
  id: string
  type: string
  title: string
  description: string
}

interface WelcomeQuestion extends BaseQuestion {
  type: "welcome"
}

interface SingleSelectQuestion extends BaseQuestion {
  type: "single-select"
  options: SingleSelectOption[]
}

interface MultiSelectQuestion extends BaseQuestion {
  type: "multi-select"
  options: BusinessModuleOption[]
}

interface SliderQuestion extends BaseQuestion {
  type: "slider"
  min: number
  max: number
  step: number
  defaultValue: number
}

type RetailQuestion = WelcomeQuestion | SingleSelectQuestion | MultiSelectQuestion | SliderQuestion
type RestaurantQuestion = WelcomeQuestion | SingleSelectQuestion | MultiSelectQuestion | SliderQuestion

// Industry options
const industryOptions = [
  {
    id: "retail",
    label: "Retail",
    icon: Building2,
    available: true,
    description: "Stores, shops, and direct-to-consumer businesses",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: UtensilsCrossed,
    available: true,
    description: "Restaurants, cafes, and food service businesses",
  },
  {
    id: "wholesale",
    label: "Wholesale",
    icon: Briefcase,
    available: false,
    description: "Bulk distribution and B2B sales",
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    icon: Layers,
    available: false,
    description: "Production and assembly operations",
  },
  {
    id: "logistics",
    label: "Logistics & Distribution",
    icon: Workflow,
    available: false,
    description: "Transportation and supply chain management",
  },
  {
    id: "hospitality",
    label: "Hospitality",
    icon: Users,
    available: false,
    description: "Hotels, restaurants, and service businesses",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    icon: Shield,
    available: false,
    description: "Medical practices and healthcare facilities",
  },
  {
    id: "agriculture",
    label: "Agriculture",
    icon: Globe,
    available: false,
    description: "Farming and agricultural operations",
  },
]

// Business modules for retail
const businessModules: BusinessModuleOption[] = [
  {
    id: "inventory",
    label: "Inventory Management",
    description: "Track and manage your product inventory",
    icon: Layers,
    essential: true,
  },
  {
    id: "pos",
    label: "Point of Sale",
    description: "Process sales and transactions",
    icon: Zap,
    essential: true,
  },
  {
    id: "customers",
    label: "Customer Management",
    description: "Manage customer information and relationships",
    icon: Users,
    essential: false,
  },
  {
    id: "employees",
    label: "Employee Management",
    description: "Track employee information and schedules",
    icon: UserPlus,
    essential: false,
  },
  {
    id: "expenses",
    label: "Expense Tracking",
    description: "Monitor and categorize business expenses",
    icon: DollarSign,
    essential: false,
  },
  {
    id: "reporting",
    label: "Analytics & Reporting",
    description: "Generate detailed business reports and insights",
    icon: PieChart,
    essential: false,
  },
  {
    id: "supply",
    label: "Supply Chain Management",
    description: "Manage suppliers and purchase orders",
    icon: Workflow,
    essential: false,
  },
]

// Business modules for restaurant
const restaurantModules: BusinessModuleOption[] = [
  {
    id: "menu",
    label: "Menu Management",
    description: "Manage your menu items, categories, and pricing",
    icon: Menu,
    essential: true,
  },
  {
    id: "pos",
    label: "Point of Sale",
    description: "Process orders and transactions",
    icon: Zap,
    essential: true,
  },
  {
    id: "tables",
    label: "Table Management",
    description: "Manage table reservations and seating",
    icon: Building2,
    essential: true,
  },
  {
    id: "orders",
    label: "Order Management",
    description: "Track and manage dine-in, takeout, and delivery orders",
    icon: ShoppingCart,
    essential: false,
  },
  {
    id: "inventory",
    label: "Inventory Management",
    description: "Track ingredients and kitchen supplies",
    icon: Layers,
    essential: false,
  },
  {
    id: "employees",
    label: "Staff Management",
    description: "Manage staff schedules and roles",
    icon: UserPlus,
    essential: false,
  },
  {
    id: "customers",
    label: "Customer Management",
    description: "Manage customer information and loyalty programs",
    icon: Users,
    essential: false,
  },
  {
    id: "reporting",
    label: "Analytics & Reporting",
    description: "Generate detailed business reports and insights",
    icon: PieChart,
    essential: false,
  },
]

// Questions for retail onboarding
const retailQuestions: RetailQuestion[] = [
  {
    id: "welcome",
    type: "welcome",
    title: "Welcome to Maamul Setup",
    description: "Let's configure your retail management system in just a few steps.",
  },
  {
    id: "company-size",
    type: "single-select",
    title: "How many employees does your company have?",
    description: "This helps us configure the right user permissions and workflows.",
    options: [
      { id: "micro", label: "Just me (1 person)", icon: Users },
      { id: "small", label: "2-5 employees", icon: Users },
      { id: "medium", label: "6-15 employees", icon: Users },
      { id: "large", label: "16-50 employees", icon: Users },
      { id: "enterprise", label: "50+ employees", icon: Users },
    ],
  },
  {
    id: "revenue",
    type: "single-select",
    title: "What is your monthly revenue?",
    description: "This helps us recommend the right features and pricing tier.",
    options: [
      { id: "startup", label: "Just starting out", icon: DollarSign },
      { id: "tier1", label: "Less than $10K", icon: DollarSign },
      { id: "tier2", label: "$10K - $30K", icon: DollarSign },
      { id: "tier3", label: "$30K - $60K", icon: DollarSign },
      { id: "tier4", label: "$60K+", icon: DollarSign },
    ],
  },
  {
    id: "locations",
    type: "slider",
    title: "How many locations does your business operate in?",
    description: "We'll configure multi-location features if needed.",
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 1,
  },
  {
    id: "modules",
    type: "multi-select",
    title: "What are your primary business needs?",
    description: "Select the modules you want included in your system. Essential modules are pre-selected.",
    options: businessModules,
  },
  {
    id: "users",
    type: "slider",
    title: "How many user accounts do you need?",
    description: "This includes managers, employees, and any other team members who will use the system.",
    min: 1,
    max: 20,
    step: 1,
    defaultValue: 2,
  },
]

// Questions for restaurant onboarding
const restaurantQuestions: RestaurantQuestion[] = [
  {
    id: "welcome",
    type: "welcome",
    title: "Welcome to Maamul Setup",
    description: "Let's configure your restaurant management system in just a few steps.",
  },
  {
    id: "company-size",
    type: "single-select",
    title: "How many employees does your restaurant have?",
    description: "This helps us configure the right user permissions and workflows.",
    options: [
      { id: "micro", label: "Just me (1 person)", icon: Users },
      { id: "small", label: "2-5 employees", icon: Users },
      { id: "medium", label: "6-15 employees", icon: Users },
      { id: "large", label: "16-50 employees", icon: Users },
      { id: "enterprise", label: "50+ employees", icon: Users },
    ],
  },
  {
    id: "revenue",
    type: "single-select",
    title: "What is your monthly revenue?",
    description: "This helps us recommend the right features and pricing tier.",
    options: [
      { id: "startup", label: "Just starting out", icon: DollarSign },
      { id: "tier1", label: "Less than $10K", icon: DollarSign },
      { id: "tier2", label: "$10K - $30K", icon: DollarSign },
      { id: "tier3", label: "$30K - $60K", icon: DollarSign },
      { id: "tier4", label: "$60K+", icon: DollarSign },
    ],
  },
  {
    id: "locations",
    type: "slider",
    title: "How many locations does your restaurant operate?",
    description: "We'll configure multi-location features if needed.",
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 1,
  },
  {
    id: "modules",
    type: "multi-select",
    title: "What are your primary business needs?",
    description: "Select the modules you want included in your system. Essential modules are pre-selected.",
    options: restaurantModules,
  },
  {
    id: "users",
    type: "slider",
    title: "How many user accounts do you need?",
    description: "This includes managers, chefs, servers, and any other staff who will use the system.",
    min: 1,
    max: 20,
    step: 1,
    defaultValue: 2,
  },
]

// Enhanced signup steps with detailed questions
const signupSteps = [
  {
    id: "manager-name",
    type: "input",
    title: "What's your name?",
    description: "We'll use this to personalize your Maamul experience.",
    field: "managerName",
    placeholder: "Enter your full name",
    icon: User,
    required: true,
  },
  {
    id: "company-name",
    type: "input",
    title: "What's your company name?",
    description: "This will appear on your invoices and reports.",
    field: "companyName",
    placeholder: "Enter your company name",
    icon: Building,
    required: true,
  },
  {
    id: "email",
    type: "input",
    title: "What's your email address?",
    description: "We'll use this for your account login and important updates.",
    field: "email",
    placeholder: "name@company.com",
    icon: Mail,
    inputType: "email",
    required: true,
  },
  {
    id: "phone",
    type: "input",
    title: "What's your phone number?",
    description: "Optional - for account security and support purposes.",
    field: "phone",
    placeholder: "+1 (555) 123-4567",
    icon: Phone,
    required: false,
  },
  {
    id: "location",
    type: "input",
    title: "Where is your business located?",
    description: "City and country help us provide localized features.",
    field: "location",
    placeholder: "City, Country",
    icon: MapPin,
    required: false,
  },
  {
    id: "business-age",
    type: "single-select",
    title: "How long has your business been operating?",
    description: "This helps us understand your experience level and needs.",
    field: "businessAge",
    icon: Calendar,
    options: [
      { id: "new", label: "Just starting (0-6 months)" },
      { id: "young", label: "Early stage (6 months - 2 years)" },
      { id: "established", label: "Established (2-5 years)" },
      { id: "mature", label: "Mature (5+ years)" },
    ],
  },
  {
    id: "primary-goal",
    type: "single-select",
    title: "What's your primary goal with Maamul?",
    description: "We'll prioritize features that help you achieve this goal.",
    field: "primaryGoal",
    icon: Target,
    options: [
      { id: "efficiency", label: "Improve operational efficiency" },
      { id: "growth", label: "Scale and grow my business" },
      { id: "organization", label: "Better organize my business" },
      { id: "insights", label: "Get better business insights" },
      { id: "automation", label: "Automate manual processes" },
    ],
  },
  {
    id: "biggest-challenge",
    type: "single-select",
    title: "What's your biggest business challenge right now?",
    description: "We'll make sure Maamul addresses your most pressing needs.",
    field: "biggestChallenge",
    icon: TrendingUp,
    options: [
      { id: "inventory", label: "Managing inventory levels" },
      { id: "sales", label: "Tracking sales and revenue" },
      { id: "customers", label: "Managing customer relationships" },
      { id: "employees", label: "Coordinating with team members" },
      { id: "reporting", label: "Getting clear business reports" },
      { id: "time", label: "Finding time for strategic work" },
    ],
  },
  {
    id: "daily-hours",
    type: "single-select",
    title: "How many hours per day do you spend on business operations?",
    description: "This helps us understand your workload and time-saving opportunities.",
    field: "dailyHours",
    icon: Clock,
    options: [
      { id: "part-time", label: "Less than 4 hours" },
      { id: "half-time", label: "4-6 hours" },
      { id: "full-time", label: "6-8 hours" },
      { id: "overtime", label: "More than 8 hours" },
    ],
  },
  {
    id: "password",
    type: "input",
    title: "Create a secure password",
    description: "Choose a strong password to protect your account.",
    field: "password",
    placeholder: "Enter a secure password",
    icon: Lock,
    inputType: "password",
    required: true,
  },
  {
    id: "confirm-password",
    type: "input",
    title: "Confirm your password",
    description: "Please re-enter your password to confirm.",
    field: "confirmPassword",
    placeholder: "Confirm your password",
    icon: Lock,
    inputType: "password",
    required: true,
  },
  {
    id: "team-members",
    type: "team-setup",
    title: "Add your team members",
    description: "Optional - You can add team members now or later from your dashboard.",
  },
]

// Sign-up form fields
interface SignUpData {
  managerName: string
  companyName: string
  email: string
  phone: string
  location: string
  businessAge: string
  primaryGoal: string
  biggestChallenge: string
  dailyHours: string
  password: string
  confirmPassword: string
  teamMembers: Array<{ name: string; email: string; role: string }>
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<"industry" | "waitlist" | "retail-setup" | "restaurant-setup" | "signup" | "success">(
    "industry",
  )
  const [selectedIndustry, setSelectedIndustry] = useState<string>("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentSignupStep, setCurrentSignupStep] = useState(0)
  const [retailAnswers, setRetailAnswers] = useState<Record<string, any>>({
    "company-size": "",
    revenue: "",
    locations: 1,
    modules: ["inventory", "pos"], // Essential modules pre-selected
    users: 2,
  })
  const [restaurantAnswers, setRestaurantAnswers] = useState<Record<string, any>>({
    "company-size": "",
    revenue: "",
    locations: 1,
    modules: ["menu", "pos", "tables"], // Essential modules pre-selected
    users: 2,
  })
  const [signUpData, setSignUpData] = useState<SignUpData>({
    managerName: "",
    companyName: "",
    email: "",
    phone: "",
    location: "",
    businessAge: "",
    primaryGoal: "",
    biggestChallenge: "",
    dailyHours: "",
    password: "",
    confirmPassword: "",
    teamMembers: [],
  })
  const [waitlistData, setWaitlistData] = useState({
    name: "",
    email: "",
    company: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Animation states for Business Setup
  const [businessSetupStep, setBusinessSetupStep] = useState(0)
  const [showBusinessLogo, setShowBusinessLogo] = useState(false)
  const [businessHeadingText, setBusinessHeadingText] = useState("")
  const [isTypingBusinessHeading, setIsTypingBusinessHeading] = useState(false)
  const [businessDescText, setBusinessDescText] = useState("")
  const [isTypingBusinessDesc, setIsTypingBusinessDesc] = useState(false)
  const [businessFeature1Text, setBusinessFeature1Text] = useState("")
  const [isTypingBusinessFeature1, setIsTypingBusinessFeature1] = useState(false)
  const [businessFeature2Text, setBusinessFeature2Text] = useState("")
  const [isTypingBusinessFeature2, setIsTypingBusinessFeature2] = useState(false)
  const [businessFeature3Text, setBusinessFeature3Text] = useState("")
  const [isTypingBusinessFeature3, setIsTypingBusinessFeature3] = useState(false)
  const [showBusinessTrust, setShowBusinessTrust] = useState(false)
  // Animation states for Business Setup - add these new states
  const [businessFeature4Text, setBusinessFeature4Text] = useState("")
  const [isTypingBusinessFeature4, setIsTypingBusinessFeature4] = useState(false)
  const [businessFeature5Text, setBusinessFeature5Text] = useState("")
  const [isTypingBusinessFeature5, setIsTypingBusinessFeature5] = useState(false)

  // Animation states for Account Setup
  const [accountSetupStep, setAccountSetupStep] = useState(0)
  const [showAccountLogo, setShowAccountLogo] = useState(false)
  const [accountHeadingText, setAccountHeadingText] = useState("")
  const [isTypingAccountHeading, setIsTypingAccountHeading] = useState(false)
  const [accountDescText, setAccountDescText] = useState("")
  const [isTypingAccountDesc, setIsTypingAccountDesc] = useState(false)
  const [accountFeature1Text, setAccountFeature1Text] = useState("")
  const [isTypingAccountFeature1, setIsTypingAccountFeature1] = useState(false)
  const [accountFeature2Text, setAccountFeature2Text] = useState("")
  const [isTypingAccountFeature2, setIsTypingAccountFeature2] = useState(false)
  const [accountFeature3Text, setAccountFeature3Text] = useState("")
  const [isTypingAccountFeature3, setIsTypingAccountFeature3] = useState(false)
  const [showAccountTrust, setShowAccountTrust] = useState(false)
  // Animation states for Account Setup - add these new states
  const [accountFeature4Text, setAccountFeature4Text] = useState("")
  const [isTypingAccountFeature4, setIsTypingAccountFeature4] = useState(false)
  const [accountFeature5Text, setAccountFeature5Text] = useState("")
  const [isTypingAccountFeature5, setIsTypingAccountFeature5] = useState(false)

  // Business Setup Animation Sequence
  useEffect(() => {
    if (currentStep === "retail-setup" || currentStep === "restaurant-setup") {
      const runBusinessAnimation = async () => {
        // Step 1: Show logo
        if (businessSetupStep === 0) {
          setTimeout(() => {
            setShowBusinessLogo(true)
            setBusinessSetupStep(1)
          }, 500)
        }
        // Step 2: Type heading
        else if (businessSetupStep === 1) {
          setTimeout(() => {
            setIsTypingBusinessHeading(true)
            const heading = "Configure Your Business Operations"
            let i = 0
            const typeHeading = () => {
              if (i < heading.length) {
                setBusinessHeadingText(heading.slice(0, i + 1))
                i++
                setTimeout(typeHeading, 100)
              } else {
                setIsTypingBusinessHeading(false)
                setTimeout(() => setBusinessSetupStep(2), 500)
              }
            }
            typeHeading()
          }, 800)
        }
        // Step 3: Type description
        else if (businessSetupStep === 2) {
          setIsTypingBusinessDesc(true)
          const description = "Customize Maamul to match your business needs and workflow"
          let i = 0
          const typeDescription = () => {
            if (i < description.length) {
              setBusinessDescText(description.slice(0, i + 1))
              i++
              setTimeout(typeDescription, 60)
            } else {
              setIsTypingBusinessDesc(false)
              setTimeout(() => setBusinessSetupStep(3), 500)
            }
          }
          typeDescription()
        }
        // Step 4: Type feature 1
        else if (businessSetupStep === 3) {
          setIsTypingBusinessFeature1(true)
          const feature1 = "Smart Business Configuration\nTailored setup based on your industry and business size"
          let i = 0
          const typeFeature1 = () => {
            if (i < feature1.length) {
              setBusinessFeature1Text(feature1.slice(0, i + 1))
              i++
              setTimeout(typeFeature1, 70)
            } else {
              setIsTypingBusinessFeature1(false)
              setTimeout(() => setBusinessSetupStep(4), 500)
            }
          }
          typeFeature1()
        }
        // Step 5: Type feature 2
        else if (businessSetupStep === 4) {
          setIsTypingBusinessFeature2(true)
          const feature2 = "Module Selection\nChoose the features that matter most to your operations"
          let i = 0
          const typeFeature2 = () => {
            if (i < feature2.length) {
              setBusinessFeature2Text(feature2.slice(0, i + 1))
              i++
              setTimeout(typeFeature2, 70)
            } else {
              setIsTypingBusinessFeature2(false)
              setTimeout(() => setBusinessSetupStep(5), 500)
            }
          }
          typeFeature2()
        }
        // Step 6: Type feature 3
        else if (businessSetupStep === 5) {
          setIsTypingBusinessFeature3(true)
          const feature3 = "Scalable Architecture\nGrow from single location to multi-branch operations"
          let i = 0
          const typeFeature3 = () => {
            if (i < feature3.length) {
              setBusinessFeature3Text(feature3.slice(0, i + 1))
              i++
              setTimeout(typeFeature3, 70)
            } else {
              setIsTypingBusinessFeature3(false)
              setTimeout(() => setBusinessSetupStep(6), 500)
            }
          }
          typeFeature3()
        }
        // Step 7: Type feature 4
        else if (businessSetupStep === 6) {
          setIsTypingBusinessFeature4(true)
          const feature4 = "Payment Integration\nSeamless eDahab, WAAFI, and M-Pesa payment processing"
          let i = 0
          const typeFeature4 = () => {
            if (i < feature4.length) {
              setBusinessFeature4Text(feature4.slice(0, i + 1))
              i++
              setTimeout(typeFeature4, 70)
            } else {
              setIsTypingBusinessFeature4(false)
              setTimeout(() => setBusinessSetupStep(7), 500)
            }
          }
          typeFeature4()
        }
        // Step 8: Type feature 5
        else if (businessSetupStep === 7) {
          setIsTypingBusinessFeature5(true)
          const feature5 = "Local Compliance\nBuilt for East African business regulations and tax requirements"
          let i = 0
          const typeFeature5 = () => {
            if (i < feature5.length) {
              setBusinessFeature5Text(feature5.slice(0, i + 1))
              i++
              setTimeout(typeFeature5, 70)
            } else {
              setIsTypingBusinessFeature5(false)
              setTimeout(() => setBusinessSetupStep(8), 500)
            }
          }
          typeFeature5()
        }
        // Step 9: Show trust badge (update the step number)
        else if (businessSetupStep === 8) {
          setTimeout(() => {
            setShowBusinessTrust(true)
          }, 500)
        }
      }
      runBusinessAnimation()
    }
  }, [businessSetupStep, currentStep])

  // Account Setup Animation Sequence
  useEffect(() => {
    if (currentStep === "signup") {
      const runAccountAnimation = async () => {
        // Step 1: Show logo
        if (accountSetupStep === 0) {
          setTimeout(() => {
            setShowAccountLogo(true)
            setAccountSetupStep(1)
          }, 500)
        }
        // Step 2: Type heading
        else if (accountSetupStep === 1) {
          setTimeout(() => {
            setIsTypingAccountHeading(true)
            const heading = "Create Your Maamul Account"
            let i = 0
            const typeHeading = () => {
              if (i < heading.length) {
                setAccountHeadingText(heading.slice(0, i + 1))
                i++
                setTimeout(typeHeading, 100)
              } else {
                setIsTypingAccountHeading(false)
                setTimeout(() => setAccountSetupStep(2), 500)
              }
            }
            typeHeading()
          }, 800)
        }
        // Step 3: Type description
        else if (accountSetupStep === 2) {
          setIsTypingAccountDesc(true)
          const description = "Secure account setup with personalized business insights"
          let i = 0
          const typeDescription = () => {
            if (i < description.length) {
              setAccountDescText(description.slice(0, i + 1))
              i++
              setTimeout(typeDescription, 60)
            } else {
              setIsTypingAccountDesc(false)
              setTimeout(() => setAccountSetupStep(3), 500)
            }
          }
          typeDescription()
        }
        // Step 4: Type feature 1
        else if (accountSetupStep === 3) {
          setIsTypingAccountFeature1(true)
          const feature1 = "Secure Authentication\nBank-level security with multi-factor authentication"
          let i = 0
          const typeFeature1 = () => {
            if (i < feature1.length) {
              setAccountFeature1Text(feature1.slice(0, i + 1))
              i++
              setTimeout(typeFeature1, 70)
            } else {
              setIsTypingAccountFeature1(false)
              setTimeout(() => setAccountSetupStep(4), 500)
            }
          }
          typeFeature1()
        }
        // Step 5: Type feature 2
        else if (accountSetupStep === 4) {
          setIsTypingAccountFeature2(true)
          const feature2 = "Team Collaboration\nInvite team members and set role-based permissions"
          let i = 0
          const typeFeature2 = () => {
            if (i < feature2.length) {
              setAccountFeature2Text(feature2.slice(0, i + 1))
              i++
              setTimeout(typeFeature2, 70)
            } else {
              setIsTypingAccountFeature2(false)
              setTimeout(() => setAccountSetupStep(5), 500)
            }
          }
          typeFeature2()
        }
        // Step 6: Type feature 3
        else if (accountSetupStep === 5) {
          setIsTypingAccountFeature3(true)
          const feature3 = "Instant Deployment\nYour customized system ready in under 24 hours"
          let i = 0
          const typeFeature3 = () => {
            if (i < feature3.length) {
              setAccountFeature3Text(feature3.slice(0, i + 1))
              i++
              setTimeout(typeFeature3, 70)
            } else {
              setIsTypingAccountFeature3(false)
              setTimeout(() => setAccountSetupStep(6), 500)
            }
          }
          typeFeature3()
        }
        // Step 7: Type feature 4
        else if (accountSetupStep === 6) {
          setIsTypingAccountFeature4(true)
          const feature4 = "Data Protection\nSOC 2 compliant with advanced encryption and backup systems"
          let i = 0
          const typeFeature4 = () => {
            if (i < feature4.length) {
              setAccountFeature4Text(feature4.slice(0, i + 1))
              i++
              setTimeout(typeFeature4, 70)
            } else {
              setIsTypingAccountFeature4(false)
              setTimeout(() => setAccountSetupStep(7), 500)
            }
          }
          typeFeature4()
        }
        // Step 8: Type feature 5
        else if (accountSetupStep === 7) {
          setIsTypingAccountFeature5(true)
          const feature5 = "24/7 Support\nDedicated support team with local language assistance"
          let i = 0
          const typeFeature5 = () => {
            if (i < feature5.length) {
              setAccountFeature5Text(feature5.slice(0, i + 1))
              i++
              setTimeout(typeFeature5, 70)
            } else {
              setIsTypingAccountFeature5(false)
              setTimeout(() => setAccountSetupStep(8), 500)
            }
          }
          typeFeature5()
        }
        // Step 9: Show trust badge (update the step number)
        else if (accountSetupStep === 8) {
          setTimeout(() => {
            setShowAccountTrust(true)
          }, 500)
        }
      }
      runAccountAnimation()
    }
  }, [accountSetupStep, currentStep])

  // Reset animations when step changes
  useEffect(() => {
    if (currentStep === "retail-setup" || currentStep === "restaurant-setup") {
      setBusinessSetupStep(0)
      setShowBusinessLogo(false)
      setBusinessHeadingText("")
      setIsTypingBusinessHeading(false)
      setBusinessDescText("")
      setIsTypingBusinessDesc(false)
      setBusinessFeature1Text("")
      setIsTypingBusinessFeature1(false)
      setBusinessFeature2Text("")
      setIsTypingBusinessFeature2(false)
      setBusinessFeature3Text("")
      setIsTypingBusinessFeature3(false)
      setShowBusinessTrust(false)
      // Add to Business Setup reset
      setBusinessFeature4Text("")
      setIsTypingBusinessFeature4(false)
      setBusinessFeature5Text("")
      setIsTypingBusinessFeature5(false)
    } else if (currentStep === "signup") {
      setAccountSetupStep(0)
      setShowAccountLogo(false)
      setAccountHeadingText("")
      setIsTypingAccountHeading(false)
      setAccountDescText("")
      setIsTypingAccountDesc(false)
      setAccountFeature1Text("")
      setIsTypingAccountFeature1(false)
      setAccountFeature2Text("")
      setIsTypingAccountFeature2(false)
      setAccountFeature3Text("")
      setIsTypingAccountFeature3(false)
      setShowAccountTrust(false)
      // Add to Account Setup reset
      setAccountFeature4Text("")
      setIsTypingAccountFeature4(false)
      setAccountFeature5Text("")
      setIsTypingAccountFeature5(false)
    }
  }, [currentStep])

  // Calculate progress for setup
  const setupProgressPercentage =
    currentStep === "retail-setup" || currentStep === "restaurant-setup"
      ? (currentQuestionIndex / (currentStep === "retail-setup" ? retailQuestions.length : restaurantQuestions.length)) * 100
      : 0

  // Calculate progress for signup
  const signupProgressPercentage = currentStep === "signup" ? ((currentSignupStep + 1) / signupSteps.length) * 100 : 0

  // Handle industry selection
  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustry(industryId)
    if (industryId === "retail") {
      setCurrentStep("retail-setup")
    } else if (industryId === "restaurant") {
      setCurrentStep("restaurant-setup")
    } else {
      setCurrentStep("waitlist")
    }
  }

  // Handle retail question navigation
  const handleNextQuestion = () => {
    const questions = currentStep === "retail-setup" ? retailQuestions : restaurantQuestions
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      window.scrollTo(0, 0)
    } else {
      setCurrentStep("signup")
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      window.scrollTo(0, 0)
    }
  }

  // Handle signup step navigation
  const handleNextSignupStep = () => {
    const currentStepData = signupSteps[currentSignupStep]
    // Validation
    if (currentStepData.required && currentStepData.field) {
      const value = signUpData[currentStepData.field as keyof SignUpData]
      if (!value || (typeof value === "string" && value.trim() === "")) {
        toast.error("This field is required")
        return
      }
    }

    // Password confirmation validation
    if (currentStepData.id === "confirm-password") {
      if (signUpData.password !== signUpData.confirmPassword) {
        toast.error("Passwords do not match")
        return
      }
    }

    if (currentSignupStep < signupSteps.length - 1) {
      setCurrentSignupStep(currentSignupStep + 1)
      window.scrollTo(0, 0)
    } else {
      handleSignUpSubmit()
    }
  }

  const handlePreviousSignupStep = () => {
    if (currentSignupStep > 0) {
      setCurrentSignupStep(currentSignupStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // Advance with Enter key in inputs and selection lists
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return

      // Prevent accidental form submission/line breaks
      e.preventDefault()

      if (currentStep === "retail-setup" || currentStep === "restaurant-setup") {
        // Only advance if current question is answered
        if (isCurrentQuestionAnswered()) {
          handleNextQuestion()
        }
      } else if (currentStep === "signup") {
        // Only advance if current signup step can proceed and not submitting
        if (canProceedSignupStep() && !isSubmitting) {
          handleNextSignupStep()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentStep, currentQuestionIndex, currentSignupStep, signUpData, retailAnswers, isSubmitting])

  // Handle retail answer changes
  const handleRetailAnswerChange = (questionId: string, value: any) => {
    setRetailAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  // Handle restaurant answer changes
  const handleRestaurantAnswerChange = (questionId: string, value: any) => {
    setRestaurantAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  // Handle signup data changes
  const handleSignupDataChange = (field: string, value: any) => {
    setSignUpData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    const questions = currentStep === "retail-setup" ? retailQuestions : restaurantQuestions
    const answers = currentStep === "retail-setup" ? retailAnswers : restaurantAnswers
    const currentQuestion = questions[currentQuestionIndex]
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

  // Check if current signup step can proceed
  const canProceedSignupStep = () => {
    const currentStepData = signupSteps[currentSignupStep]
    if (!currentStepData.required) return true
    if (currentStepData.field) {
      const value = signUpData[currentStepData.field as keyof SignUpData]
      return value && (typeof value !== "string" || value.trim() !== "")
    }
    return true
  }

  // Handle waitlist submission
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...waitlistData,
          industry: selectedIndustry,
        }),
      })
      if (response.ok) {
        toast.success("Thank you! We'll notify you when setup for your industry becomes available.")
        setWaitlistData({ name: "", email: "", company: "" })
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle sign-up submission
  const handleSignUpSubmit = async () => {
    setIsSubmitting(true)
    try {
      const onboardingData = currentStep === "retail-setup" ? retailAnswers : restaurantAnswers
      console.log(JSON.stringify({
        ...signUpData,
        industry: selectedIndustry,
        onboardingData: onboardingData
      }))
      const response = await fetch("/api/onboarding/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...signUpData,
          industry: selectedIndustry,
          onboardingData: onboardingData,
        }),
      })
      if (response.ok) {
        setCurrentStep("success")
      } else {
        let message = "Sign up failed. Please try again."
        let code: string | undefined
        try {
          const err = await response.json()
          code = err?.code
          message = err?.message || err?.error || message
        } catch {
          // fallback to status-based messages
          if (response.status === 403) message = "Email domain not authorized. Please contact support for access."
          if (response.status === 409) message = "User with this email already exists. Try logging in instead."
          if (response.status === 400) message = "Invalid input. Please review your details."
        }

        // Prefer code when available
        if (code === "DOMAIN_NOT_WHITELISTED") {
          message = "Email domain not authorized. Please contact support for access."
        }

        if (response.status === 409) {
          message = message || "User with this email already exists. Try logging in instead."
        }

        toast.error(message)
      }
    } catch (error) {
      toast.error("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add team member
  const addTeamMember = () => {
    setSignUpData((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: "", email: "", role: "Employee" }],
    }))
  }

  // Remove team member
  const removeTeamMember = (index: number) => {
    setSignUpData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }))
  }

  // Render typed text with proper formatting
  const renderTypedText = (text: string, isTitle = false) => {
    const lines = text.split("\n")
    return (
      <div>
        {lines.map((line, index) => (
          <div key={index} className={isTitle ? "font-bold text-lg mb-1" : "text-sm text-white/90"}>
            {line}
          </div>
        ))}
      </div>
    )
  }

  // Render Business Setup video section
  const renderBusinessSetupVideo = () => (
    <div className="relative h-full overflow-hidden">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover scale-105">
        <source
          src="https://zl2dvipizibcvy5o.public.blob.vercel-storage.com/maamul%20login%20%281%29.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center px-4 sm:px-6 py-4 sm:py-6 h-full">
        <div className="w-full max-w-[480px] backdrop-blur-[10%] bg-black/10 p-3 sm:p-4 rounded-xl border border-white/20 shadow-2xl overflow-hidden h-fit" style={{ fontWeight: 300 }}>
          {/* Messaging Platform Style Content */}
          <div className="space-y-2">
            {/* Logo */}
            {showBusinessLogo && (
              <div className="transition-all duration-500 opacity-100 translate-y-0 mb-1">
                <div className="text-white text-2xl sm:text-3xl font-serif drop-shadow-2xl">𐒑</div>
              </div>
            )}

            {/* Heading - Typing Effect */}
            {businessHeadingText && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start">
                  <div className="bg-primary/20 backdrop-blur-sm p-1 rounded-md mr-1.5 flex-shrink-0">
                    <Settings className="h-3 w-3 text-white" />
                  </div>
                  <div className="message-bubble bg-white/10 backdrop-blur-sm p-2 rounded-lg rounded-tl-none border border-white/20 max-w-[85%]">
                    <h1 className="text-sm sm:text-base font-bold tracking-tight text-white drop-shadow-xl leading-tight">
                      {businessHeadingText}
                      {isTypingBusinessHeading && <span className="animate-pulse">|</span>}
                    </h1>
                  </div>
                </div>
              </div>
            )}

            {/* Description - Typing Effect */}
            {businessDescText && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start justify-end">
                  <div className="message-bubble bg-primary/20 backdrop-blur-sm p-2 rounded-lg rounded-tr-none border border-primary/30 max-w-[85%]">
                    <p className="text-xs text-white leading-tight drop-shadow-sm">
                      {businessDescText}
                      {isTypingBusinessDesc && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Feature 1 - Typing Effect */}
            {businessFeature1Text && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start">
                  <div className="bg-white/20 backdrop-blur-sm p-1 rounded-md mr-1.5 border border-white/30 shadow-xl flex-shrink-0">
                    <Settings className="h-3 w-3 text-white" />
                  </div>
                  <div className="message-bubble bg-white/10 backdrop-blur-sm p-2 rounded-lg rounded-tl-none border border-white/20 max-w-[80%]">
                    {renderTypedText(businessFeature1Text)}
                    {isTypingBusinessFeature1 && <span className="animate-pulse">|</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Feature 2 - Typing Effect */}
            {businessFeature2Text && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start justify-end">
                  <div className="message-bubble bg-primary/20 backdrop-blur-sm p-2 rounded-lg rounded-tr-none border border-primary/30 max-w-[80%]">
                    {renderTypedText(businessFeature2Text)}
                    {isTypingBusinessFeature2 && <span className="animate-pulse">|</span>}
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-1 rounded-md ml-1.5 border border-white/30 shadow-xl flex-shrink-0">
                    <Layers className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Feature 3 - Typing Effect */}
            {businessFeature3Text && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start">
                  <div className="bg-white/20 backdrop-blur-sm p-1 rounded-md mr-1.5 border border-white/30 shadow-xl flex-shrink-0">
                    <TrendingUp className="h-3 w-3 text-white" />
                  </div>
                  <div className="message-bubble bg-white/10 backdrop-blur-sm p-2 rounded-lg rounded-tl-none border border-white/20 max-w-[80%]">
                    {renderTypedText(businessFeature3Text)}
                    {isTypingBusinessFeature3 && <span className="animate-pulse">|</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Feature 4 - Typing Effect */}
            {businessFeature4Text && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start justify-end">
                  <div className="message-bubble bg-primary/20 backdrop-blur-sm p-2 rounded-lg rounded-tr-none border border-primary/30 max-w-[80%]">
                    {renderTypedText(businessFeature4Text)}
                    {isTypingBusinessFeature4 && <span className="animate-pulse">|</span>}
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-1 rounded-md ml-1.5 border border-white/30 shadow-xl flex-shrink-0">
                    <DollarSign className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Feature 5 - Typing Effect */}
            {businessFeature5Text && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start">
                  <div className="bg-white/20 backdrop-blur-sm p-1 rounded-md mr-1.5 border border-white/30 shadow-xl flex-shrink-0">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  <div className="message-bubble bg-white/10 backdrop-blur-sm p-2 rounded-lg rounded-tl-none border border-white/20 max-w-[80%]">
                    {renderTypedText(businessFeature5Text)}
                    {isTypingBusinessFeature5 && <span className="animate-pulse">|</span>}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )

  // Render Account Setup video section
  const renderAccountSetupVideo = () => (
    <div className="relative h-full overflow-hidden">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover scale-105">
        <source
          src="https://zl2dvipizibcvy5o.public.blob.vercel-storage.com/maamul%20login%20%281%29.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-black/15 to-black/35"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center px-4 sm:px-6 py-4 sm:py-6 h-full">
        <div className="w-full max-w-[480px] backdrop-blur-[10%] bg-black/10 p-3 sm:p-4 rounded-xl border border-white/20 shadow-2xl overflow-hidden h-fit" style={{ fontWeight: 300 }}>
          {/* Messaging Platform Style Content */}
          <div className="space-y-2">
            {/* Logo */}
            {showAccountLogo && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="text-white text-5xl font-serif drop-shadow-2xl">𐒑</div>
              </div>
            )}

            {/* Heading - Typing Effect */}
            {accountHeadingText && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start">
                  <div className="bg-primary/20 backdrop-blur-sm p-2 rounded-full mr-3 mt-1 flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="message-bubble bg-white/10 backdrop-blur-sm p-3 rounded-2xl rounded-tl-none border border-white/20 max-w-[85%]">
                    <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-xl leading-tight">
                      {accountHeadingText}
                      {isTypingAccountHeading && <span className="animate-pulse">|</span>}
                    </h1>
                  </div>
                </div>
              </div>
            )}

            {/* Description - Typing Effect */}
            {accountDescText && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start justify-end">
                  <div className="message-bubble bg-primary/20 backdrop-blur-sm p-2 rounded-lg rounded-tr-none border border-primary/30 max-w-[85%]">
                    <p className="text-xs text-white leading-tight drop-shadow-sm">
                      {accountDescText}
                      {isTypingAccountDesc && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Feature 1 - Typing Effect */}
            {accountFeature1Text && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start">
                  <div className="bg-white/20 backdrop-blur-sm p-1 rounded-md mr-1.5 border border-white/30 shadow-xl flex-shrink-0">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  <div className="message-bubble bg-white/10 backdrop-blur-sm p-2 rounded-lg rounded-tl-none border border-white/20 max-w-[80%]">
                    {renderTypedText(accountFeature1Text)}
                    {isTypingAccountFeature1 && <span className="animate-pulse">|</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Feature 2 - Typing Effect */}
            {accountFeature2Text && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start justify-end">
                  <div className="message-bubble bg-primary/20 backdrop-blur-sm p-2 rounded-lg rounded-tr-none border border-primary/30 max-w-[80%]">
                    {renderTypedText(accountFeature2Text)}
                    {isTypingAccountFeature2 && <span className="animate-pulse">|</span>}
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-1 rounded-md ml-1.5 border border-white/30 shadow-xl flex-shrink-0">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Feature 3 - Typing Effect */}
            {accountFeature3Text && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start">
                  <div className="bg-white/20 backdrop-blur-sm p-1 rounded-md mr-1.5 border border-white/30 shadow-xl flex-shrink-0">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <div className="message-bubble bg-white/10 backdrop-blur-sm p-2 rounded-lg rounded-tl-none border border-white/20 max-w-[80%]">
                    {renderTypedText(accountFeature3Text)}
                    {isTypingAccountFeature3 && <span className="animate-pulse">|</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Feature 4 - Typing Effect */}
            {accountFeature4Text && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start justify-end">
                  <div className="message-bubble bg-primary/20 backdrop-blur-sm p-2 rounded-lg rounded-tr-none border border-primary/30 max-w-[80%]">
                    {renderTypedText(accountFeature4Text)}
                    {isTypingAccountFeature4 && <span className="animate-pulse">|</span>}
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-1 rounded-md ml-1.5 border border-white/30 shadow-xl flex-shrink-0">
                    <Lock className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Feature 5 - Typing Effect */}
            {accountFeature5Text && (
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-start">
                  <div className="bg-white/20 backdrop-blur-sm p-1 rounded-md mr-1.5 border border-white/30 shadow-xl flex-shrink-0">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  <div className="message-bubble bg-white/10 backdrop-blur-sm p-2 rounded-lg rounded-tl-none border border-white/20 max-w-[80%]">
                    {renderTypedText(accountFeature5Text)}
                    {isTypingAccountFeature5 && <span className="animate-pulse">|</span>}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )

  // Render industry selection
  const renderIndustrySelection = () => (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-primary mx-auto mb-4 text-6xl font-serif">𐒑</div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Which industry does your business operate in?</h1>
        <p className="text-lg text-muted-foreground">
          Choose your industry to get started with the right setup for your business.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {industryOptions.map((industry) => (
          <div
            key={industry.id}
            onClick={() => handleIndustrySelect(industry.id)}
            className={`
              relative p-6 rounded-lg border cursor-pointer transition-all duration-200
              ${
                industry.available
                  ? "border-border hover:border-primary/50 hover:bg-muted/50"
                  : "border-border/50 bg-muted/20 cursor-not-allowed opacity-75"
              }
            `}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-full ${industry.available ? "bg-primary/10" : "bg-muted"}`}>
                {React.createElement(industry.icon, {
                  className: `h-6 w-6 ${industry.available ? "text-primary" : "text-muted-foreground"}`,
                })}
              </div>
              <div>
                <div className="font-semibold mb-1">{industry.label}</div>
                <div className="text-sm text-muted-foreground">{industry.description}</div>
              </div>
              {industry.available ? (
                <Badge className="bg-primary text-primary-foreground">Set up on the go</Badge>
              ) : (
                <Badge variant="outline">Coming Soon</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Render waitlist form
  const renderWaitlistForm = () => {
    const selectedIndustryData = industryOptions.find((i) => i.id === selectedIndustry)
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
            {selectedIndustryData &&
              React.createElement(selectedIndustryData.icon, { className: "h-8 w-8 text-primary" })}
          </div>
          <h2 className="text-3xl font-bold mb-2">Join the Waitlist</h2>
          <p className="text-muted-foreground">
            We're working hard to bring Maamul to the <strong>{selectedIndustryData?.label}</strong> industry. Join our
            waitlist to be notified when it's ready!
          </p>
        </div>
        <form onSubmit={handleWaitlistSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={waitlistData.name}
              onChange={(e) => setWaitlistData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={waitlistData.email}
              onChange={(e) => setWaitlistData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={waitlistData.company}
              onChange={(e) => setWaitlistData((prev) => ({ ...prev, company: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Joining Waitlist..." : "Join Waitlist"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => setCurrentStep("industry")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Industry Selection
          </Button>
        </div>
      </div>
    )
  }

  // Render setup questions (retail or restaurant)
  const renderSetupQuestions = () => {
    const questions = currentStep === "retail-setup" ? retailQuestions : restaurantQuestions
    const answers = currentStep === "retail-setup" ? retailAnswers : restaurantAnswers
    const handleAnswerChange = currentStep === "retail-setup" ? handleRetailAnswerChange : handleRestaurantAnswerChange
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return null

    switch (currentQuestion.type) {
      case "welcome":
        const WelcomeIcon = currentStep === "restaurant-setup" ? UtensilsCrossed : Building2
        return (
          <div className="text-center w-full max-w-md mx-auto animate-fade-in px-2">
            <div className="mb-4">
              <div className="bg-primary/10 p-2.5 rounded-full w-fit mx-auto mb-2.5">
                <WelcomeIcon className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight mb-1.5">{currentQuestion.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{currentQuestion.description}</p>
            </div>
            <Button
              size="sm"
              onClick={handleNextQuestion}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Let's Get Started
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        )

      case "single-select":
        return (
          <div className="w-full max-w-lg mx-auto animate-fade-in px-2">
            <h2 className="text-base sm:text-lg font-bold mb-1.5">{currentQuestion.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">{currentQuestion.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
                  className={`
                    p-2.5 rounded-md border cursor-pointer transition-all duration-200
                    ${
                      answers[currentQuestion.id] === option.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-full flex-shrink-0">
                      {React.createElement(option.icon, { className: "h-4 w-4 text-primary" })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{option.label}</div>
                    </div>
                    {answers[currentQuestion.id] === option.id && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "multi-select":
        return (
          <div className="w-full max-w-lg mx-auto animate-fade-in px-2">
            <h2 className="text-base sm:text-lg font-bold mb-1.5">{currentQuestion.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">{currentQuestion.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQuestion.options.map((option) => {
                const isSelected =
                  Array.isArray(answers[currentQuestion.id]) &&
                  answers[currentQuestion.id].includes(option.id)
                const isEssential = option.essential
                return (
                  <div
                    key={option.id}
                    onClick={() => {
                      if (isEssential) return // Can't deselect essential modules
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
                      p-2.5 rounded-md border transition-all duration-200
                      ${
                        isEssential
                          ? "border-primary bg-primary/5 cursor-default"
                          : isSelected
                            ? "border-primary bg-primary/5 shadow-sm cursor-pointer"
                            : "border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-full flex-shrink-0 mt-0.5">
                        {React.createElement(option.icon, { className: "h-4 w-4 text-primary" })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm flex items-center gap-1.5 flex-wrap">
                          <span className="leading-tight">{option.label}</span>
                          {isEssential && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 leading-none">
                              Essential
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">
                          {option.description}
                        </div>
                      </div>
                      {(isSelected || isEssential) && <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case "slider":
        return (
          <div className="w-full max-w-lg mx-auto animate-fade-in px-2">
            <h2 className="text-base sm:text-lg font-bold mb-1.5">{currentQuestion.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">{currentQuestion.description}</p>
            <div className="space-y-3 mt-3">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
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
              <div className="text-center text-base sm:text-lg font-bold">
                {answers[currentQuestion.id] || currentQuestion.defaultValue}
                {currentQuestion.id === "locations" &&
                  ` location${(answers[currentQuestion.id] || currentQuestion.defaultValue) !== 1 ? "s" : ""}`}
                {currentQuestion.id === "users" &&
                  ` user${(answers[currentQuestion.id] || currentQuestion.defaultValue) !== 1 ? "s" : ""}`}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Render step-by-step signup
  const renderStepByStepSignup = () => {
    const currentStepData = signupSteps[currentSignupStep]
    if (!currentStepData) return null

    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
            {React.createElement(currentStepData.icon || User, { className: "h-6 w-6 text-primary" })}
          </div>
          <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
          <p className="text-muted-foreground">{currentStepData.description}</p>
        </div>

        {currentStepData.type === "input" && (
          <div className="space-y-4">
            <Input
              type={currentStepData.inputType || "text"}
              placeholder={currentStepData.placeholder}
              value={signUpData[currentStepData.field as keyof SignUpData] as string}
              onChange={(e) => handleSignupDataChange(currentStepData.field!, e.target.value)}
              className="text-center text-lg py-6"
              autoFocus
            />
          </div>
        )}

        {currentStepData.type === "single-select" && (
          <div className="space-y-3">
            {currentStepData.options?.map((option) => (
              <div
                key={option.id}
                onClick={() => handleSignupDataChange(currentStepData.field!, option.id)}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${
                    signUpData[currentStepData.field as keyof SignUpData] === option.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {signUpData[currentStepData.field as keyof SignUpData] === option.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStepData.type === "team-setup" && (
          <div className="space-y-4">
            {signUpData.teamMembers.map((member, index) => (
              <div key={index} className="grid grid-cols-1 gap-2 p-3 border rounded-lg">
                <Input
                  placeholder="Team member name"
                  value={member.name}
                  onChange={(e) => {
                    const updated = [...signUpData.teamMembers]
                    updated[index].name = e.target.value
                    setSignUpData((prev) => ({ ...prev, teamMembers: updated }))
                  }}
                />
                <Input
                  placeholder="Email address"
                  type="email"
                  value={member.email}
                  onChange={(e) => {
                    const updated = [...signUpData.teamMembers]
                    updated[index].email = e.target.value
                    setSignUpData((prev) => ({ ...prev, teamMembers: updated }))
                  }}
                />
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    value={member.role}
                    onChange={(e) => {
                      const updated = [...signUpData.teamMembers]
                      updated[index].role = e.target.value
                      setSignUpData((prev) => ({ ...prev, teamMembers: updated }))
                    }}
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeTeamMember(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTeamMember} className="w-full bg-transparent">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Render success page
  const renderSuccess = () => (
    <div className="max-w-lg mx-auto text-center animate-fade-in">
      <div className="mb-8">
        <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Welcome to Maamul!</h1>
        <p className="text-muted-foreground mb-6">
          Your account has been successfully created and configured. We've sent you a confirmation email with next
          steps.
        </p>
      </div>
      <div className="bg-muted/50 p-6 rounded-lg mb-8">
        <h3 className="font-semibold mb-4">What happens next?</h3>
        <div className="text-sm text-left space-y-2">
          <p>✓ Our team will set up your customized Maamul instance</p>
          <p>✓ You'll receive login credentials within 24 hours</p>
          <p>✓ We'll schedule a personalized onboarding session</p>
          <p>✓ Your team members will receive their access invitations</p>
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Questions? Contact us at{" "}
          <a href="mailto:support@maamul.com" className="text-primary hover:underline">
            support@maamul.com
          </a>
        </p>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-background dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-background/80 dark:bg-gray-900/80 border-b h-16">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between h-full">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg font-sans text-[#392A17] dark:text-primary">Maamul</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Split Layout for setup and signup */}
        {currentStep === "retail-setup" || currentStep === "restaurant-setup" || currentStep === "signup" ? (
          <>
            {/* Video Section - Left Side */}
            <div className="hidden lg:block lg:w-3/5 relative">
              {currentStep === "retail-setup" || currentStep === "restaurant-setup" ? renderBusinessSetupVideo() : renderAccountSetupVideo()}
            </div>

            {/* Form Section - Right Side */}
            <div className="w-full lg:w-2/5 flex flex-col overflow-hidden">
              {/* Progress bar */}
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b bg-background/95 backdrop-blur-sm">
                {(currentStep === "retail-setup" || currentStep === "restaurant-setup") && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Business Setup</span>
                      <span>{Math.round(setupProgressPercentage)}% Complete</span>
                    </div>
                    <Progress value={setupProgressPercentage} className="h-2" />
                  </div>
                )}
                {currentStep === "signup" && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Account Setup</span>
                      <span>
                        Step {currentSignupStep + 1} of {signupSteps.length}
                      </span>
                    </div>
                    <Progress value={signupProgressPercentage} className="h-2" />
                  </div>
                )}
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-3 sm:p-4 flex items-center justify-center min-h-full">
                  {(currentStep === "retail-setup" || currentStep === "restaurant-setup") && renderSetupQuestions()}
                  {currentStep === "signup" && renderStepByStepSignup()}
                </div>
              </div>

              {/* Navigation */}
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-t bg-background/95 backdrop-blur-sm">
                {(currentStep === "retail-setup" || currentStep === "restaurant-setup") && (() => {
                  const questions = currentStep === "retail-setup" ? retailQuestions : restaurantQuestions
                  return questions[currentQuestionIndex]?.type !== "welcome" && (
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                      Back
                    </Button>
                    <Button
                      onClick={handleNextQuestion}
                      disabled={!isCurrentQuestionAnswered()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        {currentQuestionIndex === questions.length - 1 ? "Continue to Account Setup" : "Next"}
                    </Button>
                  </div>
                  )
                })()}
                {currentStep === "signup" && (
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePreviousSignupStep} disabled={currentSignupStep === 0}>
                      Back
                    </Button>
                    <Button
                      onClick={handleNextSignupStep}
                      disabled={!canProceedSignupStep() || isSubmitting}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isSubmitting
                        ? "Creating Account..."
                        : currentSignupStep === signupSteps.length - 1
                          ? "Create Account"
                          : "Next"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Full Width Layout for other steps */
          <main className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="container max-w-6xl mx-auto px-4 pt-12 pb-24">
              <div className="min-h-[60vh] flex items-center justify-center py-8">
                {currentStep === "industry" && renderIndustrySelection()}
                {currentStep === "waitlist" && renderWaitlistForm()}
                {currentStep === "success" && renderSuccess()}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  )
}
