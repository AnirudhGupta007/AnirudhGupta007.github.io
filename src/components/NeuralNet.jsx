import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// A classic feed-forward network: input layer on the left, output on the right.
// A signal wave travels input -> output; scrolling the page drives the wave.
const SIZES = [4, 7, 10, 10, 7, 3]
const L = SIZES.length
const DX = 1.25
const DY = 0.44

function nodePos(l, i) {
  const n = SIZES[l]
  const y = (i - (n - 1) / 2) * DY
  // Each layer bows slightly in depth so the net reads as 3D when it turns.
  const z = -Math.pow(y, 2) * 0.12 + Math.sin(l * 1.7) * 0.15
  return [(l - (L - 1) / 2) * DX, y, z]
}

function buildNodes() {
  const p = []
  const layer = []
  const seed = []
  SIZES.forEach((n, l) => {
    for (let i = 0; i < n; i++) {
      p.push(...nodePos(l, i))
      layer.push(l)
      seed.push(Math.random())
    }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3))
  g.setAttribute('aLayer', new THREE.Float32BufferAttribute(layer, 1))
  g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1))
  return g
}

function buildEdges() {
  const SEG = 12
  const p = []
  const t = []
  const layer = []
  const seed = []
  const weight = []
  for (let l = 0; l < L - 1; l++)
    for (let i = 0; i < SIZES[l]; i++)
      for (let j = 0; j < SIZES[l + 1]; j++) {
        const a = nodePos(l, i)
        const b = nodePos(l + 1, j)
        const s = Math.random()
        const w = Math.pow(Math.random(), 1.6) // most weights small, a few strong
        for (let k = 0; k < SEG; k++)
          for (const u of [k / SEG, (k + 1) / SEG]) {
            p.push(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u)
            t.push(u)
            layer.push(l)
            seed.push(s)
            weight.push(w)
          }
      }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3))
  g.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1))
  g.setAttribute('aLayer', new THREE.Float32BufferAttribute(layer, 1))
  g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1))
  g.setAttribute('aW', new THREE.Float32BufferAttribute(weight, 1))
  return g
}

function buildDust(count) {
  const p = new Float32Array(count * 3)
  const s = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    p.set([(Math.random() - 0.5) * 18, (Math.random() - 0.5) * 12, -Math.random() * 10 + 1], i * 3)
    s[i] = Math.random()
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(p, 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(s, 1))
  return g
}

const palette = /* glsl */ `
const vec3 CYAN = vec3(0.49, 0.83, 0.99);
const vec3 VIOLET = vec3(0.65, 0.55, 0.98);
const vec3 WHITE = vec3(0.93, 0.96, 1.0);
const vec3 DIM = vec3(0.32, 0.36, 0.5);
`

// uWave is the signal front, measured in layers (0 = input, L-1 = output).
const edgeVertex = /* glsl */ `
uniform float uTime;
uniform float uWave;
attribute float aT;
attribute float aLayer;
attribute float aSeed;
attribute float aW;
varying float vAlpha;
varying vec3 vColor;
${palette}
void main(){
  float front = uWave - aLayer;                     // where the front is along this edge (0..1)
  float passed = smoothstep(aT - 0.05, aT + 0.05, front);
  float head = smoothstep(0.22, 0.0, abs(front - aT)) * step(-0.25, front) * step(front, 1.25);
  float trickle = smoothstep(0.08, 0.0, abs(fract(uTime * 0.35 + aSeed) - aT));  // ambient signals
  float strength = 0.25 + aW * 0.75;
  vAlpha = strength * (0.035 + passed * 0.09 + head * 0.75 + trickle * 0.12);
  vColor = mix(mix(DIM, VIOLET, passed), CYAN, aT * passed);
  vColor = mix(vColor, WHITE, head * 0.8);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const edgeFragment = /* glsl */ `
uniform float uOpacity;
varying float vAlpha;
varying vec3 vColor;
void main(){ gl_FragColor = vec4(vColor, vAlpha * uOpacity); }`

const nodeVertex = /* glsl */ `
uniform float uTime;
uniform float uWave;
uniform float uSize;
uniform float uPixelRatio;
attribute float aLayer;
attribute float aSeed;
varying float vFire;
varying float vLit;
void main(){
  float d = uWave - aLayer;
  float fires = step(0.3, aSeed);                   // like real activations, not every neuron fires
  vFire = smoothstep(0.5, 0.0, abs(d)) * (0.45 + 0.55 * fires);
  vLit = smoothstep(-0.1, 0.25, d) * (0.45 + 0.55 * fires);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (1.0 + vFire * 0.6 + sin(uTime * 2.0 + aSeed * 30.0) * 0.04) * uPixelRatio / -mv.z;
}`

const nodeFragment = /* glsl */ `
uniform float uOpacity;
varying float vFire;
varying float vLit;
${palette}
void main(){
  float d = length(gl_PointCoord - 0.5);
  float fill = max(vLit, vFire);
  float core = smoothstep(0.27, 0.22, d);                                   // filled once activated
  float ring = smoothstep(0.34, 0.31, d) - smoothstep(0.29, 0.26, d);      // hollow outline when idle
  float halo = smoothstep(0.5, 0.1, d);
  vec3 col = mix(VIOLET, CYAN, clamp(vLit, 0.0, 1.0));
  col = mix(col, WHITE, vFire * 0.85);
  float a = core * fill * 0.95 + ring * (0.4 + 0.5 * fill) + halo * (vFire * 0.9 + vLit * 0.12);
  gl_FragColor = vec4(col, a * uOpacity);
}`

const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aSeed;
varying float vA;
void main(){
  vec3 p = position;
  p.y = mod(position.y + uTime * (0.04 + aSeed * 0.08) + 6.0, 12.0) - 6.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (4.0 + aSeed * 8.0) * uPixelRatio / -mv.z;
  vA = 0.12 + 0.3 * aSeed;
}`

