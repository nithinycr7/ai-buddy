
import React from 'react'

type Tab = { id: string; label: string }
export default function Tabs({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (id: string)=>void }){
  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map(t => (
        <button key={t.id} onClick={()=>onChange(t.id)}
          className={`px-3 py-1.5 rounded-xl border shadow-soft ${active===t.id? 'bg-pastelGreen border-emerald-300' : 'bg-white hover:bg-slate-50'}`}>
          <span className="header-hand-2">{t.label}</span>
        </button>
      ))}
    </div>
  )
}
