'use client'

import useSWR from 'swr'
import { useSupabaseSession } from '@/app/_hooks/useSupabaseSession'

export const useFetch = <ResponseType,>(endpoint: string) => {
  const { token } = useSupabaseSession()

  return useSWR(
    token ? [endpoint, token] as const : null,
    async ([url, accessToken]) => {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!response.ok) throw new Error('データの取得に失敗しました。')

      return response.json() as Promise<ResponseType>
    },
  )
}