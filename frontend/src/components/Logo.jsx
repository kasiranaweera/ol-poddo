import React from 'react'
import { Link } from 'react-router-dom'

const Logo = () => {
  return (
    <div>
      <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold">
            OL
          </div>
          <span className="inline text-amber-500 font-bold" style={{ fontFamily: '"Gemunu Libre", sans-serif', fontWeight: 800, fontSize: '2.5rem' }}>
            පොඩ්ඩෝ
          </span>
        </Link>
    </div>
  )
}

export default Logo
