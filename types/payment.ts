// Payment request types
export interface CreatePaymentRequest {
  provider: string;
  returnUrl?: string;
  cancelUrl?: string;
}

// Payment response types (matching backend PaymentResponseDto)
export interface PaymentResponse {
  paymentUrl: string;
  orderId?: string;
  orderNumber?: string;
  isCod?: boolean;
  isBankTransfer?: boolean;
  bankTransferInfo?: BankTransferInfo | null;
}

export interface BankTransferInfo {
  qrDataUrl?: string;
  qrCode?: string;
  bankName?: string;
  accountNo?: string;
  accountName?: string;
  amount?: number;
  transferContent?: string;
}

// Error response types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: {
    message: string;
    statusCode: number;
  };
}

// PayOS callback query params (from return URL)
export interface PayOsCallbackParams {
  code?: string;
  id?: string;
  cancel?: string;
  status?: string;
  orderCode?: string | number;
}

