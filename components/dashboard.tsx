"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"
import {
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  RefreshCcw,
  Laptop,
  Shirt,
  Home,
  BookOpen,
  UtensilsCrossed,
  Coffee,
  Pizza,
  ChefHat,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  ShoppingBag,
  Table,
  Timer,
  Calendar,
  Zap,
  Store,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Custom hook for animated value
const useAnimatedValue = (targetValue: number, duration = 2000) => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let startTime: number
    const animateValue = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setValue(Math.floor(progress * targetValue))
      if (progress < 1) {
        requestAnimationFrame(animateValue)
      }
    }
    requestAnimationFrame(animateValue)
  }, [targetValue, duration])

  return value
}

// Custom hook for simulating real-time account balance updates
const useAccountBalances = () => {
  const [balances, setBalances] = useState([
    { name: "Checking Account", balance: 5000 },
    { name: "Savings Account", balance: 10000 },
    { name: "Investment Account", balance: 25000 },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setBalances((prevBalances) =>
        prevBalances.map((account) => ({
          ...account,
          balance: Math.max(0, account.balance + Math.floor(Math.random() * 1000) - 500),
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return balances
}

// Custom hook for retail inventory status
const useRetailInventory = () => {
  const [inventory, setInventory] = useState({
    totalProducts: 567,
    lowStock: 12,
    outOfStock: 3,
    stockValue: 125000,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setInventory((prev) => ({
        ...prev,
        lowStock: Math.max(0, prev.lowStock + Math.floor(Math.random() * 3) - 1),
        outOfStock: Math.max(0, prev.outOfStock + Math.floor(Math.random() * 2) - 1),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return inventory
}

// Custom hook for restaurant table status
const useRestaurantTables = () => {
  const [tables, setTables] = useState({
    total: 20,
    occupied: 12,
    reserved: 3,
    available: 5,
    avgWaitTime: 8,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTables((prev) => ({
        ...prev,
        occupied: Math.max(0, Math.min(prev.total, prev.occupied + Math.floor(Math.random() * 3) - 1)),
        avgWaitTime: Math.max(5, Math.min(15, prev.avgWaitTime + Math.floor(Math.random() * 3) - 1)),
      }))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return tables
}

// Generate random data for the charts
const generateData = (days: number, type: "retail" | "restaurant" = "retail") => {
  const data = []
  let sales = type === "restaurant" ? 8500 : 20000
  let customers = type === "restaurant" ? 95 : 200
  for (let i = 0; i < days; i++) {
    sales += Math.floor(Math.random() * (type === "restaurant" ? 800 : 2000)) - (type === "restaurant" ? 400 : 1000)
    customers += Math.floor(Math.random() * (type === "restaurant" ? 8 : 20)) - (type === "restaurant" ? 4 : 10)
    data.push({
      day: `Day ${i + 1}`,
      sales,
      customers,
    })
  }
  return data
}

const lightModeContentColor = "text-[#392A17] dark:text-primary"
const lightModeTextColor = "text-[#392A17] dark:text-card-foreground"
const lightModeMutedColor = "text-[#392A17]/70 dark:text-muted-foreground"

export default function Dashboard({ className }: { className?: string }) {
  const { theme } = useTheme()
  const [dashboardType, setDashboardType] = useState<"retail" | "restaurant">("retail")
  const [slideIndex, setSlideIndex] = useState(0)
  const [retailData] = useState(() => generateData(30, "retail"))
  const [restaurantData] = useState(() => generateData(30, "restaurant"))
  const data = dashboardType === "retail" ? retailData : restaurantData
  
  const [retailTransactions, setRetailTransactions] = useState(
    [...Array(12)].map((_, index) => ({
      id: index,
      type: index % 2 === 0 ? "Payment Received" : "Refund Issued",
      amount: (Math.random() * 1000).toFixed(2),
      time: Math.floor(Math.random() * 60),
      customerName: `Customer ${index + 1}`,
    })),
  )

  const [restaurantTransactions, setRestaurantTransactions] = useState(
    [...Array(12)].map((_, index) => ({
      id: index,
      type: index % 2 === 0 ? "Order Completed" : "Order Cancelled",
      amount: (Math.random() * 500).toFixed(2),
      time: Math.floor(Math.random() * 60),
      customerName: `Table ${index + 1}`,
    })),
  )

  // Reset slide when switching dashboard type manually
  const handleDashboardTypeChange = (type: "retail" | "restaurant") => {
    setDashboardType(type)
    setSlideIndex(0)
  }

  // Auto-slide between sections every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev === 0 ? 1 : 0))
    }, 6000)

    return () => clearInterval(interval)
  }, [dashboardType])

  useEffect(() => {
    const interval = setInterval(() => {
      if (dashboardType === "retail") {
        setRetailTransactions((prev) => {
          const newTransaction = {
            id: prev[prev.length - 1].id + 1,
            type: Math.random() > 0.5 ? "Payment Received" : "Refund Issued",
            amount: (Math.random() * 1000).toFixed(2),
            time: 0,
            customerName: `Customer ${prev[prev.length - 1].id + 2}`,
          }
          return [newTransaction, ...prev.slice(0, -1)].map((t) => ({
            ...t,
            time: t.time + 1,
          }))
        })
      } else {
        setRestaurantTransactions((prev) => {
          const newTransaction = {
            id: prev[prev.length - 1].id + 1,
            type: Math.random() > 0.5 ? "Order Completed" : "Order Cancelled",
            amount: (Math.random() * 500).toFixed(2),
            time: 0,
            customerName: `Table ${prev[prev.length - 1].id + 2}`,
          }
          return [newTransaction, ...prev.slice(0, -1)].map((t) => ({
            ...t,
            time: t.time + 1,
          }))
        })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [dashboardType])

  const transactions = dashboardType === "retail" ? retailTransactions : restaurantTransactions
  const totalSales = useAnimatedValue(data[data.length - 1].sales)
  const newCustomers = useAnimatedValue(data[data.length - 1].customers)
  const retailInventory = useRetailInventory()
  const restaurantTables = useRestaurantTables()

  return (
    <div
      className={cn(
        "relative w-full max-w-5xl rounded-2xl bg-gradient-to-br from-card via-card to-primary/10 dark:from-gray-800 dark:via-gray-800 dark:to-primary/5 p-6 shadow-lg transition-all duration-300 hover:shadow-xl",
        className,
      )}
    >
      <motion.div
        key={dashboardType}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex h-full flex-col overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-3xl font-bold ${lightModeTextColor}`}>
            Maamul Dashboard
          </h3>
          <div className="flex items-center gap-3">
            {/* Industry Switcher - Icon-only, prominent placement */}
            <div className="flex items-center gap-1 bg-gradient-to-r from-background/95 to-background/85 dark:from-gray-800/95 dark:to-gray-800/85 backdrop-blur-md rounded-full p-1 border-2 border-primary/30 dark:border-primary/20 shadow-2xl ring-2 ring-primary/10 hover:ring-primary/20 transition-all">
              <button
                onClick={() => handleDashboardTypeChange("retail")}
                className={`relative flex items-center justify-center p-3 rounded-full transition-all duration-300 ease-out group ${
                  dashboardType === "retail"
                    ? "bg-primary text-white shadow-lg scale-110"
                    : "text-muted-foreground hover:text-primary hover:bg-background/80 dark:hover:bg-gray-700/80 hover:scale-105"
                }`}
                aria-label="Switch to Retail Dashboard"
                title="Retail Dashboard"
              >
                <Store className={`h-5 w-5 transition-transform ${dashboardType === "retail" ? "scale-110" : "group-hover:scale-110"}`} />
                {dashboardType === "retail" && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
              <div className="w-px h-8 bg-primary/20 dark:bg-primary/10"></div>
              <button
                onClick={() => handleDashboardTypeChange("restaurant")}
                className={`relative flex items-center justify-center p-3 rounded-full transition-all duration-300 ease-out group ${
                  dashboardType === "restaurant"
                    ? "bg-primary text-white shadow-lg scale-110"
                    : "text-muted-foreground hover:text-primary hover:bg-background/80 dark:hover:bg-gray-700/80 hover:scale-105"
                }`}
                aria-label="Switch to Restaurant Dashboard"
                title="Restaurant Dashboard"
              >
                <UtensilsCrossed className={`h-5 w-5 transition-transform ${dashboardType === "restaurant" ? "scale-110" : "group-hover:scale-110"}`} />
                {dashboardType === "restaurant" && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-background/50 dark:bg-gray-700/50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
            <h4 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {dashboardType === "retail" ? "Total Sales" : "Daily Revenue"}
            </h4>
            <p className={`text-3xl font-bold ${lightModeContentColor}`}>${totalSales.toLocaleString()}</p>
            <div className="h-32 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" />
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "rgba(17, 24, 39, 0.8)", border: "none", borderRadius: "4px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke={theme === "dark" ? "#60a5fa" : "#8884d8"}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-background/50 dark:bg-gray-700/50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
            <h4 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {dashboardType === "retail" ? "New Customers" : "New Orders"}
            </h4>
            <p className={`text-3xl font-bold ${lightModeContentColor}`}>{newCustomers}</p>
            <div className="h-32 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" />
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "rgba(17, 24, 39, 0.8)", border: "none", borderRadius: "4px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke={theme === "dark" ? "#60a5fa" : "#82ca9d"}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {dashboardType === "retail" ? (
            <div className="bg-background/50 dark:bg-gray-700/50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
              <h4 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Inventory Status
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium dark:text-gray-300">Total Products</span>
                  <span className={`text-lg font-bold ${lightModeContentColor}`}>
                    {retailInventory.totalProducts}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium dark:text-gray-300 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                    Low Stock
                  </span>
                  <span className={`text-sm font-bold text-yellow-600 dark:text-yellow-400`}>
                    {retailInventory.lowStock} items
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium dark:text-gray-300 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                    Out of Stock
                  </span>
                  <span className={`text-sm font-bold text-red-600 dark:text-red-400`}>
                    {retailInventory.outOfStock} items
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Stock Value</span>
                    <span className={`text-sm font-bold ${lightModeContentColor}`}>
                      ${retailInventory.stockValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`mt-4 text-xs ${lightModeContentColor} dark:text-blue-400 flex items-center`}>
                <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
                Updating in real-time
              </div>
            </div>
          ) : (
            <div className="bg-background/50 dark:bg-gray-700/50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
              <h4 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-4 flex items-center">
                <Table className="h-5 w-5 mr-2 text-primary" />
                Table Status
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium dark:text-gray-300">Total Tables</span>
                  <span className={`text-lg font-bold ${lightModeContentColor}`}>
                    {restaurantTables.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium dark:text-gray-300 flex items-center">
                    <Users className="h-4 w-4 mr-1 text-blue-500" />
                    Occupied
                  </span>
                  <span className={`text-sm font-bold text-blue-600 dark:text-blue-400`}>
                    {restaurantTables.occupied}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium dark:text-gray-300 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-purple-500" />
                    Reserved
                  </span>
                  <span className={`text-sm font-bold text-purple-600 dark:text-purple-400`}>
                    {restaurantTables.reserved}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium dark:text-gray-300 flex items-center">
                    <Zap className="h-4 w-4 mr-1 text-green-500" />
                    Available
                  </span>
                  <span className={`text-sm font-bold text-green-600 dark:text-green-400`}>
                    {restaurantTables.available}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Timer className="h-3 w-3 mr-1" />
                      Avg Wait Time
                    </span>
                    <span className={`text-sm font-bold ${lightModeContentColor}`}>
                      {restaurantTables.avgWaitTime} min
                    </span>
                  </div>
                </div>
              </div>
              <div className={`mt-4 text-xs ${lightModeContentColor} dark:text-blue-400 flex items-center`}>
                <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
                Updating in real-time
              </div>
            </div>
          )}
        </div>
        
        {/* Sliding Section: Main Grid and Additional Metrics */}
        <div className="relative overflow-hidden">
          <div className="relative h-[400px]">
            <motion.div
              key={`${dashboardType}-${slideIndex}`}
              initial={{ opacity: 0, x: slideIndex === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full"
            >
              {/* Slide 0: Top Selling Categories/Popular Menu Items + Real-time Transactions/Orders */}
              {slideIndex === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <div className="bg-background/50 dark:bg-gray-700/50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                    <h4 className={`text-lg font-semibold ${lightModeTextColor} mb-6 flex items-center`}>
                      <BarChart3 className={`h-6 w-6 mr-3 ${lightModeContentColor}`} />
                      {dashboardType === "retail" ? "Top Selling Categories" : "Popular Menu Items"}
                    </h4>
                    <div className="space-y-6">
                      {(dashboardType === "retail"
                        ? [
                            {
                              category: "Electronics",
                              sales: 45000,
                              percentage: 70,
                              icon: <Laptop className={`w-5 h-5 ${lightModeContentColor}`} />,
                            },
                            {
                              category: "Clothing",
                              sales: 32000,
                              percentage: 50,
                              icon: <Shirt className={`w-5 h-5 ${lightModeContentColor}`} />,
                            },
                            {
                              category: "Home & Garden",
                              sales: 28000,
                              percentage: 43,
                              icon: <Home className={`w-5 h-5 ${lightModeContentColor}`} />,
                            },
                            {
                              category: "Books",
                              sales: 20000,
                              percentage: 31,
                              icon: <BookOpen className={`w-5 h-5 ${lightModeContentColor}`} />,
                            },
                          ]
                        : [
                            {
                              category: "Main Courses",
                              sales: 3200,
                              percentage: 75,
                              icon: <UtensilsCrossed className={`w-5 h-5 ${lightModeContentColor}`} />,
                            },
                            {
                              category: "Beverages",
                              sales: 2400,
                              percentage: 56,
                              icon: <Coffee className={`w-5 h-5 ${lightModeContentColor}`} />,
                            },
                            {
                              category: "Appetizers",
                              sales: 1800,
                              percentage: 42,
                              icon: <Pizza className={`w-5 h-5 ${lightModeContentColor}`} />,
                            },
                            {
                              category: "Desserts",
                              sales: 1400,
                              percentage: 33,
                              icon: <ChefHat className={`w-5 h-5 ${lightModeContentColor}`} />,
                            },
                          ]
                      ).map((item, index) => (
                        <div key={index} className="space-y-2 group">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium dark:text-gray-300 flex items-center">
                              <span className="mr-2">{item.icon}</span>
                              {item.category}
                            </span>
                            <p
                              className={`text-sm font-semibold ${theme === "light" ? "text-gray-800" : ""}`}
                            >{`${item.percentage}% (${item.sales})`}</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                            <div
                              className="bg-[#392A17] dark:bg-primary h-3 rounded-full transition-all duration-500 ease-out group-hover:saturate-[1.2]"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-background/50 dark:bg-gray-700/50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow backdrop-blur-sm">
                    <h4 className={`text-sm font-medium ${lightModeMutedColor} mb-4 flex items-center`}>
                      <Activity className={`h-5 w-5 mr-2 ${lightModeContentColor}`} />
                      {dashboardType === "retail" ? "Real-time Transactions" : "Real-time Orders"}
                    </h4>
                    <div className="h-[340px] overflow-hidden relative">
                      {transactions.slice(0, 8).map((transaction, index) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="mb-3 p-3 rounded-md border border-primary/20 dark:border-gray-500/20 hover:bg-primary/5 dark:hover:bg-gray-600/50 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              {(transaction.type === "Payment Received" || transaction.type === "Order Completed") ? (
                                <ArrowUpRight className="h-5 w-5 mr-3 text-green-500" />
                              ) : (
                                <ArrowDownLeft className="h-5 w-5 mr-3 text-red-500" />
                              )}
                              <div>
                                <span className={`text-sm font-medium ${lightModeTextColor}`}>{transaction.type}</span>
                                <p className={`${lightModeMutedColor}`}>
                                  {transaction.customerName} • {transaction.time}{" "}
                                  {transaction.time === 1 ? "minute" : "minutes"} ago
                                </p>
                              </div>
                            </div>
                            <span className={`text-sm font-bold ${lightModeContentColor}`}>${transaction.amount}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 1: Additional Industry-Specific Sections */}
              {slideIndex === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {dashboardType === "retail" ? (
                    <>
                      <div className="bg-background/50 dark:bg-gray-700/50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                        <h4 className={`text-lg font-semibold ${lightModeTextColor} mb-4 flex items-center`}>
                          <TrendingUp className={`h-6 w-6 mr-3 ${lightModeContentColor}`} />
                          Key Performance Metrics
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-background/30 dark:bg-gray-800/30 rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">Return Rate</p>
                              <p className={`text-2xl font-bold ${lightModeContentColor}`}>2.4%</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Avg Order Value</p>
                              <p className={`text-2xl font-bold ${lightModeContentColor}`}>$89.50</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-background/30 dark:bg-gray-800/30 rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">Customer Retention</p>
                              <p className={`text-2xl font-bold ${lightModeContentColor}`}>68%</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Stock Turnover</p>
                              <p className={`text-2xl font-bold ${lightModeContentColor}`}>4.2x</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-background/50 dark:bg-gray-700/50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                        <h4 className={`text-lg font-semibold ${lightModeTextColor} mb-4 flex items-center`}>
                          <ShoppingBag className={`h-6 w-6 mr-3 ${lightModeContentColor}`} />
                          Top Products
                        </h4>
                        <div className="space-y-3">
                          {[
                            { name: "Wireless Headphones", sales: 234, revenue: "$18,720" },
                            { name: "Smart Watch", sales: 189, revenue: "$15,120" },
                            { name: "Laptop Stand", sales: 156, revenue: "$4,680" },
                            { name: "USB-C Cable", sales: 342, revenue: "$1,710" },
                          ].map((product, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-background/30 dark:bg-gray-800/30 rounded-lg">
                              <div>
                                <p className="text-sm font-medium dark:text-gray-300">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.sales} units sold</p>
                              </div>
                              <p className={`text-sm font-bold ${lightModeContentColor}`}>{product.revenue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-background/50 dark:bg-gray-700/50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                        <h4 className={`text-lg font-semibold ${lightModeTextColor} mb-4 flex items-center`}>
                          <Clock className={`h-6 w-6 mr-3 ${lightModeContentColor}`} />
                          Kitchen Performance
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-background/30 dark:bg-gray-800/30 rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">Avg Prep Time</p>
                              <p className={`text-2xl font-bold ${lightModeContentColor}`}>12 min</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Orders/Hour</p>
                              <p className={`text-2xl font-bold ${lightModeContentColor}`}>28</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-background/30 dark:bg-gray-800/30 rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">On-Time Rate</p>
                              <p className={`text-2xl font-bold ${lightModeContentColor}`}>94%</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Avg Order Value</p>
                              <p className={`text-2xl font-bold ${lightModeContentColor}`}>$32.50</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-background/50 dark:bg-gray-700/50 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
                        <h4 className={`text-lg font-semibold ${lightModeTextColor} mb-4 flex items-center`}>
                          <Activity className={`h-6 w-6 mr-3 ${lightModeContentColor}`} />
                          Peak Hours Today
                        </h4>
                        <div className="space-y-3">
                          {[
                            { time: "12:00 PM - 2:00 PM", orders: 45, revenue: "$1,462" },
                            { time: "6:00 PM - 8:00 PM", orders: 52, revenue: "$1,690" },
                            { time: "8:00 PM - 10:00 PM", orders: 38, revenue: "$1,235" },
                            { time: "11:00 AM - 12:00 PM", orders: 28, revenue: "$910" },
                          ].map((period, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-background/30 dark:bg-gray-800/30 rounded-lg">
                              <div>
                                <p className="text-sm font-medium dark:text-gray-300">{period.time}</p>
                                <p className="text-xs text-muted-foreground">{period.orders} orders</p>
                              </div>
                              <p className={`text-sm font-bold ${lightModeContentColor}`}>{period.revenue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Slide Indicators */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setSlideIndex(0)}
              className={`h-2 rounded-full transition-all duration-300 ${
                slideIndex === 0
                  ? "w-8 bg-primary"
                  : "w-2 bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500"
              }`}
              aria-label="View categories/menu items and transactions"
            />
            <button
              onClick={() => setSlideIndex(1)}
              className={`h-2 rounded-full transition-all duration-300 ${
                slideIndex === 1
                  ? "w-8 bg-primary"
                  : "w-2 bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500"
              }`}
              aria-label="View performance metrics"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
