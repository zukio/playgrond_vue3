<template>
  <div
    v-visible="{ onVisible: onSlideVisible, onHidden: onSlideHidden, threshold: 0.8 }"
    class="layer-on-canvas"
    :style="{ position: isDebug ? 'relative' : 'absolute' }"
  >
    <Permission v-if="!permissionGranted" @click="handlePermissionResponse" ref="permissionComponent" />
    <Modal @onContinue="continuation" :succeed="goalReached" :failed="goalLost" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, computed, type CSSProperties } from "vue";
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Object3D,
  Mesh,
  MeshPhongMaterial,
  SphereGeometry,
  AmbientLight,
  DirectionalLight,
  MathUtils,
  Vector2,
  Vector3,
  Box3,
  PlaneGeometry,
  MeshBasicMaterial,
  TextureLoader,
  SRGBColorSpace,
  MeshStandardMaterial,
} from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as CANNON from "cannon-es";
import { defaultOrientationSign, handleOrientation } from "@/utils/orientation";
import Permission from "@/components/permission/DeviceOrientation.vue";
import type { Rotation } from "@/types";
import Modal from "@/components/book/Layer_Labyrinth001.vue";
import modelImagePath001 from "@/assets/images/labyrinth/stage001.png";
import modelImagePath002 from "@/assets/images/labyrinth/stage002.png";
import modelImagePath003 from "@/assets/images/labyrinth/stage003.png";
import ballImagePath001 from "@/assets/images/labyrinth/unevencircle003.png";
import ballImagePath002 from "@/assets/images/labyrinth/unevencircle002.png";
import ballImagePath003 from "@/assets/images/labyrinth/unevencircle001.png";
const config = useRuntimeConfig();
const modelPath001 = `${config.public.baseUrl}models/labyrinth/stage001.glb`;
const modelPath002 = `${config.public.baseUrl}models/labyrinth/stage002.glb`;
const modelPath003 = `${config.public.baseUrl}models/labyrinth/stage003.glb`;

// -----------------------------------------------
// data
const props = withDefaults(
  defineProps<{
    modelNo: number;
    ballSize: number;
    ballPosition: { x: number; y: number; z: number };
    wallPosition: { x: number; y: number; z: number; scale: number };
    goalPosition: { x: number; y: number; z: number };
  }>(),
  {
    modelNo: 1,
    ballSize: 16,
    ballPosition: () => ({ x: -10, y: 0, z: 0 }),
    wallPosition: () => ({ x: 1, y: 0.3, z: -0.1, scale: 1 }),
    goalPosition: () => ({ x: 8, y: -0.5, z: 0 }),
  }
);

// Emitsの定義
const emit = defineEmits(["customEvent"]);
// カルーセルの現在のインデックスを取得
const currentIndex = computed(() => {
  return useUser().readingState.currentIndex;
});
const modelPath = computed(() => {
  const modelPathes = [modelPath001, modelPath002, modelPath003];
  return modelPathes[props.modelNo - 1];
});
const modelImagePath = computed(() => {
  const modelImagePaths = [modelImagePath001, modelImagePath002, modelImagePath003];
  return modelImagePaths[props.modelNo - 1];
});
const ballImagePath = computed(() => {
  const ballImagePaths = [ballImagePath001, ballImagePath002, ballImagePath003];
  return ballImagePaths[props.modelNo - 1];
});

const continuation = (userChoice: boolean) => {
  if (userChoice) {
    restartGame();
  } else {
    showFanfare();
  }
};

const provider = inject("provider") as {
  context: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  camera: OrthographicCamera | null;
  renderer: WebGLRenderer | null;
  controls: any | null;
  initProvider: () => void;
  setOrbitControls: (camera: OrthographicCamera | null) => void;
};
// const gameContainer = ref<HTMLDivElement | null>(null)
const permissionGranted = ref(false);
const permissionComponent = ref<any | null>(null);
const rotation = ref<Rotation>({ alpha: 0, beta: 0, gamma: 0, absolute: false });

let scene: Scene;
let ball: Mesh;
let labyrinth: Object3D | null = null;
let animationFrameId: number | null = null;

let world: CANNON.World;
let ballBody: CANNON.Body;

let ballImage: any;

const fixRatio = true; // 縦横比を画面サイズに合わせて調整するか
const useOrbit = false; // カメラコントロールを使用するか
const isDebug = false; // デバッグモード

