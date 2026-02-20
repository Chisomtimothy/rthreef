'use client'

import React, { useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

const CosWaveMaterial = shaderMaterial(
  { 
    iTime: 0, 
    iResolution: new THREE.Vector2(),
    colorA: new THREE.Color(0.015, 0.015, 0.015),
    colorB: new THREE.Color(0.6, 0.6, 0.6)
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
  uniform float iTime;
    uniform vec2 iResolution;
    uniform vec3 colorA;
    uniform vec3 colorB;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      float mr = min(iResolution.x, iResolution.y);
      vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / mr;

      float d = -iTime * 0.5;
      float a = 0.0;

      for (float i = 0.0; i < 8.0; ++i) {
          a += cos(i - d - a * uv.x);
          d += sin(uv.y * i + a);
      }
      d += iTime * 0.5;

      vec2 c0 = cos(uv * vec2(d, a)) * 0.6 + 0.6;
      float raw = cos(a + d) * 0.5 + 0.5;

      float lum = dot(vec3(c0.x, c0.y, raw), vec3(0.3, 0.59, 0.11));
      lum = pow(smoothstep(0.15, 1.85, lum), 1.3);

      float sparkles = hash(uv * 100.0 + floor(iTime * 10.0) * 0.01);
      
      float shimmer = pow(sparkles, 30.0) * 2.0;

      shimmer *= smoothstep(0.3, 0.8, lum);

      vec3 col = mix(colorA, colorB, lum);
      
      col += shimmer;

      gl_FragColor = vec4(col, 1.0);
    }
  `
)

extend({ CosWaveMaterial })

export default function FluidBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport, camera } = useThree()

  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, -1])

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.iTime.value = clock.getElapsedTime()
      matRef.current.uniforms.iResolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <primitive object={new CosWaveMaterial()} ref={matRef} />
    </mesh>
  )
}