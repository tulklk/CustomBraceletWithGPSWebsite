# KidTrack Bracelets - E-commerce Website

Website thương mại điện tử bán vòng tay theo dõi định vị trẻ em với tính năng **Customizer** và **Chat Box** đầy đủ.

## 🚀 Demo Features

### ✨ Tính năng chính

- **📍 Duyệt sản phẩm**: Danh sách vòng tay GPS với bộ lọc, thông số kỹ thuật
- **🎨 Customizer (Trình tùy biến)**:
  - Chọn template (Sport, Cute, Galaxy, Minimal, Ocean)
  - Chọn màu dây, mặt, viền (12 màu sắc)
  - Thêm phụ kiện (12 loại charm) với drag & drop
  - Khắc tên (tối đa 12 ký tự, 3 font chữ, 2 vị trí)
  - Preview live 2D
  - Tính giá động
- **💬 Chat Box (Chatbot hỗ trợ)**:
  - Floating widget
  - Auto-response theo từ khóa
  - Quick chips
  - Tạo ticket hỗ trợ
  - Lưu lịch sử chat (localStorage)
- **🛒 Giỏ hàng & Thanh toán**: Cart drawer, checkout mock
- **👤 Tài khoản**: Lưu thiết kế, quản lý đơn hàng (mock)
- **📱 Responsive**: Mobile-first design
- **🌓 Dark Mode**: Hỗ trợ theme sáng/tối
- **♿ Accessibility**: ARIA labels, keyboard navigation

---

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand (cart, customizer, user, chat)
- **Form Validation**: react-hook-form + zod
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **DateTime**: dayjs

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+ hoặc pnpm

### Cài đặt

```bash
# Clone repo (hoặc giải nén)
cd CustomizeBraceletWithGPSWebsite

# Cài đặt dependencies
pnpm install
# hoặc
npm install
# hoặc
yarn install

# Chạy dev server
pnpm dev
# hoặc
npm run dev

# Mở trình duyệt tại http://localhost:3000
```

---

## 📂 Cấu trúc dự án

```
.
├── app/
│   ├── (storefront)/           # Storefront layout group
│   │   ├── page.tsx            # Home page
│   │   ├── products/
│   │   │   ├── page.tsx        # Danh sách sản phẩm
│   │   │   └── [slug]/page.tsx # Chi tiết + Customizer
│   │   ├── cart/page.tsx       # Giỏ hàng
│   │   ├── checkout/page.tsx   # Thanh toán
│   │   ├── faq/page.tsx        # FAQ
│   │   ├── guides/page.tsx     # Hướng dẫn
│   │   └── account/page.tsx    # Thiết kế của tôi
│   ├── api/
│   │   ├── products/route.ts   # Mock API products
│   │   ├── templates/route.ts  # Mock API templates
│   │   ├── accessories/route.ts# Mock API accessories
│   │   └── orders/route.ts     # Mock API orders
│   ├── layout.tsx              # Root layout
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── Customizer/
│   │   ├── Canvas.tsx          # Preview 2D
│   │   ├── ColorPicker.tsx
│   │   ├── TemplatePicker.tsx
│   │   ├── AccessoryBoard.tsx  # Drag & drop phụ kiện
│   │   ├── EngraveForm.tsx     # Form khắc tên
│   │   └── PriceBar.tsx        # Tổng giá
│   ├── Chat/
│   │   ├── ChatWidget.tsx      # FAB button
│   │   └── ChatWindow.tsx      # Chat UI
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── CartDrawer.tsx
│   ├── AuthModal.tsx
│   └── ProductCard.tsx
├── store/
│   ├── useCart.ts              # Zustand cart store
│   ├── useCustomizer.ts        # Zustand customizer store
│   ├── useUser.ts              # Zustand user store (mock)
│   └── useChat.ts              # Zustand chat store
├── lib/
│   ├── types.ts                # TypeScript types
│   ├── utils.ts                # Utilities (cn, formatCurrency)
│   └── constants.ts            # Color palette, config
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 🎨 Customizer - Trình tùy biến vòng tay

### Cách hoạt động

1. **Chọn Template**: User chọn 1 trong 5 template (Sport, Cute, Galaxy, Minimal, Ocean)
2. **Chọn Màu**: Thay đổi màu dây/mặt/viền từ bảng 12 màu
3. **Thêm Phụ kiện**:
   - Hiển thị danh sách 12 charms (star, heart, bear, robot, unicorn, v.v.)
   - Mỗi charm có giá riêng (50k - 120k)
   - Click vào vị trí (↑↓←→) để thêm charm
   - Tối đa 6 charms, mỗi vị trí 1 charm
   - Validation: chỉ cho phép charm tương thích với vị trí
4. **Khắc Tên**:
   - Nhập tối đa 12 ký tự (A-Z, 0-9, space, dấu gạch)
   - Chọn font: Sans, Rounded, Mono
   - Chọn vị trí: Mặt trong hoặc Dây đeo
   - Phí: 50.000đ
5. **Preview Live**: SVG canvas cập nhật real-time khi thay đổi
6. **Tính giá**: Giá cơ bản + phụ kiện + khắc tên

### Code chính

- **Canvas**: `components/Customizer/Canvas.tsx` - SVG render preview
- **State**: `store/useCustomizer.ts` - Zustand store quản lý state
- **Validation**: zod schema trong EngraveForm

---

## 💬 Chat Box - Chatbot hỗ trợ

### Cách hoạt động

1. **Floating Button** (góc phải dưới): Click để mở chat
2. **Auto-response**:
   - Phát hiện từ khóa: "size", "bảo hành", "giao hàng", "khắc tên", v.v.
   - Trả về câu trả lời được định sẵn (markdown format)
3. **Quick Chips**: 4 nút gợi ý câu hỏi thường gặp
4. **Tạo Ticket**: Form gửi email + nội dung (mock)
5. **Lịch sử**: Lưu trong localStorage, hiển thị timestamp (dayjs)

### Code chính

- **Widget**: `components/Chat/ChatWidget.tsx` - FAB button
- **Window**: `components/Chat/ChatWindow.tsx` - Chat UI + logic
- **State**: `store/useChat.ts` - Zustand store + auto-response logic

### Bot responses

Các từ khóa được hỗ trợ:
- `size`, `cỡ`, `đo` → Bảng size
- `bảo hành`, `warranty` → Chính sách bảo hành
- `giao hàng`, `ship`, `thời gian` → Thời gian & phí ship
- `khắc`, `engrave`, `tên` → Hướng dẫn khắc tên
- `chống nước`, `waterproof` → IP67/IP68
- `pin`, `sạc`, `battery` → Thông tin pin

---

## 🗄️ Mock Data

### Products (2 SKU)

1. **KidTrack Mini**: IP67, 400mAh, từ 1.200.000đ
2. **KidTrack Active**: IP68, 500mAh, từ 1.800.000đ

### Templates (5 mẫu)

- Sport, Cute, Galaxy, Minimal, Ocean
- Mỗi template có giá base, màu mặc định, phụ kiện gợi ý

### Accessories (12 charms)

- Star (⭐), Heart (❤️), Bear (🧸), Robot (🤖), Unicorn (🦄), Soccer (⚽), Rocket (🚀), Planet (🪐), Dolphin (🐬), Shell (🐚), Crown (👑), Lightning (⚡)
- Giá từ 50k - 120k

---

## 🔌 Gắn Backend Thực

Dự án hiện dùng **mock API** (in-memory). Để gắn backend thật:

### 1. API Endpoints cần thay thế

```typescript
// Thay vì:
fetch('/api/products')

