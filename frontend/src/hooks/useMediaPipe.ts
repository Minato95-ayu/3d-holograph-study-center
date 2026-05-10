import { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useStudoStore } from '../store/useStudoStore';
import { wsService } from '../lib/websocket';
import { gestureEngine } from '../lib/gestureEngine';

export const useMediaPipe = () => {
  const setGestures = useStudoStore((state) => state.setGestures);
  const setCameraStatus = useStudoStore((state) => state.setCameraStatus);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let animationFrame: number;
    let isRunning = true;

    const setup = async () => {
      try {
        // Step 1: Loading MediaPipe WASM
        setCameraStatus('loading');
        console.log('🧠 Loading MediaPipe WASM...');

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          numHands: 2,
          runningMode: 'VIDEO',
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        console.log('✅ MediaPipe loaded. Requesting camera...');

        // Step 2: Request camera permission
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, frameRate: { ideal: 30 } },
          });
        } catch (camError: any) {
          const msg =
            camError.name === 'NotAllowedError'
              ? 'Camera permission denied. Click the camera icon in your browser address bar to allow.'
              : camError.name === 'NotFoundError'
              ? 'No camera found on this device.'
              : `Camera error: ${camError.message}`;
          console.error('📷 Camera access failed:', camError);
          setCameraStatus('error', msg);
          return;
        }

        if (!isRunning) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // Step 3: Attach stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              console.log('🎥 Camera active. Starting detection loop...');
              setCameraStatus('active');
              detect();
            });
          };
        }
      } catch (error: any) {
        console.error('❌ MediaPipe setup failed:', error);
        setCameraStatus('error', `Initialization failed: ${error.message}`);
      }
    };

    let lastEmitTime = 0;
    const detect = () => {
      if (!isRunning) return;

      if (videoRef.current && handLandmarkerRef.current && videoRef.current.readyState >= 2) {
        const startTimeMs = performance.now();
        const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          const mainHand = results.landmarks[0];
          const analysis = gestureEngine.analyze(mainHand);

          setGestures({
            active: true,
            type: analysis.type,
            confidence: analysis.confidence,
            handPosition: analysis.center,
          });

          // Throttle socket emit to 20fps
          if (startTimeMs - lastEmitTime > 50) {
            wsService.emit('gesture_data', {
              gesture: analysis.type,
              position: analysis.center,
              confidence: analysis.confidence,
            });
            lastEmitTime = startTimeMs;
          }
        } else {
          setGestures({
            active: false,
            type: null,
            confidence: 0,
            handPosition: null,
          });
        }
      }
      animationFrame = requestAnimationFrame(detect);
    };

    setup();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrame);
      handLandmarkerRef.current?.close();
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [setGestures, setCameraStatus]);

  return { videoRef };
};
