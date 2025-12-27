import { ApiError } from "@/types/payment"

export function handlePaymentError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as ApiError).message
  }

  return "An unexpected error occurred"
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("Network") || error.message.includes("fetch")
  }
  return false
}

export function getErrorStatusCode(error: unknown): number {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    return (error as ApiError).statusCode
  }
  return 500
}

