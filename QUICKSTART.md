# ⚡ Quick Start - 5 phút để chạy dự án

## 📋 Prerequisites

Đảm bảo bạn đã cài:
- **Node.js 18+** (https://nodejs.org)
- **pnpm** (khuyến nghị) hoặc npm

Cài pnpm (nếu chưa có):
```bash
npm install -g pnpm
```

---

## 🚀 Chạy dự án (3 bước)

### Bước 1: Cài đặt
```bash
pnpm install
```

### Bước 2: Chạy
```bash
pnpm dev
```

### Bước 3: Mở trình duyệt
```
http://localhost:3000
```

**✅ XONG!** Website đã sẵn sàng.

---

## 🎯 Thử ngay 5 tính năng chính

### 1️⃣ Customizer (Tùy biến vòng tay)
- Vào: http://localhost:3000/products/kidtrack-mini
- Chọn template **"Sport"**
- Đổi màu dây → **xanh dương**
- Thêm phụ kiện: Click **⭐ Star** → Click nút **↑**
- Khắc tên: Nhập **"KIDTRACK"** → Click **"Lưu khắc tên"**
- Xem giá cập nhật → Click **"Thêm vào giỏ"**

### 2️⃣ Chat Box (Chatbot)
- Click icon **💬** góc phải dưới
- Gõ: **"tư vấn size"** → Enter
- Bot trả lời bảng size ngay lập tức
- Thử: "bảo hành", "giao hàng", "khắc tên"

### 3️⃣ Giỏ hàng
- Click icon **🛒** trên header
- Xem sản phẩm vừa thêm
- Tăng/giảm số lượng
- Click **"Thanh toán"**

### 4️⃣ Checkout (Mock)
- Điền thông tin:
  - Tên: **Nguyễn Văn A**
  - Email: **test@example.com**
  - SĐT: **0901234567**
  - Địa chỉ: **123 Đường ABC**
  - Tỉnh: **Hà Nội**
- Chọn phương thức thanh toán
- Click **"Đặt hàng (Mock)"**
- Nhận thông báo thành công!

### 5️⃣ Lưu thiết kế
- Click **"Đăng nhập"** (góc phải)
- Nhập email + tên bất kỳ
- Vào Customizer → Click **"Lưu"**
- Vào http://localhost:3000/account
- Xem thiết kế đã lưu

---

## 🐛 Gặp lỗi?

### Lỗi: Port 3000 đã được sử dụng
```bash
# Chạy ở port khác
pnpm dev -- -p 3001
```

### Lỗi: Module not found
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Dark mode không hoạt động
- Mở DevTools (F12)
- Console → Gõ: `localStorage.clear()`
- Reload trang (F5)

---

## 📱 Test Responsive

1. Mở DevTools (F12)
2. Click icon **📱** (Toggle device toolbar)
3. Chọn **iPhone 14 Pro** hoặc **Galaxy S20**
4. Test tất cả tính năng

---

## 🎨 Tùy chỉnh màu sắc

Đổi màu chính (primary):
```css
/* File: app/globals.css */
:root {
  --primary: 221.2 83.2% 53.3%; /* Xanh dương (mặc định) */
  
  /* Thử: */
  /* --primary: 142 76% 36%; */ /* Xanh lá */
  /* --primary: 347 77% 50%; */ /* Đỏ */
  /* --primary: 271 91% 65%; */ /* Tím */
}
```

---

## 📚 Cấu trúc quan trọng

```
app/
├── (storefront)/        ← Tất cả trang người dùng
│   ├── page.tsx        ← Home
│   ├── products/       ← Sản phẩm
│   ├── cart/           ← Giỏ hàng
│   └── checkout/       ← Thanh toán
├── api/                ← Mock API
components/
├── Customizer/         ← Trình tùy biến
├── Chat/               ← Chat box
└── ui/                 ← shadcn/ui components
store/
├── useCart.ts          ← Zustand cart
├── useCustomizer.ts    ← Zustand customizer
├── useUser.ts          ← Zustand user
└── useChat.ts          ← Zustand chat
```

---

## 🔥 Các trang quan trọng

| URL | Mô tả |
|-----|-------|
| `/` | Home page |
| `/products` | Danh sách sản phẩm |
| `/products/kidtrack-mini` | Customizer |
| `/cart` | Giỏ hàng |
| `/checkout` | Thanh toán |
| `/account` | Thiết kế đã lưu |
| `/faq` | FAQ |
| `/guides` | Hướng dẫn |

---

## 💡 Tips

1. **localStorage** lưu:
   - `kidtrack-cart` → Giỏ hàng
   - `kidtrack-user` → User + thiết kế đã lưu
   - `kidtrack-chat` → Lịch sử chat

2. **Clear data**:
   ```javascript
   // Browser console (F12)
   localStorage.clear()
   location.reload()
   ```

3. **Dark mode**: Click icon **🌙** trên header

---

## 🎉 Next Steps

- Đọc `README.md` để hiểu chi tiết kiến trúc
- Xem `SETUP.md` cho troubleshooting
- Tham khảo `/lib/types.ts` để hiểu data structure
- Khám phá `/components/Customizer` để học cách Customizer hoạt động

---

**Happy Hacking! 🚀**

Need help? Check out the Chat Box! 💬

