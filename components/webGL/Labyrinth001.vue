<template>
  <div class="layer-on-canvas" :style="{ position: isDebug ? 'relative' : 'absolute' }">
    <Permission v-show="!permissionGranted" @click="handlePermissionResponse" ref="permissionComponent" />
    <div v-if="goalLost" class="info">
      <h3 class="text-center">まま と であえなかった</h3>
      <p style="white-space: pre-wrap">{{ randomLottery.name }} と であった</p>
      <img :src="illustPath001" alt="shuzo" width="300" height="auto" />
      <div>
        <button class="btn btn-dark me-2" @click="showFanfare">まんぞく</button>
        <button class="btn btn-primary" @click="resetGame">あきらめない！</button>
      </div>
    </div>
    <div v-if="goalReached" class="info">
      <h3 class="text-center" style="white-space: pre-wrap">まま と であえた！</h3>
      <img :src="illustPath001" alt="shuzo" width="300" height="auto" />
      <div>
        <a class="btn btn-dark me-2" href="slide-by-side">次へ</a>
      </div>
    </div>
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
} from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as CANNON from "cannon-es";
import { defaultOrientationSign, handleOrientation } from "@/utils/orientation";
import Permission from "@/components/permission/DeviceOrientation.vue";
import type { Rotation } from "@/types";

const props = defineProps<{
  modelPath: string;
}>();

const lottery = [
  {
    msg: "100回叩くと壊れる壁があったとする。\nでもみんな何回叩けば壊れるかわからないから、90回まで来ていても途中であきらめてしまう。",
    name: "ぜったいに ささない はち",
    src: new URL("@/assets/images/DigitalBook_maze_01_0708.png", import.meta.url).href,
  },
  {
    msg: "勝ち負けなんか、ちっぽけなこと。\n大事なことは、本気だったかどうかだ！",
    name: "おしゃれな ありんこ",
  },
  {
    msg: "ベストを尽くすだけでは勝てない。\n僕は勝ちにいく。",
    name: "ちいさな くじら",
  },
  {
    msg: "いまの僕には勢いがある",
    name: "みみ の ながい ねこ",
  },
  {
    msg: "ミスをすることは悪いことじゃない。\nそれは上達するためには必ず必要なもの。\nただし、同じミスはしないこと。",
    name: "けむくじゃら の いぬ",
  },
  {
    msg: "予想外の人生になっても、そのとき、幸せだったらいいんじゃないかな。",
    name: "まるい しっぽ の くま",
  },
];
const randomLottery = computed(() => {
  const randomIndex = Math.floor(Math.random() * lottery.length);
  return lottery[randomIndex];
});

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

let scene: Scene;
let ball: Mesh;
let labyrinth: Object3D | null = null;
let animationFrameId: number | null = null;

let world: CANNON.World;
let ballBody: CANNON.Body;

let ballImage: any;

const illustPath001 = new URL("@/assets/images/unevencircle002.png", import.meta.url).href;
const modelImagePath = new URL("@/assets/images/DigitalBook_maze_01_0708.png", import.meta.url).href;
const ballImagePath = new URL("@/assets/images/unevencircle001.png", import.meta.url).href;
const fixRatio = true; // 縦横比を画面サイズに合わせて調整するか
const useOrbit = false; // カメラコントロールを使用するか
const isDebug = false; // デバッグモード