const model = ref<GLTF | null>(null);
const modelBoundingBox = ref<Box3 | null>(null);
const goalReached = ref(false);
const goalLost = ref(false);
// -----------------------------------------------
const initPhysics = () => {
  world = new CANNON.World();
  world.gravity.set(0, 0, 0);

  const solver = new CANNON.GSSolver();
  solver.iterations = 10;
  world.solver = solver;
  world.broadphase = new CANNON.NaiveBroadphase();
};

const initScene = async () => {
  scene = new Scene();
  provider.camera = new OrthographicCamera(0, 0, 0, 0, 0.1, 1000);

  if (provider.renderer) {
    provider.renderer.setSize(window.innerWidth, window.innerHeight);
    // provider.renderer.setClearColor(0xf0f0f0); // レンダラーの背景色も設定
  }
  setupLight();
  // モデル（ステージ）を読み込み
  model.value = await loadLabyrinthAsync();
  // モデル（ステージ）に重ねる画像を読み込み
  addImageToScene(modelImagePath.value);
  // モデル（ステージ）サイズに合わせてカメラを初期設定
  setupCamera();
  if (useOrbit) {
    provider.setOrbitControls(provider.camera);
  } else {
    provider.setOrbitControls(null);
  }
};

const setLeapedCameraPosition = (mergin: Vector2 = new Vector2(0, 0)): { min: Vector2; max: Vector2 } | null => {
  if (!provider.camera || !modelBoundingBox.value) {
    console.log("provider.camera or modelBoundingBox is null");
    return null;
  }
  // モデル全体のサイズと中心を取得
  // const boundingBox = new Box3().setFromObject(model.value.scene)
  // カメラの可動範囲を制限
  const halfFrustum = new Vector2(
    (provider.camera.right - provider.camera.left) / 2,
    (provider.camera.top - provider.camera.bottom) / 2
  );
  // カメラとモデルのスケールを合わせる
  let scalefactor = Math.abs(halfFrustum.y / modelBoundingBox.value.min.y);
  const minBound = new Vector2(
    (modelBoundingBox.value.min.x * scalefactor + halfFrustum.x + mergin.x) * -1,
    (modelBoundingBox.value.min.y * scalefactor + halfFrustum.y + mergin.y) * -1
  );
  scalefactor = Math.abs(halfFrustum.y / modelBoundingBox.value.max.y);
  const maxBound = new Vector2(
    modelBoundingBox.value.max.x * scalefactor + halfFrustum.x + mergin.x,
    modelBoundingBox.value.max.y * scalefactor + halfFrustum.y + mergin.y
  );
  return { min: minBound, max: maxBound };
};

const setupCamera = () => {
  if (!provider.camera) return;
  const parentElement = provider.canvas.parentElement;
  const clientWidth = parentElement ? parentElement.clientWidth : provider.canvas.width || window.innerWidth;
  const clientHeight = parentElement ? parentElement.clientHeight : provider.canvas.height || window.innerHeight;
  let aspect = clientHeight / clientWidth;
  let frustumSize = 7;
  if (model.value) {
    const scalefactor = 0.7; // スケールファクター
    // モデル全体のバウンディングボックスを取得
    modelBoundingBox.value = new Box3().setFromObject(model.value.scene);
    const size = modelBoundingBox.value.getSize(new Vector3());
    aspect = fixRatio ? size.x / size.y : clientWidth / clientHeight;
    frustumSize = Math.max(size.x, size.y) * scalefactor; // モデルのサイズに応じてフラスタムサイズを調整
  }
  provider.camera.left = (frustumSize * aspect) / -2;
  provider.camera.right = (frustumSize * aspect) / 2;
  provider.camera.top = frustumSize / 2;
  provider.camera.bottom = frustumSize / -2;
  provider.camera.near = 0.1;
  provider.camera.far = 1000;
  provider.camera.updateProjectionMatrix();
};

const setupLight = () => {
  const ambientLight = new AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
};

