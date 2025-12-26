// User Stats
export interface UserStats {
  totalOrders: number;
  savedDesigns: number;
  totalSpent: number;
}

// User Profile Response
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  avatar: string | null;
  role: number; // 0: Customer, 1: Admin
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  stats: UserStats | null;
}

// Update Profile Request
export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  avatar?: string | null;
}

// Change Password Request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// API Error Response
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

