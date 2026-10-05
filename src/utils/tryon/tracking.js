/**
 * Browser-side landmark tracking for the virtual try-on, built on MediaPipe
 * Tasks Vision (WebAssembly + WebGL). Loaded lazily, only when the try-on
 * opens. Everything runs on-device — no frames ever leave the browser.
 *
 * To self-host (offline / no CDN), copy node_modules/@mediapipe/tasks-vision/wasm
 * into public/mediapipe/wasm, download the two .task models into
 * public/mediapipe/, and point the URLs below at those paths.
 */
export const TRACKING_CONFIG = {
  wasm: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm',
  faceModel: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  handModel: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
};

/** Which tracker each jewellery type needs. */
export const TRACKER_FOR = { earring: 'face', necklace: 'face', ring: 'hand', wrist: 'hand' };

let visionPromise;
const detectors = {};

async function loadVision() {
  if (!visionPromise) {
    visionPromise = import('@mediapipe/tasks-vision').then(async (mp) => ({
      mp,
      fileset: await mp.FilesetResolver.forVisionTasks(TRACKING_CONFIG.wasm),
    }));
  }
  return visionPromise;
}

async function create(kind, delegate) {
  const { mp, fileset } = await loadVision();
  if (kind === 'face') {
    return mp.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: TRACKING_CONFIG.faceModel, delegate },
      runningMode: 'VIDEO',
      numFaces: 1,
    });
  }
  return mp.HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: TRACKING_CONFIG.handModel, delegate },
    runningMode: 'VIDEO',
    numHands: 1,
  });
}

/** Returns a detector with a uniform `detect(video, timeMs)` → landmarks[] | null. */
export async function getDetector(kind) {
  if (!detectors[kind]) {
    detectors[kind] = (async () => {
      let task;
      try {
        task = await create(kind, 'GPU');
      } catch {
        task = await create(kind, 'CPU');
      }
      return {
        kind,
        detect(video, time) {
          const res = task.detectForVideo(video, time);
          const lm = kind === 'face' ? res.faceLandmarks?.[0] : res.landmarks?.[0];
          return lm?.length ? lm : null;
        },
      };
    })().catch((err) => {
      delete detectors[kind];
      throw err;
    });
  }
  return detectors[kind];
}
