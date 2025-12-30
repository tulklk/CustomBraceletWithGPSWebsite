import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ChatMessage, SuggestedProduct } from '@/lib/types'
import dayjs from 'dayjs'

interface ChatStore {
  messages: ChatMessage[]
  isOpen: boolean
  sessionId: string | null
  addMessage: (role: 'user' | 'assistant', content: string, suggestedProducts?: SuggestedProduct[]) => void
  clearMessages: () => void
  toggleChat: () => void
  setOpen: (open: boolean) => void
  setSessionId: (sessionId: string | null) => void
  getAutoResponse: (userMessage: string) => string
}

export const useChat = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      isOpen: false,
      sessionId: null,

      addMessage: (role, content, suggestedProducts) => {
        const message: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random()}`,
          role,
          content,
          timestamp: dayjs().toISOString(),
          suggestedProducts: suggestedProducts && suggestedProducts.length > 0 ? suggestedProducts : undefined,
        }
        set({ messages: [...get().messages, message] })
      },

      clearMessages: () => {
        set({ messages: [], sessionId: null })
      },

      setSessionId: (sessionId) => {
        set({ sessionId })
      },

      toggleChat: () => {
        set({ isOpen: !get().isOpen })
      },

      setOpen: (open) => {
        set({ isOpen: open })
      },

      getAutoResponse: (userMessage: string) => {
        const msg = userMessage.toLowerCase()
        
        if (msg.includes('size') || msg.includes('cỡ') || msg.includes('đo')) {
          return `📏 **Hướng dẫn chọn size vòng tay:**

- **Size S (12-14cm)**: Trẻ 3-5 tuổi
- **Size M (14-16cm)**: Trẻ 6-8 tuổi  
- **Size L (16-18cm)**: Trẻ 9-12 tuổi

**Cách đo:** Dùng thước dây quấn quanh cổ tay trẻ, cộng thêm 1-1.5cm để thoải mái.`
        }
        
        if (msg.includes('bảo hành') || msg.includes('warranty')) {
          return `🛡️ **Chính sách bảo hành:**

- Bảo hành **12 tháng** lỗi kỹ thuật
- Bảo hành **6 tháng** cho pin
- Miễn phí thay dây đeo trong 3 tháng đầu
- Hỗ trợ kỹ thuật trọn đời sản phẩm

Không bảo hành cho hư hỏng do rơi vỡ, ngấm nước (nếu vượt chuẩn IP).`
        }
        
        if (msg.includes('giao hàng') || msg.includes('ship') || msg.includes('thời gian')) {
          return `🚚 **Thời gian & phí giao hàng:**

- **Nội thành Hà Nội/TP.HCM**: 1-2 ngày, phí 30.000đ
- **Tỉnh thành khác**: 3-5 ngày, phí 50.000đ
- **Miễn phí** ship cho đơn từ 1.500.000đ

Đơn hàng tùy chỉnh (custom) cần thêm 1-2 ngày gia công.`
        }
        
        if (msg.includes('khắc') || msg.includes('engrave') || msg.includes('tên')) {
          return `✏️ **Hướng dẫn khắc tên:**

- Tối đa **12 ký tự** (A-Z, 0-9, khoảng trắng, dấu gạch)
- 3 font chữ: Sans (hiện đại), Rounded (tròn), Mono (đều)
- Vị trí: mặt trong hoặc dây đeo
- Phí khắc: **50.000đ**

Lưu ý: Kiểm tra kỹ chính tả trước khi đặt, không hỗ trợ đổi trả nếu sai thông tin khắc.`
        }
        
        if (msg.includes('chống nước') || msg.includes('waterproof')) {
          return `💧 **Khả năng chống nước:**

- **IP67**: Chống nước rửa tay, mưa nhẹ (không bơi)
- **IP68**: Chống nước bơi, tắm (độ sâu 1.5m, tối đa 30 phút)

⚠️ Tránh nước nóng, nước biển, hóa chất mạnh.`
        }

        if (msg.includes('pin') || msg.includes('sạc') || msg.includes('battery')) {
          return `🔋 **Thông tin pin:**

- Dung lượng: 400mAh
- Thời lượng: 3-5 ngày sử dụng thường
- Sạc đầy: ~2 giờ (cáp USB từ tính kèm theo)
- Chế độ tiết kiệm pin: lên tới 7 ngày`
        }

        return `Xin chào! 👋 Tôi có thể giúp bạn về:

🔹 Tư vấn size vòng tay
🔹 Chính sách bảo hành
🔹 Thời gian giao hàng  
🔹 Cách khắc tên
🔹 Khả năng chống nước

Hoặc bạn có thể **Tạo ticket** để nhân viên hỗ trợ trực tiếp!`
      },
    }),
    {
      name: 'artemis-chat',
      partialize: (state) => ({ messages: state.messages, sessionId: state.sessionId }),
    }
  )
)

