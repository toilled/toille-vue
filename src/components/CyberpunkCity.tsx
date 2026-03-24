import {
  createSignal,
  onMount,
  onCleanup,
  createEffect,
  lazy,
} from "solid-js";
import { useLocation } from "@solidjs/router";
import { ScoreService, type ScoreEntry } from "../utils/ScoreService";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  CylinderGeometry,
  MeshBasicMaterial,
  Mesh,
  DoubleSide,
  Group,
  ConeGeometry,
  Object3D,
  MathUtils,
  PCFSoftShadowMap,
  ACESFilmicToneMapping,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { GameModeManager } from "../game/GameModeManager";
import { setupPostProcessing } from "../game/PostProcessingManager";
import { DrivingMode } from "../game/modes/DrivingMode";
import { DroneMode } from "../game/modes/DroneMode";
import { ExplorationMode } from "../game/modes/ExplorationMode";
import { FlyingTourMode } from "../game/modes/FlyingTourMode";
import { DemoMode } from "../game/modes/DemoMode";
import { GameContext } from "../game/types";
import { carAudio } from "../game/audio/CarAudio";
import { cyberpunkAudio } from "../utils/CyberpunkAudio";
import {
  BOUNDS,
  CELL_SIZE,
  START_OFFSET,
  DRONE_COUNT,
  GRID_SIZE,
} from "../game/config";
import {
  LEADERBOARD_CANVAS_SIZE,
  MOBILE_BREAKPOINT,
  SPARK_COUNT,
  SPARK_BURST_SIZE,
  SPARK_GRAVITY,
  SPARK_LIFETIME_DECAY,
  SPARK_OFF_SCREEN_Y,
  SPARK_MIN_VELOCITY,
  SPARK_RANDOM_VELOCITY,
  CAR_COUNT,
  CAMERA_FOV,
  CAMERA_FAR,
  CAMERA_NEAR,
  CAMERA_START_Y,
  CAMERA_TARGET_Y_DESKTOP,
  CAMERA_TARGET_Y_MOBILE,
  CAMERA_CINEMATIC_Y,
  CAMERA_LERP_FACTOR,
  CAMERA_LOOK_AT_LERP,
  ORBIT_RADIUS_DESKTOP,
  ORBIT_RADIUS_MOBILE,
  ORBIT_SPEED,
  INTRO_DURATION_MS,
  INTRO_ORBIT_RADIUS,
  INTRO_ORBIT_SPEED,
  RAYCASTER_POINTS_THRESHOLD,
  DRONE_SCORE_POINTS,
  DRONE_OSCILLATION_X,
  DRONE_OSCILLATION_Y,
  DRONE_OSCILLATION_Z,
  DRONE_EASING,
  AUDIO_VOLUME,
  AUDIO_DISTANCE_FACTOR,
  AUDIO_OSCILLATOR_FREQ_START,
  AUDIO_OSCILLATOR_FREQ_END,
  AUDIO_SWEEP_DURATION,
  CHECKPOINT_RADIUS,
  CHECKPOINT_HEIGHT,
  CHECKPOINT_SEGMENTS,
  CHECKPOINT_CORE_RADIUS,
  CHECKPOINT_CORE_SEGMENTS,
  EMISSIVE_INTENSITY_BOOST_BASS,
  EMISSIVE_INTENSITY_BOOST_HIHAT,
  EMISSIVE_INTENSITY_TARGET,
  EMISSIVE_LERP_FACTOR,
  SPARK_SPAWN_POSITIONS_OFF_Y,
  CHASE_ARROW_POSITION_Z,
} from "../game/constants/CyberpunkCity";
import { KonamiManager } from "../game/KonamiManager";
import { GangWarManager } from "../game/GangWarManager";
import { createDroneTexture } from "../utils/TextureGenerator";
import { CityBuilder } from "../game/CityBuilder";
import { TrafficSystem } from "../game/TrafficSystem";
import { getHeight } from "../utils/HeightMap";
import { audioManager } from "../utils/AudioManager";

const GameUI = lazy(() => import("./GameUI"));

interface CyberpunkCityProps {
  showSplash?: boolean;
  onGameStart?: () => void;
  onGameEnd?: () => void;
  ref?: any;
}

