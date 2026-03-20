# ARTEMIS Bracelets — GPS Website

Website bán vòng tay định vị cho trẻ em, tối ưu trải nghiệm từ lúc khách xem sản phẩm đến lúc đặt hàng và quản trị vận hành cửa hàng.

## Dành cho nhà tuyển dụng (TL;DR)
- Kết hợp **2D/3D preview** sản phẩm với **Three.js** và **customizer (Zustand)**.
- Luồng **khắc tên (engraving)** có validation, đưa trực tiếp vào **design/cart/checkout**.
- **AI Chatbot** dạng floating, duy trì phiên hội thoại bằng `sessionId`, trả về `suggestedProducts`.
- Checkout hỗ trợ **COD** và **PayOS** kèm xử lý callback (`/payment/success`, `/payment/cancel`).
- Admin có dashboard + reports (chart), CRUD sản phẩm/template/accessories/orders/vouchers/news/users/settings.

## Frontend (trang người dùng)

### Các trang/chức năng chính
- `GET /` Trang chủ: giới thiệu thương hiệu, sản phẩm nổi bật và nội dung trải nghiệm (có mô phỏng 3D ở `Experience`).
- `GET /products` Danh sách sản phẩm (phân loại + tìm kiếm).
- `GET /products/category/[slug]` Lọc sản phẩm theo category.
- `GET /products/[slug]` Chi tiết sản phẩm: toggle **2D/3D**, hiển thị rating tổng quan, tab `CHI TIẾT SẢN PHẨM` + `ĐÁNH GIÁ`, wishlist dạng tim khi đăng nhập, và chỉ hiện khắc tên khi `product.hasEngraving`.
- `GET /cart` Giỏ hàng: cập nhật số lượng, xóa item, hiển thị design đi kèm (templateId/màu/engraving nếu có).
- `GET /checkout` Checkout: nhập địa chỉ (load tỉnh/thành phố + phường/xã), áp voucher, chọn `COD` hoặc `PayOS`.
- `GET /order-lookup` Tra cứu trạng thái đơn (guest) bằng mã đơn.
- `GET /order/success?orderId=...` Thành công COD/chuyển khoản (dựa trên `orderId`).
- `GET /payment/success?orderId=...` Thành công PayOS (dựa trên callback).
- `GET /payment/cancel?orderId=...` Bị hủy PayOS (dựa trên callback).
- `GET /account` Tài khoản: overview, orders (danh sách + dialog xem chi tiết), security (đổi mật khẩu), address (CRUD + set mặc định), wishlist, settings (cập nhật cá nhân + upload avatar), dialog chi tiết đơn kèm shipping address và engraving text nếu có.
- `GET /verify-email` Xác thực email: tự verify bằng token hoặc gửi lại email xác thực.
- Nội dung/policy: `GET /faq`, `GET /guides`, `GET /warranty`, `GET /returns`, `GET /terms`, `GET /privacy`, `GET /contact`, `GET /about`, `GET /experience`, `GET /news`, `GET /news/[slug]`.

### 2D/3D Preview trên trang chi tiết sản phẩm
- Toggle `2D`/`3D` trên trang.
- `2D Preview`: gallery ảnh sản phẩm (thumbnail + điều hướng).
- `3D Preview`: ưu tiên render theo `product.model3DUrl`; nếu không có `model3DUrl` và có customizer thì fallback sang `Canvas3D` (OrbitControls: kéo xoay, scroll zoom).
- `Canvas3D`: lấy dữ liệu từ Zustand `useCustomizer` (templateId/màu/engraving), render model GLB và overlay/plate khắc tên.

### Engraving (khắc tên) — chỉ khi sản phẩm hỗ trợ
- Hiển thị qua component `EngravingSection` khi `product.hasEngraving`.
- Chuyển uppercase tự động, giới hạn độ dài (mặc định 12).
- Validate qua `validateEngravingText`.
- Có nút “Lưu” để validate/lưu nội dung khắc.
- Nội dung khắc được gắn vào design khi thêm vào `cart/checkout`.

### Đánh giá & bình luận sản phẩm
- Tab `ĐÁNH GIÁ`: tổng rating + breakdown 5 sao + danh sách review.
- Dialog “ĐÁNH GIÁ NGAY”: chọn sao (1–5), nhập comment, bắt buộc họ tên + số điện thoại, email tùy chọn.
- Upload ảnh thực tế: checkbox “Gửi ảnh thực tế”, validate `image/*`, giới hạn size (<= 5MB/ảnh).
- Upload ảnh lên Cloudinary qua route `/api/upload` (backend dùng 1 URL ảnh).
- Checkbox “Lưu thông tin…” để lưu họ tên/email vào `localStorage`.
- Comment được tổ chức theo thread (build comment tree).

### AI Chatbot (ARTEMIS)
- Widget chat floating (mở/đóng).
- Gửi tin nhắn: `POST ${NEXT_PUBLIC_API_URL}/api/Chat/message` kèm `sessionId` để duy trì hội thoại.
- Backend trả về `message` và `suggestedProducts`.
- UI hiển thị lịch sử chat (persist bằng Zustand + localStorage), có quick chips khi hội thoại ngắn (<= 2 tin nhắn), có nút xóa lịch sử và nút đóng chat.

