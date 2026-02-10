'use client'

import React, { useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Shader material
const CosWaveMaterial = shaderMaterial(
  { iTime: 0, iResolution: new THREE.Vector2() },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float iTime;
    uniform vec2 iResolution;
    varying vec2 vUv;

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

        vec2 c0 = cos(uv * vec2(d, a)) * 0.6 + 0.4;
        float r = c0.x;
        float g = c0.y;
        float b = cos(a + d) * 0.5 + 0.5;

        vec3 col = vec3(r, g, b);
        col = cos(col * cos(vec3(d, a, 5.5)) * 0.5 + 0.5);

        gl_FragColor = vec4(col, 1.0);
    }
  `
)

extend({ CosWaveMaterial })

export default function CosWaveBackground() {
  // ✅ Typed ref for TypeScript
  const matRef = useRef<InstanceType<typeof CosWaveMaterial>>(null)
  const { size, viewport, camera } = useThree()

  // Full-screen plane dimensions for perspective camera
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, -1])

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.iTime = clock.getElapsedTime()
      matRef.current.iResolution.set(size.width, size.height)
    }
  })

  return (
    <mesh position={[0, 0, -1]}>
      {/* Full-screen plane */}
      <planeGeometry args={[width, height]} />
      <cosWaveMaterial ref={matRef} />
    </mesh>
  )
}