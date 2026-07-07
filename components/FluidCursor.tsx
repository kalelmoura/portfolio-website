"use client";

import { useEffect, useRef } from "react";

/*
 * Real-time fluid simulation (stable fluids + vorticity confinement) driving a
 * cursor-following plasma effect. Dye is stored as subtractive "ink" and
 * rendered inverted, so the canvas (mix-blend-multiply) stains the white page.
 * The cursor continuously exhales ink from a ring around it (more when it
 * moves fast, a trickle when idle) while an eraser pass keeps the core white.
 *
 * Adapted from Pavel Dobryakov's WebGL-Fluid-Simulation (MIT).
 */

const SIM_RESOLUTION = 144;
const DYE_RESOLUTION = 720;
const DENSITY_DISSIPATION = 1.3; // how fast the ink fades — high = tight halo around the cursor
const VELOCITY_DISSIPATION = 3.5; // high = viscous, motion dies out right next to the cursor
const PRESSURE = 0.8;
const PRESSURE_ITERATIONS = 20;
const CURL = 10; // vorticity — kept low for slow plasma swirls instead of chaotic marbling
const SPLAT_RADIUS = 0.0042; // fat soft blobs (plasma) rather than thin ink jets
const ERASE_RADIUS = 0.003; // white core under the cursor
const ERASE_STRENGTH = 0.4; // per-frame fade toward white inside the core
const CORE_OFFSET = 0.05; // ring (in v-units) the ink is thrown from — must clear the erase core
const IDLE_POWER = 60; // throw strength while the mouse rests
const POWER_GAIN = 110; // extra throw strength per uv/s of mouse speed
const MAX_POWER = 320;
const IDLE_INK = 0.014; // ink per frame while the mouse rests
const INK_GAIN = 0.06; // extra ink per uv/s of mouse speed
const MAX_INK = 0.12;
const COLOR_ROTATE_MS = 200;

// site palette — greens dominate, teal/blue as accents
const PALETTE: Array<[number, number, number]> = [
  [0.13, 0.77, 0.37], // green-500
  [0.29, 0.87, 0.5], // green-400
  [0.2, 0.83, 0.6], // emerald-400
  [0.02, 0.59, 0.41], // emerald-600
  [0.18, 0.83, 0.75], // teal-400
  [0.22, 0.74, 0.97], // sky-400
  [0.23, 0.51, 0.96], // blue-500
];

type Ink = [number, number, number];

function pickInk(strength: number): Ink {
  const i =
    Math.random() < 0.7
      ? Math.floor(Math.random() * 4)
      : 4 + Math.floor(Math.random() * 3);
  const [r, g, b] = PALETTE[i];
  return [(1 - r) * strength, (1 - g) * strength, (1 - b) * strength];
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach(id: number): number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap(): void;
}

interface TexFormat {
  internalFormat: number;
  format: number;
}

const BASE_VERTEX = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const CLEAR_FRAG = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

const SPLAT_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

// multiplicative fade toward zero ink (= white) around the cursor
const ERASE_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec2 point;
  uniform float radius;
  uniform float strength;
  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    float e = exp(-dot(p, p) / radius) * strength;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base * (1.0 - e), 1.0);
  }
`;

const ADVECTION_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform vec2 dyeTexelSize;
  uniform float dt;
  uniform float dissipation;

  vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
  }

  void main () {
  #ifdef MANUAL_FILTERING
    vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
    vec4 result = bilerp(uSource, coord, dyeTexelSize);
  #else
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = texture2D(uSource, coord);
  #endif
    float decay = 1.0 + dissipation * dt;
    gl_FragColor = result / decay;
  }
`;

const DIVERGENCE_FRAG = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const CURL_FRAG = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`;

const VORTICITY_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;
  void main () {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity += force * dt;
    velocity = min(max(velocity, -1000.0), 1000.0);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const PRESSURE_FRAG = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const GRADIENT_SUBTRACT_FRAG = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  varying highp vec2 vL;
  varying highp vec2 vR;
  varying highp vec2 vT;
  varying highp vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

// ink is subtractive: invert so empty water renders white (invisible on the page)
const DISPLAY_FRAG = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  void main () {
    vec3 ink = clamp(texture2D(uTexture, vUv).rgb, 0.0, 1.0);
    gl_FragColor = vec4(vec3(1.0) - ink, 1.0);
  }
`;

