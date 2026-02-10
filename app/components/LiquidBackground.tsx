'use client'

import React, { useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// 1️⃣ Shader material
const LiquidShaderMaterial = shaderMaterial(
  { iTime: 0, iResolution: new THREE.Vector2() },
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
    const float arrow_density = 4.5;
    const float arrow_length = .45;
    const int iterationTime1 = 20;
    const int iterationTime2 = 20;
    const float scale = 6.;
    const float velocity_x = 0.1;
    const float velocity_y = 0.2;
    const float mode_2_speed = 2.5;
    const float mode_1_detail = 200.;
    const float mode_1_twist = 50.;

    struct Field { vec2 vel; vec2 pos; };

    float f(in vec2 p) {
      return sin(p.x + sin(p.y + time*velocity_x)) * sin(p.y*p.x*0.1 + time*velocity_y);
    }

    Field field(in vec2 p) {
      Field fld;
      vec2 ep = vec2(0.05, 0.);
      vec2 rz = vec2(0);
      for(int i=0; i<iterationTime1; i++){
        float t0 = f(p);
        float t1 = f(p + ep.xy);
        float t2 = f(p + ep.yx);
        vec2 g = vec2((t1-t0),(t2-t0))/ep.xx;
        vec2 t = vec2(-g.y,g.x);
        p += (mode_1_twist*0.01)*t + g*(1./mode_1_detail);
        p.x += sin(time*mode_2_speed/10.)/10.;
        p.y += cos(time*mode_2_speed/10.)/10.;
        rz = g;
      }
      fld.vel = rz;
      fld.pos = p;
      return fld;
    }

    vec3 getRGB(in Field fld){
      vec2 p = fld.pos;
      float r=cos(p.x+p.y+1.)*.5+.5;
      float g=sin(p.x+p.y+1.)*.5+.5;
      float b=(sin(p.x+p.y)+cos(p.x+p.y))*.3+.5;
      return vec3(r,g,b);
    }

    void main() {
      vec2 p = vUv - 0.5;
      p.x *= iResolution.x/iResolution.y;
      p *= scale;

      Field fld = field(p);
      vec3 col = getRGB(fld) * 0.85;
      gl_FragColor = vec4(col,1.0);
    }
  `
)

extend({ LiquidShaderMaterial })

export default function LiquidBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.iTime.value = clock.getElapsedTime()
      matRef.current.uniforms.iResolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh position={[0, 0, -1]}>
      {/* Fullscreen plane */}
      <planeGeometry args={[2, 2]} />
      <primitive object={new LiquidShaderMaterial()} ref={matRef} />
    </mesh>
  )
}