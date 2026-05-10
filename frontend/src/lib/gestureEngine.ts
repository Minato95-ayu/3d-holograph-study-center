import * as THREE from 'three';

export type GestureType = 'NONE' | 'PINCH' | 'GRAB' | 'SPREAD' | 'POINT';

export interface GestureResult {
  type: GestureType;
  confidence: number;
  center: { x: number; y: number; z: number };
  distance?: number; // Distance between fingers for pinching
}

export class GestureEngine {
  // Calculate distance between two points
  private getDistance(p1: any, p2: any) {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) + 
      Math.pow(p1.y - p2.y, 2) + 
      Math.pow(p1.z - p2.z, 2)
    );
  }

  analyze(landmarks: any[]): GestureResult {
    if (!landmarks || landmarks.length < 21) {
      return { type: 'NONE', confidence: 0, center: { x: 0, y: 0, z: 0 } };
    }

    // Points of interest
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const palmBase = landmarks[0];

    // Calculate palm center (approx)
    const center = {
      x: (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3,
      y: (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3,
      z: (landmarks[0].z + landmarks[5].z + landmarks[17].z) / 3,
    };

    // 1. PINCH (Thumb and Index tips close together)
    const thumbIndexDist = this.getDistance(thumbTip, indexTip);
    if (thumbIndexDist < 0.05) {
      return { type: 'PINCH', confidence: 1 - thumbIndexDist, center, distance: thumbIndexDist };
    }

    // 2. GRAB (All fingers tips close to palm base)
    const fingerDistances = [indexTip, middleTip, ringTip, pinkyTip].map(tip => this.getDistance(tip, palmBase));
    const isGrab = fingerDistances.every(d => d < 0.25);
    if (isGrab) {
      return { type: 'GRAB', confidence: 0.9, center };
    }

    // 3. SPREAD (All fingers far from each other and palm)
    const isSpread = fingerDistances.every(d => d > 0.4);
    if (isSpread) {
      return { type: 'SPREAD', confidence: 0.9, center };
    }

    // 4. POINT (Index tip far, others close to palm)
    const indexDist = this.getDistance(indexTip, palmBase);
    const othersClose = [middleTip, ringTip, pinkyTip].every(tip => this.getDistance(tip, palmBase) < 0.2);
    if (indexDist > 0.4 && othersClose) {
      return { type: 'POINT', confidence: 0.8, center };
    }

    return { type: 'NONE', confidence: 0, center };
  }
}

export const gestureEngine = new GestureEngine();
