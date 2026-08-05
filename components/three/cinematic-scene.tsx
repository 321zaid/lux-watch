"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity, react-hooks/immutability */
// Three.js scene setup and the useFrame loop mutate r3f refs and call Math.random
// by design; React's component-purity rules do not model the r3f frame loop.

import { Suspense, useEffect, useMemo, useRef, type ReactElement } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  useGLTF,
  Sparkles,
  Environment,
  Lightformer,
  AdaptiveDpr,
} from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import { scrollStore } from "@/lib/scroll-store";

// Draco decoder is served locally (public/draco) — no runtime CDN dependency.
useGLTF.setDecoderPath("/draco/");

// Normalise the GLB so its longest axis ≈ 1 unit, guaranteeing consistent framing.
// The SHOTS table (camera distance 2.2–3.6, fov 24–31°) was tuned for a ~1-unit
// watch; 0.85 keeps it hero-sized while still fully fitting the tightest
// full-watch beats (freeze/final). The model is also recentred so its bounding
// box centre sits on the camera's look axis.
const WATCH_NORM = 0.85;
function useNormalizedModel() {
  const { scene } = useGLTF("/models/hero-watch.glb");
  const group = useMemo(() => {
    const g = new THREE.Group();
    g.add(scene.clone(true));
    const box = new THREE.Box3().setFromObject(g);
    const size = box.getSize(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z);
    if (longest > 0) {
      const s = WATCH_NORM / longest;
      g.scale.setScalar(s);
      box.setFromObject(g);
      g.position.copy(box.getCenter(new THREE.Vector3())).multiplyScalar(-1);
    }
    return g;
  }, [scene]);
  return group;
}

