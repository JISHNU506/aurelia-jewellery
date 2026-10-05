/**
 * Converts normalised landmarks into on-screen placements for each jewellery
 * type. Output is in CSS pixels of the try-on stage:
 *   { points: [{ x, y, visible }], angle (rad, screen roll), pxPerCm }
 *
 * Average adult proportions used for real-world sizing:
 *   face width (landmarks 234 ↔ 454) ≈ 14 cm, knuckle width (5 ↔ 17) ≈ 7 cm.
 */
const FACE_WIDTH_CM = 14;
const KNUCKLE_WIDTH_CM = 7;

const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Maps a normalised video landmark to stage pixels (object-fit: cover + mirroring). */
export function makeProjector({ videoW, videoH, stageW, stageH, mirror }) {
  const scale = Math.max(stageW / videoW, stageH / videoH);
  const dw = videoW * scale;
  const dh = videoH * scale;
  const ox = (stageW - dw) / 2;
  const oy = (stageH - dh) / 2;
  return (lm) => ({ x: ox + (mirror ? 1 - lm.x : lm.x) * dw, y: oy + lm.y * dh });
}

export function placeFromLandmarks(type, landmarks, project) {
  const P = (i) => project(landmarks[i]);

  if (type === 'earring' || type === 'necklace') {
    const left = P(234);
    const right = P(454);
    const faceW = dist(left, right);
    const pxPerCm = faceW / FACE_WIDTH_CM;
    const eyeL = P(33);
    const eyeR = P(263);
    let angle = Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x);
    if (eyeR.x < eyeL.x) angle = Math.atan2(eyeL.y - eyeR.y, eyeL.x - eyeR.x);

    if (type === 'earring') {
      const nose = P(1);
      const ratio = dist(nose, left) / (dist(nose, left) + dist(nose, right));
      const lobeL = lerp(left, P(132), 0.62);
      const lobeR = lerp(right, P(361), 0.62);
      const out = 0.06 * faceW;
      const dirL = Math.sign(lobeL.x - nose.x) || -1;
      const dirR = Math.sign(lobeR.x - nose.x) || 1;
      return {
        angle,
        pxPerCm,
        points: [
          { x: lobeL.x + dirL * out * 0.4, y: lobeL.y, visible: ratio > 0.24 },
          { x: lobeR.x + dirR * out * 0.4, y: lobeR.y, visible: ratio < 0.76 },
        ],
      };
    }

    // necklace — base of the neck, below the chin along the face's vertical axis
    const top = P(10);
    const chin = P(152);
    const faceH = dist(top, chin);
    const ux = (chin.x - top.x) / faceH;
    const uy = (chin.y - top.y) / faceH;
    const neck = { x: chin.x + ux * faceH * 0.5, y: chin.y + uy * faceH * 0.5 };
    return { angle: Math.atan2(-ux, uy), pxPerCm, points: [{ ...neck, visible: true }] };
  }

  // hands
  const pxPerCm = dist(P(5), P(17)) / KNUCKLE_WIDTH_CM;
  if (type === 'ring') {
    const mcp = P(13);
    const pip = P(14);
    const at = lerp(mcp, pip, 0.42);
    return { angle: Math.atan2(pip.x - mcp.x, -(pip.y - mcp.y)), pxPerCm, points: [{ ...at, visible: true }] };
  }
  // wrist
  const wrist = P(0);
  const middle = P(9);
  const at = lerp(wrist, middle, -0.08);
  return { angle: Math.atan2(middle.x - wrist.x, -(middle.y - wrist.y)), pxPerCm, points: [{ ...at, visible: true }] };
}

/** Sensible starting positions when no face / hand is being tracked. */
export function defaultPlacement(type, stageW, stageH) {
  const pxPerCm = (Math.min(stageW, stageH * 0.75) * 0.55) / FACE_WIDTH_CM;
  switch (type) {
    case 'earring':
      return {
        angle: 0,
        pxPerCm,
        points: [
          { x: stageW / 2 - pxPerCm * 7.2, y: stageH * 0.5, visible: true },
          { x: stageW / 2 + pxPerCm * 7.2, y: stageH * 0.5, visible: true },
        ],
      };
    case 'necklace':
      return { angle: 0, pxPerCm, points: [{ x: stageW / 2, y: stageH * 0.68, visible: true }] };
    case 'ring':
      return { angle: 0, pxPerCm: pxPerCm * 3.2, points: [{ x: stageW / 2, y: stageH * 0.48, visible: true }] };
    default:
      return { angle: 0, pxPerCm: pxPerCm * 1.25, points: [{ x: stageW / 2, y: stageH * 0.48, visible: true }] };
  }
}

/** Guide silhouettes shown while searching for a face / hand. */
export const GUIDE_TEXT = {
  earring: 'Face the camera and tuck your hair behind your ears',
  necklace: 'Face the camera with your neck and collarbone visible',
  ring: 'Show the back of your hand with fingers spread',
  wrist: 'Show the back of your hand and wrist to the camera',
};
