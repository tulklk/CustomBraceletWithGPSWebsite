"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  MapPin, 
  Battery, 
  Droplet, 
  Heart, 
  Sparkles,
  Target,
  Users,
  Award,
  Mail,
  Phone,
  MapPin as MapPinIcon
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

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

const iconRotate = {
  hover: { 
    rotate: [0, -10, 10, -10, 0],
    scale: 1.1,
    transition: { duration: 0.5 }
  }
}

export default function AboutPage() {
  const sectionRef1 = useRef(null)
  const sectionRef2 = useRef(null)
  const sectionRef3 = useRef(null)
  const sectionRef4 = useRef(null)
  const sectionRef5 = useRef(null)
  const sectionRef6 = useRef(null)
  
  const inView1 = useInView(sectionRef1, { once: true, margin: "-100px" })
  const inView2 = useInView(sectionRef2, { once: true, margin: "-100px" })
  const inView3 = useInView(sectionRef3, { once: true, margin: "-100px" })
  const inView4 = useInView(sectionRef4, { once: true, margin: "-100px" })
  const inView5 = useInView(sectionRef5, { once: true, margin: "-100px" })
  const inView6 = useInView(sectionRef6, { once: true, margin: "-100px" })

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
                <Badge className="mb-4 text-sm px-4 py-1">Về ARTEMIS</Badge>
              </motion.div>
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Giới thiệu về ARTEMIS
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Vòng tay thông minh giúp phụ huynh an tâm theo dõi con yêu mọi lúc mọi nơi
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
          
          {/* Giới thiệu chung */}
          <section ref={sectionRef1}>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate={inView1 ? "visible" : "hidden"}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 md:p-8">
                  <motion.h2 
                    className="text-2xl md:text-3xl font-bold mb-4 text-primary"
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    Chúng tôi là ai?
                  </motion.h2>
                  <motion.div 
                    className="space-y-4 text-muted-foreground leading-relaxed"
                    variants={staggerContainer}
                    initial="hidden"
                    animate={inView1 ? "visible" : "hidden"}
                  >
                    <motion.p variants={fadeInUp}>
                      ARTEMIS là thương hiệu chuyên về vòng tay thông minh định vị GPS dành cho trẻ em, 
                      được thiết kế với mục tiêu mang lại sự an tâm cho phụ huynh và niềm vui cho các bé.
                    </motion.p>
                    <motion.p variants={fadeInUp}>
                      Với công nghệ định vị GPS/LBS tiên tiến, thiết kế đáng yêu và tính năng tùy biến độc đáo, 
                      ARTEMIS không chỉ là một thiết bị theo dõi mà còn là món phụ kiện thời trang cá tính cho trẻ em.
                    </motion.p>
                    <motion.p variants={fadeInUp}>
                      Chúng tôi tin rằng mỗi đứa trẻ đều xứng đáng được bảo vệ và yêu thương. 
                      ARTEMIS ra đời với sứ mệnh giúp các bậc phụ huynh luôn có thể theo dõi và bảo vệ con yêu 
                      một cách dễ dàng và hiệu quả nhất.
                    </motion.p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Sứ mệnh & Tầm nhìn */}
          <section ref={sectionRef2} className="grid md:grid-cols-2 gap-6">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate={inView2 ? "visible" : "hidden"}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 md:p-8">
                  <motion.div 
                    className="flex items-center gap-3 mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <motion.div 
                      className="p-3 rounded-full bg-primary/10"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Target className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="text-xl md:text-2xl font-bold">Sứ mệnh</h3>
                  </motion.div>
                  <motion.p 
                    className="text-muted-foreground leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={inView2 ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    Mang lại giải pháp theo dõi trẻ em an toàn, hiện đại và dễ sử dụng, 
                    giúp phụ huynh luôn an tâm về sự an toàn của con yêu trong mọi hoàn cảnh.
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate={inView2 ? "visible" : "hidden"}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 md:p-8">
                  <motion.div 
                    className="flex items-center gap-3 mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <motion.div 
                      className="p-3 rounded-full bg-primary/10"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Sparkles className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="text-xl md:text-2xl font-bold">Tầm nhìn</h3>
                  </motion.div>
                  <motion.p 
                    className="text-muted-foreground leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={inView2 ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    Trở thành thương hiệu hàng đầu về thiết bị theo dõi trẻ em tại Việt Nam, 
                    được tin dùng bởi hàng triệu gia đình nhờ chất lượng sản phẩm và dịch vụ xuất sắc.
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Tính năng nổi bật */}
          <section ref={sectionRef3}>
            <motion.h2 
              className="text-2xl md:text-3xl font-bold mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              Tính năng nổi bật
            </motion.h2>
            <motion.div 
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate={inView3 ? "visible" : "hidden"}
            >
              {[
                { icon: MapPin, title: "Định vị GPS/LBS", desc: "Theo dõi vị trí chính xác trong thời gian thực, giúp phụ huynh luôn biết con đang ở đâu" },
                { icon: Droplet, title: "Chống nước IP67", desc: "Bé có thể đeo vòng tay khi tắm, rửa tay mà không lo hỏng hóc" },
                { icon: Battery, title: "Pin lâu dài", desc: "Pin 400mAh, sử dụng liên tục 3-5 ngày, không cần sạc thường xuyên" },
                { icon: Sparkles, title: "Tùy biến độc đáo", desc: "Chọn màu sắc, thêm phụ kiện, khắc tên theo sở thích của bé" },
                { icon: Shield, title: "An toàn tuyệt đối", desc: "Vật liệu an toàn, không chứa chất độc hại, phù hợp cho trẻ em" },
                { icon: Heart, title: "Thiết kế đáng yêu", desc: "Họa tiết Bunny dễ thương, màu sắc tươi sáng, bé sẽ rất thích đeo" },
              ].map((feature, index) => {
                const Icon = feature.icon
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
                            className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors"
                            animate={{ 
                              boxShadow: inView3 ? [
                                "0 0 0px rgba(236, 72, 153, 0)",
                                "0 0 20px rgba(236, 72, 153, 0.3)",
                                "0 0 0px rgba(236, 72, 153, 0)"
                              ] : "0 0 0px rgba(236, 72, 153, 0)"
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              delay: index * 0.3,
                              ease: "easeInOut"
                            }}
                          >
                            <Icon className="h-8 w-8 text-primary" />
                          </motion.div>
                        </motion.div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          </section>

          {/* Tại sao chọn ARTEMIS */}
          <section ref={sectionRef4}>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate={inView4 ? "visible" : "hidden"}
            >
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 md:p-8">
                  <motion.h2 
                    className="text-2xl md:text-3xl font-bold mb-6 text-center text-primary"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={inView4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    Tại sao chọn ARTEMIS?
                  </motion.h2>
                  <motion.div 
                    className="grid md:grid-cols-2 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate={inView4 ? "visible" : "hidden"}
                  >
                    <div className="space-y-4">
                      <motion.div 
                        className="flex items-start gap-3 group"
                        variants={fadeInUp}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        </motion.div>
                        <div>
                          <h4 className="font-semibold mb-1">Chất lượng hàng đầu</h4>
                          <p className="text-sm text-muted-foreground">
                            Sản phẩm được sản xuất theo tiêu chuẩn quốc tế, đảm bảo độ bền và độ chính xác cao
                          </p>
                        </div>
                      </motion.div>
                      <motion.div 
                        className="flex items-start gap-3 group"
                        variants={fadeInUp}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        </motion.div>
                        <div>
                          <h4 className="font-semibold mb-1">Đội ngũ hỗ trợ chuyên nghiệp</h4>
                          <p className="text-sm text-muted-foreground">
                            Luôn sẵn sàng hỗ trợ khách hàng 24/7, giải đáp mọi thắc mắc nhanh chóng
                          </p>
                        </div>
                      </motion.div>
                    </div>
                    <div className="space-y-4">
                      <motion.div 
                        className="flex items-start gap-3 group"
                        variants={fadeInUp}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        </motion.div>
                        <div>
                          <h4 className="font-semibold mb-1">Bảo hành chính hãng</h4>
                          <p className="text-sm text-muted-foreground">
                            Chính sách bảo hành rõ ràng, đổi trả dễ dàng nếu sản phẩm có lỗi
                          </p>
                        </div>
                      </motion.div>
                      <motion.div 
                        className="flex items-start gap-3 group"
                        variants={fadeInUp}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        </motion.div>
                        <div>
                          <h4 className="font-semibold mb-1">Giá cả hợp lý</h4>
                          <p className="text-sm text-muted-foreground">
                            Sản phẩm chất lượng với mức giá phù hợp, phù hợp với mọi gia đình Việt Nam
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Sản phẩm */}
          <section ref={sectionRef5}>
            <motion.h2 
              className="text-2xl md:text-3xl font-bold mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              Sản phẩm của chúng tôi
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate={inView5 ? "visible" : "hidden"}
            >
              {[
                { title: "Vòng tay thông minh", desc: "Thiết kế vòng tay với nhiều mẫu mã đa dạng, từ màu sắc đến họa tiết" },
                { title: "Dây chuyền", desc: "Dây chuyền định vị với mặt dây đáng yêu, phù hợp cho cả bé trai và bé gái" },
                { title: "Pin kẹp quần áo", desc: "Thiết kế nhỏ gọn, kẹp vào quần áo, phù hợp cho các bé nhỏ tuổi" },
              ].map((product, index) => (
                <motion.div key={index} variants={scaleIn}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold mb-2 text-lg">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {product.desc}
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button asChild variant="outline" size="sm">
                          <Link href="/products">Xem sản phẩm</Link>
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Thông tin liên hệ */}
          <section ref={sectionRef6}>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate={inView6 ? "visible" : "hidden"}
            >
              <Card className="hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 md:p-8">
                  <motion.h2 
                    className="text-2xl md:text-3xl font-bold mb-6 text-center text-primary"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={inView6 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    Liên hệ với chúng tôi
                  </motion.h2>
                  <motion.div 
                    className="grid md:grid-cols-3 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate={inView6 ? "visible" : "hidden"}
                  >
                    {[
                      { icon: Mail, title: "Email", content: "contact@artemis.vn", href: "mailto:contact@artemis.vn" },
                      { icon: Phone, title: "Điện thoại", content: "+84 123 456 789", href: "tel:+84123456789" },
                      { icon: MapPinIcon, title: "Địa chỉ", content: "Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh", href: null },
                    ].map((contact, index) => {
                      const Icon = contact.icon
                      return (
                        <motion.div 
                          key={index} 
                          className="flex flex-col items-center text-center"
                          variants={scaleIn}
                          whileHover={{ y: -5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <motion.div 
                            className="p-4 rounded-full bg-primary/10 mb-4"
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            animate={inView6 ? {
                              boxShadow: [
                                "0 0 0px rgba(236, 72, 153, 0)",
                                "0 0 15px rgba(236, 72, 153, 0.4)",
                                "0 0 0px rgba(236, 72, 153, 0)"
                              ]
                            } : "0 0 0px rgba(236, 72, 153, 0)"}
                            transition={{
                              boxShadow: {
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.3,
                                ease: "easeInOut"
                              },
                              scale: { duration: 0.5 },
                              rotate: { duration: 0.5 }
                            }}
                          >
                            <Icon className="h-6 w-6 text-primary" />
                          </motion.div>
                          <h3 className="font-semibold mb-2">{contact.title}</h3>
                          {contact.href ? (
                            <a 
                              href={contact.href}
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {contact.content}
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {contact.content}
                            </p>
                          )}
                        </motion.div>
                      )
                    })}
                  </motion.div>
                  <motion.div 
                    className="mt-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView6 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button asChild size="lg">
                        <Link href="/contact">Gửi tin nhắn cho chúng tôi</Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

        </div>
      </div>
    </div>
  )
}

