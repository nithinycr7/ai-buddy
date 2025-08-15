
import Card from '../../components/UI/Card'

function Left(){
  return (
    <div className="space-y-4">
      <h2 className="text-2xl header-hand">Feedback Categories</h2>
      <div className="space-y-3">
        {['Pace','Clarity','Engagement'].map(x => (
          <div key={x} className="sticky">{x}</div>
        ))}
      </div>
    </div>
  )
}

function Right(){
  return (
    <div className="space-y-4">
      <h2 className="text-2xl header-hand">Drill-down</h2>
      <Card>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>00:14 — Define "vertex" earlier</li>
          <li>03:02 — Add example problem</li>
          <li>05:47 — Check pacing</li>
        </ul>
      </Card>
    </div>
  )
}

export default { Left, Right }
