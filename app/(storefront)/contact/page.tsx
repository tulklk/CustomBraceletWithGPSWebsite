"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Mail, 
  Phone, 
  MapPin,
  Send,
  MessageSquare,
  User,
  Clock,
  CheckCircle2
} from "lucide-react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useToast } from "@/hooks/use-toast"

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(50, "Tên quá dài"),
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ").max(15, "Số điện thoại quá dài"),
  subject: z.string().min(1, "Vui lòng chọn chủ đề"),
  message: z.string().min(10, "Tin nhắn phải có ít nhất 10 ký tự").max(1000, "Tin nhắn quá dài"),
})

type ContactFormData = z.infer<typeof contactSchema>

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const sectionRef1 = useRef(null)
  const sectionRef2 = useRef(null)
  const sectionRef3 = useRef(null)
  
  const inView1 = useInView(sectionRef1, { once: true, margin: "-100px" })
  const inView2 = useInView(sectionRef2, { once: true, margin: "-100px" })
  const inView3 = useInView(sectionRef3, { once: true, margin: "-100px" })

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log("Contact form data:", data)
      
      // TODO: Replace with actual API call
      // await contactApi.submit(data)
      
      setIsSubmitted(true)
      form.reset()
      
      toast({
        title: "Gửi thành công!",
        description: "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.",
      })
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    } catch (error: any) {
      console.error("Error submitting contact form:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi tin nhắn. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Google Maps embed URL for the address
  // Using Google Maps search URL (works without API key)
  const mapAddress = encodeURIComponent("Lô E2a-7, Đường D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh")
  const mapUrl = `https://maps.google.com/maps?q=${mapAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        </motion.div>
        
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </motion.div>
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Liên hệ với chúng tôi
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy gửi tin nhắn cho chúng tôi!
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
          
          {/* Contact Information Cards */}
          <section ref={sectionRef1}>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={inView1 ? "visible" : "hidden"}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: Mail,
                  title: "Email",
                  content: "contact@artemis.vn",
                  href: "mailto:contact@artemis.vn",
                  color: "text-blue-500"
                },
                {
                  icon: Phone,
                  title: "Điện thoại",
                  content: "+84 123 456 789",
                  href: "tel:+84123456789",
                  color: "text-green-500"
                },
                {
                  icon: Clock,
                  title: "Giờ làm việc",
                  content: "Thứ 2 - Chủ nhật: 8:00 - 20:00",
                  href: null,
                  color: "text-orange-500"
                },
              ].map((contact, index) => {
                const Icon = contact.icon
                return (
                  <motion.div key={index} variants={scaleIn}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
                      <CardContent className="p-6 text-center">
                        <motion.div 
                          className="flex justify-center mb-4"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <motion.div 
                            className={`p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors ${contact.color}`}
                            animate={inView1 ? {
                              boxShadow: [
                                "0 0 0px rgba(236, 72, 153, 0)",
                                "0 0 20px rgba(236, 72, 153, 0.3)",
                                "0 0 0px rgba(236, 72, 153, 0)"
                              ]
                            } : "0 0 0px rgba(236, 72, 153, 0)"}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              delay: index * 0.3,
                              ease: "easeInOut"
                            }}
                          >
                            <Icon className="h-6 w-6" />
                          </motion.div>
                        </motion.div>
                        <h3 className="font-semibold mb-2">{contact.title}</h3>
                        {contact.href ? (
                          <a 
                            href={contact.href}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                          >
                            {contact.content}
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {contact.content}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </section>

          {/* Contact Form and Map */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <section ref={sectionRef2}>
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate={inView2 ? "visible" : "hidden"}
              >
                <Card className="hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 md:p-8">
                    <motion.h2 
                      className="text-2xl md:text-3xl font-bold mb-6 text-primary"
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      Gửi tin nhắn cho chúng tôi
                    </motion.h2>
                    
                    {isSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
                        </p>
                      </motion.div>
                    )}

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate={inView2 ? "visible" : "hidden"}
                        transition={{ delay: 0.3 }}
                      >
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Họ và tên *
                        </Label>
                        <Input
                          id="name"
                          {...form.register("name")}
                          placeholder="Nhập họ và tên của bạn"
                          className="mt-1"
                          disabled={isSubmitting}
                        />
                        {form.formState.errors.name && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.name.message}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate={inView2 ? "visible" : "hidden"}
                        transition={{ delay: 0.4 }}
                      >
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email")}
                          placeholder="your.email@example.com"
                          className="mt-1"
                          disabled={isSubmitting}
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate={inView2 ? "visible" : "hidden"}
                        transition={{ delay: 0.5 }}
                      >
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Số điện thoại *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...form.register("phone")}
                          placeholder="0123456789"
                          className="mt-1"
                          disabled={isSubmitting}
                        />
                        {form.formState.errors.phone && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.phone.message}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate={inView2 ? "visible" : "hidden"}
                        transition={{ delay: 0.6 }}
                      >
                        <Label htmlFor="subject" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Chủ đề *
                        </Label>
                        <Select
                          onValueChange={(value) => form.setValue("subject", value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Chọn chủ đề" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">Câu hỏi về sản phẩm</SelectItem>
                            <SelectItem value="order">Câu hỏi về đơn hàng</SelectItem>
                            <SelectItem value="warranty">Bảo hành & Sửa chữa</SelectItem>
                            <SelectItem value="shipping">Vận chuyển & Giao hàng</SelectItem>
                            <SelectItem value="payment">Thanh toán</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.subject && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.subject.message}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate={inView2 ? "visible" : "hidden"}
                        transition={{ delay: 0.7 }}
                      >
                        <Label htmlFor="message" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Tin nhắn *
                        </Label>
                        <Textarea
                          id="message"
                          {...form.register("message")}
                          placeholder="Nhập tin nhắn của bạn..."
                          className="mt-1 min-h-[120px]"
                          disabled={isSubmitting}
                        />
                        {form.formState.errors.message && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.message.message}
                          </p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.8 }}
                      >
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Đang gửi...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Gửi tin nhắn
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* Map Section */}
            <section ref={sectionRef3}>
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate={inView3 ? "visible" : "hidden"}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={inView3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="relative h-full min-h-[400px]"
                    >
                      <iframe
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0, minHeight: "400px" }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute inset-0"
                      />
                      <motion.div
                        className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <div className="flex items-start gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          </motion.div>
                          <div>
                            <h3 className="font-semibold mb-1">Địa chỉ văn phòng</h3>
                            <p className="text-sm text-muted-foreground">
                              Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>
          </div>

        </div>
      </div>
    </div>
  )
}

