'use client'

import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from "@react-three/fiber";
import FluidBackground from "./components/FluidBcakground";
import Link from "next/link";
import { Environment, Float, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { easing } from 'maath';
import { lerp } from 'three/src/math/MathUtils.js';

import React from 'react'
import { a } from 'framer-motion/client';

useGLTF.preload('ring/scene.gltf');

const poses = [
  {
    position: [0, 0, 0], rotation: [0, 0, 0]
  },
  {
    position: [0.08, 0.08, 0.08], rotation: [2.3, 2.3, 2.3]
  },
  {
    position: [-0.2, -0.2, -0.2], rotation: [0.6, 0.6, 0.6]
  }
]

const Model = () => {
  const { scene } = useGLTF('ring/scene.gltf');
  const modelRef = useRef<THREE.Group>(null!);

  const [spin, setSpin] = useState(true);
  const { scrollYProgress } = useScroll();
  let y = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 2]);

  useFrame((state, delta) => {
    if (modelRef.current) {
      if (spin) modelRef.current.rotation.z += delta * 0.7;

      if (scrollYProgress.get() > 0) {
        setSpin(false);
        easing.damp3(
          modelRef.current.position,
          [0.01, 0.04, 0],
          0.5,
          delta
        )
      } else {
        setSpin(true)
        easing.damp3(
          modelRef.current.position,
          [0, 0, 0],
          0.5,
          delta
        )
      }
    }

    if (!modelRef.current) return;

    const progress = scrollYProgress.get();
    const total = poses.length - 1;
    const scaled = progress * total;
    const index = Math.floor(scaled);
    const t = scaled - index;

    const current = poses[index];
    const next = poses[index + 1] || current;

    // modelRef.current.position.lerpVectors(
    //   new THREE.Vector3(...current.position),
    //   new THREE.Vector3(...next.position),
    //   t
    // )

    const q1 = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...current.rotation)
    )
    const q2 = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...next.rotation)
    )

    // modelRef.current.quaternion.slerpQuaternions(q1, q2, t);

  })

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // child.material.side = THREE.FrontSide;
        child.material.transparent = false;
        // child.material.depthWrite = true;
        // child.material.roughness = 0.8;
        // child.castShadow = true;
        // child.receiveShadow = true;
      }
    });
  }, [scene]); 


  return (
    <primitive object={scene} ref={modelRef} position={[0, 0, 0.0]} rotation={[-0, -0.4, 0]} />
    // <primitive object={scene} ref={modelRef} position={[0, 0, 0]} rotation={[0, 0, 0]} />
  )
}

export default function Home() {
  const { scrollYProgress } = useScroll();

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const width = useTransform(scrollYProgress, [0, 0.2], ['0', '100%']);
  const width2 = useTransform(scrollYProgress, [0.2, 0.4], ['0', '100%']);
  const width3 = useTransform(scrollYProgress, [0.4, 0.6], ['0', '100%']);
  // const background = useTransform(scrollYProgress, [0, 1], ['#ff0000', '#00ffff'])

  return (
    <main>
      <div className="fixed inset-0 z-0 h-screen w-full">
        <Canvas>
          <FluidBackground />
        </Canvas>
        <div className="fixed inset-0  w-full bg-black/70"></div>
      </div>

      <div className="fixed w-full h-screen flex">
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            powerPreference: "high-performance",
            precision: "lowp",
            alpha: true,
            stencil: false,
            depth: true
          }}
          camera={{ position: [0, 0, 0.3], fov: 50 }}
        >
          <OrbitControls
            enableDamping 
            dampingFactor={0.09}
          />
          
          <Suspense fallback={null}>
            <Model />
            <Environment files={'studio.exr'} environmentIntensity={0.3} />
          </Suspense>
        </Canvas>
      </div>

      <div className='fixed z-[100] inset-0 w-full h-15 p-2 px-6'>
        <div className='flex justify-between items-center h-full py-2'>
          <div className='logo-font text-[9px] tracking-[5px]'>
            ONYX
          </div>

          <div className=''>
            <div className='flex sm:hidden'>
              <button className='bg-[none] aspect-square h-5 flex items-center justify-center'>
                <span>+</span>
              </button>
            </div>
            <div className='hidden sm:flex gap-3 items-center font-sans text-[9px] text-white tracking-[0.2em] uppercase'>
              <Link href='#'>Collections</Link>
              <span className='w-1 h-1 bg-gray-500 rounded-full'></span>
              <Link href='#'>Atelier</Link>
              <span className='w-1 h-1 bg-gray-500 rounded-full'></span>
              <Link href='#'>Archive</Link>
            </div>
          </div>
        </div>
      </div>

      <div className='fixed w-full z-100 bottom-5 flex items-center justify-center px-8'>

        <div className='left-1/2 flex items-center gap-1.5 h-8 p-1 rounded-full'>
          <button className='h-full aspect-square text-white hover:text-white hover:bg-white/10 hover:border-white/20 transition-all rounded-full flex items-center justify-center group active:scale-90 cursor-pointer'>
            <span className="text-sm font-light leading-none">+</span>
          </button>

          <nav className='h-full flex items-center justify-center rounded-full text-white min-w-[100px] mix-blend-difference'>
            <div className='flex items-center gap-2.5 tracking-[0.4em] uppercase text-[8px] font-bold'>
              <span className='text-amber-300'>01</span>
              <span className="text-white">Home</span>
            </div>
          </nav>

          <button className='h-full aspect-square text-white hover:text-white hover:bg-white/10 hover:border-white/20 transition-all rounded-full flex items-center justify-center group active:scale-90'>
            <span className="text-sm font-light leading-none">+</span>
          </button>
        </div>

      </div>

      <div className='relative h-screen w-full p-5'>
        <motion.div className='sticky top-60 flex max-w-80 mx-auto justify-between text-4xl text-[#E5E5E5] font-serif'>
          <motion.span
            className='absolute inset-0 bg-black'
          ></motion.span>
          <span>O</span>
          <span className='text-amber-300'>N</span>
          <span>Y</span>
          <span>X</span>
        </motion.div>
      </div>

      <div className='relative h-500 w-full bg-white p-5'>

      </div>


    </main>
  )
}


