import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Types for the blob state and props
export type BlobState = 'idle' | 'listening' | 'speaking' | 'responding';

interface BlobProps {
  state: BlobState;
  amplitude?: number;
  onClick?: () => void;
}

// GLSL Shaders
const vertexShader = `
  uniform float u_time;
  uniform float u_amplitude;
  uniform float u_speed;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  
  // Simplex 3D Noise
  // by Ian McEwan, Ashima Arts
  // https://github.com/ashima/webgl-noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
    
    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    
    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    
    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                 dot(p2,x2), dot(p3,x3) ) );
  }
  
  void main() {
    vUv = uv;
    vNormal = normal;
    
    // Breathing effect - base animation
    float breathing = sin(u_time * u_speed) * 0.5 + 0.5; 
    
    // Apply subtle noise displacement for organic feel
    vec3 pos = position;
    float noiseFreq = 1.2;
    float noiseAmp = u_amplitude * 0.1;
    
    // Different noise frequencies for organic feel
    float noise = snoise(vec3(pos.x * noiseFreq, pos.y * noiseFreq, pos.z * noiseFreq + u_time * u_speed));
    
    // Apply the noise and breathing to the vertex (more subtle for circular shape)
    vec3 newPosition = pos + normal * (noise * noiseAmp + breathing * u_amplitude * 0.05);
    
    // Final position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_intensity;
  uniform float u_pulseRate;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main() {
    // Calculate fresnel effect for edge glow
    vec3 viewDirection = normalize(cameraPosition - vNormal);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0) * u_intensity;
    
    // Create vertical gradient based on UV coordinates
    float gradientFactor = vUv.y; // Use V coordinate for vertical gradient
    gradientFactor = smoothstep(0.0, 1.0, gradientFactor);
    
    // Mix colors based on vertical position (color1 at top, color2 at bottom)
    vec3 color = mix(u_color1, u_color2, gradientFactor);
    
    // Add subtle pulse variation
    float pulse = sin(u_time * u_pulseRate) * 0.5 + 0.5;
    color = mix(color, mix(u_color1, u_color2, pulse * 0.3 + gradientFactor * 0.7), 0.2);
    
    // Add glow intensity based on fresnel
    color += fresnel * mix(u_color2, vec3(1.0), 0.3);
    
    // Make wireframe lines more prominent
    float lineIntensity = 1.0 + fresnel * 0.5;
    color *= lineIntensity;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const BlobVisualization: React.FC<BlobProps> = ({ 
  state = 'idle', 
  amplitude = 0.5,
  onClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const frameIdRef = useRef<number>(0);
  const [hoverState, setHoverState] = useState<boolean>(false);
  const [wireframeMode, setWireframeMode] = useState<boolean>(true);

  // Convert state to colors and animation parameters
  const getStateParams = (state: BlobState) => {
    switch (state) {
      case 'listening':
        return {
          color1: new THREE.Color(0x4ade80), // Light green
          color2: new THREE.Color(0xffffff), // White
          amplitude: 0.3,
          speed: 0.7,
          intensity: 1.2,
          pulseRate: 1.5
        };
      case 'speaking':
        return {
          color1: new THREE.Color(0x9b87f5), // Vivid purple
          color2: new THREE.Color(0xD6BCFA), // Light purple
          amplitude: 0.8,
          speed: 1.9,
          intensity: 1.4,
          pulseRate: 3.0
        };
      case 'responding':
        return {
          color1: new THREE.Color(0x34D399), // Teal
          color2: new THREE.Color(0x8df4d8), // Light teal
          amplitude: 1.0,
          speed: 0.9,
          intensity: 1.5,
          pulseRate: 2.0
        };
      default: // idle
        return {
          color1: new THREE.Color(0x60a5fa), // Light blue
          color2: new THREE.Color(0x8b5cf6), // Purple
          amplitude: 0.9,
          speed: 0.3,
          intensity: 1.2,
          pulseRate: 0.3
        };
    }
  };

  // Setup and animation
  useEffect(() => {
    if (!containerRef.current) return;

    // Helper function to check screen size
    const isSmallScreen = () => window.innerWidth < 768;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    // Set camera position based on screen size
    const isMobileOrSmall = isSmallScreen();
    camera.position.z = isMobileOrSmall ? 1.9 : 2.0;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create blob geometry with higher subdivision for finer wireframe
    const blobSize = isMobileOrSmall ? 0.5 : 0.7;
    const geometry = new THREE.IcosahedronGeometry(blobSize, 20);


    // Initial shader parameters
    const stateParams = getStateParams(state);
    
    // Create material with custom shaders
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_color1: { value: stateParams.color1 },
        u_color2: { value: stateParams.color2 },
        u_amplitude: { value: stateParams.amplitude * amplitude },
        u_speed: { value: stateParams.speed },
        u_intensity: { value: stateParams.intensity },
        u_pulseRate: { value: stateParams.pulseRate }
      },
      transparent: true,
      wireframe: wireframeMode,
    });
    materialRef.current = material;

    // Create mesh and add to scene
    const blob = new THREE.Mesh(geometry, material);
    scene.add(blob);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Add point light for more dimension
    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // Animation loop
    const animate = (time: number) => {
      if (materialRef.current) {
        materialRef.current.uniforms.u_time.value = time * 0.001;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    frameIdRef.current = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && sceneRef.current) {
        // Update camera aspect ratio
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        
        // Update camera position based on new screen size
        const isSmall = isSmallScreen();
        cameraRef.current.position.z = isSmall ? 1.9 : 2.0;
        
        // Update blob size
        if (sceneRef.current.children.length > 0) {
          // Find and remove the old blob (first mesh in the scene)
          const oldBlob = sceneRef.current.children.find(child => child instanceof THREE.Mesh && 
                                                         child.geometry instanceof THREE.IcosahedronGeometry);
          
          if (oldBlob && materialRef.current) {
            sceneRef.current.remove(oldBlob);
            const blobSize = isSmall ? 0.3 : 0.7;
            const newGeometry = new THREE.IcosahedronGeometry(blobSize, 25);
            const newBlob = new THREE.Mesh(newGeometry, materialRef.current);
            sceneRef.current.add(newBlob);
            
            // Dispose of old geometry
            if (oldBlob.geometry) {
              oldBlob.geometry.dispose();
            }
          }
        }
        
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Add hover and click effects for better interactivity
    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };
    
    const handleMouseEnter = () => {
      setHoverState(true);
      if (containerRef.current) {
        containerRef.current.style.cursor = 'pointer';
      }
      
      // Subtle animation on hover
      if (state === 'idle' && materialRef.current) {
        materialRef.current.uniforms.u_amplitude.value = amplitude * 1.2;
      }
    };
    
    const handleMouseLeave = () => {
      setHoverState(false);
      
      // Reset animation on mouse leave
      if (state === 'idle' && materialRef.current) {
        materialRef.current.uniforms.u_amplitude.value = amplitude;
      }
    };
    
    const container = containerRef.current;
    container.addEventListener('click', handleClick);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.style.cursor = 'pointer';
    
    // Cleanup
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [state, amplitude, onClick, wireframeMode]);

  // Update shader parameters when state changes
  useEffect(() => {
    if (materialRef.current) {
      const stateParams = getStateParams(state);
      
      // Smoothly transition to new values
      materialRef.current.uniforms.u_color1.value = stateParams.color1;
      materialRef.current.uniforms.u_color2.value = stateParams.color2;
      materialRef.current.uniforms.u_amplitude.value = stateParams.amplitude * amplitude;
      materialRef.current.uniforms.u_speed.value = stateParams.speed;
      materialRef.current.uniforms.u_intensity.value = stateParams.intensity;
      materialRef.current.uniforms.u_pulseRate.value = stateParams.pulseRate;
    }
  }, [state, amplitude]);

  // Update wireframe mode
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.wireframe = wireframeMode;
    }
  }, [wireframeMode]);

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        className="blob-container w-full h-96 md:h-[500px] lg:h-[600px]" 
      />
      
      
      <div className="absolute bottom-1/6 left-1/2 transform -translate-x-1/2 text-center">
        {state === 'listening' && (
          <div className="bg-blue-500 bg-opacity-80 text-white px-3 py-1 rounded-full text-xs animate-pulse">
            Listening...
          </div>
        )}
      </div>
    </div>
  );
};

export default BlobVisualization;
