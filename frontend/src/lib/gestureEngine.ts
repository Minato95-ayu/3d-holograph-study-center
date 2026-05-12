// Gesture Engine — Simplified for ARIO OS
// Strictly handles: Rotate (Grab) and Zoom (Pinch)

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type GestureType = 'GRAB' | 'PINCH' | 'NONE';

export interface GestureResult {
  type: GestureType;
  confidence: number;
  position: { x: number; y: number; z: number }; // Palm center
}

export class GestureEngine {
  // Calculate distance between two 3D points
  private static getDistance(p1: NormalizedLandmark, p2: NormalizedLandmark) {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) + 
      Math.pow(p1.y - p2.y, 2) + 
      Math.pow(p1.z - p2.z, 2)
    );
  }

  static analyze(landmarks: NormalizedLandmark[]): GestureResult {
    if (!landmarks || landmarks.length < 21) {
      return { type: 'NONE', confidence: 0, position: { x: 0, y: 0, z: 0 } };
    }

    // Key landmarks
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // Calculate palm center (approximate)
    const palmX = (wrist.x + landmarks[9].x) / 2;
    const palmY = (wrist.y + landmarks[9].y) / 2;
    const palmZ = (wrist.z + landmarks[9].z) / 2;
    const position = { x: palmX, y: palmY, z: palmZ };

    // Distance metrics
    const thumbIndexDist = this.getDistance(thumbTip, indexTip);
    const indexBaseDist = this.getDistance(indexTip, wrist);
    const middleBaseDist = this.getDistance(middleTip, wrist);
    const ringBaseDist = this.getDistance(ringTip, wrist);
    const pinkyBaseDist = this.getDistance(pinkyTip, wrist);

    // 1. PINCH DETECT (Thumb and Index close, others can be anything)
    if (thumbIndexDist < 0.05) {
      // Confidence based on how close thumb and index are (0.05 is max distance for pinch)
      const confidence = Math.max(0, 1 - (thumbIndexDist / 0.05));
      return { type: 'PINCH', confidence, position };
    }

    // 2. GRAB DETECT (All fingertips close to wrist/palm -> forming a fist)
    // Thresholds: if distance from tip to wrist is small, finger is folded
    const foldedThreshold = 0.25;
    if (
      indexBaseDist < foldedThreshold &&
      middleBaseDist < foldedThreshold &&
      ringBaseDist < foldedThreshold &&
      pinkyBaseDist < foldedThreshold
    ) {
      // Calculate how tight the fist is for confidence
      const avgDist = (indexBaseDist + middleBaseDist + ringBaseDist + pinkyBaseDist) / 4;
      const confidence = Math.max(0, 1 - (avgDist / foldedThreshold));
      return { type: 'GRAB', confidence, position };
    }

    return { type: 'NONE', confidence: 0, position };
  }
}
