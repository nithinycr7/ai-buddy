
import React from 'react'

export default function VideoPlayer(){
  return (
    <div className="relative bg-black aspect-video rounded-xl overflow-hidden shadow-soft taped">
      <video className="w-full h-full" controls poster="https://placehold.co/800x450/png">
        <source src="" type="video/mp4" />
      </video>
    </div>
  )
}
