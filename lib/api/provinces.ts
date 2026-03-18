// API for Vietnamese Provinces
// Using provinces.open-api.vn/api/v2/

import { cachedFetch, cacheConfigs } from "@/lib/cache"

export interface Province {
  code: string | number
  name: string
  nameEn?: string
  fullName?: string
  fullNameEn?: string
  codeName?: string
  codename?: string
  division_type?: string
  phone_code?: number
  administrativeUnit?: {
    id: number
    fullName: string
    fullNameEn: string
    shortName: string
    shortNameEn: string
    codeName: string
    codeNameEn: string
  }
  districts?: District[]
  d?: District[] // Alternative property name
  wards?: Ward[] // Wards can be directly in province (when depth=2 or depth=3)
  w?: Ward[] // Alternative property name for wards
}

export interface District {
  code: string | number
  name: string
  nameEn?: string
  fullName?: string
  fullNameEn?: string
  codeName?: string
  codename?: string
  provinceCode?: string | number
  province_code?: string | number
  administrativeUnit?: {
    id: number
    fullName: string
    fullNameEn: string
    shortName: string
    shortNameEn: string
    codeName: string
    codeNameEn: string
  }
  wards?: Ward[]
  w?: Ward[] // Alternative property name
}

export interface Ward {
  code: string | number
  name: string
  nameEn?: string
  fullName?: string
  fullNameEn?: string
  codeName?: string
  codename?: string
  districtCode?: string | number
  district_code?: string | number
  administrativeUnit?: {
    id: number
    fullName: string
    fullNameEn: string
    shortName: string
    shortNameEn: string
    codeName: string
    codeNameEn: string
  }
}

const PROVINCES_API_BASE = "https://provinces.open-api.vn/api/v2"
const PROXY_API_BASE = "/api/provinces"

