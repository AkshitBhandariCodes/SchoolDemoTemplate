"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Upload, X, User, Camera, GraduationCap } from "lucide-react"
import SplitText from "./blocks/TextAnimations/SplitText/SplitText"
import Carousel from './blocks/Components/Carousel/Carousel'

// Note: Make sure to replace your existing Carousel component with the new stylish version

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export function Admission() {
  const [submitStatus, setSubmitStatus] = useState(null)
  const [studentData, setStudentData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)
  
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      course: "",
      admissionYear: "",
      city: "",
      address: "",
      photo: null,
    },
  })

  // Fetch students data for carousel
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admissions?limit=50&sortBy=applicationDate&sortOrder=desc`)
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.data) {
          // Transform student data for carousel
          const carouselItems = result.data.map((student, index) => ({
            id: student.id || index,
            title: student.title || student.name,
            description: student.description || `${student.course} - ${student.city} (${student.admissionYear})`,
            icon: getStudentIcon(student.course),
            photo: student.photo || null,
            name: student.name,
            course: student.course,
            city: student.city,
            admissionYear: student.admissionYear,
            email: student.email,
            status: student.status,
            studentData: student // Keep original data for reference
          }))
          
          setStudentData(carouselItems)
        }
      } else {
        console.error('Failed to fetch students:', response.statusText)
        // Set default items if API fails
        setStudentData([{
          id: 1,
          title: "No Students Yet",
          description: "Be the first to register!",
          icon: "🎓"
        }])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      // Set default items if API fails
      setStudentData([{
        id: 1,
        title: "Registration System",
        description: "Submit your application to see students here",
        icon: "📝"
      }])
    } finally {
      setLoading(false)
    }
  }

  // Load students on component mount and when form is submitted successfully
  useEffect(() => {
    fetchStudents()
  }, [refreshTrigger])

  // Helper function to get appropriate icon based on course
  const getStudentIcon = (course) => {
    if (!course) return "🎓"
    
    const courseIcons = {
      'computer science': '💻',
      'engineering': '⚙️',
      'business': '💼',
      'medicine': '🏥',
      'arts': '🎨',
      'science': '🔬',
      'mathematics': '📊',
      'physics': '⚛️',
      'chemistry': '⚗️',
      'biology': '🧬',
      'english': '📚',
      'history': '📜',
      'psychology': '🧠',
      'economics': '💰',
      'law': '⚖️',
      'technology': '🔧',
      'design': '🎨',
      'marketing': '📈',
      'finance': '💰',
      'architecture': '🏗️',
      'music': '🎵',
      'sports': '⚽',
      'agriculture': '🌱'
    }

    const courseLower = course.toLowerCase()
    for (const [key, icon] of Object.entries(courseIcons)) {
      if (courseLower.includes(key)) {
        return icon
      }
    }
    return '🎓' // Default graduation cap icon
  }

  // Handle photo selection and preview
  const handlePhotoSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSubmitStatus({
          type: "error",
          message: "Please select a valid image file (JPG, PNG, GIF, etc.)"
        })
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitStatus({
          type: "error",
          message: "Image size must be less than 5MB"
        })
        return
      }

      setSelectedPhoto(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
      
      // Clear any previous errors
      setSubmitStatus(null)
    }
  }

  // Remove selected photo
  const removePhoto = () => {
    setSelectedPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Convert file to base64 for storage
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  const onSubmit = async (data) => {
    try {
      setSubmitStatus(null) // Clear previous status
      setUploadingPhoto(true)
      
      let photoData = null
      
      // Convert photo to base64 if selected
      if (selectedPhoto) {
        try {
          photoData = await fileToBase64(selectedPhoto)
        } catch (error) {
          console.error('Error converting photo:', error)
          setSubmitStatus({
            type: "error",
            message: "Error processing photo. Please try again."
          })
          setUploadingPhoto(false)
          return
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/admissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          admissionYear: parseInt(data.admissionYear), // Ensure year is a number
          photo: photoData // Include base64 photo data
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus({ 
          type: "success", 
          message: result.message || "Application submitted successfully! 🎉" 
        })
        form.reset()
        removePhoto() // Clear photo
        // Refresh carousel data
        setRefreshTrigger(prev => prev + 1)
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => setSubmitStatus(null), 5000)
      } else {
        setSubmitStatus({ 
          type: "error", 
          message: result.message || "Failed to submit application. Please try again." 
        })
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus({ 
        type: "error", 
        message: "Network error. Please check your connection and try again." 
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  return (
    <>
      <div className="text-center text-6xl text-orange-500 font-bold p-5 bg-black">
        <SplitText
          text="Admission and Students"
          className="text-center text-6xl text-orange-500 font-bold p-5 bg-black"
          delay={50}
          duration={0.3}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
        />
      </div>
      
      <div className="flex justify-between h-auto w-screen bg-black">
        {/* Form Section */}
        <div className="text-black w-1/2 h-auto p-10">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="text-3xl text-center font-bold tracking-wide">
                🎓 Student Admission Form
              </CardTitle>
              <p className="text-center text-orange-100 mt-2">
                Join our academic community today!
              </p>
            </CardHeader>
            <CardContent className="p-8">
              {submitStatus && (
                <Alert 
                  variant={submitStatus.type === "error" ? "destructive" : "default"} 
                  className={`mb-6 border-2 ${
                    submitStatus.type === "error" 
                      ? "border-red-300 bg-red-50 text-red-800" 
                      : "border-green-300 bg-green-50 text-green-800"
                  } rounded-xl shadow-md`}
                >
                  <AlertDescription className="font-medium text-base">
                    {submitStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Photo Upload Section */}
                  <div className="text-center">
                    <FormLabel className="text-lg font-semibold text-gray-700 mb-4 block">
                      📸 Profile Photo
                    </FormLabel>
                    <div className="flex flex-col items-center space-y-4">
                      {photoPreview ? (
                        <div className="relative">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-orange-300 shadow-lg"
                          />
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Camera size={40} className="text-gray-400" />
                        </div>
                      )}
                      
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <Upload size={20} className="mr-2" />
                          {photoPreview ? 'Change Photo' : 'Upload Photo'}
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Max size: 5MB • Formats: JPG, PNG, GIF
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      rules={{ 
                        required: "Name is required",
                        minLength: { value: 2, message: "Name must be at least 2 characters" }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold flex items-center">
                            <User size={18} className="mr-2 text-orange-500" />
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Please enter a valid email address",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold flex items-center">
                            📧 Email Address *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email address" 
                              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="course"
                      rules={{ 
                        required: "Course is required",
                        minLength: { value: 2, message: "Course must be at least 2 characters" }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold flex items-center">
                            📚 Desired Course *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Computer Science" 
                              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="admissionYear"
                      rules={{
                        required: "Admission year is required",
                        min: { value: 2020, message: "Year must be 2020 or later" },
                        max: { value: 2030, message: "Year must be 2030 or earlier" },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold flex items-center">
                            📅 Admission Year *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 2024"
                              min="2020"
                              max="2030"
                              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value) || "")}
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="city"
                    rules={{ 
                      required: "City is required",
                      minLength: { value: 2, message: "City must be at least 2 characters" }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold flex items-center">
                          🌆 City *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your city" 
                            className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    rules={{ 
                      required: "Address is required",
                      minLength: { value: 10, message: "Address must be at least 10 characters" }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold flex items-center">
                          🏠 Full Address *
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your complete address with postal code" 
                            className="min-h-[120px] border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 font-medium" />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-center pt-4">
                    <Button 
                      type="submit" 
                      disabled={form.formState.isSubmitting || uploadingPhoto}
                      className="w-full md:w-2/3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {form.formState.isSubmitting || uploadingPhoto ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Submitting Application...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          🚀 Submit Application
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Carousel Section */}
        <div className="w-1/2 flex items-center justify-center">
          <div className="p-10">
            {loading ? (
              <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-900 to-black rounded-3xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <div className="text-white text-xl font-semibold">Loading Students...</div>
                  <div className="text-gray-300 text-sm mt-2">Please wait while we fetch student data</div>
                </div>
              </div>
            ) : (
              <Carousel
                items={studentData}
                baseWidth={700}
                autoplay={studentData.length > 1}
                autoplayDelay={4000}
                pauseOnHover={true}
                loop={studentData.length > 1}
                round={false}
              />
            )}
            
            {/* Student Count Display */}
            <div className="text-center mt-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl shadow-lg inline-block">
                <div className="flex items-center gap-2">
                  <GraduationCap size={20} />
                  <span className="text-lg font-bold">
                    {loading ? 
                      "Loading..." : 
                      `${studentData.length} ${studentData.length === 1 ? 'Student' : 'Students'} Registered`
                    }
                  </span>
                </div>
                {!loading && studentData.length > 0 && (
                  <div className="text-orange-100 text-sm mt-1">
                    Welcome to our academic community! 🎉
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Admission