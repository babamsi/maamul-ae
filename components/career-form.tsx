"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface JobApplication {
  fullName: string
  email: string
  phone: string
  location: string
  position: string
  experience: string
  coverLetter: string
  portfolio?: string
  linkedin?: string
  availability: string
  salary: string
  remote: boolean
  resume?: File
}

interface CareerFormProps {
  position: string
  onClose: () => void
}

export function CareerForm({ position, onClose }: CareerFormProps) {
  const [formData, setFormData] = useState<JobApplication>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    position: position,
    experience: "",
    coverLetter: "",
    portfolio: "",
    linkedin: "",
    availability: "",
    salary: "",
    remote: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<JobApplication>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<JobApplication> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Experience level is required"
    }

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required"
    }

    if (!formData.availability.trim()) {
      newErrors.availability = "Availability is required"
    }

    if (!formData.salary.trim()) {
      newErrors.salary = "Salary expectation is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof JobApplication, value: string | boolean | File) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "boolean") {
            submitData.append(key, value.toString())
          } else if (value instanceof File) {
            submitData.append(key, value)
          } else {
            submitData.append(key, value.toString())
          }
        }
      })

      const response = await fetch("/api/careers/apply", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        throw new Error("Failed to submit application")
      }

      toast.success("Application submitted successfully! We'll be in touch soon.")
      onClose()
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error("Failed to submit application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Apply for {position}</CardTitle>
        <CardDescription>
          Fill out the form below to apply for this position. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, Country"
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience Level *</Label>
            <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
              <SelectTrigger className={errors.experience ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
              </SelectContent>
            </Select>
            {errors.experience && <p className="text-sm text-red-500">{errors.experience}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input
                id="portfolio"
                value={formData.portfolio}
                onChange={(e) => handleInputChange("portfolio", e.target.value)}
                placeholder="https://your-portfolio.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="availability">Availability *</Label>
              <Select value={formData.availability} onValueChange={(value) => handleInputChange("availability", value)}>
                <SelectTrigger className={errors.availability ? "border-red-500" : ""}>
                  <SelectValue placeholder="When can you start?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Immediately</SelectItem>
                  <SelectItem value="2weeks">2 weeks notice</SelectItem>
                  <SelectItem value="1month">1 month notice</SelectItem>
                  <SelectItem value="2months">2+ months</SelectItem>
                </SelectContent>
              </Select>
              {errors.availability && <p className="text-sm text-red-500">{errors.availability}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary Expectation *</Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => handleInputChange("salary", e.target.value)}
                placeholder="e.g., $50,000 - $70,000"
                className={errors.salary ? "border-red-500" : ""}
              />
              {errors.salary && <p className="text-sm text-red-500">{errors.salary}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume/CV</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleInputChange("resume", file)
              }}
            />
            <p className="text-sm text-gray-500">Upload your resume in PDF, DOC, or DOCX format (max 5MB)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter}
              onChange={(e) => handleInputChange("coverLetter", e.target.value)}
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              rows={6}
              className={errors.coverLetter ? "border-red-500" : ""}
            />
            {errors.coverLetter && <p className="text-sm text-red-500">{errors.coverLetter}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={formData.remote}
              onCheckedChange={(checked) => handleInputChange("remote", checked as boolean)}
            />
            <Label htmlFor="remote">I'm interested in remote work opportunities</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
