'use client'

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import FluidBackground from './components/FluidBackground';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { useScroll, useTransform, motion } from 'framer-motion';
import * as THREE from 'three';
import { easing } from 'maath';

const poses = [
  {
    rotation: [-0.8, 0, 0],
    position: [0, 0.04, -0.2]
  },
  {
    rotation: [0, 0, Math.PI * 0.5],
    position: [0, 0, 0]
  },

  {
    rotation: [-Math.PI * 0.5, 0, Math.PI * 2],
    position: [0, 0, 0.3]
  }
]

// useGLTF.preload('ring/scene.gltf');
import { useMemo } from 'react'
import Hero from './components/Hero';

const Model = ({ position, rotation }: any) => {
  const { scene } = useGLTF('ring/scene.gltf');
  const meshRef = useRef<THREE.Mesh>(null!);

  const clone = useMemo(() => {
    const copy = scene.clone(true);

    copy.traverse(child => {
      if(child instanceof THREE.Mesh) {
        child.material = child.material.clone();
        child.material.transparent = false;
      }
    })
    return copy;
  }, [scene])

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.z += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.2;
  })

  return (
    <primitive 
      object={clone}
      ref={meshRef}
      position={position}
      rotation={rotation}
    />
  )
}

const Home = () => {

  const { scrollYProgress } = useScroll();
  const homeCopyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0], { clamp: false });

  return (
    <main className='relative w-full h-screen border-t bg-black'>

    <div className='px-5 lg:px-10'>
      {/* FLUID BACKGROUND */}
      <div className='fixed h-screen w-full inset-0 z-0'>
        <Canvas>
          <FluidBackground />
        </Canvas>
        <div className='absolute inset-0 bg-black/70 h-full'></div>
      </div>

      {/* RING MODEL */}
      <div className='relative h-[40dvh] mt-30'>
        <div className='absolute inset-0 h-full w-full z-10'>
          <Canvas
            camera={{ position: [0, 0, 0.6], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              precision: "lowp",
              alpha: true,
              stencil: true,
              depth: true,
            }}
          >
            {/* <Model position={[-0.4, 0, 0]} rotation={[Math.PI * -0.5, 0, 0]} />
            <Model position={[0, 0, 0.3]} rotation={[Math.PI * 0.5, 0, 0]} />
            <Model position={[0.4, 0, 0]} rotation={[Math.PI * -0.5, 0, 0]} /> */}

            <Model position={[-0.16, -0.13, 0]} rotation={[Math.PI * -0.5, 0, 0]} />
            <Model position={[0, 0.06, 0.25]} rotation={[Math.PI * 0.5, 0, 0]} />
            <Model position={[0.16, -0.13, 0]} rotation={[Math.PI * -0.5, 0, 0]} />

            <Environment files='studio.exr' environmentIntensity={0.4} />
          </Canvas>
        </div>
        <div className='absolute inset-0 h-full text-[11px] text-white/50'>
          <span className='absolute'>+</span>
          <span className='absolute right-0'>+</span>
          {/* <span className='absolute bottom-38'>+</span>
          <span className='absolute bottom-38 right-0'>+</span> */}
          <span className='absolute bottom-0'>+</span>
          <span className='absolute bottom-0 right-0'>+</span>
        </div>
      </div>
    </div>

      <Hero />

    </main>
  )
}

export default Home