interface Shot {
  t: number;
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const SHOTS: Shot[] = [
  // t, pos, target, fov — the scroll-length film moves from dark, far establishment
  // shot through a composed sequence: orbit → crown → dial → whip-pan → reflection
  // sweep → macro hands → freeze → signature handoff.
  { t: 0.0, pos: [3.6, 1.5, 3.6], target: [0, 0, 0], fov: 31 }, // emerge from darkness
  { t: 0.12, pos: [2.9, 0.4, 2.9], target: [0, 0.05, 0], fov: 30 }, // orbital sweep
  { t: 0.28, pos: [2.7, 0.6, 1.95], target: [0.18, 0.12, 0], fov: 28 }, // crown reveal
  { t: 0.38, pos: [0.2, 0.35, 2.4], target: [0, 0, 0], fov: 26 }, // dial, straight-on
  { t: 0.46, pos: [3.3, 1.1, 1.9], target: [0.05, 0.02, 0], fov: 29 }, // whip-pan peak
  { t: 0.52, pos: [-2.2, -0.2, 2.2], target: [0, 0.06, 0], fov: 27 }, // reflection sweep (low)
  { t: 0.64, pos: [0.65, 0.8, 1.55], target: [0.05, 0.03, 0], fov: 24 }, // macro hands
  { t: 0.72, pos: [0, 0.35, 2.2], target: [0, 0, 0], fov: 27 }, // freeze beat, face-on
  { t: 0.8, pos: [0, 0.35, 2.2], target: [0, 0, 0], fov: 27 }, // freeze hold
  { t: 0.87, pos: [0, 0.33, 2.5], target: [0, 0, 0], fov: 25 }, // settle back
  { t: 0.94, pos: [0, 0.33, 2.65], target: [0, 0, 0], fov: 24 }, // final composition
  { t: 1.0, pos: [0, 0.33, 2.7], target: [0, 0, 0], fov: 24 }, // signature handoff
];

function sample(a: Shot[], p: number, pick: (v: Shot) => number): number {
  if (p <= a[0].t) return pick(a[0]);
  for (let i = 1; i < a.length; i++) {
    if (p <= a[i].t) {
      const span = a[i].t - a[i - 1].t || 1;
      const k = Math.min(1, Math.max(0, (p - a[i - 1].t) / span));
      return pick(a[i - 1]) + (pick(a[i]) - pick(a[i - 1])) * k;
    }
  }
  return pick(a[a.length - 1]);
}

function CameraRig() {
  const camera = useThree((s) => s.camera);
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const pos = useRef(new THREE.Vector3(...SHOTS[0].pos));
  const fov = useRef(SHOTS[0].fov);
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const p = scrollStore.progress;
    tmpA.set(
      sample(SHOTS, p, (s) => s.pos[0]),
      sample(SHOTS, p, (s) => s.pos[1]),
      sample(SHOTS, p, (s) => s.pos[2])
    );
    tmpB.set(
      sample(SHOTS, p, (s) => s.target[0]),
      sample(SHOTS, p, (s) => s.target[1]),
      sample(SHOTS, p, (s) => s.target[2])
    );
    const f = sample(SHOTS, p, (s) => s.fov);
    // Entrance breath: while the reveal is playing the establishment shot
    // floats gently so the entry never feels static.
    if (scrollStore.introActive) {
      const t = performance.now() * 0.001;
      pos.current.y += Math.sin(t * 0.5) * 0.03;
      look.current.y += Math.sin(t * 0.4) * 0.008;
    }
    // Whip-pan: a single punctuated fast move accelerating into the 0.46 peak
    // (arc from dial to reflection sweep), then easing back out. Everywhere else
    // the camera glides at the base lerp rate.
    const k = Math.min(1, Math.max(0, p < 0.46 ? (p - 0.38) / 0.08 : (0.56 - p) / 0.1));
    const lerp = 0.09 + 0.15 * k;
    pos.current.lerp(tmpA, lerp);
    look.current.lerp(tmpB, 0.08);
    fov.current += (f - fov.current) * (0.06 + 0.12 * k);
    // Orbit arc: the approach shots rise, sweep wide, and fall as the watch is
    // discovered — envelope peaks mid-orbit, decays by the freeze.
    if (p < 0.72) {
      const orbitEnv = Math.sin(Math.min(1, p / 0.28) * Math.PI);
      const sway = Math.sin(p * Math.PI * 4.5) * 0.085 * orbitEnv * (1 - p / 0.72);
      pos.current.y += sway;
    }
    camera.position.copy(pos.current);
    camera.lookAt(look.current);
    if (Math.abs((camera as THREE.PerspectiveCamera).fov - fov.current) > 0.01) {
      (camera as THREE.PerspectiveCamera).fov = fov.current;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
    // Dev-only telemetry: exposes the current camera pose for scroll-shot verification.
    if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
      const camP = (camera as THREE.PerspectiveCamera);
      (window as unknown as { __cin: unknown }).__cin = {
        p: scrollStore.progress,
        pos: camP.position.toArray(),
        fov: camP.fov,
      };
    }
  });

  return null;
}

