"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollAnimation, StaggerContainer, StaggerItem } from "@/components/ScrollAnimation"

export default function FAQPage() {
  const faqs = [
    {
      question: "Vòng tay có chống nước không?",
      answer:
        "Có! ARTEMIS Mini có chuẩn chống nước IP67 (chịu được rửa tay, mưa nhẹ). ARTEMIS Active có IP68, có thể bơi lội ở độ sâu 1.5m trong 30 phút. Tuy nhiên, nên tránh nước nóng, nước biển và hóa chất mạnh.",
    },
    {
      question: "Thời lượng pin là bao lâu?",
      answer:
        "Các sản phẩm có thời gian sử dụng trong một năm, khi hết pin thì sẽ được thay pin miễn phí.",
    },
    {
      question: "Có bảo hành bao lâu?",
      answer:
        "Chúng tôi bảo hành 12 tháng cho lỗi kỹ thuật, 6 tháng cho pin. Miễn phí thay dây đeo trong 3 tháng đầu. Hỗ trợ kỹ thuật trọn đời sản phẩm. Không bảo hành cho hư hỏng do rơi vỡ hoặc ngấm nước vượt chuẩn IP.",
    },
    {
      question: "Khắc tên có mất phí không?",
      answer:
        "Không, khắc tên hoàn toàn miễn phí. Bạn có thể khắc tối đa 12 ký tự (A-Z, 0-9, khoảng trắng, dấu gạch). Lưu ý: kiểm tra kỹ chính tả vì không hỗ trợ đổi trả nếu sai thông tin khắc.",
    },
    {
      question: "Thời gian giao hàng?",
      answer:
        "Nội thành Hà Nội/TP.HCM: 1-2 ngày (phí 30.000đ). Tỉnh thành khác: 3-5 ngày (phí 50.000đ). Miễn phí ship cho đơn từ 1.500.000đ. Đơn hàng custom cần thêm 1-2 ngày gia công.",
    },
    {
      question: "Có thể đổi trả không?",
      answer:
        "Có thể đổi trả trong vòng 7 ngày nếu sản phẩm lỗi kỹ thuật hoặc không đúng mô tả. Sản phẩm phải còn nguyên tem, chưa qua sử dụng. Lưu ý: Không hỗ trợ đổi trả sản phẩm đã khắc tên theo yêu cầu.",
    },
    {
      question: "Làm sao để chọn size phù hợp?",
      answer:
        "Dùng thước dây đo chu vi cổ tay trẻ, sau đó cộng thêm 1-1.5cm để thoải mái. Size S (12-14cm): 3-5 tuổi. Size M (14-16cm): 6-8 tuổi. Size L (16-18cm): 9-12 tuổi. Tham khảo thêm tại trang Hướng dẫn.",
    },
    {
      question: "Ứng dụng theo dõi có tính phí không?",
      answer:
        "Ứng dụng ARTEMIS (iOS/Android) hoàn toàn miễn phí.",
    },
  ]

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <ScrollAnimation direction="fade" className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Câu hỏi thường gặp</h1>
          <p className="text-muted-foreground text-lg">
            Tìm câu trả lời nhanh chóng cho các thắc mắc phổ biến
          </p>
        </ScrollAnimation>

        <Accordion type="single" collapsible className="space-y-4">
          <StaggerContainer>
            {faqs.map((faq, index) => (
              <StaggerItem key={index}>
                <AccordionItem
                  value={`item-${index}`}
                  className="border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Accordion>

        <ScrollAnimation delay={0.1} direction="up">
          <Card className="mt-12">
            <CardContent className="p-6 text-center space-y-3">
              <h2 className="text-xl font-semibold">Chưa tìm thấy câu trả lời?</h2>
              <p className="text-muted-foreground">
                Hãy liên hệ với chúng tôi qua chat hoặc email support@kidtrack.vn
              </p>
            </CardContent>
          </Card>
        </ScrollAnimation>
      </div>
    </div>
  )
}