const loadLabyrinthAsync = () => {
  return new Promise<GLTF | null>((resolve) => {
    const loader = new GLTFLoader();
    loader
      .loadAsync(modelPath.value)
      .then((gltf: GLTF) => {
        labyrinth = gltf.scene;
        if (scene && labyrinth) {
          const scalefactor = 2;
          labyrinth.scale.set(scalefactor, scalefactor, scalefactor);
          labyrinth.position.set(0, 0, 0); // 中心に配置
          labyrinth.rotation.x = 0; // 水平に配置

          labyrinth.traverse((child: any) => {
            if (child instanceof Mesh) {
              // メッシュを非表示にする
              child.visible = isDebug;
              // 子オブジェクトのスケールと位置を親オブジェクトのスケールと位置に合わせる
              child.updateMatrixWorld(true);
              const worldPosition = new Vector3();
              child.getWorldPosition(worldPosition);
              const worldScale = new Vector3();
              child.getWorldScale(worldScale);

              const geometry = child.geometry.clone();
              geometry.applyMatrix4(child.matrixWorld); // ワールド変換行列を適用

              let vertices = geometry.attributes.position.array;
              let indices = geometry.index ? geometry.index.array : [];

              // 三角形メッシュの形状を作成
              const trimeshShape = new CANNON.Trimesh(vertices, indices);
              const body = new CANNON.Body({
                mass: 0,
                shape: trimeshShape,
                position: new CANNON.Vec3(worldPosition.x, worldPosition.y, worldPosition.z),
              });
              world.addBody(body);
            }
          });
          scene.add(labyrinth);
          console.log("Labyrinth added to scene and physics world");
          resolve(gltf);
        } else {
          console.error("Scene or labyrinth is not defined.");
          resolve(null);
        }
      })
      .catch((error: any) => {
        console.error("ラビリンスモデルの読み込み中にエラーが発生しました:", error);
        resolve(null);
      });
  });
};

const addImageToScene = (imagePath: string) => {
  const textureLoader = new TextureLoader();
  textureLoader.load(imagePath, (texture: any) => {
    const geometry = new PlaneGeometry(1, 1); // 画像の平面ジオメトリ
    const material = new MeshBasicMaterial({ map: texture, transparent: true });
    const plane = new Mesh(geometry, material);

    if (modelBoundingBox.value) {
      // モデル全体のバウンディングボックスを取得
      const size = modelBoundingBox.value.getSize(new Vector3());
      const scale = props.wallPosition.scale;
      plane.scale.set(size.x * scale, size.y * scale, 1);
    }
    // plane.position.set(1.8, 0.3, -0.1); // モデルの背後に配置
    plane.position.set(props.wallPosition.x, props.wallPosition.y, props.wallPosition.z); // モデルの背後に配置

    scene.add(plane);
  });
  textureLoader.load(ballImagePath.value, (texture: any) => {
    texture.encoding = SRGBColorSpace;
    const geometry = new PlaneGeometry(1, 1); // 画像の平面ジオメトリ
    const material = new MeshStandardMaterial({ map: texture, transparent: true });
    const scale = props.ballSize > 5 ? props.ballSize / 10 : 1;
    ballImage = new Mesh(geometry, material);
    ballImage.scale.set(scale, scale, scale); // 必要に応じてスケールを調整
    ballImage.position.set(0, 0, 0); // 初期位置を設定
    scene.add(ballImage);
  });
};

const setupBall = () => {
  if (!provider.camera) {
    return console.log("先にカメラを初期化してください");
  }
  // ボールをカメラの画額内に配置
  // const ballPosition = new Vector3(-10, 0, 0);
  const ballPos = new Vector3(props.ballPosition.x, props.ballPosition.y, props.ballPosition.z);
  const leapPosition = setLeapedCameraPosition(new Vector2(3, 0));
  const newX = leapPosition ? Math.max(leapPosition.min.x, Math.min(leapPosition.max.x, ballPos.x)) : 0;
  //  Y軸固定につきコメントアウト
  // const newY = leapPosition ? Math.max(leapPosition.min.y, Math.min(leapPosition.max.y, ballPos.y)) : 0;
  createBall(ballPos.x, ballPos.y, 0); // 画面サイズによって変な位置に
  //createBall(newX, newY, 0); // 画面サイズによっては見切れる
  // ボールを捉えるようカメラの初期位置を調整 // Y軸固定につきコメントアウト
  //provider.camera.position.set(newX, newY, 50);
  provider.camera.position.set(newX, 0, 50);
  provider.camera.lookAt(ballPos.x, 0, 0);
};

