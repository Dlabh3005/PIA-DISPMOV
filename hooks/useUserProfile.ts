import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '../src/config/firebase'
import { VehiclesService } from '../src/services/VehiclesService'

export interface Vehicle {
  id: string
  model: string
  year: string
  plate: string
  currentKm: number
  status?: string
}

interface UserProfileState {
  user: User | null
  vehicles: Vehicle[]
  loading: boolean
  error: string | null
}

export function useUserProfile(): UserProfileState {
  const [user, setUser] = useState<User | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Subscribe to auth state
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser)

        if (!firebaseUser) {
          setVehicles([])
          setLoading(false)
          return
        }

        // Subscribe to vehicles in real time
        setLoading(true)
        setError(null)

        try {
          const unsubscribeVehicles = VehiclesService.subscribeUserVehicles(
            firebaseUser.uid,
            (data) => {
              setVehicles(data as Vehicle[])
              setLoading(false)
              setError(null)
            }
          )

          // Return inner unsubscribe
          return () => unsubscribeVehicles()
        } catch (err) {
          setError('No se pudo conectar con la base de datos. Verifica tu conexión.')
          setLoading(false)
        }
      },
      (err) => {
        setError('Error de autenticación: ' + err.message)
        setLoading(false)
      }
    )

    return () => unsubscribeAuth()
  }, [])

  return { user, vehicles, loading, error }
}
