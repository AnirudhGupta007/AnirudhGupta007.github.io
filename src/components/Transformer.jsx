import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// A stylised decoder stack: T tokens per layer, L layers, 3 attention heads side by side in depth.
// Scrolling the page runs a "forward pass" up the stack; the active layer lights up.
export const LAYERS = 7
const T = 14
const HEADS = [-0.6, 0, 0.6]
const DX = 0.32
const DY = 0.72
const SEG = 22

const nodePos = (i, l, h) => [(i - (T - 1) / 2) * DX, (l - (LAYERS - 1) / 2) * DY, HEADS[h]]

function buildNodes() {
  const p = []
  const layer = []
  const seed = []
  for (let l = 0; l < LAYERS; l++)
    for (let h = 0; h < HEADS.length; h++)
      for (let i = 0; i < T; i++) {
        p.push(...nodePos(i, l, h))
        layer.push(l)
        seed.push(Math.random())
      }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3))
  g.setAttribute('aLayer', new THREE.Float32BufferAttribute(layer, 1))
  g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1))
  return g
}

function buildEdges() {
  const p = []
  const t = []
  const layer = []
  const seed = []
  const weight = []
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const q = new THREE.Vector3()

  const curve = (from, to, bulgeZ, l, w) => {
    a.set(...from)
    b.set(...to)
    c.addVectors(a, b).multiplyScalar(0.5)
    c.z += bulgeZ
    const s = Math.random()
    for (let k = 0; k < SEG; k++) {
      for (const u of [k / SEG, (k + 1) / SEG]) {
        // Quadratic bezier: (1-u)^2 a + 2u(1-u) c + u^2 b
        q.copy(a).multiplyScalar((1 - u) * (1 - u))
          .addScaledVector(c, 2 * u * (1 - u))
          .addScaledVector(b, u * u)
        p.push(q.x, q.y, q.z)
        t.push(u)
        layer.push(l)
        seed.push(s)
        weight.push(w)
      }
    }
  }

  for (let l = 0; l < LAYERS - 1; l++)
    for (let h = 0; h < HEADS.length; h++)
      for (let i = 0; i < T; i++) {
        // Causal attention: each token attends to itself, its neighbour and a couple of earlier tokens.
        const sources = new Map([[i, 1], [Math.max(0, i - 1), 0.6]])
        for (let n = 0; n < 1; n++) sources.set(Math.floor(Math.random() * (i + 1)), 0.25 + Math.random() * 0.5)
        for (const [j, w] of sources) {
          const bulge = HEADS[h] * 1.3 + (Math.random() - 0.5) * 0.35 + (j === i ? 0 : 0.15 * Math.sign(HEADS[h] || 1))
          curve(nodePos(j, l, h), nodePos(i, l + 1, h), j === i ? 0 : bulge, l, w)
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
const vec3 EMBER = vec3(1.0, 0.36, 0.2);
const vec3 AMBER = vec3(1.0, 0.72, 0.42);
const vec3 HOT = vec3(1.0, 0.93, 0.82);
const vec3 ASH = vec3(0.45, 0.4, 0.36);
`

const edgeVertex = /* glsl */ `
uniform float uTime;
uniform float uActive;
attribute float aT;
attribute float aLayer;
attribute float aSeed;
attribute float aW;
varying float vAlpha;
varying vec3 vColor;
${palette}
void main(){
  float act = 1.0 - smoothstep(0.0, 1.3, abs(aLayer + 0.5 - uActive));
  float phase = fract(uTime * (0.25 + aSeed * 0.2) + aSeed);
  float head = smoothstep(0.14, 0.0, abs(aT - phase));
  vAlpha = aW * (0.13 + 0.3 * act) + head * aW * (0.12 + 0.85 * act);
  vColor = mix(mix(ASH, EMBER, act), AMBER, aT * act);
  vColor = mix(vColor, HOT, head * act);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const edgeFragment = /* glsl */ `
uniform float uOpacity;
varying float vAlpha;
varying vec3 vColor;
void main(){ gl_FragColor = vec4(vColor, vAlpha * uOpacity); }`

const nodeVertex = /* glsl */ `
uniform float uTime;
uniform float uActive;
uniform float uSize;
uniform float uPixelRatio;
attribute float aLayer;
attribute float aSeed;
varying float vAct;
varying float vTw;
void main(){
  vAct = 1.0 - smoothstep(0.0, 1.0, abs(aLayer - uActive));
  vTw = 0.75 + 0.25 * sin(uTime * 2.0 + aSeed * 40.0);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.8 + vAct * 0.7) * uPixelRatio / -mv.z;
}`

const nodeFragment = /* glsl */ `
uniform float uOpacity;
varying float vAct;
varying float vTw;
${palette}
void main(){
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.18, 0.0, d);
  float halo = smoothstep(0.5, 0.0, d) * 0.35;
  vec3 col = mix(mix(ASH, AMBER, 0.35), mix(EMBER, HOT, core), vAct);
  float a = (core + halo * (0.3 + vAct)) * (0.72 + 0.28 * vAct) * vTw;
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
  vA = 0.15 + 0.35 * aSeed;
}`

const dustFragment = /* glsl */ `
uniform float uOpacity;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  gl_FragColor = vec4(1.0, 0.7, 0.5, smoothstep(0.5, 0.0, d) * vA * uOpacity);
}`

// Scroll keyframes for the stack: position, scale, rotation, opacity.
const KEYS = [
  { at: 0.0, x: 2.1, y: 0.0, z: 0.0, s: 0.95, rx: 0.12, ry: -0.55, o: 1 },
  { at: 0.12, x: 2.1, y: 0.0, z: 0.0, s: 0.95, rx: 0.12, ry: -0.55, o: 0.95 },
  { at: 0.34, x: 2.9, y: 0.0, z: -2.4, s: 1.1, rx: 0.2, ry: 0.5, o: 0.35 },
  { at: 0.62, x: -2.4, y: 0.0, z: -3.2, s: 1.2, rx: 0.05, ry: 1.45, o: 0.3 },
  { at: 0.84, x: 0.0, y: 0.0, z: -3.0, s: 1.2, rx: 0.5, ry: 0.2, o: 0.3 },
  { at: 1.0, x: 0.0, y: -0.6, z: -3.6, s: 1.5, rx: 1.25, ry: 0.0, o: 0.55 },
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

function Stack({ mobile, reduced, onProgress }) {
  const group = useRef()
  const progress = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const nodes = useMemo(buildNodes, [])
  const edges = useMemo(buildEdges, [])
  const dust = useMemo(() => buildDust(mobile ? 500 : 1400), [mobile])
  const pr = Math.min(window.devicePixelRatio || 1, 2)
  const u = useMemo(
    () => ({
      uTime: { value: 0 },
      uActive: { value: 0 },
      uSize: { value: mobile ? 70 : 85 },
      uPixelRatio: { value: pr },
      uOpacity: { value: 1 },
    }),
    [mobile, pr],
  )

  useFrame((state, delta) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const target = max > 0 ? window.scrollY / max : 0
    progress.current = THREE.MathUtils.damp(progress.current, target, 3.5, delta)
    const p = progress.current
    const k = sample(p)
    if (!reduced) u.uTime.value += delta

    // Idle forward pass loops in the hero; once scrolling, the page position drives it.
    const idle = ((u.uTime.value * 0.9) % (LAYERS + 1.5)) - 0.75
    const scroll = -0.5 + p * LAYERS
    u.uActive.value = THREE.MathUtils.lerp(idle, scroll, smooth(THREE.MathUtils.clamp((p - 0.02) / 0.1, 0, 1)))
    u.uOpacity.value = mobile ? k.o * 0.55 : k.o
    onProgress?.(u.uActive.value)

    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, state.pointer.x, 2, delta)
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, state.pointer.y, 2, delta)
    const sway = reduced ? 0 : Math.sin(u.uTime.value * 0.15) * 0.12

    const g = group.current
    g.position.set(mobile ? 0 : k.x, mobile ? k.y + (p < 0.12 ? 2.4 : 0) : k.y, k.z)
    g.scale.setScalar(mobile ? k.s * 0.62 : k.s)
    g.rotation.set(k.rx - pointer.current.y * 0.12, k.ry + sway + pointer.current.x * 0.2, 0)
  })

  const common = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }
  return (
    <>
      <points geometry={dust}>
        <shaderMaterial vertexShader={dustVertex} fragmentShader={dustFragment} uniforms={u} {...common} />
      </points>
      <group ref={group}>
        <lineSegments geometry={edges}>
          <shaderMaterial vertexShader={edgeVertex} fragmentShader={edgeFragment} uniforms={u} {...common} />
        </lineSegments>
        <points geometry={nodes}>
          <shaderMaterial vertexShader={nodeVertex} fragmentShader={nodeFragment} uniforms={u} {...common} />
        </points>
      </group>
    </>
  )
}

export default function Transformer({ onProgress }) {
  const mobile = window.innerWidth < 768
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <div className="scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <Stack mobile={mobile} reduced={reduced} onProgress={onProgress} />
      </Canvas>
    </div>
  )
}
