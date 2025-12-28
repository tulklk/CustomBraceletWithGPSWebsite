/**
 * Comprehensive caching system for API responses
 * Supports memory cache, localStorage, and sessionStorage
 */

// Cache entry interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Cache configuration
interface CacheConfig {
  ttl?: number // Time to live in milliseconds
  useLocalStorage?: boolean // Whether to persist to localStorage
  useSessionStorage?: boolean // Whether to persist to sessionStorage
  storageKey?: string // Custom storage key
}

// Default TTL values (in milliseconds)
const DEFAULT_TTL = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  PRODUCT_DETAIL: 10 * 60 * 1000, // 10 minutes
  CATEGORIES: 30 * 60 * 1000, // 30 minutes
  PROVINCES: 24 * 60 * 60 * 1000, // 24 hours
  ORDERS: 2 * 60 * 1000, // 2 minutes
  USER: 5 * 60 * 1000, // 5 minutes
  CART: 1 * 60 * 1000, // 1 minute
}

// Memory cache (in-memory storage)
const memoryCache = new Map<string, CacheEntry<any>>()

// Storage keys prefix
const STORAGE_PREFIX = "artemis_cache_"

/**
 * Get cache key from URL and options
 */
function getCacheKey(url: string, options?: RequestInit): string {
  const method = options?.method || "GET"
  const body = options?.body ? JSON.stringify(options.body) : ""
  return `${method}:${url}:${body}`
}

/**
 * Get storage key
 */
function getStorageKey(cacheKey: string, customKey?: string): string {
  return customKey || `${STORAGE_PREFIX}${cacheKey}`
}

/**
 * Check if cache entry is still valid
 */
function isValid<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  if (!entry) return false
  return Date.now() < entry.expiresAt
}

/**
 * Get from memory cache
 */
function getFromMemory<T>(key: string): CacheEntry<T> | null {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  
  if (!isValid(entry)) {
    memoryCache.delete(key)
    return null
  }
  
  return entry
}

/**
 * Set to memory cache
 */
function setToMemory<T>(key: string, data: T, ttl: number): void {
  const now = Date.now()
  memoryCache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + ttl,
  })
}

/**
 * Get from localStorage
 */
function getFromLocalStorage<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined") return null
  
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null
    
    const entry = JSON.parse(stored) as CacheEntry<T>
    if (!isValid(entry)) {
      localStorage.removeItem(key)
      return null
    }
    
    return entry
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return null
  }
}

/**
 * Set to localStorage
 */
function setToLocalStorage<T>(key: string, data: T, ttl: number): void {
  if (typeof window === "undefined") return
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("LocalStorage quota exceeded, clearing old cache entries")
      clearOldCacheEntries()
      // Try again
      try {
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          expiresAt: Date.now() + ttl,
        }
        localStorage.setItem(key, JSON.stringify(entry))
      } catch (retryError) {
        console.error("Failed to save to localStorage after cleanup:", retryError)
      }
    } else {
      console.error("Error writing to localStorage:", error)
    }
  }
}

/**
 * Get from sessionStorage
 */
function getFromSessionStorage<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined") return null
  
  try {
    const stored = sessionStorage.getItem(key)
    if (!stored) return null
    
    const entry = JSON.parse(stored) as CacheEntry<T>
    if (!isValid(entry)) {
      sessionStorage.removeItem(key)
      return null
    }
    
    return entry
  } catch (error) {
    console.error("Error reading from sessionStorage:", error)
    return null
  }
}

/**
 * Set to sessionStorage
 */
function setToSessionStorage<T>(key: string, data: T, ttl: number): void {
  if (typeof window === "undefined") return
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    }
    sessionStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    console.error("Error writing to sessionStorage:", error)
  }
}

/**
 * Clear old cache entries from localStorage
 */
function clearOldCacheEntries(): void {
  if (typeof window === "undefined") return
  
  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()
    let cleared = 0
    
    for (const key of keys) {
      if (key.startsWith(STORAGE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key)
          if (stored) {
            const entry = JSON.parse(stored) as CacheEntry<any>
            if (now >= entry.expiresAt) {
              localStorage.removeItem(key)
              cleared++
            }
          }
        } catch {
          // Invalid entry, remove it
          localStorage.removeItem(key)
          cleared++
        }
      }
    }
    
    // If still too many entries, remove oldest ones
    if (cleared < 10) {
      const cacheEntries: Array<{ key: string; timestamp: number }> = []
      
      for (const key of keys) {
        if (key.startsWith(STORAGE_PREFIX)) {
          try {
            const stored = localStorage.getItem(key)
            if (stored) {
              const entry = JSON.parse(stored) as CacheEntry<any>
              cacheEntries.push({ key, timestamp: entry.timestamp })
            }
          } catch {
            // Skip invalid entries
          }
        }
      }
      
      // Sort by timestamp and remove oldest 20%
      cacheEntries.sort((a, b) => a.timestamp - b.timestamp)
      const toRemove = Math.floor(cacheEntries.length * 0.2)
      
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(cacheEntries[i].key)
      }
    }
  } catch (error) {
    console.error("Error clearing old cache entries:", error)
  }
}

