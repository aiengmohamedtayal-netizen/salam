import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WebGLFallback } from './WebGLFallback';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Checks if WebGL is available in the current browser environment.
 */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function readThemeColor(variableName, fallback) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
  try {
    return new THREE.Color(value || fallback);
  } catch {
    return new THREE.Color(fallback);
  }
}

/**
 * AMAL Interactive 3D Neural/NLP Network Component.
 * Abstract representation of linguistic parsing, embeddings, and cognitive indicators.
 *
 * @param {object} props
 * @param {'idle'|'processing'|'result'|'error'} [props.state='idle']
 * @param {boolean} [props.interactive=true] - Respond to mouse/touch hover
 * @param {string} [props.className]
 */
export function SalamNeuralNetwork({
  state = 'idle',
  interactive = true,
  className,
}) {
  const containerRef = useRef(null);
  const [hasWebGLError, setHasWebGLError] = useState(() => !isWebGLAvailable());

  // Keep state ref updated for animation loop without recreation
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (hasWebGLError) return;

    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 320;
    let height = container.clientHeight || 280;

    // 2. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 24;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
    } catch {
      setTimeout(() => setHasWebGLError(true), 0);
      return;
    }

    // 3. Network Construction: Nodes & Connections
    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 55 : 95;
    const maxDistance = isMobile ? 5.8 : 5.0;

    // Node Positions & Velocities
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeBasePositions = [];
    const nodeColors = new Float32Array(nodeCount * 3);

    // Read the active theme so the scene stays in step with the rest of AMAL.
    const colorPrimary = readThemeColor('--color-primary-500', '#a169cf');
    const colorPrimaryLight = readThemeColor('--color-primary-300', '#d1b1e9');
    const colorPrimaryDark = readThemeColor('--color-primary-700', '#70409a');
    const colorGold = new THREE.Color(0xf59e0b); // attention / gold
    const colorSlate = readThemeColor('--color-text-muted', '#81718f');

    for (let i = 0; i < nodeCount; i++) {
      // Distribute organically in a central ellipsoid
      const radius = 6.5 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.75;
      const z = radius * Math.cos(phi) * 0.85;

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      nodeBasePositions.push({
        x,
        y,
        z,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
      });

      // Keep most signals in the brand family with a few warm attention points.
      let chosenColor = colorPrimary;
      const rand = Math.random();
      if (rand > 0.85) chosenColor = colorGold;
      else if (rand > 0.62) chosenColor = colorPrimaryLight;
      else if (rand > 0.32) chosenColor = colorPrimaryDark;
      else if (rand > 0.16) chosenColor = colorSlate;

      nodeColors[i * 3] = chosenColor.r;
      nodeColors[i * 3 + 1] = chosenColor.g;
      nodeColors[i * 3 + 2] = chosenColor.b;
    }

    // Points Geometry & Material
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(nodePositions, 3)
    );
    pointsGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(nodeColors, 3)
    );

    // Procedural smooth circular sprite with clear depth
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 32;
    spriteCanvas.height = 32;
    const ctx = spriteCanvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.35, 'rgba(161,105,207,0.92)');
      gradient.addColorStop(0.7, 'rgba(88,50,120,0.72)');
      gradient.addColorStop(1, 'rgba(40,27,52,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const pointTexture = new THREE.CanvasTexture(spriteCanvas);

    const pointsMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.9 : 1.1,
      vertexColors: true,
      map: pointTexture,
      transparent: true,
      opacity: 0.92,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    // Connections: LineSegments with dynamic buffer
    const maxConnections = (nodeCount * (nodeCount - 1)) / 2;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(linePositions, 3)
    );
    linesGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(lineColors, 3)
    );

    const linesMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.38,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(lines);

    // Central Core Wireframe Orb
    const coreGeometry = new THREE.IcosahedronGeometry(3.6, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: colorPrimary,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    const createOrbit = (radius, color, opacity, rotation) => {
      const geometry = new THREE.TorusGeometry(radius, 0.018, 6, 160);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.set(...rotation);
      scene.add(mesh);
      return { geometry, material, mesh };
    };
    const orbits = [
      createOrbit(7.2, colorPrimaryLight, 0.28, [1.1, 0.2, -0.15]),
      createOrbit(9.1, colorGold, 0.13, [1.65, -0.45, 0.35]),
    ];

    // 4. Mouse Parallax & Interaction
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const handlePointerMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.45;
      targetRotationX = -y * 0.35;
    };

    container.addEventListener('pointermove', handlePointerMove);

    // 5. Animation Loop
    let animationFrameId = null;
    let isVisible = true;
    const startTime = performance.now();
    const reducedMotion = prefersReducedMotion();

    const animate = () => {
      const elapsedTime = (performance.now() - startTime) * 0.001;
      const currentState = stateRef.current;

      // Speed & behavior based on state
      let speedFactor = 1.0;
      let pulseFreq = 1.2;
      let lineOpacityTarget = 0.38;

      if (currentState === 'processing') {
        speedFactor = 2.4;
        pulseFreq = 3.2;
        lineOpacityTarget = 0.42;
      } else if (currentState === 'result') {
        speedFactor = 0.8;
        pulseFreq = 1.0;
        lineOpacityTarget = 0.26;
      } else if (currentState === 'error') {
        speedFactor = 0.5;
        pulseFreq = 0.7;
        lineOpacityTarget = 0.16;
      }

      // Parallax damping
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;

      points.rotation.y = elapsedTime * 0.05 * speedFactor + currentRotationY;
      points.rotation.x = currentRotationX;

      lines.rotation.y = points.rotation.y;
      lines.rotation.x = points.rotation.x;

      coreMesh.rotation.y = -elapsedTime * 0.07 * speedFactor + currentRotationY;
      coreMesh.rotation.x = currentRotationX;
      orbits[0].mesh.rotation.z = -0.15 + elapsedTime * 0.018 * speedFactor;
      orbits[1].mesh.rotation.y = -0.45 + elapsedTime * 0.012 * speedFactor;

      // Update Node Positions with organic breathing drift
      const posAttr = pointsGeometry.attributes.position;
      const posArray = posAttr.array;

      for (let i = 0; i < nodeCount; i++) {
        const base = nodeBasePositions[i];
        const drift =
          Math.sin(elapsedTime * base.speed * speedFactor + base.phase) * 0.4;

        posArray[i * 3] = base.x + drift * 0.25;
        posArray[i * 3 + 1] = base.y + drift * 0.4;
        posArray[i * 3 + 2] = base.z + drift * 0.25;
      }
      posAttr.needsUpdate = true;

      // Update Dynamic Connections
      let lineIndex = 0;
      const linePosArray = linesGeometry.attributes.position.array;
      const lineColArray = linesGeometry.attributes.color.array;

      const thresholdDist = maxDistance;

      for (let i = 0; i < nodeCount; i++) {
        const x1 = posArray[i * 3];
        const y1 = posArray[i * 3 + 1];
        const z1 = posArray[i * 3 + 2];

        for (let j = i + 1; j < nodeCount; j++) {
          const x2 = posArray[j * 3];
          const y2 = posArray[j * 3 + 1];
          const z2 = posArray[j * 3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < thresholdDist * thresholdDist) {
            linePosArray[lineIndex * 6] = x1;
            linePosArray[lineIndex * 6 + 1] = y1;
            linePosArray[lineIndex * 6 + 2] = z1;

            linePosArray[lineIndex * 6 + 3] = x2;
            linePosArray[lineIndex * 6 + 4] = y2;
            linePosArray[lineIndex * 6 + 5] = z2;

            // Soft distance fade with crisp contrast on light background
            const alpha = 1.0 - Math.sqrt(distSq) / thresholdDist;
            const pulse =
              0.55 + 0.45 * Math.sin(elapsedTime * pulseFreq + (x1 + y1));

            const r = colorPrimary.r * alpha * pulse;
            const g = colorPrimary.g * alpha * pulse;
            const b = colorPrimary.b * alpha * pulse;

            lineColArray[lineIndex * 6] = r;
            lineColArray[lineIndex * 6 + 1] = g;
            lineColArray[lineIndex * 6 + 2] = b;

            lineColArray[lineIndex * 6 + 3] = r;
            lineColArray[lineIndex * 6 + 4] = g;
            lineColArray[lineIndex * 6 + 5] = b;

            lineIndex++;
          }
        }
      }

      linesMaterial.opacity = lineOpacityTarget;
      linesGeometry.setDrawRange(0, lineIndex * 2);
      linesGeometry.attributes.position.needsUpdate = true;
      linesGeometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);

      // In reduced motion, render single static state and avoid RAF loop
      if (!reducedMotion && isVisible) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        animationFrameId = null;
      }
    };

    // Initial render
    animate();

    const visibilityObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
          isVisible = entry.isIntersecting;
          if (!isVisible && animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          } else if (isVisible && !reducedMotion && animationFrameId === null) {
            animationFrameId = requestAnimationFrame(animate);
          } else if (isVisible && reducedMotion) {
            renderer.render(scene, camera);
          }
        }, { rootMargin: '120px' })
      : null;
    visibilityObserver?.observe(container);

    // 6. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
          renderer.render(scene, camera);
        }
      }
    });
    resizeObserver.observe(container);

    // 7. Complete Memory & Resource Cleanup
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      visibilityObserver?.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);

      // Dispose Three.js objects
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      pointTexture.dispose();

      linesGeometry.dispose();
      linesMaterial.dispose();

      coreGeometry.dispose();
      coreMaterial.dispose();
      orbits.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive, hasWebGLError]);

  if (hasWebGLError) {
    return <WebGLFallback className={className} />;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full min-h-[260px] overflow-hidden select-none touch-pan-y',
        className
      )}
      aria-hidden="true"
    />
  );
}

export const AmalNeuralNetwork = SalamNeuralNetwork;