export default function CyberpunkCity(props: CyberpunkCityProps) {
  let canvasContainer: HTMLDivElement | undefined;

  let scene: Scene;
  let camera: PerspectiveCamera;
  let renderer: WebGLRenderer;
  let composer: EffectComposer;
  let animationId: number;
  let isActive = false;

  let occupiedGrids = new Map<
    string,
    { halfW: number; halfD: number; isRound?: boolean }
  >();
  let cars: Group[] = [];
  const leaderboardMeshes: Mesh[] = [];

  let drones: Points;
  let droneTargetPositions: Float32Array;
  let droneBasePositions: Float32Array;
  const deadDrones = new Set<number>();

  const [score, setScore] = createSignal(0);
  const [droneScore, setDroneScore] = createSignal(0);
  const [drivingScore, setDrivingScore] = createSignal(0);
  const [isGameMode, setIsGameMode] = createSignal(false);
  const [isDrivingMode, setIsDrivingMode] = createSignal(false);
  const [isExplorationMode, setIsExplorationMode] = createSignal(false);
  const [isFlyingTour, setIsFlyingTour] = createSignal(false);
  const [isCinematicMode, setIsCinematicMode] = createSignal(false);

  const cinematicTarget = new Vector3();
  const [activeCar, setActiveCar] = createSignal<Group | null>(null);
  let checkpointMesh: Mesh;
  let navArrow: Group;
  let chaseArrow: Group;
  const [timeLeft, setTimeLeft] = createSignal(0);
  const [isGameOver, setIsGameOver] = createSignal(false);
  let lastTime = 0;
  let startTime = 0;
  const [distToTarget, setDistToTarget] = createSignal(0);

  let gameModeManager: GameModeManager;
  let konamiManager: KonamiManager;
  let gangWarManager: GangWarManager;
  let trafficSystem: TrafficSystem;
  let cityBuilder: CityBuilder;

  const [leaderboard, setLeaderboard] = createSignal<ScoreEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = createSignal(false);

  let leaderboardCanvas: HTMLCanvasElement;
  let leaderboardTexture: CanvasTexture;

  const location = useLocation();

  function updateLeaderboard(newScores: ScoreEntry[]) {
    setLeaderboard(newScores);
  }

  function updateLeaderboardTexture() {
    if (!leaderboardCanvas) return;
    const ctx = leaderboardCanvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "#100010";
    ctx.fillRect(0, 0, LEADERBOARD_CANVAS_SIZE, LEADERBOARD_CANVAS_SIZE);

    ctx.scale(2, 2);

    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 504);

    ctx.fillStyle = "#00ffcc";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 10;
    ctx.fillText("LEADERBOARD", 256, 80);
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(20, 100);
    ctx.lineTo(492, 100);
    ctx.stroke();

    ctx.font = "bold 40px Courier New";
    ctx.textAlign = "left";
    let y = 160;

    const currentLeaderboard = leaderboard();

    if (currentLeaderboard.length === 0) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#aaaaaa";
      ctx.fillText("Loading...", 256, 250);
    } else {
      currentLeaderboard.forEach((entry, idx) => {
        switch (idx) {
          case 0:
            ctx.fillStyle = "#ffff00";
            break;
          case 1:
            ctx.fillStyle = "#cccccc";
            break;
          case 2:
            ctx.fillStyle = "#cd7f32";
            break;
          default:
            ctx.fillStyle = "#ffffff";
            break;
        }

        const rank = `${idx + 1}.`;
        const name = entry.name.substring(0, 8).toUpperCase();
        const scoreStr = entry.score.toString();

        ctx.fillText(rank, 40, y);
        ctx.fillText(name, 110, y);

        ctx.textAlign = "right";
        ctx.fillText(scoreStr, 470, y);
        ctx.textAlign = "left";

        y += 60;
      });
    }

    ctx.fillStyle = "#00ffcc";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("CRASH TO SUBMIT SCORE", 256, 480);

    if (leaderboardTexture) {
      leaderboardTexture.needsUpdate = true;
    }
  }

  createEffect(() => {
    leaderboard();
    updateLeaderboardTexture();
  });

  function createLeaderboardTexture() {
    leaderboardCanvas = document.createElement("canvas");
    leaderboardCanvas.width = LEADERBOARD_CANVAS_SIZE;
    leaderboardCanvas.height = LEADERBOARD_CANVAS_SIZE;
    leaderboardTexture = new CanvasTexture(leaderboardCanvas);
    leaderboardTexture.anisotropy = 16;

    updateLeaderboardTexture();

    return leaderboardTexture;
  }

  const [isMobile, setIsMobile] = createSignal(false);

  const updateIsMobile = () => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }
  };

  const controls = {
    left: false,
    right: false,
    forward: false,
    backward: false,
  };

  const lookControls = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  const currentLookAt = new Vector3(0, 0, 0);

  const raycaster = new Raycaster();
  const pointer = new Vector2();

  let sparks: Points;
  const sparkPositions = new Float32Array(SPARK_COUNT * 3);
  for (let i = 0; i < SPARK_COUNT; i++) {
    sparkPositions[i * 3 + 1] = SPARK_SPAWN_POSITIONS_OFF_Y;
  }
  const sparkVelocities = new Float32Array(SPARK_COUNT * 3);
  const sparkLifetimes = new Float32Array(SPARK_COUNT);

  function createCheckpoint() {
    const geo = new CylinderGeometry(
      CHECKPOINT_RADIUS,
      CHECKPOINT_RADIUS,
      CHECKPOINT_HEIGHT,
      CHECKPOINT_SEGMENTS,
      1,
      true,
    );
    const mat = new MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.6,
      side: DoubleSide,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    checkpointMesh = new Mesh(geo, mat);
    checkpointMesh.visible = false;
    scene.add(checkpointMesh);

    const coreGeo = new CylinderGeometry(
      CHECKPOINT_CORE_RADIUS,
      CHECKPOINT_CORE_RADIUS,
      CHECKPOINT_HEIGHT,
      CHECKPOINT_CORE_SEGMENTS,
    );
    const coreMat = new MeshBasicMaterial({ color: 0xffffff });
    const core = new Mesh(coreGeo, coreMat);
    checkpointMesh.add(core);
  }

  function createNavArrow() {
    navArrow = new Group();

    const cone = new Mesh(
      new ConeGeometry(2, 7.5, 16),
      new MeshBasicMaterial({
        color: 0x888800,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
      }),
    );
    cone.rotation.x = Math.PI / 2;

    navArrow.add(cone);
    cone.renderOrder = 999;

    navArrow.visible = false;
    scene.add(navArrow);
  }

  function createChaseArrow() {
    chaseArrow = new Group();

    const cone = new Mesh(
      new ConeGeometry(2, 7.5, 16),
      new MeshBasicMaterial({
        color: 0xff0000,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.0,
      }),
    );
    cone.rotation.x = Math.PI / 2;
    cone.position.z = CHASE_ARROW_POSITION_Z;

    chaseArrow.add(cone);
    cone.renderOrder = 999;

    chaseArrow.visible = false;
    scene.add(chaseArrow);
  }

  function spawnCheckpoint() {
    const roadIndexX = Math.floor(Math.random() * (GRID_SIZE + 1));
    const roadIndexZ = Math.floor(Math.random() * (GRID_SIZE + 1));

    const axis = Math.random() > 0.5 ? "x" : "z";
    const roadCoordinate =
      START_OFFSET +
      (axis === "x" ? roadIndexX : roadIndexZ) * CELL_SIZE -
      CELL_SIZE / 2;

    const limit = (GRID_SIZE * CELL_SIZE) / 2;
    const otherCoord = (Math.random() - 0.5) * 2 * limit * 0.9;

    let x = 0,
      z = 0;
    if (axis === "x") {
      z = roadCoordinate;
      x = otherCoord;
    } else {
      x = roadCoordinate;
      z = otherCoord;
    }

    const h = getHeight(x, z);
    checkpointMesh.position.set(x, h, z);
    checkpointMesh.visible = true;
  }

  function spawnSparks(position: Vector3) {
    if (!sparks) return;
    const posAttribute = sparks.geometry.attributes.position;

    let spawned = 0;

    for (let i = 0; i < SPARK_COUNT; i++) {
      if (sparkLifetimes[i] <= 0) {
        activateSpark(i, position, posAttribute);
        spawned++;
        if (spawned >= SPARK_BURST_SIZE) break;
      }
    }

    if (spawned < SPARK_BURST_SIZE) {
      for (let i = 0; i < SPARK_BURST_SIZE - spawned; i++) {
        const randIndex = Math.floor(Math.random() * SPARK_COUNT);
        activateSpark(randIndex, position, posAttribute);
      }
    }

    posAttribute.needsUpdate = true;
  }

  function activateSpark(
    i: number,
    position: Vector3,
    posAttribute: BufferAttribute,
  ) {
    sparkLifetimes[i] = 1.0;
    posAttribute.setXYZ(i, position.x, position.y, position.z);
    sparkVelocities[i * 3] = (Math.random() - 0.5) * SPARK_RANDOM_VELOCITY;
    sparkVelocities[i * 3 + 1] =
      Math.random() * SPARK_RANDOM_VELOCITY + SPARK_MIN_VELOCITY;
    sparkVelocities[i * 3 + 2] = (Math.random() - 0.5) * SPARK_RANDOM_VELOCITY;
  }

  onMount(() => {
    if (!canvasContainer) return;

    updateIsMobile();

    scene = new Scene();
    scene.background = new Color(0x050510);

    camera = new PerspectiveCamera(
      CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      CAMERA_NEAR,
      CAMERA_FAR,
    );
    camera.position.set(0, 250, 600);
    camera.lookAt(0, 0, 0);

    renderer = new WebGLRenderer({ antialias: false, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    canvasContainer.appendChild(renderer.domElement);

    composer = setupPostProcessing(scene, camera, renderer);

    const lbTexture = createLeaderboardTexture();
    cityBuilder = new CityBuilder(scene);
    cityBuilder.buildCity(isMobile(), lbTexture);
    const buildings = cityBuilder.getBuildings();
    occupiedGrids = cityBuilder.getOccupiedGrids();

    buildings.forEach((b) => {
      b.traverse((c) => {
        if (c instanceof Mesh && c.userData.isLeaderboard) {
          leaderboardMeshes.push(c);
        }
      });
    });

    trafficSystem = new TrafficSystem(scene, CAR_COUNT, spawnSparks);
    cars = trafficSystem.getCars();

    const droneGeo = new BufferGeometry();
    const droneCount = DRONE_COUNT;
    const dronePositions = new Float32Array(droneCount * 3);
    const droneColorsArray = new Float32Array(droneCount * 3);
    droneTargetPositions = new Float32Array(droneCount * 3);
    droneBasePositions = new Float32Array(droneCount * 3);

    const baseRand = mulberry32(1337);
    for (let i = 0; i < droneCount; i++) {
      const range = BOUNDS * 2;
      droneBasePositions[i * 3] = (baseRand() - 0.5) * range;
      droneBasePositions[i * 3 + 1] = 300 + baseRand() * 800;
      droneBasePositions[i * 3 + 2] = (baseRand() - 0.5) * range;
    }

    const dColor1 = new Color(0xff0000);
    const dColor2 = new Color(0x00ffcc);
    const dColor3 = new Color(0x00ff00);
    const dColor4 = new Color(0xffffff);

    generateDroneTargets(location.pathname);

    for (let i = 0; i < droneCount * 3; i++) {
      dronePositions[i] = droneTargetPositions[i];
    }

    for (let i = 0; i < droneCount; i++) {
      const c = Math.random();
      let finalColor = dColor4;
      if (c < 0.25) finalColor = dColor1;
      else if (c < 0.5) finalColor = dColor2;
      else if (c < 0.75) finalColor = dColor3;

      droneColorsArray[i * 3] = finalColor.r;
      droneColorsArray[i * 3 + 1] = finalColor.g;
      droneColorsArray[i * 3 + 2] = finalColor.b;
    }

    droneGeo.setAttribute("position", new BufferAttribute(dronePositions, 3));
    droneGeo.setAttribute("color", new BufferAttribute(droneColorsArray, 3));

    const droneMaterial = new PointsMaterial({
      size: 15,
      map: createDroneTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    drones = new Points(droneGeo, droneMaterial);
    scene.add(drones);

    const sparkGeo = new BufferGeometry();
    sparkGeo.setAttribute("position", new BufferAttribute(sparkPositions, 3));

    const sparkMat = new PointsMaterial({
      color: 0xffaa00,
      size: 3,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    sparks = new Points(sparkGeo, sparkMat);
    sparks.frustumCulled = false;
    scene.add(sparks);

    konamiManager = new KonamiManager(scene);

    gangWarManager = new GangWarManager(
      scene,
      occupiedGrids,
      spawnSparks,
      playPewSound,
    );

    createCheckpoint();
    createNavArrow();
    createChaseArrow();

    window.addEventListener("resize", onResize);
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    const context: GameContext = {
      scene,
      camera,
      renderer,
      composer,
      cars,
      drones,
      droneTargetPositions,
      occupiedGrids,
      buildings,
      score: { get value() { return score() }, set value(v) { setScore(v) } } as any,
      droneScore: { get value() { return droneScore() }, set value(v) { setDroneScore(v) } } as any,
      drivingScore: { get value() { return drivingScore() }, set value(v) { setDrivingScore(v) } } as any,
      timeLeft: { get value() { return timeLeft() }, set value(v) { setTimeLeft(v) } } as any,
      activeCar: { get value() { return activeCar() }, set value(v) { setActiveCar(v) } } as any,
      isMobile: { get value() { return isMobile() }, set value(v) { setIsMobile(v) } } as any,
      isGameOver: { get value() { return isGameOver() }, set value(v) { setIsGameOver(v) } } as any,
      distToTarget: { get value() { return distToTarget() }, set value(v) { setDistToTarget(v) } } as any,
      controls,
      lookControls,
      spawnSparks,
      playPewSound,
      spawnCheckpoint,
      checkpointMesh,
      navArrow,
      chaseArrow,
    };

    // We need to keep references up to date for GameModeManager
    // Since we use createSignal, we map them into refs

    gameModeManager = new GameModeManager(context as any);

    isActive = true;
    if (!props.showSplash) {
      startTime = Date.now();
    }
    animate();

    ScoreService.getTopScores().then((scores) => {
      setLeaderboard(scores);
      updateLeaderboardTexture();
    });

    cyberpunkAudio.addListener(onAudioNote);

    if (props.ref) {
      props.ref({
        startExplorationMode,
        startFlyingTour,
        startDemoMode
      });
    }
  });

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      exitGameMode();
      return;
    }
    if (konamiManager) konamiManager.onKeyDown(event);
    if (gameModeManager) gameModeManager.onKeyDown(event);
  }

  function onKeyUp(event: KeyboardEvent) {
    if (gameModeManager) gameModeManager.onKeyUp(event);
  }

  function mulberry32(a: number) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function generateDroneTargets(path: string) {
    let seed = 0;
    for (let i = 0; i < path.length; i++) {
      seed = (seed << 5) - seed + path.charCodeAt(i);
      seed |= 0;
    }
    seed = Math.abs(seed) + 1;

    const rand = mulberry32(seed);

    if (droneTargetPositions) {
      for (let i = 0; i < droneTargetPositions.length / 3; i++) {
        const xOffset = (rand() - 0.5) * 500;
        const yOffset = (rand() - 0.5) * 200;
        const zOffset = (rand() - 0.5) * 500;

        if (droneBasePositions) {
          droneTargetPositions[i * 3] = droneBasePositions[i * 3] + xOffset;
          droneTargetPositions[i * 3 + 1] = droneBasePositions[i * 3 + 1] + yOffset;
          droneTargetPositions[i * 3 + 2] = droneBasePositions[i * 3 + 2] + zOffset;
        } else {
          droneTargetPositions[i * 3] = xOffset * 8;
          droneTargetPositions[i * 3 + 1] = 300 + (yOffset + 100) * 4;
          droneTargetPositions[i * 3 + 2] = zOffset * 8;
        }
      }
    }
  }

  createEffect(() => {
    if (!isGameMode() && !isDrivingMode()) {
      generateDroneTargets(location.pathname);
    }
  });

  createEffect(() => {
    if (!props.showSplash && startTime === 0) {
      startTime = Date.now();
    }
  });

  createEffect(() => {
    if (droneScore() >= 500 && !isGameMode() && !isDrivingMode()) {
      startTargetPractice();
    }
  });

  function startTargetPractice() {
    setIsGameMode(true);
    if (props.onGameStart) props.onGameStart();
    gameModeManager.setMode(new DroneMode());
  }

  function startExplorationMode() {
    setIsGameMode(true);
    setIsExplorationMode(true);
    if (props.onGameStart) props.onGameStart();
    gameModeManager.setMode(new ExplorationMode());
  }

  function startFlyingTour() {
    setIsGameMode(true);
    setIsFlyingTour(true);
    if (props.onGameStart) props.onGameStart();
    gameModeManager.setMode(new FlyingTourMode());
  }

  function startDemoMode() {
    setIsGameMode(true);
    if (props.onGameStart) props.onGameStart();
    gameModeManager.setMode(new DemoMode());
  }

  function exitGameMode() {
    if (gameModeManager) gameModeManager.clearMode();

    if (isDrivingMode()) {
      setIsDrivingMode(false);
    }

    if (isExplorationMode()) {
      setIsExplorationMode(false);
    }

    if (isFlyingTour()) {
      setIsFlyingTour(false);
    }

    setIsCinematicMode(false);
    setIsGameMode(false);
    setIsGameOver(false);
    setScore(0);
    setDroneScore(0);
    setDrivingScore(0);
    if (props.onGameEnd) props.onGameEnd();

    if (drones && droneTargetPositions) {
      const positions = drones.geometry.attributes.position.array;
      const count = positions.length / 3;
      for (let i = 0; i < count; i++) {
        positions[i * 3] = droneTargetPositions[i * 3];
        positions[i * 3 + 1] = droneTargetPositions[i * 3 + 1];
        positions[i * 3 + 2] = droneTargetPositions[i * 3 + 2];
      }
      drones.geometry.attributes.position.needsUpdate = true;
    }
  }

  function onResize() {
    if (!renderer || !camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) {
      composer.setSize(window.innerWidth, window.innerHeight);
    }
    updateIsMobile();
  }

  function onPointerLockChange() {}

  function onClick(event: MouseEvent) {
    if (!camera) return;

    if (gameModeManager) gameModeManager.onClick(event);

    if (isGameMode() || isDrivingMode()) return;

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    if (gangWarManager && gangWarManager.fightMarkers.length > 0) {
      const markerIntersects = raycaster.intersectObjects(
        gangWarManager.fightMarkers,
      );
      if (markerIntersects.length > 0) {
        const hit = markerIntersects[0].object;
        if (hit.userData.isFightMarker && hit.userData.target) {
          setIsGameMode(true);
          setIsCinematicMode(true);
          cinematicTarget.copy(hit.userData.target);
          if (props.onGameStart) props.onGameStart();
          return;
        }
      }
    }

    const carMeshes: Object3D[] = [];
    cars.forEach((c) =>
      c.traverse((child) => {
        if (child instanceof Mesh) carMeshes.push(child);
      }),
    );

    const carIntersects = raycaster.intersectObjects(carMeshes);
    if (carIntersects.length > 0) {
      const hit = carIntersects[0].object;
      let target = hit;
      while (target.parent && target.parent.type !== "Scene") {
        target = target.parent;
      }

      if (target instanceof Group && target.userData.speed !== undefined) {
        setIsDrivingMode(true);
        if (props.onGameStart) props.onGameStart();

        setActiveCar(target);

        // Remove lights from old, add to new. Handling reactivity change
        trafficSystem.addLightsToCar(target);

        target.userData.isPlayerControlled = true;
        target.userData.currentSpeed = target.userData.speed;

        gameModeManager.setMode(new DrivingMode());
        return;
      }
    }

    if (leaderboardMeshes.length > 0) {
      const lbIntersects = raycaster.intersectObjects(leaderboardMeshes);
      if (lbIntersects.length > 0) {
        setShowLeaderboard(true);
        return;
      }
    }

    if (drones && !isExplorationMode()) {
      raycaster.params.Points.threshold = RAYCASTER_POINTS_THRESHOLD;
      const intersects = raycaster.intersectObject(drones);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const index = intersect.index;

        if (index !== undefined && !deadDrones.has(index)) {
          const posAttribute = drones.geometry.attributes.position;
          const x = posAttribute.getX(index);
          const y = posAttribute.getY(index);
          const z = posAttribute.getZ(index);

          spawnSparks(new Vector3(x, y, z));

          posAttribute.setXYZ(index, 0, SPARK_OFF_SCREEN_Y, 0);
          posAttribute.needsUpdate = true;

          deadDrones.add(index);

          playPewSound();
          setDroneScore(prev => prev + DRONE_SCORE_POINTS);
        }
      }
    }
  }

  function onMouseMove(event: MouseEvent) {
    if (gameModeManager) gameModeManager.onMouseMove(event);
  }

  function animate() {
    if (!isActive) return;
    animationId = requestAnimationFrame(animate);

    const now = Date.now();
    const time = now * 0.0005;
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (konamiManager) konamiManager.update(dt);
    if (gangWarManager) gangWarManager.update(dt);
    if (gameModeManager) gameModeManager.update(dt, time);
    if (trafficSystem) trafficSystem.update();

    if (cityBuilder) {
      const materials = cityBuilder.getAudioMaterials();
      for (const key in materials) {
        const mat = materials[key];
        if (mat.emissiveIntensity > EMISSIVE_INTENSITY_TARGET) {
          mat.emissiveIntensity = MathUtils.lerp(
            mat.emissiveIntensity,
            EMISSIVE_INTENSITY_TARGET,
            EMISSIVE_LERP_FACTOR,
          );
        }
      }
    }

    if (sparks) {
      const positions = sparks.geometry.attributes.position.array;
      let needsUpdate = false;

      for (let i = 0; i < SPARK_COUNT; i++) {
        if (sparkLifetimes[i] > 0) {
          sparkVelocities[i * 3 + 1] -= SPARK_GRAVITY;
          positions[i * 3] += sparkVelocities[i * 3];
          positions[i * 3 + 1] += sparkVelocities[i * 3 + 1];
          positions[i * 3 + 2] += sparkVelocities[i * 3 + 2];

          const h = getHeight(positions[i * 3], positions[i * 3 + 2]);

          if (positions[i * 3 + 1] < h) {
            positions[i * 3 + 1] = h;
            sparkVelocities[i * 3 + 1] *= -0.5;
          }

          const ix = Math.round((positions[i * 3] - START_OFFSET) / CELL_SIZE);
          const iz = Math.round(
            (positions[i * 3 + 2] - START_OFFSET) / CELL_SIZE,
          );

          if (occupiedGrids.has(`${ix},${iz}`)) {
            const cX = START_OFFSET + ix * CELL_SIZE;
            const cZ = START_OFFSET + iz * CELL_SIZE;
            const dims = occupiedGrids.get(`${ix},${iz}`);

            if (
              dims &&
              Math.abs(positions[i * 3] - cX) < dims.halfW &&
              Math.abs(positions[i * 3 + 2] - cZ) < dims.halfD
            ) {
              sparkLifetimes[i] = 0;
            }
          }

          sparkLifetimes[i] -= SPARK_LIFETIME_DECAY;
          if (sparkLifetimes[i] < 0) {
            sparkLifetimes[i] = 0;
            positions[i * 3 + 1] = SPARK_OFF_SCREEN_Y;
          }
          needsUpdate = true;
        }
      }
      if (needsUpdate) {
        sparks.geometry.attributes.position.needsUpdate = true;
      }
    }

    const isDroneMode = gameModeManager ? gameModeManager.getMode() instanceof DroneMode : false;

    if (drones && !isDroneMode) {
      const positions = drones.geometry.attributes.position.array;

      if (droneTargetPositions) {
        const oscTime = Date.now() * 0.001;

        for (let i = 0; i < positions.length / 3; i++) {
          if (deadDrones.has(i)) continue;

          const offset = i;
          const oscX = Math.sin(oscTime + offset) * DRONE_OSCILLATION_X;
          const oscY = Math.cos(oscTime * 0.5 + offset) * DRONE_OSCILLATION_Y;
          const oscZ = Math.sin(oscTime * 0.8 + offset) * DRONE_OSCILLATION_Z;

          const targetX = droneTargetPositions[i * 3] + oscX;
          const targetY = droneTargetPositions[i * 3 + 1] + oscY;
          const targetZ = droneTargetPositions[i * 3 + 2] + oscZ;

          positions[i * 3] += (targetX - positions[i * 3]) * DRONE_EASING;
          positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * DRONE_EASING;
          positions[i * 3 + 2] += (targetZ - positions[i * 3 + 2]) * DRONE_EASING;
        }
        drones.geometry.attributes.position.needsUpdate = true;
      }
    }

    if (!gameModeManager || !gameModeManager.getMode()) {
      if (isCinematicMode()) {
        const angle = time * INTRO_ORBIT_SPEED;

        const tx = cinematicTarget.x + Math.sin(angle) * INTRO_ORBIT_RADIUS;
        const tz = cinematicTarget.z + Math.cos(angle) * INTRO_ORBIT_RADIUS;

        camera.position.x += (tx - camera.position.x) * CAMERA_LERP_FACTOR;
        camera.position.z += (tz - camera.position.z) * CAMERA_LERP_FACTOR;
        camera.position.y +=
          (CAMERA_CINEMATIC_Y - camera.position.y) * CAMERA_LERP_FACTOR;

        currentLookAt.lerp(cinematicTarget, CAMERA_LERP_FACTOR);
        camera.lookAt(currentLookAt);
      } else {
        const orbitRadius = isMobile()
          ? ORBIT_RADIUS_MOBILE
          : ORBIT_RADIUS_DESKTOP;
        camera.position.x = Math.sin(time * ORBIT_SPEED) * orbitRadius;
        camera.position.z = Math.cos(time * ORBIT_SPEED) * orbitRadius;

        const targetY = isMobile()
          ? CAMERA_TARGET_Y_MOBILE
          : CAMERA_TARGET_Y_DESKTOP;

        const introProgress =
          startTime === 0
            ? 0
            : Math.min(1, (now - startTime) / INTRO_DURATION_MS);

        if (startTime === 0) {
          camera.position.y = CAMERA_START_Y;
          camera.position.x =
            Math.sin(time * ORBIT_SPEED + Math.PI * 2) * orbitRadius;
          camera.position.z =
            Math.cos(time * ORBIT_SPEED + Math.PI * 2) * orbitRadius;
        } else if (introProgress < 1) {
          const ease = 1 - Math.pow(1 - introProgress, 3);
          const startY = CAMERA_START_Y;
          const currentY = startY + (targetY - startY) * ease;
          camera.position.y = currentY;

          const spiralAngle = (1 - ease) * Math.PI * 2;
          camera.position.x =
            Math.sin(time * ORBIT_SPEED + spiralAngle) * orbitRadius;
          camera.position.z =
            Math.cos(time * ORBIT_SPEED + spiralAngle) * orbitRadius;
        } else {
          if (Math.abs(camera.position.y - targetY) > 1) {
            camera.position.y +=
              (targetY - camera.position.y) * CAMERA_LERP_FACTOR;
          }
        }

        const targetLookAt = new Vector3(0, 0, 0);
        currentLookAt.lerp(targetLookAt, CAMERA_LOOK_AT_LERP);
        camera.lookAt(currentLookAt);
      }
    }

    if (composer) {
      composer.render();
    } else if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function playPewSound(pos?: Vector3) {
    audioManager.init();
    const audioCtx = audioManager.ctx;
    const dest = audioManager.masterGain || audioManager.ctx?.destination;

    if (!audioCtx || !dest) return;

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(
      AUDIO_OSCILLATOR_FREQ_START,
      audioCtx.currentTime,
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      AUDIO_OSCILLATOR_FREQ_END,
      audioCtx.currentTime + AUDIO_SWEEP_DURATION,
    );

    let volume = AUDIO_VOLUME;

    if (pos && camera) {
      const dist = pos.distanceTo(camera.position);
      volume = AUDIO_VOLUME / (1 + dist / AUDIO_DISTANCE_FACTOR);

      if (volume < 0.001) volume = 0;
    }

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + AUDIO_SWEEP_DURATION,
    );

    oscillator.connect(gainNode);
    gainNode.connect(dest);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + AUDIO_SWEEP_DURATION);
  }

  function onAudioNote(type: string, data?: any) {
    if (!cityBuilder) return;
    const materials = cityBuilder.getAudioMaterials();
    let key = "";
    if (type === "bass") {
      key = `bass${data}`;
    } else {
      key = type;
    }
    if (materials[key]) {
      let boost = EMISSIVE_INTENSITY_BOOST_BASS;
      if (type === "hihat") boost = EMISSIVE_INTENSITY_BOOST_HIHAT;
      materials[key].emissiveIntensity = boost;
    }
  }

  onCleanup(() => {
    cyberpunkAudio.removeListener(onAudioNote);
    isActive = false;
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    }

    cancelAnimationFrame(animationId);
    if (renderer) {
      renderer.dispose();
    }
    carAudio.stop();
    if (konamiManager) {
      konamiManager.dispose();
    }
    if (gangWarManager) {
      gangWarManager.dispose();
    }
  });

  return (
    <>
      <div ref={canvasContainer} id="cyberpunk-city"></div>
      <GameUI
        isDrivingMode={isDrivingMode()}
        isGameMode={isGameMode()}
        isExplorationMode={isExplorationMode()}
        isFlyingTour={isFlyingTour()}
        isCinematicMode={isCinematicMode()}
        isGameOver={isGameOver()}
        isMobile={isMobile()}
        drivingScore={drivingScore()}
        droneScore={droneScore()}
        timeLeft={timeLeft()}
        distToTarget={distToTarget()}
        controls={controls}
        lookControls={lookControls}
        leaderboard={leaderboard()}
        showLeaderboard={showLeaderboard()}
        onExitGameMode={exitGameMode}
        onUpdateLeaderboard={updateLeaderboard}
        onCloseLeaderboard={() => setShowLeaderboard(false)}
      />
      <style>{`
        #cyberpunk-city {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }
      `}</style>
    </>
  );
}