function WatchRig() {
  const model = useNormalizedModel();
  const group = useRef<THREE.Group>(null);
  const matRefs = useRef<{ mat: THREE.MeshStandardMaterial; baseOpacity: number }[]>([]);

  useEffect(() => {
    matRefs.current = [];
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!(m as THREE.MeshStandardMaterial & { isMeshStandardMaterial?: boolean }).isMeshStandardMaterial) return;
        const std = m as THREE.MeshStandardMaterial;
        const name = std.name.toLowerCase();
        if (name.includes("glass")) {
          // Sapphire crystal: near-transparent, mirror-flat, letting the dial read through.
          std.metalness = 0.05;
          std.roughness = 0.02;
          std.envMapIntensity = 1.6;
          std.transparent = true;
          std.depthWrite = false;
          matRefs.current.push({ mat: std, baseOpacity: 0.16 });
        } else {
          // Polished case/bracelet: deep metallic with soft brushed falloff.
          std.metalness = 0.95;
          std.roughness = 0.28;
          std.envMapIntensity = 1.35;
          matRefs.current.push({ mat: std, baseOpacity: 1 });
        }
      });
    });
  }, [model]);

  useFrame(() => {
    const p = scrollStore.progress;
    if (!group.current) return;
    // Entrance reveal: the watch is absent for a beat, then rises and fades in
    // as the gold field drifts — the site breathes on arrival instead of
    // sitting static. Scroll takes over once the film begins.
    const reveal = THREE.MathUtils.smoothstep(scrollStore.intro, 0.12, 0.62);
    const frozen = p > 0.72;
    group.current.rotation.y = frozenYaw(p);
    group.current.rotation.x = frozenPitch(p);
    // Between beats the watch stays alive: a slow idle roll + breathing scale.
    // The Freeze beat (p > 0.72) locks every axis until the dissolve takes over.
    const idle = frozen ? 0 : Math.sin(p * Math.PI * 9);
    group.current.rotation.z = idle * 0.018;
    const breathe = 1 + idle * 0.006;
    const dissolve = THREE.MathUtils.clamp((p - 0.8) / 0.14, 0, 1);
    const ease = 1 - Math.pow(1 - dissolve, 3);
    group.current.scale.setScalar((1 - 0.24 * ease) * breathe * (0.5 + 0.5 * reveal));
    group.current.position.y = (1 - reveal) * 0.35;
    const fade = THREE.MathUtils.clamp((p - 0.86) / 0.1, 0, 1);
    matRefs.current.forEach(({ mat, baseOpacity }) => {
      mat.opacity = baseOpacity * reveal * (1 - fade);
      mat.transparent = true;
    });
  });

  return <primitive ref={group} object={model} />;
}

type Key = { t: number; v: number };
/** Linear sample across a time/value keyframe table. */
function sampleKey(keys: Key[], p: number): number {
  if (p <= keys[0].t) return keys[0].v;
  if (p >= keys[keys.length - 1].t) return keys[keys.length - 1].v;
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i].t) {
      const span = keys[i].t - keys[i - 1].t || 1;
      const k = Math.min(1, Math.max(0, (p - keys[i - 1].t) / span));
      return keys[i - 1].v + (keys[i].v - keys[i - 1].v) * k;
    }
  }
  return keys[keys.length - 1].v;
}

// Watch orientation keyframed to mirror SHOTS so the dial faces each camera angle
// (yaw ≈ camera azimuth = face-on dial; yaw − azimuth ≈ ±π/2 = side profile).
const WATCH_YAW: Key[] = [
  { t: 0.0, v: 0.72 },
  { t: 0.12, v: 0.66 },
  { t: 0.28, v: 0.5 },
  { t: 0.38, v: 0.0 },
  { t: 0.52, v: 0.18 },
  { t: 0.64, v: 0.28 },
  { t: 0.72, v: 0.0 },
  { t: 1.0, v: 0.0 },
];
const WATCH_PITCH: Key[] = [
  { t: 0.0, v: -0.06 },
  { t: 0.12, v: -0.12 },
  { t: 0.28, v: -0.04 },
  { t: 0.38, v: -0.14 },
  { t: 0.52, v: 0.08 },
  { t: 0.64, v: 0.02 },
  { t: 0.72, v: -0.08 },
  { t: 1.0, v: -0.08 },
];
function frozenYaw(p: number) {
  return p > 0.72 ? 0 : sampleKey(WATCH_YAW, p);
}
function frozenPitch(p: number) {
  return p > 0.72 ? sampleKey(WATCH_PITCH, 0.72) : sampleKey(WATCH_PITCH, p);
}

