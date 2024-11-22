import { StudenDetail } from '@/components/common/swr'
import React, { useState } from 'react'

export default function LoginPage() {
  const [studenList, setStudenList] = useState<any[]>([1, 1, 1])
  const handleAddStuden = () => {
    setStudenList([...studenList, 1])
  }
  return (
    <div>
      <h1>SWR Playground</h1>
      <button onClick={handleAddStuden}>Add Student</button>
      <ul>
        {studenList.map((x, index) => (
          <li key={index}>
            <StudenDetail studenId="aqbbx1vj1lqrtv3y0" />
          </li>
        ))}
      </ul>
    </div>
  )
}
