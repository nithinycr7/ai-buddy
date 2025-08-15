
import React from 'react'

export default function ProgressRing({ value=0.6, size=140, stroke=12 }: { value?: number; size?: number; stroke?: number }){
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = c * value
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size/2} cy={size/2} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke="#0ea5e9" strokeWidth={stroke} fill="none"
        strokeDasharray={`${dash} ${c-dash}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="font-bold">{Math.round(value*100)}%</text>
    </svg>
  )
}