/*const createBall = (posX: number, posY: number, posZ: number) => {
  const ballGeometry = new SphereGeometry(0.5, props.ballSize, props.ballSize);
  const ballMaterial = new MeshPhongMaterial({ color: 0xff0000 });
  ball = new Mesh(ballGeometry, ballMaterial);
  ball.scale.set(1, 1, 1);
  ball.position.set(posX, posY, posZ); // ボールを迷路の中に配置
  ball.visible = isDebug; // 3Dボールを非表示に設定
  scene.add(ball);

  // ボールの質量を調整することで、物理エンジンがボールの動きをより正確にシミュレートできるようにします。
  const shape = new CANNON.Sphere(0.5);
  ballBody = new CANNON.Body({
    mass: 9.8, // ボールの質量を小さくする
    shape: shape,
    position: new CANNON.Vec3(ball.position.x, ball.position.y, ball.position.z),
    linearDamping: 0.3, // 強めの減衰設定
    angularDamping: 0.9, // 回転の減衰設定
  });
  // ボールとコライダーの間で衝突の反発係数（リスティチューション）を設定し、衝突後にボールが跳ね返るようにします。
  ballBody.material = new CANNON.Material();
  ballBody.material.restitution = 0.7; // 反発係数を設定
  world.addBody(ballBody);
};*/

const createBall = (posX: number, posY: number, posZ: number) => {
  const ballGeometry = new SphereGeometry(0.5, props.ballSize, props.ballSize);
  const ballMaterial = new MeshPhongMaterial({ color: 0xff0000 });
  ball = new Mesh(ballGeometry, ballMaterial);
  ball.scale.set(1, 1, 1);
  ball.position.set(posX, posY, posZ); // ボールを迷路の中に配置
  ball.visible = isDebug; // 3Dボールを非表示に設定
  scene.add(ball);

  // ボールの質量を調整することで、物理エンジンがボールの動きをより正確にシミュレートできるようにします。
  const shape = new CANNON.Sphere(0.5);
  ballBody = new CANNON.Body({
    mass: 1, // 質量を1に設定
    shape: shape,
    position: new CANNON.Vec3(ball.position.x, ball.position.y, ball.position.z),
    linearDamping: 0.5, // 線形減衰を増加
    angularDamping: 0.99, // 角度（回転）減衰を大幅に増加
  });

  // 慣性モーメントを手動で設定
  const radius = 10; // ボールの半径
  const I = (2 / 5) * ballBody.mass * radius * radius;
  ballBody.inertia.set(I, I, I);
  ballBody.updateMassProperties();

  // ボールとコライダーの間で衝突の反発係数（リスティチューション）を設定し、衝突後にボールが跳ね返るようにします。
  ballBody.material = new CANNON.Material();
  ballBody.material.friction = 0.5; // 摩擦係数を設定
  ballBody.material.restitution = 0.2; // 反発係数を低めに設定

  world.addBody(ballBody);
};

const updatePhysics = () => {
  // ボールの位置と回転をThree.jsのメッシュに反映
  ball.position.copy(ballBody.position);
  ball.quaternion.copy(ballBody.quaternion);
  // z軸の位置を制限
  ballBody.position.z = Math.max(-1, Math.min(1, ballBody.position.z));
  // 3Dボールの上に2D画像を重ねる
  if (ballImage) {
    ballImage.position.set(ballBody.position.x, ballBody.position.y, 3);
    ballImage.quaternion.copy(ballBody.quaternion);
    ballImage.rotation.set(0, 0, ball.rotation.z);
  }

  // デバイスの傾きを力に変換
  const gravityStrength = 5; // デバイスの傾きに基づく力の適用強度
  const constantGravity = 1; // 常に存在する重力の強さ (m/s^2)

  const tiltX = MathUtils.degToRad(rotation.value.alpha || 0);
  const tiltZ = MathUtils.degToRad(rotation.value.gamma || 0);

  const forceX = Math.sin(tiltZ) * gravityStrength;
  const forceZ = -Math.sin(tiltX) * gravityStrength;

  // デバイスの下方向に基づく重力の計算
  let downX = 0;
  let downZ = -constantGravity; // 上から見下ろしているのでZ軸が下方向
  // 画面の向きに応じて重力ベクトルを調整
  switch (window.screen.orientation.angle) {
    case 0:
      // console.log('上向き')
      downX = 0;
      downZ = -constantGravity;
      break;
    case 90:
      // console.log('右向き')
      downX = constantGravity;
      downZ = 0;
      break;
    case -90:
    case 270:
      // console.log('左向き')
      downX = -constantGravity;
      downZ = 0;
      break;
    case 180:
      // console.log('逆さま')
      downX = 0;
      downZ = constantGravity;
      break;
  }
  //orientationSign() をキャッシュして、downX と downZ にそれぞれ適用
  const orientationSign = defaultOrientationSign();
  downX *= orientationSign;
  downZ *= orientationSign;

  // デバッグ用出力
  // console.log('Forces:', { forceX, forceZ, downX, downZ })

  // XZ平面での力の適用を確認
  ballBody.applyForce(new CANNON.Vec3(forceX + downX, forceZ + downZ, 0), ballBody.position); // デバイスの傾きに基づく力
  // 以下だとY軸方向に力を加えてしまう
  // ballBody.applyForce(new CANNON.Vec3(forceX + downX, 0, forceZ + downZ), ballBody.position)

  // ゴールに到達したかどうかのチェック
  checkGoal();
};

