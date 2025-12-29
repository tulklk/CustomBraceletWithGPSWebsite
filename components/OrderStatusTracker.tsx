"use client"

import { useEffect } from "react"
import { Package, CheckCircle2, Truck, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderStatusTrackerProps {
  orderStatus: number // 0: Pending, 1: Confirmed, 2: Processing, 3: Shipped, 4: Delivered, 5: Cancelled
}

const statusSteps = [
  {
    id: 0,
    label: "ĐANG XỬ LÝ",
    icon: Package,
    orderStatusValue: 0, // Pending/Processing
  },
  {
    id: 1,
    label: "ĐÃ XÁC NHẬN",
    icon: CheckCircle2,
    orderStatusValue: 1, // Confirmed
  },
  {
    id: 2,
    label: "ĐÃ CHUẨN BỊ HÀNG",
    icon: Package,
    orderStatusValue: 2, // Processing/Preparing
  },
  {
    id: 3,
    label: "ĐÃ GIAO CHO ĐƠN VỊ VẬN CHUYỂN",
    icon: Truck,
    orderStatusValue: 3, // Shipped
  },
  {
    id: 4,
    label: "HOÀN THÀNH",
    icon: Home,
    orderStatusValue: 4, // Delivered/Completed
  },
]

export function OrderStatusTracker({ orderStatus }: OrderStatusTrackerProps) {
  // Inject shimmer keyframes one lần vào <head>
  useEffect(() => {
    const styleId = "order-status-shimmer-style"
    if (document.getElementById(styleId)) return

    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      @keyframes orderStatusShimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      .order-status-shimmer {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.8) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: orderStatusShimmer 2s linear infinite;
        opacity: 0.7;
        pointer-events: none;
      }

      @keyframes orderStatusPulse {
        0% {
          box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
          transform: translateY(0) scale(1);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(236, 72, 153, 0);
          transform: translateY(-1px) scale(1.05);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(236, 72, 153, 0);
          transform: translateY(0) scale(1);
        }
      }

      .order-status-active-glow {
        animation: orderStatusPulse 1.8s ease-out infinite;
      }
    `
    document.head.appendChild(style)
  }, [])

  // Don't show tracker for cancelled orders
  if (orderStatus === 5) {
    return null
  }

  // Determine current step index based on orderStatus
  // Mapping theo account/page.tsx và logic đơn hàng:
  // 0: Pending -> "Chờ xử lý" -> Step 0 (ĐANG XỬ LÝ) - đơn mới, bắt đầu xử lý
  // 1: Confirmed -> "Đã xác nhận" -> Step 1 (ĐÃ XÁC NHẬN) - đã xác nhận đơn
  // 2: Processing -> "Đang xử lý" -> Step 2 (ĐÃ CHUẨN BỊ HÀNG) - đang xử lý = đang chuẩn bị hàng
  // 3: Shipped -> "Đang giao" -> Step 3 (ĐÃ GIAO CHO ĐƠN VỊ VẬN CHUYỂN) - đang giao = đã giao cho đơn vị vận chuyển
  // 4: Delivered -> "Đã giao" -> Step 4 (HOÀN THÀNH) - đã giao = hoàn thành
  const getCurrentStepIndex = (): number => {
    // Map orderStatus to step index
    if (orderStatus === 0) return 0 // Pending -> ĐANG XỬ LÝ
    if (orderStatus === 1) return 1 // Confirmed -> ĐÃ XÁC NHẬN
    if (orderStatus === 2) return 2 // Processing -> ĐÃ CHUẨN BỊ HÀNG
    if (orderStatus === 3) return 3 // Shipped -> ĐÃ GIAO CHO ĐƠN VỊ VẬN CHUYỂN
    if (orderStatus === 4) return 4 // Delivered -> HOÀN THÀNH
    return 0 // Default to first step
  }

  const currentStepIndex = getCurrentStepIndex()

  // Tính phần trăm line hồng (0% -> 100%), dùng để tô gradient
  // Mapping tay cho đẹp giống design
  const getProgressPercent = () => {
    if (currentStepIndex === 0) return 30 // ĐANG XỬ LÝ
    if (currentStepIndex === 1) return 50 // ĐÃ XÁC NHẬN
    if (currentStepIndex === 2) return 70 // ĐÃ CHUẨN BỊ HÀNG
    if (currentStepIndex === 3) return 90 // ĐÃ GIAO CHO ĐƠN VỊ VẬN CHUYỂN
    return 100 // HOÀN THÀNH
  }

  const progressPercent = getProgressPercent()

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-pink-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <div className="text-pink-600">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </div>
          <span className="text-sm font-medium text-pink-700">Trạng thái đơn hàng</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div
          className="absolute top-6 left-0 right-0 h-2 rounded-full overflow-hidden"
          style={{
            // Gradient: hồng từ 0 -> progressPercent, xám từ progressPercent -> 100
            background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${progressPercent}%, #e5e7eb ${progressPercent}%, #e5e7eb 100%)`,
          }}
        >
          {/* Lớp shimmer chỉ chạy trên phần hồng (dùng width = progressPercent%) */}
          <div
            className="order-status-shimmer"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const isActive = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            const Icon = step.icon

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                {/* Icon Circle */}
                <div
                  className={cn(
                    "relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                    isCurrent
                      ? "bg-pink-500 border-2 border-white shadow-lg order-status-active-glow"
                      : isActive
                        ? "bg-pink-100 border-2 border-pink-500"
                        : "bg-white border-2 border-gray-300"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors duration-300",
                      isCurrent
                        ? "text-white"
                        : isActive
                          ? "text-pink-600"
                          : "text-gray-400"
                    )}
                  />
                </div>

                {/* Label */}
                <div className="mt-3 text-center max-w-[120px]">
                  <p
                    className={cn(
                      "text-xs font-medium transition-colors duration-300",
                      isCurrent || isActive ? "text-pink-600" : "text-gray-500"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

