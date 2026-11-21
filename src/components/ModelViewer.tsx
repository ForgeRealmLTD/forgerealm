import { useEffect, useRef, useState } from "react";
import type { Ref } from "react";
import { prefersReducedMotion } from "../hooks/motion";

/**
 * A lightweight three.js "statue on a turntable".
 *
 * The photo (`poster`) renders immediately and stays as the fallback; three.js
 * and the model are only fetched once the viewer nears the viewport, then the
 * canvas cross-fades in over it. If WebGL or the model is unavailable the
 * poster simply stays.
 *
 * Interaction is deliberately constrained: dragging only turns the model about
 * its vertical axis, from front face to side face (clamped to +/-90deg), and
 * it glides back to face front shortly after release so the diagram callouts
 * around it stay meaningful. Vertical swipes still scroll the page on touch.
 *
 * Performance: frames render only while the canvas is on screen and the
 * model is moving, the pixel ratio is capped, and everything is disposed on
 * unmount.
 */

type Props = {
  src: string;
  poster: string;
  alt: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /**
   * Screen points (as % of the viewer box, model facing front) to pin onto
   * the model. Each is raycast onto the surface once on load, then
   * re-projected every frame as the model turns and reported via onAnchors.
   */
  anchors?: { key: string; xPct: number; yPct: number }[];
  /** Per-frame anchor positions (% of box) and how much each faces the viewer (0..1). */
  onAnchors?: (pts: Record<string, AnchorPoint>) => void;
};

export type AnchorPoint = { xPct: number; yPct: number; facing: number };

const MAX_YAW = Math.PI / 2; // front face -> side face
const IDLE_SWAY = 0.28; // radians of gentle idle sway (~16deg)
const RETURN_DELAY = 1800; // ms after release before gliding back to front

