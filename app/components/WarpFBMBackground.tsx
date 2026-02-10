// components/WarpFBMBackground.jsx
import React, { useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Shader material
const WarpFBMMaterial = shaderMaterial(
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

    float colormap_red(float x) {
        if(x < 0.0) return 54.0 / 255.0;
        else if(x < 20049.0 / 82979.0) return (829.79 * x + 54.51) / 255.0;
        else return 1.0;
    }

    float colormap_green(float x) {
        if(x < 20049.0 / 82979.0) return 0.0;
        else if(x < 327013.0 / 810990.0) return (8546482679670.0 / 10875673217.0 * x - 2064961390770.0 / 10875673217.0) / 255.0;
        else if(x <= 1.0) return (103806720.0 / 483977.0 * x + 19607415.0 / 483977.0) / 255.0;
        else return 1.0;
    }

    float colormap_blue(float x) {
        if(x < 0.0) return 54.0 / 255.0;
        else if(x < 7249.0 / 82979.0) return (829.79 * x + 54.51) / 255.0;
        else if(x < 20049.0 / 82979.0) return 127.0 / 255.0;
        else if(x < 327013.0 / 810990.0) return (792.0224934136139 * x - 64.36479073560233) / 255.0;
        else return 1.0;
    }

    vec4 colormap(float x) {
        return vec4(colormap_red(x), colormap_green(x), colormap_blue(x), 1.0);
    }

    float rand(vec2 n) {
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    float noise(vec2 p) {
        vec2 ip = floor(p);
        vec2 u = fract(p);
        u = u*u*(3.0-2.0*u);

        float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0,0.0)), u.x),
            mix(rand(ip + vec2(0.0,1.0)), rand(ip + vec2(1.0,1.0)), u.x),
            u.y
        );
        return res*res;
    }

    const mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);

    float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5*noise(p + iTime); p = mtx*p*2.02;
        f += 0.03125*noise(p);      p = mtx*p*2.01;
        f += 0.25*noise(p);         p = mtx*p*2.03;
        f += 0.125*noise(p);        p = mtx*p*2.01;
        f += 0.0625*noise(p);       p = mtx*p*2.04;
        f += 0.015625*noise(p + sin(iTime));
        return f / 0.96875;
    }

    float pattern(vec2 p) {
        return fbm(p + fbm(p + fbm(p)));
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.x;
        float shade = pattern(uv);
        gl_FragColor = vec4(colormap(shade).rgb, shade);
    }
  `
)

extend({ WarpFBMMaterial })

export default function WarpFBMBackground() {
  const matRef = useRef()
  const { size } = useThree()

  useFrame(({ clock }) => {
    if(matRef.current) {
      matRef.current.iTime = clock.getElapsedTime()
      matRef.current.iResolution.set(size.width, size.height)
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <warpFBMMaterial ref={matRef} />
    </mesh>
  )
}