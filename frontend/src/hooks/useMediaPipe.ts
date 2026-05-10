import { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useStudoStore } from '../store/useStudoStore';
import { wsService } from '../lib/websocket';
import { gestureEngine } from '../lib/gestureEngine';

export const useMediaPipe = () => {
  const setGestures = useStudoStore((state) => state.setGestures);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let animationFrame: number;

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          numHands: 2,
          runningMode: "VIDEO",
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720, frameRate: { ideal: 30 } } 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            detect();
          };
        }
      } catch (error) {
        console.error("MediaPipe setup failed:", error);
      }
    };

    let lastEmitTime = 0;
    const detect = () => {
      if (videoRef.current && handLandmarkerRef.current) {
        const startTimeMs = performance.now();
        const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          const mainHand = results.landmarks[0];
          const analysis = gestureEngine.analyze(mainHand);

          setGestures({
            active: true,
            type: analysis.type,
            confidence: analysis.confidence,
            handPosition: analysis.center
          });

          // Throttle socket emit to 20fps
          if (startTimeMs - lastEmitTime > 50) {
            wsService.emit("gesture_data", {
              gesture: analysis.type,
              position: analysis.center,
              confidence: analysis.confidence
            });
            lastEmitTime = startTimeMs;
          }
        } else {
          setGestures({
            active: false,
            type: null,
            confidence: 0,
            handPosition: null
          });
        }
      }
      animationFrame = requestAnimationFrame(detect);
    };

    setup();

    return () => {
      cancelAnimationFrame(animationFrame);
      handLandmarkerRef.current?.close();
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [setGestures]);

  return { videoRef };
};
