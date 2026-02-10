// 'use client'

// import React, { useState } from 'react'
// import { Canvas } from '@react-three/fiber'
// import LiquidBackground from './components/LiquidBackground'
// import CosWaveBackground from './components/CosWaveBackground'
// import WarpFBMBackground from './components/WarpFBMBackground'
// import VectorFieldBackground from './components/VectorFieldBackground'

// const backgrounds = {
//   Liquid: LiquidBackground,
//   CosWave: CosWaveBackground,
//   WarpFBM: WarpFBMBackground,
//   VectorField: VectorFieldBackground,
// }

// export default function BackgroundManager() {
//   const [active, setActive] = useState('VectorField')

//   const ActiveBG = backgrounds[active]

//   return (
//     <div className="h-screen w-full bg-black relative overflow-hidden">
//       {/* Canvas with active background */}
//       <Canvas orthographic camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0, far: 10 }}>
//         <ActiveBG />
//       </Canvas>

//       {/* UI Overlay */}
//       <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
//         {Object.keys(backgrounds).map((name) => (
//           <button
//             key={name}
//             onClick={() => setActive(name)}
//             className={`px-3 py-1 rounded-md font-medium transition ${
//               active === name
//                 ? 'bg-red-500 text-white'
//                 : 'bg-white/20 text-white hover:bg-white/40'
//             }`}
//           >
//             {name}
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }


'use client'

import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import LiquidBackground from './components/LiquidBackground'
import CosWaveBackground from './components/CosWaveBackground'
import WarpFBMBackground from './components/WarpFBMBackground'
import VectorFieldBackground from './components/VectorFieldBackground'

const backgrounds = {
  Liquid: LiquidBackground,
  CosWave: CosWaveBackground,
  WarpFBM: WarpFBMBackground,
  VectorField: VectorFieldBackground,
}

export default function BackgroundManager() {
  const [active, setActive] = useState('VectorField')

  const ActiveBG = backgrounds[active]

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden select-none">
      {/* Canvas */}
      <Canvas
        orthographic
        camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0, far: 10 }}
      >
        <ActiveBG />
      </Canvas>

      {/* Premium UI Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        {Object.keys(backgrounds).map((name) => (
          <button
            key={name}
            onClick={() => setActive(name)}
            className={`
              px-5 py-2 rounded-xl font-semibold text-white text-lg
              backdrop-blur-md bg-white/10 border border-white/20
              transition-all duration-300 ease-out
              shadow-lg
              ${active === name ? 'bg-red-500/70 text-white scale-110 shadow-2xl' : 'hover:bg-white/20 hover:scale-105'}
            `}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}