// Gọi API thật:
fetch('https://your-backend.com/api/products', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### 2. Cần thay đổi

- `app/api/**/route.ts` → Xóa hoặc giữ làm fallback
- `store/useCart.ts` → Gửi API khi add/update/remove
- `store/useUser.ts` → Gọi API login/register thật
- `app/(storefront)/checkout/page.tsx` → Tích hợp payment gateway (Stripe, PayPal, MoMo)

### 3. Khuyến nghị

- Dùng **React Query** hoặc **SWR** để cache & revalidate
- Thêm loading states, error handling
- Upload ảnh lên CDN (Cloudinary, AWS S3)
- Lưu `previewDataURL` (Canvas.toDataURL) để hiển thị thiết kế đã lưu

---

## 📱 Responsive & Accessibility

- **Mobile-first**: Tất cả UI đều responsive
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Dark Mode**: Toggle ở header, persist vào localStorage
- **A11y**:
  - ARIA labels trên mọi button
  - Keyboard navigation (Tab, Enter, Escape)
  - Focus visible
  - Color contrast ratio ≥ 4.5:1 (WCAG AA)

---

## 🎯 Scripts

```json
{
  "dev": "next dev",        // Chạy dev server (http://localhost:3000)
  "build": "next build",    // Build production
  "start": "next start",    // Chạy production server
  "lint": "next lint"       // Lint code
}
```

---

## 📄 License

Dự án demo cho mục đích học tập. Không sử dụng cho mục đích thương mại.

---

## 🙋 Support

- **Chat Box**: Click vào icon góc phải dưới
- **Email**: support@kidtrack.vn (demo)

---

## 🎉 Acceptance Checklist

- [x] `pnpm dev` chạy OK
- [x] Home page hiển thị đầy đủ
- [x] Products list & detail
- [x] Customizer hoạt động:
  - [x] Chọn template
  - [x] Đổi màu
  - [x] Thêm/xóa phụ kiện
  - [x] Khắc tên (validation)
  - [x] Tính giá động
  - [x] Preview live
- [x] Chat box:
  - [x] Mở/đóng mượt
  - [x] Auto-response theo keyword
  - [x] Quick chips
  - [x] Tạo ticket
  - [x] Lưu lịch sử (localStorage)
- [x] Cart & Checkout (mock)
- [x] Account: Lưu thiết kế
- [x] FAQ, Guides đầy đủ
- [x] Responsive mobile
- [x] Dark mode
- [x] TypeScript, code sạch

---

**Made with ❤️ for Kids Safety**

