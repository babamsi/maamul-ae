"use client"
import { useState } from "react"
import {
  BarChart3,
  Users,
  Package,
  CreditCard,
  MapPin,
  Settings,
  Bell,
  Search,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  ShoppingCart,
  UserCheck,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Mock user data - in a real app, this would come from authentication
const mockUser = {
  name: "Ahmed Hassan",
  company: "Hassan Electronics",
  email: "ahmed@hassanelectronics.com",
  industry: "retail",
  companySize: "small",
  monthlyRevenue: "growing",
  businessLocations: "single",
  selectedModules: ["pos", "inventory", "customers", "analytics", "payments"],
  teamMembers: [
    { name: "Fatima Ali", email: "fatima@hassanelectronics.com", role: "manager" },
    { name: "Omar Mohamed", email: "omar@hassanelectronics.com", role: "staff" },
  ],
}

const moduleIcons = {
  pos: ShoppingCart,
  inventory: Package,
  customers: Users,
  suppliers: Building2,
  analytics: BarChart3,
  payments: CreditCard,
  employees: UserCheck,
  accounting: DollarSign,
}

const moduleNames = {
  pos: "Point of Sale",
  inventory: "Inventory Management",
  customers: "Customer Management",
  suppliers: "Supplier Management",
  analytics: "Analytics & Reporting",
  payments: "Multi-Payment Integration",
  employees: "Employee Management",
  accounting: "Basic Accounting",
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full backdrop-blur-sm bg-background/80 dark:bg-gray-900/80 border-b">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl font-sans text-[#392A17] dark:text-primary">Maamul</span>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">{mockUser.company}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {mockUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{mockUser.name}</p>
                  <p className="text-xs text-muted-foreground">{mockUser.company}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {mockUser.name.split(" ")[0]}! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with {mockUser.company} today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,345</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">567</div>
              <p className="text-xs text-muted-foreground">12 low stock alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockUser.businessLocations === "single" ? "1" : mockUser.businessLocations === "multiple" ? "3" : "8"}
              </div>
              <p className="text-xs text-muted-foreground">All locations active</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your Modules */}
            <Card>
              <CardHeader>
                <CardTitle>Your Business Modules</CardTitle>
                <CardDescription>
                  Active modules based on your configuration. You have {mockUser.selectedModules.length} modules
                  enabled.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockUser.selectedModules.map((moduleId) => {
                    const Icon = moduleIcons[moduleId as keyof typeof moduleIcons]
                    const name = moduleNames[moduleId as keyof typeof moduleNames]
                    return (
                      <div
                        key={moduleId}
                        className="flex items-center space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{name}</h3>
                          <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 dark:bg-green-900/20 p-1 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New sale completed</p>
                      <p className="text-xs text-muted-foreground">$245.00 • 2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-1 rounded-full">
                      <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Inventory updated</p>
                      <p className="text-xs text-muted-foreground">15 products restocked • 1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-100 dark:bg-orange-900/20 p-1 rounded-full">
                      <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Low stock alert</p>
                      <p className="text-xs text-muted-foreground">iPhone 13 Pro • 3 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Setup Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Setup Progress</CardTitle>
                <CardDescription>Complete your Maamul setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Account Setup</span>
                    <span className="text-sm text-muted-foreground">80%</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Business information added</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Modules configured</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Team members added</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Payment methods setup</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">First product added</span>
                  </div>
                </div>

                <Button className="w-full" size="sm">
                  Continue Setup
                </Button>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Members</CardTitle>
                <CardDescription>
                  {mockUser.teamMembers.length + 1} member{mockUser.teamMembers.length > 0 ? "s" : ""} in your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {mockUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{mockUser.name}</p>
                    <p className="text-xs text-muted-foreground">Owner</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                </div>

                {mockUser.teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}

                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