const updateCameraPosition = () => {
  if (!provider.camera) {
    console.log("provider.camera is null");
    return;
  }

  const leapPosition = setLeapedCameraPosition(new Vector2(3, 0));
  if (!leapPosition) {
    console.log("setLeapedCameraPosition is null");
    return;
  }
  const minBound = leapPosition.min;
  const maxBound = leapPosition.max;

  // ボールの位置を取得
  // const ballPosition = ball.position.clone()
  const ballPosition = ballBody.position;

  // ボールの位置に基づいてカメラを更新
  let newX = ballPosition.x;
  // let newY = ballPosition.y;// Y軸固定につきコメントアウト;

  // 現在のカメラ位置を取得
  const currentX = provider.camera.position.x;
  // const currentY = provider.camera.position.y;// Y軸固定につきコメントアウト;

  // カメラの可動範囲内にボールがあるか判定
  const inBoxX = minBound.x < ballPosition.x && ballPosition.x < maxBound.x;
  // const inBoxY = minBound.y < ballPosition.y && ballPosition.y < maxBound.y;// Y軸固定につきコメントアウト;

  // ボールがバウンディングボックス内にある場合のみカメラの位置を更新
  // if (inBoxX || inBoxY) {// Y軸固定につきコメントアウト;
  if (inBoxX) {
    newX = Math.max(minBound.x, Math.min(maxBound.x, newX));
  } else {
    newX = currentX;
  }
  provider.camera.lookAt(ballPosition.x, 0, ballPosition.z);

  //if (inBoxY) {// Y軸固定につきコメントアウト;
  //  newY = Math.max(minBound.y, Math.min(maxBound.y, newY));
  //} else {
  //  newY = currentY;
  //}
  //provider.camera.position.set(newX, newY, provider.camera.position.z); Y軸固定につきコメントアウト
  provider.camera.position.set(newX, provider.camera.position.y, provider.camera.position.z);
  // }
};
// ゴールに到達したかどうかのチェック
const checkGoal = () => {
  const goalThreshold = 2; // ゴールとボールの距離のしきい値
  // const goalPos = new Vector3(8, -0.5, 0); // ゴールの位置

  if (!goalReached.value) {
    // ゴールに十分近づいた
    if (ball.position.distanceTo(props.goalPosition) < goalThreshold) {
      goalReached.value = true;
      cancelAnimationFrame(animationFrameId!);
    }
    // ステージから離れた
    if (modelBoundingBox.value) {
      if (
        ball.position.x < modelBoundingBox.value.min.x ||
        ball.position.x > modelBoundingBox.value.max.x ||
        ball.position.y < modelBoundingBox.value.min.y ||
        ball.position.y > modelBoundingBox.value.max.y
      ) {
        goalLost.value = true;
        cancelAnimationFrame(animationFrameId!);
      }
    }
  }
};

const showFanfare = () => {
  goalReached.value = false;
  goalLost.value = false;
  // 現在のページ（computedなので遷移中に値が変わらないように移す）
  const currentIndex = useUser().readingState.currentIndex;
  // 自動で次のページに遷移
  useUser().setCurrentIndex(currentIndex + 1);
  // emit("customEvent", { type: "next" });
};

