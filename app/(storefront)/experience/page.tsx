"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Shield, MapPin, Clock, AlertCircle, CheckCircle2, Star, AlertTriangle, Palette } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { LostChildSimulation3D } from "@/components/LostChildSimulation3D"

export default function ExperiencePage() {
  const [activeStory, setActiveStory] = useState(0)

  const stories = [
    {
      title: "Khoảnh khắc đáng sợ nhất",
      subtitle: "Khi con bị lạc trong siêu thị",
      description: "Chị Minh kể: 'Tôi chỉ quay lưng 30 giây để lấy hàng. Khi quay lại, con tôi đã biến mất trong đám đông...'",
      image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
      emotion: "fearful"
    },
    {
      title: "3 phút hoảng loạn",
      subtitle: "Tìm kiếm tuyệt vọng",
      description: "Trái tim đập thình thịch. Tiếng kêu tên con vang khắp siêu thị. Mọi người xung quanh nhìn nhưng không ai biết con ở đâu.",
      image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80",
      emotion: "panic"
    },
    {
      title: "Giải pháp an tâm",
      subtitle: "Với vòng tay GPS ARTEMIS",
      description: "'Giờ đây, tôi luôn biết con mình ở đâu qua app trên điện thoại. An tâm tuyệt đối!' - Chị Minh",
      image: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800&q=80",
      emotion: "relieved"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Video Background */}
      <section className="relative h-[90vh] overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10" />
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container relative h-full flex flex-col justify-center py-12">
          <Button variant="ghost" asChild className="mb-6 w-fit">
            <Link href="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <Badge className="mb-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 text-sm">
              ✨ Trải nghiệm thực tế
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              Đừng để nỗi sợ<br />trở thành hiện thực
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              Mỗi năm, hàng triệu trẻ em bị lạc. Cảm giác hoảng loạn của ba mẹ và nỗi sợ hãi của con không thể tả.
              <span className="block mt-2 text-foreground font-semibold">
                Nhưng điều đó có thể ngăn chặn được.
              </span>
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="text-lg h-14 px-8" asChild>
                <Link href="/products">
                  <Shield className="mr-2 h-5 w-5" />
                  Bảo vệ con ngay
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-muted-foreground text-sm flex flex-col items-center gap-2"
          >
            <span>Cuộn xuống để tìm hiểu thêm</span>
            <div className="w-6 h-10 border-2 border-current rounded-full p-1">
              <div className="w-1 h-2 bg-current rounded-full mx-auto" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3D Simulation */}
      <section className="py-20 bg-gradient-to-b from-background to-red-50/30 dark:to-red-950/10">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-red-500 text-red-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Nội dung nghiêm túc - Chỉ dành cho phụ huynh
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Mô phỏng 3D: Nguy hiểm khi trẻ bị lạc
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trải nghiệm thực tế ảo về những tình huống nguy hiểm có thể xảy ra.
              Đây là lý do tại sao ARTEMIS GPS là thiết yếu.
            </p>
          </div>

          <LostChildSimulation3D />
        </div>
      </section>

      {/* Story Timeline */}
      <section className="py-20 bg-gradient-to-b from-red-50/30 to-accent/20 dark:from-red-950/10 dark:to-accent/20">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Câu chuyện có thật</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Một phút lơ là, một đời ân hận
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Đây là câu chuyện của hàng ngàn gia đình mỗi ngày
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {stories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card 
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-2xl ${
                    activeStory === index ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveStory(index)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-110 duration-500"
                      style={{ 
                        backgroundImage: `url(${story.image})`,
                      }}
                    />
                    <div className={`absolute inset-0 ${
                      story.emotion === 'fearful' ? 'bg-gradient-to-t from-red-900/90 to-red-900/30' :
                      story.emotion === 'panic' ? 'bg-gradient-to-t from-orange-900/90 to-orange-900/30' :
                      'bg-gradient-to-t from-green-900/90 to-green-900/30'
                    }`} />
                    
                    <div className="absolute top-4 right-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        story.emotion === 'fearful' ? 'bg-red-500/20 backdrop-blur' :
                        story.emotion === 'panic' ? 'bg-orange-500/20 backdrop-blur' :
                        'bg-green-500/20 backdrop-blur'
                      }`}>
                        {story.emotion === 'fearful' ? '😰' : story.emotion === 'panic' ? '😭' : '❤️'}
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <Badge className="mb-3">Phần {index + 1}</Badge>
                    <h3 className="text-2xl font-bold mb-2">{story.title}</h3>
                    <p className="text-sm text-primary font-semibold mb-3">{story.subtitle}</p>
                    <p className="text-muted-foreground italic leading-relaxed">
                      &ldquo;{story.description}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics with Images */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Sự thật đau lòng
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Những con số khiến mọi bậc phụ huynh phải suy ngẫm
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-600 mb-1">8 triệu</div>
                    <p className="text-sm text-muted-foreground">
                      trẻ em bị lạc mỗi năm trên toàn thế giới
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600 mb-1">40%</div>
                    <p className="text-sm text-muted-foreground">
                      trẻ em bị lạc trong các khu vui chơi công cộng
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                  <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-600 mb-1">90 phút</div>
                    <p className="text-sm text-muted-foreground">
                      thời gian trung bình để tìm lại trẻ bị lạc (không có GPS)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: "url(https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80)"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <p className="text-lg font-semibold mb-2">
                    &ldquo;Tôi không bao giờ quên cảm giác hoảng loạn khi không thấy con...&rdquo;
                  </p>
                  <p className="text-sm opacity-80">- Một bậc phụ huynh</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:order-2"
            >
              <Badge className="mb-4 bg-green-500 text-white">Giải pháp</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Với vòng tay GPS ARTEMIS
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Công nghệ bảo vệ con bạn mọi lúc, mọi nơi
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">99.9%</div>
                    <p className="text-sm text-muted-foreground">
                      độ chính xác định vị GPS/LBS
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">Tức thì</div>
                    <p className="text-sm text-muted-foreground">
                      biết vị trí con qua ứng dụng điện thoại
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">Free-Custom</div>
                    <p className="text-sm text-muted-foreground">
                       nhiều màu sắc và tự do khắc tên theo sở thích
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:order-1 relative"
            >
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: "url(https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800&q=80)"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-900/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-lg font-semibold mb-2">
                    &ldquo;Giờ đây tôi luôn yên tâm khi cho con đi chơi!&rdquo;
                  </p>
                  <p className="text-sm opacity-80">- Chị Minh, mẹ của bé An</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Câu chuyện từ các bậc phụ huynh
            </h2>
            <p className="text-lg text-muted-foreground">
              Hàng ngàn gia đình đã tin tưởng ARTEMIS
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Chị Nguyễn Thảo",
                role: "Mẹ của bé Minh, 6 tuổi",
                text: "Con tôi từng bị lạc 2 tiếng ở siêu thị. Khoảng thời gian đó là địa ngục. Giờ có ARTEMIS, tôi luôn yên tâm."
              },
              {
                name: "Anh Trần Hoàng",
                role: "Bố của bé An, 5 tuổi",
                text: "Lần đầu tiên con tôi đi chơi công viên, tôi hoảng loạn không thấy con đâu. May có vòng tay GPS, tìm được con chỉ sau 3 phút!"
              },
              {
                name: "Chị Lê Mai",
                role: "Mẹ của 2 bé",
                text: "Sản phẩm này không chỉ là công nghệ, mà là sự yên tâm cho ba mẹ. Trẻ thích đeo vì đẹp, mình yên tâm vì an toàn."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full p-6 hover:shadow-xl transition-shadow">
                  <div className="flex gap-1 text-yellow-400 mb-4">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic mb-6 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-pink-500/10 to-purple-500/10">
        <div className="container">
          <Card className="p-8 md:p-16 bg-gradient-to-br from-primary via-pink-500 to-purple-500 border-0 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Bảo vệ con yêu ngay hôm nay
              </h2>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                Đừng để nỗi lo lắng cướp đi những khoảnh khắc hạnh phúc bên con. 
                Với ARTEMIS, bạn luôn biết con mình an toàn ở đâu.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild className="text-lg h-14 px-8">
                  <Link href="/products">
                    <Shield className="mr-2 h-5 w-5" />
                    Xem sản phẩm
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg h-14 px-8 border-2 border-white bg-white text-primary hover:bg-white/90 hover:text-primary">
                  <Link href="/guides">
                    Tìm hiểu thêm
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Miễn phí giao hàng
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Bảo hành 12 tháng
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Hỗ trợ 24/7
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
