// Engraving API Types

export interface EngravingInfo {
  isFree: boolean
  maxLength: number
  allowedCharacters: string
  description: string
}

export interface ValidateEngravingTextResult {
  isValid: boolean
  errorMessage: string | null
  maxLength: number
  allowedCharacters: string
}

