'use client'

import React, { useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// ---------------- Shader Material ----------------
const VectorFieldMaterial = shaderMaterial(
  {
    iTime: 0,
    iResolution: new THREE.Vector2(1, 1),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float iTime;
    uniform vec2 iResolution;
    varying vec2 vUv;

    #define time iTime
    const int iterationTime1 = 20;
    const float scale = 6.0;
    const float velocity_x = 0.1;
    const float velocity_y = 0.2;
    const float mode_1_detail = 200.0;
    const float mode_1_twist = 50.0;
    const float mode_2_speed = 2.5;

    float f(in vec2 p) {
      return sin(p.x + sin(p.y + time*velocity_x)) * sin(p.y*p.x*0.1 + time*velocity_y);
    }

    void main() {
      vec2 p = (vUv - 0.5) * scale;
      p.x *= iResolution.x / iResolution.y;

      vec2 ep = vec2(0.05, 0.0);
      vec2 rz = vec2(0.0);
      vec2 currentP = p;

      for(int i=0; i<iterationTime1; i++) {
          float t0 = f(currentP);
          float t1 = f(currentP + ep.xy);
          float t2 = f(currentP + ep.yx);
          vec2 g = vec2((t1-t0), (t2-t0))/ep.xx;
          vec2 t = vec2(-g.y, g.x);
          
          currentP += (mode_1_twist*0.01)*t + g*(1./mode_1_detail);
          currentP.x += sin(time*mode_2_speed/10.)/10.0;
          currentP.y += cos(time*mode_2_speed/10.)/10.0;
          rz = g; 
      }

      vec3 col = vec3(rz * 0.5 + 0.5, 1.5) * 0.85;
      gl_FragColor = vec4(col, 1.0);
    }
  `
)

extend({ VectorFieldMaterial })

// ---------------- React Component ----------------
export default function VectorFieldBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  useFrame(({ clock }) => {
    if(materialRef.current){
      materialRef.current.uniforms.iTime.value = clock.getElapsedTime()
      materialRef.current.uniforms.iResolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh>
      {/* Fullscreen plane */}
      <planeGeometry args={[2, 2]} />
      <primitive object={new VectorFieldMaterial()} ref={materialRef} />
    </mesh>
  )
}