// 'use client'

// import { motion } from 'framer-motion';
// import { Canvas, useFrame } from "@react-three/fiber";
// import { Environment, OrbitControls, useGLTF, Float, ContactShadows } from "@react-three/drei";
// import { Suspense, useRef, useEffect } from "react";
// import * as THREE from 'three';
// import Link from "next/link";
// import FluidBackground from "./components/FluidBcakground";

// // Preload for performance
// useGLTF.preload('ring/scene.gltf');

// const RingModel = () => {
//   const { scene } = useGLTF('ring/scene.gltf');
//   const modelRef = useRef<THREE.Group>(null!);

//   // Subtle auto-rotation to catch the light
//   useFrame((state) => {
//     const t = state.clock.getElapsedTime();
//     modelRef.current.rotation.y = Math.sin(t / 4) * 0.2;
//     modelRef.current.position.y = Math.sin(t / 3.5) / 20;
//   });

//   return (
//     <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
//       <primitive 
//         object={scene} 
//         ref={modelRef} 
//         scale={1.2} 
//         position={[0, -0.05, 0]} 
//       />
//     </Float>
//   );
// }

// export default function OnyxHero() {
//   return (
//     <main className="relative w-full h-screen bg-[#050505] text-white overflow-hidden font-serif">
      
//       {/* 1. MINIMAL NAVIGATION */}
//       <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-10 py-8 mix-blend-difference">
//         <div className="flex gap-8 text-[10px] uppercase tracking-[0.3em] font-light text-gray-400">
//           <Link href="#" className="hover:text-white transition-colors">Collections</Link>
//           <Link href="#" className="hover:text-white transition-colors">Bespoke</Link>
//         </div>
        
//         <div className="flex gap-8 text-[10px] uppercase tracking-[0.3em] font-light text-gray-400">
//           <Link href="#" className="hover:text-white transition-colors">Showroom</Link>
//           <Link href="#" className="hover:text-white transition-colors">Cart (0)</Link>
//         </div>
//       </nav>

//       {/* 2. CENTERED BRANDING */}
//       <div className="absolute inset-0 flex flex-col items-center pt-32 pointer-events-none z-10">
//         <motion.h1 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
//           className="text-6xl md:text-8xl tracking-[0.6em] font-extralight"
//         >
//           ONYX
//         </motion.h1>
//         <motion.p 
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 0.5 }}
//           transition={{ delay: 0.8, duration: 1.5 }}
//           className="mt-4 text-[11px] uppercase tracking-[0.8em] font-light italic"
//         >
//           Fine Diamond Jewelry
//         </motion.p>
//       </div>

//       {/* 3. 3D SCENE */}
//       <div className="absolute inset-0 z-0">
//         <Canvas camera={{ position: [0, 0, 0.4], fov: 45 }}>
//           <color attach="background" args={['#050505']} />
          
//           {/* Cinematic Lighting */}
//           <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
//           <pointLight position={[-10, -10, -10]} intensity={1} color="#ffffff" />
          
//           <Suspense fallback={null}>
//             {/* <FluidBackground /> */}
//             {/* <RingModel /> */}
//             {/* Environment provides the high-end metallic reflections */}
//             <Environment files='env.exr' />
//             <ContactShadows 
//               position={[0, -0.15, 0]} 
//               opacity={0.4} 
//               scale={2} 
//               blur={2.5} 
//               far={0.5} 
//             />
//           </Suspense>

//           <OrbitControls 
//             enableZoom={false} 
//             enablePan={false}
//             minPolarAngle={Math.PI / 2.5}
//             maxPolarAngle={Math.PI / 1.5}
//           />
//         </Canvas>
//       </div>

//       {/* 4. CALL TO ACTION */}
//       <div className="absolute bottom-12 w-full flex flex-col items-center z-20">
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 1.2, duration: 1 }}
//         >
//           <Link 
//             href="/collection" 
//             className="group flex flex-col items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-light"
//           >
//             <span className="group-hover:text-gray-400 transition-colors">Explore Collection</span>
//             <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent opacity-30 group-hover:h-16 transition-all duration-500" />
//           </Link>
//         </motion.div>
//       </div>

//     </main>
//   );
// }