export default function ModelViewer({
  src,
  poster,
  alt,
  className,
  ref,
  anchors,
  onAnchors,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  // Latest props in refs so the (expensive) three.js effect never re-runs
  // just because the parent re-rendered with a new callback or array.
  const anchorsRef = useRef(anchors);
  const onAnchorsRef = useRef(onAnchors);
  useEffect(() => {
    anchorsRef.current = anchors;
    onAnchorsRef.current = onAnchors;
  });
  const [ready, setReady] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup = () => {};

    // Defer the ~150 KB three.js chunk until the viewer is close to view.
    const gate = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        gate.disconnect();
        start().catch(() => {
          /* no WebGL / model missing: keep the poster */
        });
      },
      { rootMargin: "300px" },
    );
    gate.observe(host);

    async function start() {
      const [THREE, { GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/loaders/GLTFLoader.js"),
        import("three/examples/jsm/libs/meshopt_decoder.module.js"),
      ]);
      if (disposed || !host) return;

      const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      const gltf = await loader.loadAsync(src);
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 1.15;
      const canvas = renderer.domElement;
      canvas.className = "absolute inset-0 h-full w-full";
      canvas.setAttribute("aria-hidden", "true");
      host.appendChild(canvas);

      const scene = new THREE.Scene();

      // The build script outputs the model 1 unit tall, base at y=0.
      const model = gltf.scene;
      model.traverse((o) => {
        const mesh = o as import("three").Mesh;
        if (mesh.isMesh) mesh.castShadow = mesh.receiveShadow = true;
      });
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const extent = Math.max(size.y, size.x, size.z);
      const pivot = new THREE.Group();
      pivot.add(model);
      scene.add(pivot);

      // Blink. Models built with --eyelids carry an oversized "Eyelids"
      // shell over the eyes plus each eye's centre and radius (glTF extras).
      // The shader cuts the shell to an exact circle per eye, seen from the
      // front (so it stays a true ellipse as the owl turns), and lowers a
      // curved lid edge down it as `shut` goes 0 -> 1.
      let lids: import("three").Mesh | undefined;
      const lidNode = model.getObjectByName("Eyelids");
      lidNode?.traverse((o) => {
        const mesh = o as import("three").Mesh;
        if (mesh.isMesh && !lids) lids = mesh;
      });
      const lidEyes = lidNode?.userData.lid_eyes as number[] | undefined;
      const lidShut = { value: 0 };
      if (lids && lidEyes?.length === 6) {
        lids.castShadow = lids.receiveShadow = false;
        const lidMat = lids.material as import("three").Material;
        // Pull the lid forward in depth so the eye never z-fights through it.
        lidMat.polygonOffset = true;
        lidMat.polygonOffsetFactor = -4;
        lidMat.polygonOffsetUnits = -4;
        // gltfpack quantises positions (dequantising via the node transform),
        // so map mesh space -> model space, where the eye data lives.
        scene.updateMatrixWorld(true);
        const toModel = new THREE.Matrix4()
          .copy(model.matrixWorld)
          .invert()
          .multiply(lids.matrixWorld);
        lidMat.onBeforeCompile = (shader) => {
          shader.uniforms.uShut = lidShut;
          shader.uniforms.uToModel = { value: toModel };
          shader.uniforms.uEyeL = {
            value: new THREE.Vector3(...lidEyes.slice(0, 3)),
          };
          shader.uniforms.uEyeR = {
            value: new THREE.Vector3(...lidEyes.slice(3)),
          };
          shader.vertexShader = shader.vertexShader
            .replace(
              "void main() {",
              "uniform mat4 uToModel;\nvarying vec3 vLid;\nvoid main() {",
            )
            .replace(
              "#include <begin_vertex>",
              "#include <begin_vertex>\nvLid = (uToModel * vec4(transformed, 1.0)).xyz;",
            );
          shader.fragmentShader = shader.fragmentShader
            .replace(
              "void main() {",
              "uniform float uShut;\nuniform vec3 uEyeL;\nuniform vec3 uEyeR;\nvarying vec3 vLid;\nvoid main() {",
            )
            .replace(
              "#include <clipping_planes_fragment>",
              `#include <clipping_planes_fragment>
              vec3 eye = vLid.x < 0.0 ? uEyeL : uEyeR;
              vec2 d = (vLid.xy - eye.xy) / eye.z;   // -1..1 across the eye
              if (dot(d, d) > 1.0) discard;         // exact round outline
              // Lid edge: from the top (1) to past the bottom, sagging in the
              // middle like a real upper lid.
              float edge = 1.0 - uShut * (2.2 + 0.35 * (1.0 - d.x * d.x));
              if (d.y < edge) discard;`,
            );
        };
        lids.visible = false;
      } else lids = undefined;
      // Owl blinks are quick: lid snaps down, a beat shut, eases back up (ms).
      const BLINK_DOWN = 70;
      const BLINK_HOLD = 40;
      const BLINK_UP = 110;
      let blinkAt = performance.now() + 1200 + Math.random() * 2000;
      let blinkStart = -1;
      let doubled = false;

      // Forge lighting. A dim cool ambient so shadows actually read, one hard
      // key from high front-right casting real shadows (arms onto the apron,
      // the owl onto the floor), a low flickering orange forge glow, and
      // blue/cyan rims tracing the silhouette in the site accents. The lights
      // stay put while the owl turns, so shadows sweep across it on drag.
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      scene.add(new THREE.HemisphereLight(0x8fa6c8, 0x05070c, 0.35));

      const key = new THREE.DirectionalLight(0xfff0dc, 3.4);
      key.position.set(0.9, 3.0, 1.3); // high, so the floor shadow stays short
      key.target.position.set(0, size.y * 0.45, 0);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      const half = extent * 0.8; // tight frustum = crisp shadow texels
      Object.assign(key.shadow.camera, {
        left: -half,
        right: half,
        top: half,
        bottom: -half,
        near: 0.5,
        far: 6,
      });
      key.shadow.bias = -0.0005;
      key.shadow.normalBias = 0.02;
      scene.add(key, key.target);

      const FORGE = 1.8;
      const forge = new THREE.PointLight(0xff7a2a, FORGE, 3, 1.6);
      forge.position.set(-0.55, 0.22, 0.75);
      scene.add(forge);

      const rimBlue = new THREE.DirectionalLight(0x60a5fa, 3.6);
      rimBlue.position.set(1.8, 1.4, -2);
      const rimCyan = new THREE.DirectionalLight(0x67e8f9, 2);
      rimCyan.position.set(-2, 1, -1.6);
      scene.add(rimBlue, rimCyan);

      // Invisible floor that only shows the cast shadow, plus a soft pool of
      // forge light under the owl so it reads as standing somewhere.
      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(extent * 0.9, 48),
        new THREE.ShadowMaterial({ opacity: 0.55 }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      // Fade the shadow out radially so it never ends on a hard edge (the
      // floor disc or the canvas border).
      floor.material.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader
          .replace("void main() {", "varying vec2 vFloorUv;\nvoid main() {")
          .replace(
            "#include <begin_vertex>",
            "#include <begin_vertex>\nvFloorUv = uv;",
          );
        shader.fragmentShader = shader.fragmentShader
          .replace("void main() {", "varying vec2 vFloorUv;\nvoid main() {")
          .replace(
            "#include <fog_fragment>",
            "gl_FragColor.a *= 1.0 - smoothstep(0.15, 0.5, distance(vFloorUv, vec2(0.5)));\n#include <fog_fragment>",
          );
      };
      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = glowCanvas.height = 128;
      const g = glowCanvas.getContext("2d")!;
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(255,130,50,0.5)");
      grad.addColorStop(1, "rgba(255,130,50,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(extent * 0.9, extent * 0.5),
        new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(glowCanvas),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.set(-0.08, 0.002, 0.02);
      scene.add(floor, glow);

      // Frame so the model fills ~86% of the square, like the photo did,
      // whichever is larger of its height or its turning width.
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
      const dist = extent / (0.86 * 2 * Math.tan(THREE.MathUtils.degToRad(14)));
      camera.position.set(0, size.y / 2, dist);
      camera.lookAt(0, size.y / 2, 0);

      // Pin each callout to the model: cast a ray through its front-view
      // screen point and keep the surface hit (or, over empty space, the
      // point on the model's mid plane) plus the surface normal there.
      camera.updateMatrixWorld();
      scene.updateMatrixWorld(true);
      const body: import("three").Object3D[] = [];
      model.traverse((o) => {
        if ((o as import("three").Mesh).isMesh && o !== lids) body.push(o);
      });
      const ray = new THREE.Raycaster();
      const midPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const pins = (anchorsRef.current ?? []).map((a) => {
        ray.setFromCamera(
          new THREE.Vector2(a.xPct / 50 - 1, 1 - a.yPct / 50),
          camera,
        );
        const hit = ray.intersectObjects(body, false)[0];
        const point = hit
          ? hit.point.clone()
          : (ray.ray.intersectPlane(midPlane, new THREE.Vector3()) ??
            new THREE.Vector3());
        const normal = hit?.face
          ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
          : new THREE.Vector3(0, 0, 1);
        return { key: a.key, point, normal };
      });
      const pinPos = new THREE.Vector3();
      const pinNormal = new THREE.Vector3();
      const toCam = new THREE.Vector3();
      let pinnedYaw = NaN;
      const reportPins = () => {
        const cb = onAnchorsRef.current;
        if (!cb || !pins.length || pivot.rotation.y === pinnedYaw) return;
        pinnedYaw = pivot.rotation.y;
        pivot.updateMatrixWorld();
        const out: Record<string, AnchorPoint> = {};
        for (const p of pins) {
          pinPos.copy(p.point).applyMatrix4(pivot.matrixWorld);
          pinNormal.copy(p.normal).transformDirection(pivot.matrixWorld);
          toCam.copy(camera.position).sub(pinPos).normalize();
          const facing = THREE.MathUtils.smoothstep(
            pinNormal.dot(toCam),
            -0.15,
            0.3,
          );
          pinPos.project(camera);
          out[p.key] = {
            xPct: (pinPos.x + 1) * 50,
            yPct: (1 - pinPos.y) * 50,
            facing,
          };
        }
        cb(out);
      };

      // ---------------------------------------------------------- sizing
      const resize = () => {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        wake();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // ---------------------------------------------------------- input
      const reduced = prefersReducedMotion();
      let yaw = 0;
      let target = 0;
      let dragging = false;
      let lastX = 0;
      let lastInput = -Infinity;

      const onDown = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
        setTouched(true);
        if (blinkStart < 0) blinkAt = performance.now(); // startled blink
        wake();
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        // A full-width drag turns roughly front -> side.
        target = THREE.MathUtils.clamp(
          target + (dx / host.clientWidth) * Math.PI * 0.9,
          -MAX_YAW,
          MAX_YAW,
        );
        lastInput = performance.now();
        wake();
      };
      const onUp = (e: PointerEvent) => {
        dragging = false;
        lastInput = performance.now();
        canvas.style.cursor = "grab";
        if (canvas.hasPointerCapture(e.pointerId))
          canvas.releasePointerCapture(e.pointerId);
      };
      canvas.style.cursor = "grab";
      canvas.style.touchAction = "pan-y"; // vertical swipes still scroll
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);

      // ---------------------------------------------------------- loop
      let raf = 0;
      let onScreen = true;
      let prev = performance.now();

      const frame = (now: number) => {
        raf = 0;
        const dt = Math.min((now - prev) / 1000, 0.05);
        prev = now;

        const idle = !dragging && now - lastInput > RETURN_DELAY;
        // Idle: drift back to front with a slow sway (none under reduced motion).
        const goal = idle
          ? reduced
            ? 0
            : Math.sin(now / 2600) * IDLE_SWAY
          : target;
        if (idle) target = goal;

        // Frame-rate independent exponential smoothing.
        yaw += (goal - yaw) * (1 - Math.exp(-dt * (dragging ? 14 : 3.5)));
        pivot.rotation.y = yaw;
        reportPins();
        if (!reduced) {
          // Two out-of-phase sines read as an uneven, living flame.
          const f =
            1 +
            0.09 * Math.sin(now * 0.011) +
            0.06 * Math.sin(now * 0.031 + 1.3);
          forge.intensity = FORGE * f;
          glow.material.opacity = f;
        }
        if (lids && !reduced) {
          if (blinkStart < 0 && now >= blinkAt) blinkStart = now;
          if (blinkStart >= 0) {
            const t = now - blinkStart;
            let shut: number; // 0 open .. 1 closed
            if (t < BLINK_DOWN) shut = t / BLINK_DOWN;
            else if (t < BLINK_DOWN + BLINK_HOLD) shut = 1;
            else if (t < BLINK_DOWN + BLINK_HOLD + BLINK_UP)
              shut = 1 - (t - BLINK_DOWN - BLINK_HOLD) / BLINK_UP;
            else {
              shut = 0;
              blinkStart = -1;
              // Now and then a quick double blink, never three in a row.
              doubled = !doubled && Math.random() < 0.25;
              blinkAt = now + (doubled ? 140 : 2200 + Math.random() * 3800);
            }
            lids.visible = shut > 0;
            lidShut.value = shut;
          }
        }
        renderer.render(scene, camera);

        const settled = Math.abs(goal - yaw) < 1e-4;
        // Keep animating while on screen, unless there is nothing to animate.
        if (onScreen && !(reduced && idle && settled)) wake();
      };
      function wake() {
        if (!raf && onScreen && !disposed) raf = requestAnimationFrame(frame);
      }

      const vis = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) {
          prev = performance.now();
          wake();
        }
      });
      vis.observe(host);

      resize();
      renderer.render(scene, camera);
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        vis.disconnect();
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        scene.traverse((o) => {
          const mesh = o as import("three").Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          mats.forEach((m) => {
            Object.values(m).forEach((v) => {
              if (v && (v as import("three").Texture).isTexture)
                (v as import("three").Texture).dispose();
            });
            m.dispose();
          });
        });
        renderer.dispose();
        canvas.remove();
      };
    }

    return () => {
      disposed = true;
      gate.disconnect();
      cleanup();
    };
  }, [src]);

  const setRefs = (el: HTMLDivElement | null) => {
    hostRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = el;
  };

  return (
    <div ref={setRefs} className={`relative aspect-square ${className ?? ""}`}>
      <img
        src={poster}
        alt={alt}
        className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
        style={{ opacity: ready ? 0 : 1 }}
        loading="lazy"
        decoding="async"
      />
      {ready && (
        <span
          className="fr-label fr-fg-3 pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 !text-[15px] transition-opacity duration-700"
          style={{ opacity: touched ? 0 : 1 }}
        >
          drag to turn
        </span>
      )}
    </div>
  );
}