### Giỏ hàng & Checkout
- Cart: lưu item/design trong Zustand và đồng bộ với backend cart endpoint khi cần; tăng/giảm số lượng và xóa item.
- Voucher: áp dụng qua `ordersApi.applyVoucher`, hỗ trợ cả user đăng nhập và guest checkout.
- Thanh toán: `COD` tạo order rồi điều hướng `/order/success`; `PayOS` tạo payment link qua `paymentService.createPayment` rồi redirect tới flow PayOS; callback hiển thị ở `/payment/success` và `/payment/cancel` (component `PaymentStatus` + hook `usePayOsCallback`).
- Checkout: dùng `provincesApi` để load tỉnh/thành phố và phường/xã tương ứng.

### Tra cứu đơn (guest)
- `GET /order-lookup`: nhập mã đơn, gọi `ordersApi.getGuestOrderStatus`, hiển thị trạng thái + phương thức thanh toán + tổng tiền.

### Xác thực email
- `GET /verify-email`: nếu có `token` thì gọi `authApi.verifyEmail`; nếu mới đăng ký thì cho phép “Gửi lại email xác thực” bằng `authApi.resendVerification`.

## Admin (khu quản trị)

Các trang admin nằm trong group `app/(admin)/admin/...`.

### Dashboard & thống kê
- `GET /admin`: bảng thống kê + biểu đồ doanh thu + đơn gần đây.
- `GET /admin/reports`: báo cáo theo khoảng ngày (recharts) + top sản phẩm theo doanh thu.

### Quản lý đơn hàng
- `GET /admin/orders`: danh sách đơn (lọc theo trạng thái), xem chi tiết qua dialog, cập nhật trạng thái đơn (`adminApi.orders.updateStatus`), hiển thị `paymentStatus`.

### Quản lý sản phẩm & nội dung
- `GET /admin/products`: CRUD sản phẩm (ImageUpload), tùy chọn `model3DUrl`, quản lý variants, engraving flags, stock và `isActive`.
- `GET /admin/templates`: quản lý template thiết kế (basePrice + defaultColors).
- `GET /admin/accessories`: quản lý charm/phụ kiện (icon emoji, giá, vị trí tương thích).
- `GET /admin/categories`: quản lý category + subcategories.
- `GET /admin/news`: quản lý tin/tóm tắt/nội dung (rich text), thumbnail upload, publish/unpublish.

### Khuyến mãi & tài khoản
- `GET /admin/vouchers`: quản lý voucher (tìm kiếm, filter published/hidden, copy code, xóa, sửa theo `/admin/vouchers/[id]`).
- `GET /admin/vouchers/new`: tạo voucher mới (Percent/Amount, giới hạn dùng, min/max, thời gian hiệu lực, published).
- `GET /admin/users`: quản lý người dùng (role/status + xóa).
- `GET /admin/customers`: trang khách hàng (hiện dùng dữ liệu mock trong UI).

### Cài đặt hệ thống cửa hàng
- `GET /admin/settings`: tab `Chung`, `Cửa hàng`, `Vận chuyển`, `Thanh toán` (COD/chuyển khoản/VNPay…).

## Backend API / routes
Endpoint frontend đang dùng hoặc proxy:
- `app/api/products/...` (sản phẩm, sold-quantity, rating).
- `app/api/templates/...` (template).
- `app/api/accessories/...` (charms).
- `app/api/cart/...` (cart).
- `app/api/orders/...` (orders + apply voucher).
- `app/api/guest/orders/...` (guest checkout + payment).
- `app/api/news/child-abduction/...` (nội dung child abduction).
- `app/api/provinces` (tỉnh/thành phố).
- `app/api/upload` (upload ảnh lên Cloudinary).

## Tech Stack
- Next.js 14 (App Router) + TypeScript.
- TailwindCSS + shadcn/ui.
- Zustand (cart/customizer/user/chat).
- react-hook-form + zod.
- Framer Motion, Lucide React, dayjs.
- Three.js qua `@react-three/fiber` và `@react-three/drei`.
- Charts: `recharts`.
- Cloudinary upload qua route `/api/upload`.

## Setup & chạy dự án
- Yêu cầu: Node.js 18+.
- `npm install` hoặc `pnpm install`.
- `npm run dev` hoặc `pnpm dev`.
- Mặc định: `http://localhost:3000`.

## Env thường dùng
- `NEXT_PUBLIC_API_URL`: base URL backend cho các call như Chat/Orders/Auth...
- `NEXT_PUBLIC_BASE_URL`: base URL dùng cho return/cancel URL PayOS (fallback khi không set).
- Cloudinary upload:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (hoặc `CLOUDINARY_CLOUD_NAME`).
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (hoặc `CLOUDINARY_UPLOAD_PRESET`).

## Notes
- Một số chức năng phụ thuộc cấu hình backend và các biến môi trường (đặc biệt: Chat, Orders, Payment PayOS, Upload Cloudinary).