const dustFragment = /* glsl */ `
uniform float uOpacity;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  gl_FragColor = vec4(0.6, 0.75, 1.0, smoothstep(0.5, 0.0, d) * vA * uOpacity);
}`

// Where the network sits as the page scrolls: position, scale, rotation, opacity.
const KEYS = [
  { at: 0.0, x: 2.05, y: 0.0, z: 0.0, s: 0.62, rx: 0.08, ry: -0.38, o: 1 },
  { at: 0.1, x: 2.05, y: 0.0, z: 0.0, s: 0.62, rx: 0.08, ry: -0.38, o: 1 },
  { at: 0.35, x: 2.6, y: 0.0, z: -2.4, s: 0.9, rx: 0.12, ry: 0.5, o: 0.5 },
  { at: 0.62, x: 0.0, y: 0.0, z: -2.6, s: 1.05, rx: -0.08, ry: -0.3, o: 0.35 },
  { at: 0.85, x: 0.0, y: 0.1, z: -2.0, s: 0.95, rx: 0.05, ry: 0.15, o: 0.4 },
  { at: 1.0, x: 0.0, y: 0.6, z: -2.4, s: 0.95, rx: 0.1, ry: 0.0, o: 0.8 },
]
const smooth = (t) => t * t * (3 - 2 * t)
function sample(p) {
  let i = 0
  while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const t = smooth(THREE.MathUtils.clamp((p - a.at) / (b.at - a.at), 0, 1))
  const out = {}
  for (const k of ['x', 'y', 'z', 's', 'rx', 'ry', 'o']) out[k] = a[k] + (b[k] - a[k]) * t
  return out
}

function Network({ mobile, reduced }) {
  const group = useRef()
  const progress = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const nodes = useMemo(buildNodes, [])
  const edges = useMemo(buildEdges, [])
  const dust = useMemo(() => buildDust(mobile ? 400 : 1100), [mobile])
  const u = useMemo(
    () => ({
      uTime: { value: 0 },
      uWave: { value: 0 },
      uSize: { value: mobile ? 150 : 175 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uOpacity: { value: 1 },
    }),
    [mobile],
  )
  // Build materials by hand and point them all at the same uniforms object; passing `uniforms` as a
  // JSX prop gives each material its own copy, which would freeze the animation.
  const mats = useMemo(() => {
    const make = (vertexShader, fragmentShader) => {
      const m = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      m.uniforms = u
      return m
    }
    return {
      dust: make(dustVertex, dustFragment),
      edges: make(edgeVertex, edgeFragment),
      nodes: make(nodeVertex, nodeFragment),
    }
  }, [u])

  useFrame((state, delta) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const target = max > 0 ? window.scrollY / max : 0
    progress.current = THREE.MathUtils.damp(progress.current, target, 3.5, delta)
    const p = progress.current
    const k = sample(p)
    if (!reduced) u.uTime.value += delta

    // In the hero the signal loops input -> output on its own; once you scroll, scroll position drives it.
    const idle = ((u.uTime.value * 0.7) % (L + 1)) - 0.5
    const scrolled = -0.4 + p * (L - 0.2)
    u.uWave.value = THREE.MathUtils.lerp(idle, scrolled, smooth(THREE.MathUtils.clamp((p - 0.02) / 0.1, 0, 1)))
    u.uOpacity.value = mobile ? k.o * 0.6 : k.o

    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, state.pointer.x, 2, delta)
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, state.pointer.y, 2, delta)
    const sway = reduced ? 0 : Math.sin(u.uTime.value * 0.2) * 0.06

    const g = group.current
    g.position.set(mobile ? 0 : k.x, mobile ? k.y + (p < 0.1 ? 1.75 : 0) : k.y, k.z)
    g.scale.setScalar(mobile ? k.s * 0.62 : k.s)
    g.rotation.set(k.rx - pointer.current.y * 0.1, k.ry + sway + pointer.current.x * 0.18, 0)
  })

  return (
    <>
      <points geometry={dust} material={mats.dust} />
      <group ref={group}>
        <lineSegments geometry={edges} material={mats.edges} />
        <points geometry={nodes} material={mats.nodes} />
      </group>
    </>
  )
}

export default function NeuralNet() {
  const mobile = window.innerWidth < 768
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <div className="scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <Network mobile={mobile} reduced={reduced} />
      </Canvas>
    </div>
  )
}