/** Metallic particles sampled from the watch's own geometry; burst outward during the dissolve. */
function DissolveParticles({ count = 2600 }: { count?: number }) {
  const { scene } = useGLTF("/models/hero-watch.glb");
  const points = useRef<THREE.Points>(null);
  const seeds = useRef<Float32Array | null>(null);
  const offsets = useRef<Float32Array | null>(null);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) {
        const geo = mesh.geometry as THREE.BufferGeometry;
        const attr = geo.getAttribute("position");
        if (!attr) return;
        const n = attr.count;
        for (let i = 0; i < count && positions.length < count * 3; i++) {
          const idx = Math.floor(Math.random() * n);
          positions.push(attr.getX(idx), attr.getY(idx), attr.getZ(idx));
        }
      }
    });
    const arr = new Float32Array(Math.max(positions.length, count * 3));
    const n = positions.length / 3;
    if (n < count) {
      for (let i = 0; i < count; i++) {
        arr[i * 3] = positions[(i % n) * 3];
        arr[i * 3 + 1] = positions[(i % n) * 3 + 1];
        arr[i * 3 + 2] = positions[(i % n) * 3 + 2];
      }
    } else {
      arr.set(positions);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return geo;
  }, [scene, count]);

  useMemo(() => {
    const n = geometry.attributes.position.count;
    seeds.current = new Float32Array(n * 3);
    offsets.current = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      seeds.current[i * 3] = Math.random() * 2 - 1;
      seeds.current[i * 3 + 1] = Math.random() * 2 - 1;
      seeds.current[i * 3 + 2] = Math.random() * 2 - 1;
      const len = 0.4 + Math.random() * 1.6;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(Math.random() * 2 - 1);
      offsets.current[i * 3] = Math.sin(b) * Math.cos(a) * len;
      offsets.current[i * 3 + 1] = Math.sin(b) * Math.sin(a) * len;
      offsets.current[i * 3 + 2] = Math.cos(b) * len;
    }
  }, [geometry]);

  useFrame(() => {
    const p = scrollStore.progress;
    const start = 0.78;
    const end = 0.98;
    const k = THREE.MathUtils.clamp((p - start) / (end - start), 0, 1);
    const ease = k * k * (3 - 2 * k);
    if (!points.current || !seeds.current || !offsets.current) return;
    const attr = points.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const pos = attr.array as Float32Array;
    const n = attr.count;
    for (let i = 0; i < n; i++) {
      pos[i * 3] = seeds.current[i * 3] * (1 - ease) + offsets.current[i * 3] * ease;
      pos[i * 3 + 1] = seeds.current[i * 3 + 1] * (1 - ease) + offsets.current[i * 3 + 1] * ease;
      pos[i * 3 + 2] = seeds.current[i * 3 + 2] * (1 - ease) + offsets.current[i * 3 + 2] * ease;
    }
    attr.needsUpdate = true;
    (points.current.material as THREE.PointsMaterial).opacity = ease;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.012}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#d8c29a"
      />
    </points>
  );
}

/**
 * Ambient dust with a scroll envelope: livelier while the camera is between
 * beats (transitions), calmer during holds. Drive-in, drive-out around each
 * keyframe via a pseudo-derivative of the shot timeline.
 */
function AmbientDust({ count, scale }: { count: number; scale: [number, number, number] }) {
  const sparkles = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    const p = scrollStore.progress;
    const pts = sparkles.current;
    if (!pts) return;
    pts.visible = p < 0.78;
    // The gold field never sits still: a perpetual slow drift, livelier during
    // the entrance reveal, calmer once the scroll film owns the canvas.
    const t = clock.getElapsedTime();
    const drift = scrollStore.introActive ? 1 : 0.6;
    pts.rotation.y = Math.sin(t * 0.06) * 0.14 * drift;
    pts.rotation.z = Math.cos(t * 0.045) * 0.07 * drift;
    // Transition energy: high mid-beat, low at each keyframe. Sum of triangle
    // impulses centered on every shot except the freeze hold.
    let energy = 0;
    for (const s of SHOTS) {
      if (s.t >= 0.72) break;
      const d = Math.abs(p - s.t);
      energy += Math.max(0, 1 - d / 0.09);
    }
    const target = 0.22 + 0.3 * Math.min(1, energy) + (scrollStore.introActive ? 0.28 : 0);
    const attr = pts.geometry.getAttribute("opacity") as THREE.BufferAttribute | undefined;
    if (attr) {
      const a = attr.array as Float32Array;
      for (let i = 0; i < a.length; i++) a[i] += (target - a[i]) * 0.1;
      attr.needsUpdate = true;
    }
  });

  return <Sparkles ref={sparkles} count={count} scale={scale} size={1.6} speed={0.5} opacity={0.4} color="#cfc6b4" />;
}

