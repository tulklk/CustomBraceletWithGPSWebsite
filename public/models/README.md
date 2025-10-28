# 3D Models

Đặt các file 3D model (.glb, .gltf) của vòng tay vào đây.

## Quy ước đặt tên (QUAN TRỌNG):
Template ID → Tên file GLB tương ứng:

- `bunny-baby-pink` → `bracelet-bunny-pink.glb`
- `bunny-lavender` → `bracelet-bunny-lavendar.glb` (lưu ý: lavendar không có e)
- `bunny-yellow` → `bracelet-bunny-yellow.glb`
- `bunny-mint` → `bracelet-bunny-mint.glb`
- `bunny-pink` → `bracelet-bunny-green.glb` (template bunny-pink hiển thị model green)

## Hướng dẫn:
1. Copy các file .glb vào thư mục này
2. Đảm bảo tên file khớp với mapping ở trên
3. Component Canvas3D sẽ tự động load model theo template được chọn

## Cấu trúc:
```
public/models/
  ├── bracelet-bunny-pink.glb
  ├── bracelet-bunny-lavendar.glb
  ├── bracelet-bunny-yellow.glb
  ├── bracelet-bunny-mint.glb
  ├── bracelet-bunny-green.glb
  └── README.md
```