const model = ref<GLTF | null>(null);
const modelBoundingBox = ref<Box3 | null>(null);
const rotation = ref<Rotation>({ alpha: 0, beta: 0, gamma: 0, absolute: false });
const goalReached = ref(false);
const goalLost = ref(false);

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
    provider.renderer.setClearColor(0xf0f0f0); // レンダラーの背景色も設定
  }
  // setupLight();
  // モデル（ステージ）を読み込み
  model.value = await loadLabyrinthAsync();
  // モデル（ステージ）に重ねる画像を読み込み
  addImageToScene(modelImagePath);
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
    modelBoundingBox.value.max.x * scalefactor - halfFrustum.x - mergin.y,
    modelBoundingBox.value.max.y * scalefactor - halfFrustum.y - mergin.y
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
      .loadAsync(props.modelPath)
      .then((gltf: GLTF) => {
        labyrinth = gltf.scene;
        if (scene && labyrinth) {
          const scalefactor = 5.4;
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
      const scale = 1;
      plane.scale.set(size.x * scale, size.y * scale, 1);
    }
    plane.position.set(0.2, -0.1, -0.1); // モデルの背後に配置

    scene.add(plane);
  });
  textureLoader.load(ballImagePath, (texture: any) => {
    const geometry = new PlaneGeometry(1, 1); // 画像の平面ジオメトリ
    const material = new MeshBasicMaterial({ map: texture, transparent: true });
    const scale = 1.5;
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
  const ballPosition = new Vector3(-7, 0, 0);
  const leapPosition = setLeapedCameraPosition(new Vector2(3, 0));
  const newX = leapPosition ? Math.max(leapPosition.min.x, Math.min(leapPosition.max.x, ballPosition.x)) : 0;
  const newY = leapPosition ? Math.max(leapPosition.min.y, Math.min(leapPosition.max.y, ballPosition.y)) : 0;
  //createBall(newX, newY, 0) // 画面サイズによって変な位置に
  createBall(-7, 0, 0); // 画面サイズによっては見切れる
  // ボールを捉えるようカメラの初期位置を調整
  provider.camera.position.set(newX, newY, 50);
  provider.camera.lookAt(newX, newY, 0);
};

const createBall = (posX: number, posY: number, posZ: number) => {
  const ballGeometry = new SphereGeometry(0.5, 16, 16);
  const ballMaterial = new MeshPhongMaterial({ color: 0xff0000 });
  ball = new Mesh(ballGeometry, ballMaterial);
  ball.scale.set(1, 1, 1);
  ball.position.set(posX, posY, posZ); // ボールを迷路の中に配置
  ball.visible = isDebug; // 3Dボールを非表示に設定
  scene.add(ball);

  // ボールの質量を調整することで、物理エンジンがボールの動きをより正確にシミュレートできるようにします。
  const shape = new CANNON.Sphere(0.5);
  ballBody = new CANNON.Body({
    mass: 1, // ボールの質量を小さくする
    shape: shape,
    position: new CANNON.Vec3(ball.position.x, ball.position.y, ball.position.z),
    linearDamping: 0.1, // 強めの減衰設定
    angularDamping: 0.3, // 回転の減衰設定
  });
  // ボールとコライダーの間で衝突の反発係数（リスティチューション）を設定し、衝突後にボールが跳ね返るようにします。
  ballBody.material = new CANNON.Material();
  ballBody.material.restitution = 0.7; // 反発係数を設定
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
    // ballImage.quaternion.copy(ballBody.quaternion)
    // ballImage.rotation.set(0, 0, ball.rotation.z)
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
  // ボールの位置に基づいてカメラを更新
  const ballPosition = ballBody.position;

  // カメラの新しい位置を計算
  let newX = ballPosition.x;
  let newY = ballPosition.y;

  // 現在のカメラ位置を取得
  const currentX = provider.camera.position.x;
  const currentY = provider.camera.position.y;

  // カメラの可動範囲内にボールがあるか判定
  const inBoxX = minBound.x < ballPosition.x && ballPosition.x < maxBound.x;
  const inBoxY = minBound.y < ballPosition.y && ballPosition.y < maxBound.y;

  // ボールがバウンディングボックス内にある場合のみカメラの位置を更新
  if (inBoxX || inBoxY) {
    if (inBoxX) {
      newX = Math.max(minBound.x, Math.min(maxBound.x, newX));
    } else {
      newX = currentX;
    }
    if (inBoxY) {
      newY = Math.max(minBound.y, Math.min(maxBound.y, newY));
    } else {
      newY = currentY;
    }
    provider.camera.position.set(newX, newY, provider.camera.position.z);
    if (inBoxX && inBoxY) {
      provider.camera.lookAt(ballPosition.x, ballPosition.y, ballPosition.z);
    }
  }
};
// ゴールに到達したかどうかのチェック
const checkGoal = () => {
  const goalThreshold = 2; // ゴールとボールの距離のしきい値
  const goalPosition = new Vector3(8, -0.5, 0); // ゴールの位置

  if (!goalReached.value) {
    // ゴールに十分近づいた
    if (ball.position.distanceTo(goalPosition) < goalThreshold) {
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
  goalReached.value = true;
  goalLost.value = false;

  setTimeout(() => {
    // 自動で次のページに遷移
    window.location.href = "/next-page"; // 適切なURLに変更してください
  }, 5000); // 5秒後に自動遷移
};

const resetGame = () => {
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

const animate = () => {
  if (goalReached.value || goalLost.value) {
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

const localHandleOrientation = (event: DeviceOrientationEvent) => {
  // ポートレイトとランドスケープの切り替えはヘルパー関数内で行われている
  handleOrientation(event, rotation);
};
const localFallbackOrientation = (event: KeyboardEvent) => {
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

onMounted(async () => {
  if (permissionComponent.value) {
    try {
      const isAvailable = await permissionComponent.value.checkOrientation();
      handlePermissionResponse(isAvailable);
    } catch (error) {
      console.error("Error checking orientation availability:", error);
    }
  }
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
</script>

<style lang="scss" scoped>
.layer-on-canvas {
  // position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* canvasの上 */
  touch-action: none; /* canvasのカメラコントロールが効かなくなるため指定しない */
}
.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  animation: slideinTopDown 0.3s ease-in-out;
  text-align: center;
  touch-action: auto;
}

@keyframes slideinTopDown {
  0% {
    transform: translateY(-100vh);
  }
  100% {
    transform: translateY(0);
  }
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