function StudioLighting() {
  return (
    <Environment resolution={512} frames={1}>
      {/* Large top softbox — the dominant reflection on the case and bracelet */}
      <Lightformer intensity={6} position={[0, 3.2, 2]} scale={[8, 4, 1]} color="#ffffff" />
      {/* Warm key strip, front-left */}
      <Lightformer intensity={3.2} position={[-4, 1.2, 2]} scale={[2.5, 6, 1]} color="#ffe9d0" />
      {/* Cool fill strip, front-right — crisp edge definition on the case */}
      <Lightformer intensity={2.6} position={[4, 0.2, 1.5]} scale={[2.5, 6, 1]} color="#e8f1ff" />
      {/* Soft bounce under the dial */}
      <Lightformer intensity={2} position={[0, -1.6, 3]} scale={[6, 3, 1]} color="#dfe6ee" />
      {/* Back rim strips — carve the silhouette out of the dark backdrop */}
      <Lightformer intensity={3} position={[0, 1, -4]} scale={[8, 3, 1]} color="#f0f4f8" />
      <Lightformer intensity={2.4} position={[2.6, 2.4, -1.5]} scale={[3, 1.5, 1]} color="#fff7ea" />
    </Environment>
  );
}

/**
 * Demand-mode driver: the canvas renders only while the film is scrubbed
 * (or briefly settling after). Idle = zero GPU work.
 */
function FrameDriver() {
  const invalidate = useThree((s) => s.invalidate);
  const settleUntil = useRef(performance.now() + 1500);
  useEffect(() => {
    return scrollStore.subscribe(() => {
      settleUntil.current = performance.now() + 1500;
      invalidate();
    });
  }, [invalidate]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      // The gold field never freezes: while it is on screen (before the dissolve)
      // keep a slow steady render so the orbs drift even with zero scroll input.
      if (scrollStore.progress < 0.78 && now - last > 33) {
        last = now;
        invalidate();
      }
      // Render continuously while the entrance reveal plays (time-driven), then
      // settle back into demand mode: idle = zero GPU work.
      if (scrollStore.introActive || settleUntil.current > performance.now()) invalidate();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);

  return null;
}

export function CinematicScene() {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const isSmall = size.width < 1024;
  const dust = isMobile ? 140 : 220;

  const effects: ReactElement[] = [
    ...(isSmall ? [] : [<DepthOfField key="dof" focusDistance={0.02} focalLength={0.055} bokehScale={2.4} />]),
    <Bloom
      key="bloom"
      intensity={isMobile ? 0.45 : 0.55}
      luminanceThreshold={0.72}
      luminanceSmoothing={0.6}
      mipmapBlur
      radius={0.7}
    />,
    <Vignette key="vignette" eskil={false} offset={0.18} darkness={0.78} />,
  ];

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <StudioLighting />
      {/* Key (warm) / fill (cool) / rim — shadows off: env handles most of the metal response */}
      <directionalLight position={[3, 4, 2.5]} intensity={1.4} color="#ffe9c9" />
      <directionalLight position={[-4, -1, 3]} intensity={0.6} color="#9fb6d8" />
      <directionalLight position={[0.5, 1.5, -4]} intensity={1.8} color="#ffffff" />
      <Suspense fallback={null}>
        <WatchRig />
        <DissolveParticles count={isMobile ? 1600 : 2600} />
      </Suspense>
      <AmbientDust count={dust} scale={[7, 5, 7]} />
      <CameraRig />
      <FrameDriver />
      <AdaptiveDpr pixelated />
      <EffectComposer multisampling={isMobile ? 0 : 4}>{effects}</EffectComposer>
    </>
  );
}
