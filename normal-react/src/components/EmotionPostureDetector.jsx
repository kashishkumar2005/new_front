import React, { useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as poseDetection from '@tensorflow-models/pose-detection';

// Lightweight combined detector using FaceMesh + MoveNet heuristics
const EmotionPostureDetector = ({ videoRef, enabled = false, onPrediction = () => {} }) => {
  const faceDetectorRef = useRef(null);
  const poseDetectorRef = useRef(null);
  const loopRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadModels = async () => {
      try {
        await tf.ready();

        if (!faceDetectorRef.current) {
          faceDetectorRef.current = await faceLandmarksDetection.createDetector(
            faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
            { runtime: 'tfjs' }
          );
        }

        if (!poseDetectorRef.current) {
          poseDetectorRef.current = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { modelType: poseDetection.movenet?.modelType?.SINGLEPOSE_LIGHTNING || 'SINGLEPOSE_LIGHTNING' }
          );
        }
      } catch (err) {
        console.error('Error loading models:', err);
      }
    };

    loadModels();

    const analyzeLoop = async () => {
      if (!mounted) return;
      if (!enabled) {
        loopRef.current = requestAnimationFrame(analyzeLoop);
        return;
      }
      const video = videoRef?.current;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        loopRef.current = requestAnimationFrame(analyzeLoop);
        return;
      }

      try {
        const faceDetector = faceDetectorRef.current;
        const poseDetector = poseDetectorRef.current;

        let faceScore = 30;
        let postureScore = 30;

        if (faceDetector) {
          const faces = await faceDetector.estimateFaces(video, { flipHorizontal: false });
          if (faces && faces.length) {
            const f = faces[0];
            const landmarks = f.keypoints || f.scaledMesh || null;
            if (landmarks) {
              faceScore = computeExpressionStress(landmarks);
            }
          }
        }

        if (poseDetector) {
          const poses = await poseDetector.estimatePoses(video);
          if (poses && poses.length) {
            postureScore = computePostureStress(poses[0]);
          }
        }

        // Combine: expressions weighted 0.65, posture 0.35
        const combined = Math.min(100, Math.max(0, Math.round(faceScore * 0.65 + postureScore * 0.35)));
        onPrediction({ combined, faceScore: Math.round(faceScore), postureScore: Math.round(postureScore) });
      } catch (err) {
        console.error('Analysis error:', err);
      }

      loopRef.current = requestAnimationFrame(analyzeLoop);
    };

    loopRef.current = requestAnimationFrame(analyzeLoop);

    return () => {
      mounted = false;
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      if (faceDetectorRef.current && faceDetectorRef.current.dispose) faceDetectorRef.current.dispose();
      if (poseDetectorRef.current && poseDetectorRef.current.dispose) poseDetectorRef.current.dispose();
    };
  }, [videoRef, enabled, onPrediction]);


  const computeExpressionStress = (landmarks) => {
    try {
      const get = (i) => {
        const p = landmarks[i];
        if (!p) return null;
        // face-landmarks-detection can return {x,y,z} or {name,x,y,score}
        return { x: p.x ?? p[0], y: p.y ?? p[1] };
      };

      const leftM = get(61) || get(78);
      const rightM = get(291) || get(308);
      const upperLip = get(13);
      const lowerLip = get(14);
      const leftEyeTop = get(159);
      const leftEyeBottom = get(145);
      const rightEyeTop = get(386);
      const rightEyeBottom = get(374);
      const noseTip = get(1);

      let smile = 0;
      if (leftM && rightM) {
        smile = distance(leftM, rightM);
      }

      let mouthOpen = 0;
      if (upperLip && lowerLip) mouthOpen = distance(upperLip, lowerLip);

      let eyeOpenness = 0.03;
      if (leftEyeTop && leftEyeBottom && rightEyeTop && rightEyeBottom) {
        const leftOpen = distance(leftEyeTop, leftEyeBottom);
        const rightOpen = distance(rightEyeTop, rightEyeBottom);
        eyeOpenness = (leftOpen + rightOpen) / 2 || 0.03;
      }

      const base = noseTip ? Math.max(0.0001, noseTip.y) : 0.5;

      const mouthOpenScore = Math.min(100, Math.max(0, (mouthOpen / (base * 0.06)) * 40));
      const smileScore = smile ? Math.min(100, Math.max(0, 60 - (smile / (base * 0.12)) * 100)) : 30;
      const eyeScore = Math.min(100, Math.max(0, (0.08 / eyeOpenness) * 50));

      let score = mouthOpenScore * 0.5 + eyeScore * 0.5 + (100 - smileScore) * 0.3;
      score = Math.min(100, Math.max(0, score));
      return score;
    } catch (err) {
      return 30;
    }
  };

  const computePostureStress = (pose) => {
    try {
      const keypoints = pose.keypoints || [];
      const find = (name) => keypoints.find(k => k.name === name || k.part === name) || null;
      const leftShoulder = find('left_shoulder') || find('leftShoulder') || keypoints.find(k => k.part === 'leftShoulder');
      const rightShoulder = find('right_shoulder') || find('rightShoulder') || keypoints.find(k => k.part === 'rightShoulder');
      const leftHip = find('left_hip') || find('leftHip') || keypoints.find(k => k.part === 'leftHip');
      const rightHip = find('right_hip') || find('rightHip') || keypoints.find(k => k.part === 'rightHip');
      const nose = find('nose') || keypoints.find(k => k.part === 'nose');

      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !nose) return 30;

      const shoulderCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
      const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };

      const torsoVec = { x: hipCenter.x - shoulderCenter.x, y: hipCenter.y - shoulderCenter.y };
      const torsoAngle = Math.abs(Math.atan2(torsoVec.x, torsoVec.y));
      const torsoDeg = torsoAngle * (180 / Math.PI);

      const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x) || 1;
      const forward = Math.abs(nose.x - shoulderCenter.x) / shoulderWidth;

      const angleScore = Math.min(100, (torsoDeg / 45) * 70);
      const forwardScore = Math.min(100, forward * 100 * 0.7);

      const score = Math.min(100, Math.max(0, angleScore * 0.6 + forwardScore * 0.4));
      return score;
    } catch (err) {
      return 30;
    }
  };

  const distance = (a, b) => {
    if (!a || !b) return 0;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  return null; // background analyzer only
};

export default EmotionPostureDetector;
