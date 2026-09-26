import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Ashima 3D simplex noise, used to make the particle field breathe.
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uSize;
uniform float uPixelRatio;
attribute vec3 aRing;
attribute vec3 aGalaxy;
attribute float aRand;
varying float vTone;
varying float vAlpha;
${noise}
void main(){
  vec3 p;
  float m = uMorph;
  if (m < 1.0) p = mix(position, aRing, smoothstep(0.0, 1.0, m));
  else if (m < 2.0) p = mix(aRing, aGalaxy, smoothstep(0.0, 1.0, m - 1.0));
  else p = mix(aGalaxy, position, smoothstep(0.0, 1.0, m - 2.0));

  float n = snoise(p * 1.1 + vec3(0.0, uTime * 0.12, uTime * 0.08));
  p += normalize(p + 1e-4) * n * 0.14;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.35 + aRand * 0.9) * uPixelRatio / -mv.z;

  vTone = clamp(n * 0.5 + 0.5 + (p.y * 0.12), 0.0, 1.0);
  vAlpha = 0.25 + 0.75 * aRand;
}`

const fragmentShader = /* glsl */ `
uniform float uOpacity;
varying float vTone;
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float glow = smoothstep(0.5, 0.0, d);
  glow *= glow;
  vec3 cyan = vec3(0.49, 0.83, 0.99);
  vec3 violet = vec3(0.55, 0.36, 0.96);
  vec3 white = vec3(0.93, 0.96, 1.0);
  vec3 col = mix(violet, cyan, vTone);
  col = mix(col, white, smoothstep(0.75, 1.0, vTone) * 0.6);
  gl_FragColor = vec4(col, glow * vAlpha * uOpacity);
}`

function buildGeometry(count) {
  const sphere = new Float32Array(count * 3)
  const ring = new Float32Array(count * 3)
  const galaxy = new Float32Array(count * 3)
  const rand = new Float32Array(count)
  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < count; i++) {
    // Sphere: fibonacci lattice with a little depth so it reads as a volume.
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    const shell = 1 - Math.random() * 0.08
    sphere.set([Math.cos(theta) * r * shell, y * shell, Math.sin(theta) * r * shell], i * 3)

    // Ring: a thick torus of orbiting points.
    const a = Math.random() * Math.PI * 2
    const tube = 0.22 * Math.sqrt(Math.random())
    const tubeA = Math.random() * Math.PI * 2
    const R = 1.25 + Math.cos(tubeA) * tube
    ring.set([Math.cos(a) * R, Math.sin(tubeA) * tube * 0.6, Math.sin(a) * R], i * 3)

    // Galaxy: 3 spiral arms on a flat disc.
    const arm = i % 3
    const t = Math.pow(Math.random(), 0.7)
    const radius = 0.15 + t * 1.9
    const spin = radius * 2.6 + (arm * Math.PI * 2) / 3
    const scatter = (1 - t * 0.5) * 0.28
    galaxy.set(
      [
        Math.cos(spin) * radius + (Math.random() - 0.5) * scatter,
        (Math.random() - 0.5) * 0.12 * (1.2 - t),
        Math.sin(spin) * radius + (Math.random() - 0.5) * scatter,
      ],
      i * 3,
    )

    rand[i] = Math.random()
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(sphere, 3))
  geo.setAttribute('aRing', new THREE.BufferAttribute(ring, 3))
  geo.setAttribute('aGalaxy', new THREE.BufferAttribute(galaxy, 3))
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
  return geo
}

// Scroll keyframes: where the orb sits, how big it is, how it is tilted, and which shape it is in.
// morph: 0 sphere, 1 ring, 2 galaxy, 3 back to sphere.
const KEYS = [
  { at: 0.0, x: 1.9, y: 0.05, z: 0, s: 1.35, tilt: 0.25, morph: 0, o: 1 },
  { at: 0.12, x: 1.9, y: 0.05, z: 0, s: 1.35, tilt: 0.25, morph: 0, o: 0.9 },
  { at: 0.34, x: 2.6, y: 0.0, z: -2.2, s: 1.8, tilt: 0.9, morph: 1, o: 0.22 },
  { at: 0.62, x: -1.2, y: -0.3, z: -3.5, s: 2.4, tilt: 1.1, morph: 2, o: 0.2 },
  { at: 0.84, x: 0.0, y: 0.2, z: -2.5, s: 2.2, tilt: 0.5, morph: 2.6, o: 0.3 },
  { at: 1.0, x: 0.0, y: 3.1, z: -1.0, s: 3.0, tilt: 0.1, morph: 3, o: 1 },
]
const ease = (t) => t * t * (3 - 2 * t)

function sample(p) {
  let i = 0
  while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const t = ease(THREE.MathUtils.clamp((p - a.at) / (b.at - a.at), 0, 1))
  const out = {}
  for (const k of ['x', 'y', 'z', 's', 'tilt', 'morph', 'o']) out[k] = a[k] + (b[k] - a[k]) * t
  return out
}

function Particles({ count, mobile, reduced }) {
  const group = useRef()
  const progress = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const { gl } = useThree()
  const geometry = useMemo(() => buildGeometry(count), [count])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uSize: { value: mobile ? 34 : 42 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uOpacity: { value: 1 },
    }),
    [gl, mobile],
  )

  useFrame((state, delta) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const target = max > 0 ? window.scrollY / max : 0
    progress.current = THREE.MathUtils.damp(progress.current, target, 4, delta)
    const k = sample(progress.current)

    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, state.pointer.x, 2.5, delta)
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, state.pointer.y, 2.5, delta)

    const g = group.current
    const scale = mobile ? k.s * 0.8 : k.s
    g.position.set(mobile ? k.x * 0.15 : k.x, mobile ? k.y + (progress.current < 0.14 ? 1.5 : 0) : k.y, k.z)
    g.scale.setScalar(scale)
    g.rotation.x = k.tilt + pointer.current.y * 0.15
    if (!reduced) g.rotation.y += delta * 0.06
    g.rotation.z = pointer.current.x * 0.1

    if (!reduced) uniforms.uTime.value += delta
    uniforms.uMorph.value = k.morph
    uniforms.uOpacity.value = mobile ? k.o * 0.7 : k.o
  })

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

export default function Orb() {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="orb" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <Particles count={mobile ? 9000 : 22000} mobile={mobile} reduced={reduced} />
      </Canvas>
    </div>
  )
}
