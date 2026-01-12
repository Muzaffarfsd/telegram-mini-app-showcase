import { useEffect, useRef, memo } from 'react';

interface WebGLBackgroundProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  intensity?: number;
  className?: string;
}

const WebGLBackground = memo(function WebGLBackground({
  color1 = '#10B981',
  color2 = '#06B6D4',
  color3 = '#8B5CF6',
  speed = 0.0005,
  intensity = 0.15,
  className = '',
}: WebGLBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const glRef = useRef<WebGLRenderingContext | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power',
    });

    if (!gl) {
      console.warn('[WebGL] Not supported, falling back to CSS');
      return;
    }

    glRef.current = gl;

    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform float u_intensity;
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 uv = v_uv;
        
        float n1 = sin(uv.x * 3.0 + u_time) * cos(uv.y * 2.0 + u_time * 0.7);
        float n2 = cos(uv.x * 2.0 - u_time * 0.5) * sin(uv.y * 3.0 + u_time * 0.3);
        float n3 = sin((uv.x + uv.y) * 2.0 + u_time * 0.2);
        
        vec3 color = u_color1 * (0.5 + 0.5 * n1) * 0.4;
        color += u_color2 * (0.5 + 0.5 * n2) * 0.35;
        color += u_color3 * (0.5 + 0.5 * n3) * 0.25;
        
        color *= u_intensity;
        
        float grain = noise(uv * 1000.0 + u_time) * 0.02;
        color += grain;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[WebGL] Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[WebGL] Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const color1Location = gl.getUniformLocation(program, 'u_color1');
    const color2Location = gl.getUniformLocation(program, 'u_color2');
    const color3Location = gl.getUniformLocation(program, 'u_color3');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');

    function hexToRgb(hex: string): [number, number, number] {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result 
        ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
        : [0, 0, 0];
    }

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const rgb3 = hexToRgb(color3);

    gl.uniform3fv(color1Location, rgb1);
    gl.uniform3fv(color2Location, rgb2);
    gl.uniform3fv(color3Location, rgb3);
    gl.uniform1f(intensityLocation, intensity);

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    let startTime = performance.now();
    let lastFrameTime = startTime;

    const render = () => {
      const now = performance.now();
      const deltaTime = now - lastFrameTime;
      
      if (deltaTime < 33) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }
      
      lastFrameTime = now;
      
      const time = (now - startTime) * speed;
      gl.uniform1f(timeLocation, time);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (glRef.current) {
        glRef.current.deleteProgram(program);
        glRef.current.deleteShader(vertexShader);
        glRef.current.deleteShader(fragmentShader);
        glRef.current.deleteBuffer(positionBuffer);
      }
    };
  }, [color1, color2, color3, speed, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{
        zIndex: -1,
        opacity: 0.6,
      }}
      aria-hidden="true"
    />
  );
});

export default WebGLBackground;