/**
 * Cached fetch function
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  config?: CacheConfig
): Promise<T> {
  const cacheKey = getCacheKey(url, options)
  const storageKey = getStorageKey(cacheKey, config?.storageKey)
  const ttl = config?.ttl || DEFAULT_TTL.PRODUCTS
  
  // Try memory cache first (fastest)
  const memoryEntry = getFromMemory<T>(cacheKey)
  if (memoryEntry) {
    return memoryEntry.data
  }
  
  // Try localStorage if enabled
  if (config?.useLocalStorage) {
    const localStorageEntry = getFromLocalStorage<T>(storageKey)
    if (localStorageEntry) {
      // Also update memory cache
      setToMemory(cacheKey, localStorageEntry.data, ttl)
      return localStorageEntry.data
    }
  }
  
  // Try sessionStorage if enabled
  if (config?.useSessionStorage) {
    const sessionStorageEntry = getFromSessionStorage<T>(storageKey)
    if (sessionStorageEntry) {
      // Also update memory cache
      setToMemory(cacheKey, sessionStorageEntry.data, ttl)
      return sessionStorageEntry.data
    }
  }
  
  // Fetch from API
  const response = await fetch(url, options)
  const data = await response.json()
  
  if (!response.ok) {
    throw data
  }
  
  // Store in all enabled caches
  setToMemory(cacheKey, data, ttl)
  
  if (config?.useLocalStorage) {
    setToLocalStorage(storageKey, data, ttl)
  }
  
  if (config?.useSessionStorage) {
    setToSessionStorage(storageKey, data, ttl)
  }
  
  return data as T
}

/**
 * Invalidate cache entry
 */
export function invalidateCache(url: string, options?: RequestInit, storageKey?: string): void {
  const cacheKey = getCacheKey(url, options)
  const storageKeyToUse = storageKey || getStorageKey(cacheKey)
  
  // Remove from memory
  memoryCache.delete(cacheKey)
  
  // Remove from localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(storageKeyToUse)
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
    
    // Remove from sessionStorage
    try {
      sessionStorage.removeItem(storageKeyToUse)
    } catch (error) {
      console.error("Error removing from sessionStorage:", error)
    }
  }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  // Clear memory cache
  memoryCache.clear()
  
  // Clear localStorage cache
  if (typeof window !== "undefined") {
    try {
      const keys = Object.keys(localStorage)
      for (const key of keys) {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
    
    // Clear sessionStorage cache
    try {
      const keys = Object.keys(sessionStorage)
      for (const key of keys) {
        if (key.startsWith(STORAGE_PREFIX)) {
          sessionStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.error("Error clearing sessionStorage:", error)
    }
  }
}

/**
 * Pre-configured cache configs for different data types
 */
export const cacheConfigs = {
  products: {
    ttl: DEFAULT_TTL.PRODUCTS,
    useLocalStorage: true,
    useSessionStorage: true,
  } as CacheConfig,
  
  productDetail: {
    ttl: DEFAULT_TTL.PRODUCT_DETAIL,
    useLocalStorage: true,
    useSessionStorage: true,
  } as CacheConfig,
  
  categories: {
    ttl: DEFAULT_TTL.CATEGORIES,
    useLocalStorage: true,
    useSessionStorage: true,
  } as CacheConfig,
  
  provinces: {
    ttl: DEFAULT_TTL.PROVINCES,
    useLocalStorage: true,
    useSessionStorage: false,
  } as CacheConfig,
  
  orders: {
    ttl: DEFAULT_TTL.ORDERS,
    useLocalStorage: false,
    useSessionStorage: true,
  } as CacheConfig,
  
  user: {
    ttl: DEFAULT_TTL.USER,
    useLocalStorage: false,
    useSessionStorage: true,
  } as CacheConfig,
  
  cart: {
    ttl: DEFAULT_TTL.CART,
    useLocalStorage: false,
    useSessionStorage: true,
  } as CacheConfig,
}

// Clean up old cache entries on load
if (typeof window !== "undefined") {
  clearOldCacheEntries()
  
  // Clean up every hour
  setInterval(clearOldCacheEntries, 60 * 60 * 1000)
}

