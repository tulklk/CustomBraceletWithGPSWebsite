# 🚀 Hướng dẫn Setup Nhanh

## Bước 1: Cài đặt Dependencies

```bash
# Sử dụng pnpm (khuyến nghị)
pnpm install

# Hoặc npm
npm install

# Hoặc yarn
yarn install
```

## Bước 2: Chạy Development Server

```bash
pnpm dev
# hoặc
npm run dev
```

Server sẽ chạy tại: **http://localhost:3000**

## Bước 3: Khám phá Website

### 🏠 Trang chính
- `/` - Home page
- `/products` - Danh sách sản phẩm
- `/products/kidtrack-mini` - Chi tiết + Customizer
- `/products/kidtrack-active` - Chi tiết + Customizer

### 🛒 Shopping Flow
1. Vào `/products/kidtrack-mini`
2. Chọn template (ví dụ: **Sport**)
3. Đổi màu (dây, mặt, viền)
4. Thêm phụ kiện (click nút ↑↓←→)
5. Khắc tên (nhập text, chọn font)
6. Xem giá cập nhật live
7. Click **"Thêm vào giỏ"**
8. Mở giỏ hàng (icon góc phải)
9. Click **"Thanh toán"**
10. Điền form → **"Đặt hàng (Mock)"**

### 💬 Chat Box
- Click icon **💬** góc phải dưới
- Thử gõ: "tư vấn size", "bảo hành", "giao hàng", "khắc tên"
- Click **"Tạo ticket"** để test form

### 👤 Tài khoản
1. Click **"Đăng nhập"** (góc phải)
2. Nhập email + tên bất kỳ (demo)
3. Vào `/account` để xem thiết kế đã lưu
4. Click **"Lưu"** khi customizer để lưu thiết kế

---

## 🎯 Test Checklist

- [ ] Home page hiển thị đầy đủ
- [ ] Products list load OK
- [ ] Customizer:
  - [ ] Chọn template
  - [ ] Đổi màu → preview cập nhật
  - [ ] Thêm phụ kiện → hiển thị trên canvas
  - [ ] Khắc tên (test validation: nhập >12 ký tự, ký tự đặc biệt)
  - [ ] Giá tính đúng
- [ ] Chat:
  - [ ] Mở/đóng
  - [ ] Gõ "size" → nhận bảng size
  - [ ] Quick chips hoạt động
  - [ ] Tạo ticket
- [ ] Cart:
  - [ ] Thêm sản phẩm
  - [ ] Update số lượng
  - [ ] Xóa sản phẩm
  - [ ] Persist sau khi reload
- [ ] Checkout:
  - [ ] Điền form (validation)
  - [ ] Đặt hàng → toast thành công
  - [ ] Cart clear
- [ ] Account:
  - [ ] Đăng nhập mock
  - [ ] Lưu thiết kế
  - [ ] Xem/xóa thiết kế
- [ ] Dark mode toggle

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module..."
```bash
rm -rf node_modules
rm pnpm-lock.yaml # hoặc package-lock.json
pnpm install
```

### Lỗi: "Module not found: Can't resolve '@/...' "
Kiểm tra `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Dark mode không hoạt động
- Clear localStorage
- Reload trang
- Check browser console

### localStorage bị đầy
```javascript
// Mở browser console, chạy:
localStorage.clear()
location.reload()
```

---

## 📦 Build Production

```bash
pnpm build
pnpm start

# Hoặc deploy lên Vercel
vercel
```

---

## 🎨 Customization

### Đổi màu chính (Primary color)
File: `app/globals.css`
```css
:root {
  --primary: 221.2 83.2% 53.3%; /* HSL */
}
```

### Thêm template mới
File: `app/api/templates/route.ts`
```typescript
{
  id: 'my-template',
  name: 'My Template',
  basePrice: 1300000,
  defaultColors: { band: 'red', face: 'white', rim: 'black' },
  recommendedAccessories: ['star'],
  preview: '/images/templates/my-template.svg',
}
```

### Thêm phụ kiện mới
File: `app/api/accessories/route.ts`
```typescript
{
  id: 'flower',
  name: 'Hoa',
  price: 60000,
  icon: '🌸',
  compatiblePositions: ['top', 'bottom'],
}
```

---

## 📚 Tech Docs

- [Next.js 14 Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://zustand-demo.pmnd.rs)
- [TailwindCSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

---

**Happy Coding! 🎉**