export const provincesApi = {
  /**
   * Get all provinces (depth=1) - with caching
   */
  async getProvinces(): Promise<Province[]> {
    try {
      // Use proxy API to avoid CORS with caching
      return await cachedFetch<Province[]>(
        `${PROXY_API_BASE}?action=provinces&depth=1`,
        {
          method: "GET",
        },
        {
          ...cacheConfigs.provinces,
          storageKey: "provinces_list",
        }
      )
    } catch (error) {
      console.error("Error fetching provinces:", error)
      throw error
    }
  },

  /**
   * Get province by code with districts (depth=2)
   */
  async getProvinceWithDistricts(provinceCode: string): Promise<Province> {
    try {
      return await cachedFetch<Province>(
        `${PROXY_API_BASE}?action=province&code=${provinceCode}`,
        {
          method: "GET",
        },
        {
          ...cacheConfigs.provinces,
          storageKey: `province_${provinceCode}`,
        }
      )
    } catch (error) {
      console.error("Error fetching province with districts:", error)
      throw error
    }
  },

  /**
   * Get district by code with wards (depth=2)
   */
  async getDistrictWithWards(districtCode: string): Promise<District> {
    try {
      return await cachedFetch<District>(
        `${PROXY_API_BASE}?action=district&code=${districtCode}`,
        {
          method: "GET",
        },
        {
          ...cacheConfigs.districts,
          storageKey: `district_${districtCode}`,
        }
      )
    } catch (error) {
      console.error("Error fetching district with wards:", error)
      throw error
    }
  },

  /**
   * Get districts by province code
   */
  async getDistrictsByProvince(provinceCode: string): Promise<District[]> {
    try {
      // First, try to get province with depth=2 which should include districts
      try {
        const provinceData = await cachedFetch<any>(
          `${PROXY_API_BASE}?action=province&code=${provinceCode}`,
          {
            method: "GET",
          },
          {
            ...cacheConfigs.provinces,
            storageKey: `province_${provinceCode}`,
          }
        )

        // Try multiple property names
        let districts = provinceData.districts || provinceData.d || []

        // If still empty, check if response structure is different
        if (districts.length === 0) {
          // Some APIs might nest districts differently
          if (provinceData.data && provinceData.data.districts) {
            districts = provinceData.data.districts
          }

          // API v2 might return wards directly instead of districts
          // Check if wards exist and have province_code matching
          if (districts.length === 0 && provinceData.wards && Array.isArray(provinceData.wards)) {
            // If wards have province_code, they might actually be districts
            // But typically, we need to fetch districts separately
            // Let's try to get districts from a different endpoint
          }
        }

        if (districts.length > 0) {
          return districts
        }
      } catch (provinceError) {
        console.error("Province fetch failed:", provinceError)
      }

      // Fallback: try direct districts endpoint
      const data = await cachedFetch<any>(
        `${PROXY_API_BASE}?action=districts&code=${provinceCode}`,
        {
          method: "GET",
        },
        {
          ...cacheConfigs.districts,
          storageKey: `districts_${provinceCode}`,
        }
      )

      // Extract districts from response
      let districts = data.districts || []

      return districts
    } catch (error) {
      console.error("Error fetching districts:", error)
      return []
    }
  },

  /**
   * Get wards by district code
   */
  async getWardsByDistrict(districtCode: string): Promise<Ward[]> {
    try {
      // Use proxy API to avoid CORS
      const data = await cachedFetch<any>(
        `${PROXY_API_BASE}?action=wards&code=${districtCode}`,
        {
          method: "GET",
        },
        {
          ...cacheConfigs.wards,
          storageKey: `wards_${districtCode}`,
        }
      )

      // Extract wards from response
      let wards = data.wards || []

      // If no wards in response, try getting district with depth=2
      if (wards.length === 0) {
        try {
          try {
            const districtData = await cachedFetch<any>(
              `${PROXY_API_BASE}?action=district&code=${districtCode}`,
              {
                method: "GET",
              },
              {
                ...cacheConfigs.districts,
                storageKey: `district_${districtCode}`,
              }
            )
            wards = districtData.wards || districtData.w || []
          } catch (districtError) {
            console.error("District fetch failed:", districtError)
          }
        } catch (districtError) {
          console.error("District fetch failed:", districtError)
        }
      }

      return wards
    } catch (error) {
      console.error("Error fetching wards:", error)
      return []
    }
  },

  /**
   * Get wards directly by province code (skip district layer)
   * Uses provinces.open-api.vn API to get all wards for a province
   */
  async getWardsByProvince(provinceCode: string): Promise<Ward[]> {
    try {
      const allWards: Ward[] = []
      const seenWardCodes = new Set<string | number>()

      // Helper function to add wards without duplicates
      const addWards = (wards: any[]) => {
        if (!wards || !Array.isArray(wards)) return
        for (const ward of wards) {
          const wardCode = ward.code || ward.codename
          if (wardCode && !seenWardCodes.has(wardCode)) {
            seenWardCodes.add(wardCode)
            allWards.push(ward)
          }
        }
      }

      // Method 1: Get province with depth=2 or depth=3 - check if province has wards directly
      try {
        const province = await this.getProvinceWithDistricts(provinceCode)

        // FIRST: Check if province has wards directly (some API responses include wards at province level)
        if (province.wards && Array.isArray(province.wards) && province.wards.length > 0) {
          addWards(province.wards)
        } else if (province.w && Array.isArray(province.w) && province.w.length > 0) {
          addWards(province.w)
        }

        // SECOND: If no direct wards, collect from districts
        if (allWards.length === 0) {
          const districts = province.districts || province.d || []
          for (const district of districts) {
            const districtWards = district.wards || district.w || []
            addWards(districtWards)
          }
        }
      } catch (provinceError) {
        console.warn("Province method failed:", provinceError)
      }

      // Method 2: Try to get all provinces with depth=3 and filter (with caching)
      if (allWards.length === 0) {
        try {
          const allProvinces = await cachedFetch<any[]>(
            `${PROXY_API_BASE}?action=provinces&depth=3`,
            {
              method: "GET",
            },
            {
              ...cacheConfigs.provinces,
              storageKey: "provinces_depth_3",
            }
          )
          const provinceCodeNum = typeof provinceCode === 'string' ? parseInt(provinceCode) : provinceCode

          // Find the province and collect all its wards
          for (const province of allProvinces) {
            const pCode = typeof province.code === 'number' ? province.code : parseInt(province.code || "0")
            if (pCode === provinceCodeNum || province.code?.toString() === provinceCode) {
              // Check direct wards first
              if (province.wards && Array.isArray(province.wards)) {
                addWards(province.wards)
              } else if (province.w && Array.isArray(province.w)) {
                addWards(province.w)
              }

              // Then collect from districts if needed
              if (allWards.length === 0) {
                const districts = province.districts || province.d || []
                for (const district of districts) {
                  const districtWards = district.wards || district.w || []
                  addWards(districtWards)
                }
              }

              break
            }
          }
        } catch (depth3Error) {
          console.warn("Depth=3 method failed:", depth3Error)
        }
      }

      // Method 3: Try direct API endpoint /p/{code}/w (if available) - Note: External API, can't use proxy cache
      if (allWards.length === 0) {
        try {
          const directUrl = `https://provinces.open-api.vn/api/v2/p/${provinceCode}/w`
          const directResponse = await fetch(directUrl, {
            headers: {
              "Accept": "application/json",
            },
          })

          if (directResponse.ok) {
            const directData = await directResponse.json()
            // Response might be an array of wards or an object with wards property
            if (Array.isArray(directData)) {
              addWards(directData)
            } else if (directData.wards && Array.isArray(directData.wards)) {
              addWards(directData.wards)
            } else if (directData.w && Array.isArray(directData.w)) {
              addWards(directData.w)
            }
          }
        } catch (directError) {
          console.warn("Direct wards endpoint failed:", directError)
        }
      }

      return allWards
    } catch (error) {
      console.error("Error fetching wards by province:", error)
      return []
    }
  },
}

