import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Address {
  id: string
  fullName: string
  phoneNumber: string
  addressLine: string
  ward: string
  wardName?: string
  city: string
  cityName?: string
  isDefault: boolean
}

interface AddressStore {
  addresses: Address[]
  addAddress: (address: Omit<Address, 'id' | 'isDefault'>) => void
  updateAddress: (id: string, address: Partial<Address>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  getDefaultAddress: () => Address | null
}

export const useAddresses = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],

      addAddress: (address) => {
        const addresses = get().addresses
        const newAddress: Address = {
          ...address,
          id: `addr-${Date.now()}`,
          isDefault: addresses.length === 0, // First address is default
        }
        
        set({
          addresses: [...addresses, newAddress],
        })
      },

      updateAddress: (id, updatedData) => {
        const addresses = get().addresses
        set({
          addresses: addresses.map((addr) =>
            addr.id === id ? { ...addr, ...updatedData } : addr
          ),
        })
      },

      deleteAddress: (id) => {
        const addresses = get().addresses
        const addressToDelete = addresses.find((a) => a.id === id)
        
        // If deleting default address, set first remaining address as default
        let newAddresses = addresses.filter((a) => a.id !== id)
        if (addressToDelete?.isDefault && newAddresses.length > 0) {
          newAddresses[0].isDefault = true
        }
        
        set({ addresses: newAddresses })
      },

      setDefaultAddress: (id) => {
        const addresses = get().addresses
        set({
          addresses: addresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === id,
          })),
        })
      },

      getDefaultAddress: () => {
        const addresses = get().addresses
        return addresses.find((a) => a.isDefault) || null
      },
    }),
    {
      name: 'artemis-addresses',
    }
  )
)

