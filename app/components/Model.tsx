import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Model = ({speed}: { speed: number } ) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const tex = useTexture('texture.jpg')

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * speed;
        }
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[2, 100, 100]} />
            <meshStandardMaterial map={tex} />
        </mesh>
    )
}

export default Model