const restartGame = () => {
  goalReached.value = false;
  goalLost.value = false;
  rotation.value = { alpha: 0, beta: 0, gamma: 0, absolute: false };
  // 以前のボールを削除 // 画像は使いまわし
  if (ball) {
    scene.remove(ball);
    world.removeBody(ballBody);
  }
  setupBall();
  animate();
};

const initGame = async () => {
  initPhysics();
  await initScene();
  setupBall();
  // ウィンドウサイズ変更時にモデルのサイズを調整
  window.addEventListener("resize", setupCamera);
  animate();
};
// -----------------------------------------------
const animate = () => {
  if (!isActive.value || goalReached.value || goalLost.value) {
    return;
  }
  if (!provider.camera) return;
  animationFrameId = requestAnimationFrame(animate);

  const deltaTime = 1 / 60;
  world.step(deltaTime, 1 / 60, 10);

  updatePhysics();

  if (useOrbit) {
    provider.controls?.update();
  } else {
    updateCameraPosition(); // カメラの位置を更新
  }
  if (provider.renderer && provider.camera) {
    provider.renderer.render(scene, provider.camera);
  }
};
// -----------------------------------------------
const localHandleOrientation = (event: DeviceOrientationEvent) => {
  // 非表示時は処理しない
  if (!isActive.value) return;
  // ポートレイトとランドスケープの切り替えはヘルパー関数内で行われている
  handleOrientation(event, rotation);
};

const localFallbackOrientation = (event: KeyboardEvent) => {
  // 非表示時は処理しない
  if (!isActive.value) return;
  // ヘルパー関数はデバッグ用のフォールバックでプレイ用とは異なる
  // debugOrientation (event, 5, rotation)

  // 現在の回転状態を取得
  let { alpha, beta, gamma } = rotation.value;

  switch (event.key) {
    case "ArrowUp":
      alpha = 270;
      beta = 0;
      gamma = 0;
      break;
    case "ArrowDown":
      alpha = 90;
      beta = 0;
      gamma = 0;
      break;
    case "ArrowLeft":
      alpha = 180;
      beta = 0;
      gamma = -90; // 左に傾ける
      break;
    case "ArrowRight":
      alpha = 0;
      beta = 0;
      gamma = 90; // 右に傾ける
      break;
  }

  // 回転値を更新
  rotation.value = { alpha, beta, gamma, absolute: rotation.value.absolute };

  // デバッグ用出力
  // console.log('Fallback Orientation:', { alpha, beta, gamma })
};

const handlePermissionResponse = (isDeviceOrientationAvailable: boolean) => {
  if (isDeviceOrientationAvailable) {
    window.addEventListener("deviceorientation", localHandleOrientation);
  } else {
    window.addEventListener("keydown", localFallbackOrientation);
  }
  permissionGranted.value = true;
};

async function checkOrientationAvailability() {
  if (permissionComponent.value) {
    try {
      const isAvailable = await permissionComponent.value.checkDeviceOrientationAvailability();
      handlePermissionResponse(isAvailable);
    } catch (error) {
      console.error("Error checking orientation availability:", error);
    }
  }
}
// -----------------------------------------------
// Page Visibility
const isActive = ref(false);
const onSlideVisible = () => {
  console.log("Element is now visible!");
  isActive.value = true;
  restartGame();
};
const onSlideHidden = () => {
  console.log("Element is now hidden!");
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  isActive.value = false;
};
const activeSelf = (activate: boolean) => {
  //
};
// -----------------------------------------------
// Lifecycle
onMounted(async () => {
  await checkOrientationAvailability();
  initGame();
});

onUnmounted(() => {
  window.removeEventListener("deviceorientation", localHandleOrientation);
  window.removeEventListener("keydown", localFallbackOrientation);
  window.removeEventListener("resize", setupCamera);
  if (provider.renderer) {
    provider.renderer.dispose();
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});

defineExpose({
  activeSelf,
});
</script>

<style lang="scss" scoped>
.layer-on-canvas {
  // position: absolute;
  top: 0;
  /* left: 0; カルーセルで１番左へ配置される */
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  z-index: 1; /* canvasの上 */
  touch-action: none; /* canvasのカメラコントロールが効かなくなるため指定しない */
}

.model-image {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  // z-index: -1;
  pointer-events: none; /* 画像がマウスイベントを受け取らないように */
}
.fanfare {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  z-index: 1000;
}
.fanfare button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
}
</style>
