"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export function PlanAccessForm({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    planData: {} as Record<string, any>,
  })

  // Check for existing questionnaire data on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.__questionnaire_data) {
      const questionnaireData = window.__questionnaire_data

      // Store all questionnaire data in planData
      setFormData((prev) => ({
        ...prev,
        planData: questionnaireData,
      }))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const isFormValid = () => {
    return formData.businessName && formData.contactName && formData.email && formData.phone
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Add any additional information from the questionnaire if available
      if (typeof window !== "undefined" && window.__questionnaire_data) {
        setFormData((prev) => ({
          ...prev,
          planData: {
            ...prev.planData,
            ...window.__questionnaire_data,
          },
        }))
      }

      const response = await fetch("/api/plan-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.")
      }

      setIsSuccess(true)
      toast.success(data.message || "Your plan request has been submitted successfully!")

      // Close the form after a delay
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (error) {
      console.error("Submission error:", error)
      setError(error instanceof Error ? error.message : "Failed to submit request. Please try again.")
      toast.error(error instanceof Error ? error.message : "Failed to submit request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Render form content
  const renderFormContent = () => {
    return (
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="businessName">
            Business Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            placeholder="Your company name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contactName">
            Contact Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleInputChange}
            placeholder="Your full name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Your phone number"
            required
          />
        </div>

        {formData.planData && formData.planData.recommendedPlan && (
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/20 mt-4">
            <h4 className="font-medium mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              Selected Plan
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {formData.planData.recommendedPlan.includes("tier") ? 
                  formData.planData.recommendedPlan.replace(/tier(\d)/, (match, num) => {
                    const tierNames = {
                      "1": "Starter",
                      "2": "Growth",
                      "3": "Professional",
                      "4": "Business",
                    };
                    return tierNames[num] || match;
                  }) : 
                  formData.planData.recommendedPlan
                }
              </span>
              <Badge variant="outline" className="bg-primary/10">
                {formData.planData.billingPreference === "annual" ? "Annual" : "Quarterly"}
              </Badge>
            </div>
            {formData.planData.monthlyPrice && (
              <div className="mt-2 text-sm text-muted-foreground">
                {formData.planData.billingPreference === "annual"
                  ? `$${Math.round(formData.planData.annualPrice / 12)}/month (billed annually)`
                  : `$${formData.planData.monthlyPrice}/month`}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start mt-4">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isSuccess && (
          <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-3 rounded-md flex items-start mt-4">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              Your plan request has been submitted successfully! Our team will contact you shortly to discuss next
              steps.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Your Plan</DialogTitle>
          <DialogDescription>
            Complete your information to get started with your selected plan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {renderFormContent()}
        </form>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading || isSuccess}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || isSuccess || !isFormValid()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submitted!
              </>
            ) : (
              "Request Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
