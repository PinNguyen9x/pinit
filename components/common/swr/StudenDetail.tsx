import React, { useState } from 'react'
import useSWR from 'swr'

interface StudentDetailProps {
  studenId: string
}

export function StudenDetail({ studenId }: StudentDetailProps) {
  const MILISECOND_PER_HOUR = 60 * 60 * 1000
  const { data, error, mutate, isValidating } = useSWR(`/students/${studenId}`, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  })

  const handleMuetate = () => {
    mutate({ name: 'John' }, true)
  }

  return (
    <div>
      <p>
        Name: {data?.name || '--'} <button onClick={handleMuetate}>mutate</button>
      </p>
    </div>
  )
}
