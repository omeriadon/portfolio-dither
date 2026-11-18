"use client";

import { useEffect, useRef } from "react";

// A port of Bayer's wave field: domain-warped fBm, ordered-dithered with an 8×8 Bayer
// matrix into a palette, drawn as slightly rounded cells. Palette index 0 is the page
// background, and the field fades to it towards the bottom so it melts into the page.

const PALETTES = {
  // Newsprint, lightest first so the field fades into paper
  light: ["#F4EFE6", "#CFC6B5", "#6B6358", "#1B1A17"],
  // Newsprint, darkest first so the field fades into ink
  dark: ["#1B1A17", "#6B6358", "#CFC6B5", "#F4EFE6"],
};

const CELL = 6; // css px, Bayer's default pixelSize
const FPS = 12; // Bayer's wave frame rate
const SPEED = 0.05;
const FREQUENCY = 3;
const AMPLITUDE = 0.3;

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 resolution;
uniform float cell;
uniform float time;
uniform vec3 palette[4];
uniform float fadeStart;
out vec4 color;

vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz, iy = Pi.yyww, fx = Pf.xzxz, fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  gx -= floor(gx + 0.5);
  vec2 g00 = vec2(gx.x, gy.x), g10 = vec2(gx.y, gy.y), g01 = vec2(gx.z, gy.z), g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x)), n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z)), n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 f = fade(Pf.xy);
  vec2 nx = mix(vec2(n00, n01), vec2(n10, n11), f.x);
  return 2.3 * mix(nx.x, nx.y, f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 1.0;
  for (int i = 0; i < 4; i++) { v += a * abs(cnoise(p)); p *= ${FREQUENCY.toFixed(1)}; a *= ${AMPLITUDE.toFixed(2)}; }
  return v;
}

float pattern(vec2 p) {
  // Bayer's default direction, 135°: (sin, -cos) * sqrt(2)
  vec2 shifted = p - time * ${SPEED.toFixed(3)} * vec2(1.0, 1.0);
  vec2 warp = vec2(fbm(shifted + vec2(17.3, 41.7)), fbm(shifted + vec2(73.1, 11.9))) - 0.5;
  return fbm(shifted + warp);
}

const float bayer8[64] = float[64](
  0.,48.,12.,60.,3.,51.,15.,63., 32.,16.,44.,28.,35.,19.,47.,31.,
  8.,56.,4.,52.,11.,59.,7.,55., 40.,24.,36.,20.,43.,27.,39.,23.,
  2.,50.,14.,62.,1.,49.,13.,61., 34.,18.,46.,30.,33.,17.,45.,29.,
  10.,58.,6.,54.,9.,57.,5.,53., 42.,26.,38.,22.,41.,25.,37.,21.);

void main() {
  vec2 p = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y);
  vec2 c = floor(p / cell);
  vec2 corner = c * cell;
  float ref = max(resolution.y, 700.0 * cell / ${CELL.toFixed(1)});
  vec2 uv = (corner - 0.5 * resolution) / ref;
  float value = clamp(pattern(uv), 0.0, 1.0);

  // Fade towards the bottom, into palette[0]
  float y = (c.y + 0.5) * cell / resolution.y;
  float keep = 1.0 - smoothstep(fadeStart, 1.0, y);
  value *= keep;

  ivec2 m = ivec2(mod(c, 8.0));
  float threshold = bayer8[m.y * 8 + m.x] / 64.0 - 0.25;
  float pv = value + threshold / 3.0;
  pv = clamp(pv - mix(0.2, 0.0, smoothstep(0.45, 0.8, pv)), 0.0, 1.0);
  int index = int(floor(pv * 3.0 + 0.5));
  vec3 background = palette[0];
  vec3 ink = mix(background, palette[index], float(index) / 3.0);

  // Rounded cell: gap 0.06, corner 0.18, like Bayer's defaults
  vec2 local = p - corner - 0.5 * cell;
  float half_ = cell * (0.5 - 0.06);
  float r = half_ * 2.0 * 0.18;
  vec2 q = abs(local) - (half_ - r);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float inside = 1.0 - smoothstep(-0.5, 0.5, d);
  color = vec4(mix(background, ink, index == 0 ? 0.0 : inside), 1.0);
}`;

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function DitherField({ fadeStart = 0.3 }: { fadeStart?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", { antialias: false, alpha: false });
    if (!canvas || !gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
      }
      return shader;
    };
    const program = gl.createProgram()!;
    const shaders = [compile(gl.VERTEX_SHADER, vertex), compile(gl.FRAGMENT_SHADER, fragment)];
    shaders.forEach((shader) => gl.attachShader(program, shader));
    gl.linkProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uResolution = u("resolution"), uCell = u("cell"), uTime = u("time");
    const uPalette = u("palette"), uFade = u("fadeStart");

    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setPalette = () => {
      const colors = PALETTES[darkQuery.matches ? "dark" : "light"].flatMap(hexToRgb);
      gl.uniform3fv(uPalette, colors);
    };

    const start = performance.now() - 20_000; // start partway in so it isn't the same frame every load
    const draw = () => {
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uResolution, width, height);
      gl.uniform1f(uCell, Math.round(CELL * dpr));
      draw();
    };

    gl.uniform1f(uFade, fadeStart);
    setPalette();
    resize();

    let visible = true;
    let last = 0;
    let frame = 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!visible || document.hidden || motionQuery.matches) return;
      if (now - last < 1000 / FPS) return;
      last = now;
      draw();
    };
    frame = requestAnimationFrame(loop);

    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    observer.observe(canvas);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const onScheme = () => { setPalette(); draw(); };
    darkQuery.addEventListener("change", onScheme);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      darkQuery.removeEventListener("change", onScheme);
      // Don't lose the context: the canvas keeps it, and React may run this effect again.
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [fadeStart]);

  return <canvas ref={canvasRef} aria-hidden className="block size-full" />;
}
