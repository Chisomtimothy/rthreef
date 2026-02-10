import '@react-three/fiber'
import { CosWaveMaterial } from './CosWaveBackground'

declare module '@react-three/fiber' {
  interface ThreeElements {
    cosWaveMaterial: React.ElementType<JSX.IntrinsicElements['meshStandardMaterial']>
  }
}