export default function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const params: WebGLContextAttributes = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };
    const gl2 = canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
    const gl = (gl2 ??
      canvas.getContext("webgl", params) ??
      canvas.getContext("experimental-webgl", params)) as
      | WebGL2RenderingContext
      | WebGLRenderingContext
      | null;
    if (!gl) return;
    const isWebGL2 = !!gl2;

    let halfFloatType: number;
    let supportLinearFiltering: boolean;
    if (isWebGL2) {
      gl.getExtension("EXT_color_buffer_float");
      supportLinearFiltering = !!gl.getExtension("OES_texture_float_linear");
      halfFloatType = (gl as WebGL2RenderingContext).HALF_FLOAT;
    } else {
      const halfFloat = gl.getExtension("OES_texture_half_float");
      supportLinearFiltering = !!gl.getExtension("OES_texture_half_float_linear");
      if (!halfFloat) return;
      halfFloatType = halfFloat.HALF_FLOAT_OES;
    }

    function supportRenderTextureFormat(
      internalFormat: number,
      format: number,
      type: number,
    ): boolean {
      if (!gl) return false;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    }

    function getSupportedFormat(
      internalFormat: number,
      format: number,
      type: number,
    ): TexFormat | null {
      if (!supportRenderTextureFormat(internalFormat, format, type)) {
        const g = gl as WebGL2RenderingContext;
        if (isWebGL2 && internalFormat === g.R16F)
          return getSupportedFormat(g.RG16F, g.RG, type);
        if (isWebGL2 && internalFormat === g.RG16F)
          return getSupportedFormat(g.RGBA16F, g.RGBA, type);
        return null;
      }
      return { internalFormat, format };
    }

    let formatRGBA: TexFormat | null;
    let formatRG: TexFormat | null;
    let formatR: TexFormat | null;
    if (isWebGL2) {
      const g = gl as WebGL2RenderingContext;
      formatRGBA = getSupportedFormat(g.RGBA16F, g.RGBA, halfFloatType);
      formatRG = getSupportedFormat(g.RG16F, g.RG, halfFloatType);
      formatR = getSupportedFormat(g.R16F, g.RED, halfFloatType);
    } else {
      formatRGBA = getSupportedFormat(gl.RGBA, gl.RGBA, halfFloatType);
      formatRG = formatRGBA;
      formatR = formatRGBA;
    }
    if (!formatRGBA || !formatRG || !formatR) return;

    function compileShader(type: number, source: string, defines?: string[]): WebGLShader {
      const g = gl!;
      const src = (defines ?? []).map((d) => `#define ${d}\n`).join("") + source;
      const shader = g.createShader(type)!;
      g.shaderSource(shader, src);
      g.compileShader(shader);
      return shader;
    }

    function createProgram(vs: WebGLShader, fs: WebGLShader) {
      const g = gl!;
      const program = g.createProgram()!;
      g.attachShader(program, vs);
      g.attachShader(program, fs);
      g.bindAttribLocation(program, 0, "aPosition");
      g.linkProgram(program);
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const count = g.getProgramParameter(program, g.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i++) {
        const name = g.getActiveUniform(program, i)!.name;
        uniforms[name] = g.getUniformLocation(program, name);
      }
      return { program, uniforms, bind: () => g.useProgram(program) };
    }

    const baseVertex = compileShader(gl.VERTEX_SHADER, BASE_VERTEX);
    const frag = (src: string, defines?: string[]) =>
      compileShader(gl.FRAGMENT_SHADER, src, defines);

    const clearProgram = createProgram(baseVertex, frag(CLEAR_FRAG));
    const splatProgram = createProgram(baseVertex, frag(SPLAT_FRAG));
    const eraseProgram = createProgram(baseVertex, frag(ERASE_FRAG));
    const advectionProgram = createProgram(
      baseVertex,
      frag(ADVECTION_FRAG, supportLinearFiltering ? undefined : ["MANUAL_FILTERING"]),
    );
    const divergenceProgram = createProgram(baseVertex, frag(DIVERGENCE_FRAG));
    const curlProgram = createProgram(baseVertex, frag(CURL_FRAG));
    const vorticityProgram = createProgram(baseVertex, frag(VORTICITY_FRAG));
    const pressureProgram = createProgram(baseVertex, frag(PRESSURE_FRAG));
    const gradientSubtractProgram = createProgram(baseVertex, frag(GRADIENT_SUBTRACT_FRAG));
    const displayProgram = createProgram(baseVertex, frag(DISPLAY_FRAG));

    // fullscreen quad shared by every pass
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.disable(gl.BLEND);

    function blit(target: FBO | null) {
      const g = gl!;
      if (target == null) {
        g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
        g.bindFramebuffer(g.FRAMEBUFFER, null);
      } else {
        g.viewport(0, 0, target.width, target.height);
        g.bindFramebuffer(g.FRAMEBUFFER, target.fbo);
      }
      g.drawElements(g.TRIANGLES, 6, g.UNSIGNED_SHORT, 0);
    }

    function createFBO(
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ): FBO {
      const g = gl!;
      g.activeTexture(g.TEXTURE0);
      const texture = g.createTexture()!;
      g.bindTexture(g.TEXTURE_2D, texture);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, param);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, param);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      g.texImage2D(g.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = g.createFramebuffer()!;
      g.bindFramebuffer(g.FRAMEBUFFER, fbo);
      g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0);
      g.viewport(0, 0, w, h);
      g.clear(g.COLOR_BUFFER_BIT);
      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        attach(id: number) {
          g.activeTexture(g.TEXTURE0 + id);
          g.bindTexture(g.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ): DoubleFBO {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        get read() {
          return fbo1;
        },
        get write() {
          return fbo2;
        },
        swap() {
          const tmp = fbo1;
          fbo1 = fbo2;
          fbo2 = tmp;
        },
      } as DoubleFBO;
    }

    function getResolution(resolution: number) {
      const g = gl!;
      let aspect = g.drawingBufferWidth / g.drawingBufferHeight;
      if (aspect < 1) aspect = 1 / aspect;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspect);
      return g.drawingBufferWidth > g.drawingBufferHeight
        ? { width: max, height: min }
        : { width: min, height: max };
    }

    let dye: DoubleFBO;
    let velocity: DoubleFBO;
    let divergence: FBO;
    let curl: FBO;
    let pressure: DoubleFBO;

    function initFramebuffers() {
      const simRes = getResolution(SIM_RESOLUTION);
      const dyeRes = getResolution(DYE_RESOLUTION);
      const texType = halfFloatType;
      const filtering = supportLinearFiltering ? gl!.LINEAR : gl!.NEAREST;
      const rgba = formatRGBA!;
      const rg = formatRG!;
      const r = formatR!;
      dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
      velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
      divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST);
      curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST);
      pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST);
    }

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas!.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas!.clientHeight * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        return true;
      }
      return false;
    }

    function correctRadius(radius: number) {
      const aspect = canvas!.width / canvas!.height;
      return aspect > 1 ? radius * aspect : radius;
    }

    function splat(x: number, y: number, dx: number, dy: number, ink: Ink) {
      const g = gl!;
      splatProgram.bind();
      g.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      g.uniform1f(splatProgram.uniforms.aspectRatio, canvas!.width / canvas!.height);
      g.uniform2f(splatProgram.uniforms.point, x, y);
      g.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
      g.uniform1f(splatProgram.uniforms.radius, correctRadius(SPLAT_RADIUS));
      blit(velocity.write);
      velocity.swap();

      g.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      g.uniform3f(splatProgram.uniforms.color, ink[0], ink[1], ink[2]);
      blit(dye.write);
      dye.swap();
    }

    function eraseAt(x: number, y: number) {
      const g = gl!;
      eraseProgram.bind();
      g.uniform1i(eraseProgram.uniforms.uTarget, dye.read.attach(0));
      g.uniform1f(eraseProgram.uniforms.aspectRatio, canvas!.width / canvas!.height);
      g.uniform2f(eraseProgram.uniforms.point, x, y);
      g.uniform1f(eraseProgram.uniforms.radius, correctRadius(ERASE_RADIUS));
      g.uniform1f(eraseProgram.uniforms.strength, ERASE_STRENGTH);
      blit(dye.write);
      dye.swap();
    }

    function step(dt: number) {
      const g = gl!;

      curlProgram.bind();
      g.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      g.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);

      vorticityProgram.bind();
      g.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      g.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      g.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
      g.uniform1f(vorticityProgram.uniforms.curl, CURL);
      g.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      divergenceProgram.bind();
      g.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      g.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      clearProgram.bind();
      g.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      g.uniform1f(clearProgram.uniforms.value, PRESSURE);
      blit(pressure.write);
      pressure.swap();

      pressureProgram.bind();
      g.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      g.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        g.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      gradientSubtractProgram.bind();
      g.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      g.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
      g.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      advectionProgram.bind();
      g.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!supportLinearFiltering)
        g.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      g.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      g.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
      g.uniform1f(advectionProgram.uniforms.dt, dt);
      g.uniform1f(advectionProgram.uniforms.dissipation, VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      if (!supportLinearFiltering)
        g.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      g.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      g.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      g.uniform1f(advectionProgram.uniforms.dissipation, DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    function render() {
      displayProgram.bind();
      gl!.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    }

    // single-pointer state, in texture coords (y up)
    const pointer = {
      x: 0,
      y: 0,
      dx: 0, // uv delta accumulated since the last frame
      dy: 0,
      inside: false,
      ink: pickInk(1),
      lastColorAt: 0,
    };

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      if (!inside) {
        pointer.inside = false;
        return;
      }
      if (!pointer.inside) {
        // re-entering the hero: don't splash a huge jump delta
        pointer.inside = true;
        pointer.x = x;
        pointer.y = y;
        pointer.dx = 0;
        pointer.dy = 0;
        return;
      }
      pointer.dx += x - pointer.x;
      pointer.dy += y - pointer.y;
      pointer.x = x;
      pointer.y = y;
    }

    function onPointerDown(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      splat(x, y, 0, 0, pickInk(0.3));
    }

    // throws ink from a ring around the cursor; amount scales with mouse speed
    function emit(dt: number) {
      const aspect = canvas!.width / canvas!.height;
      // measure speed in square (v-unit) space so direction isn't distorted
      const dsx = pointer.dx * aspect;
      const dsy = pointer.dy;
      pointer.dx = 0;
      pointer.dy = 0;
      const speed = Math.hypot(dsx, dsy) / Math.max(dt, 1e-4);

      const now = performance.now();
      if (now - pointer.lastColorAt > COLOR_ROTATE_MS) {
        pointer.ink = pickInk(1);
        pointer.lastColorAt = now;
      }

      const moving = speed > 0.02;
      const angle = moving
        ? Math.atan2(dsy, dsx) + (Math.random() - 0.5) * 1.6
        : Math.random() * Math.PI * 2;
      const power = Math.min(IDLE_POWER + speed * POWER_GAIN, MAX_POWER);
      const amount = Math.min(IDLE_INK + speed * INK_GAIN, MAX_INK);

      const ex = pointer.x + (Math.cos(angle) * CORE_OFFSET) / aspect;
      const ey = pointer.y + Math.sin(angle) * CORE_OFFSET;
      const ink = pointer.ink.map((c) => c * amount) as Ink;
      splat(ex, ey, Math.cos(angle) * power, Math.sin(angle) * power, ink);
      eraseAt(pointer.x, pointer.y);
    }

    // a soft ink bloom so the effect is visible before the mouse moves
    function initialBloom() {
      for (let i = 0; i < 4; i++) {
        const ink = pickInk(0.2);
        const x = 0.25 + Math.random() * 0.5;
        const y = 0.3 + Math.random() * 0.4;
        const dx = 120 * (Math.random() - 0.5);
        const dy = 120 * (Math.random() - 0.5);
        splat(x, y, dx, dy, ink);
      }
    }

    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);

    resizeCanvas();
    initFramebuffers();
    initialBloom();

    let raf = 0;
    let lastTime = performance.now();

    function update() {
      raf = requestAnimationFrame(update);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.016666);
      lastTime = now;
      if (!visible) return;
      if (resizeCanvas()) initFramebuffers();
      if (pointer.inside) emit(dt);
      step(dt);
      render();
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply"
    />
  );
}
