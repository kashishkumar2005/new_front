// Stress Detection using Computer Vision Analysis
// Analyzes body posture and facial expressions to predict stress levels

const analyzeStressFromVideo = (detectionData) => {
  /**
   * detectionData format: {
   *   posture: { shoulderHeight, headTilt, spineAlignment, armTension },
   *   facial: { eyeOpenness, mouthShape, eyebrowPosition, muscleContraction },
   *   movement: { gestureFrequency, stillnessLevel }
   * }
   */
  
  let stressScore = 0;
  const factors = {};

  // 1. POSTURE ANALYSIS (0-30 points)
  const postureScore = analyzePosture(detectionData.posture);
  stressScore += postureScore * 0.3;
  factors.posture = {
    score: postureScore,
    description: getPostureDescription(postureScore)
  };

  // 2. FACIAL EXPRESSION ANALYSIS (0-30 points)
  const facialScore = analyzeFacialExpression(detectionData.facial);
  stressScore += facialScore * 0.3;
  factors.facial = {
    score: facialScore,
    description: getFacialDescription(facialScore)
  };

  // 3. MOVEMENT PATTERN ANALYSIS (0-20 points)
  const movementScore = analyzeMovement(detectionData.movement);
  stressScore += movementScore * 0.2;
  factors.movement = {
    score: movementScore,
    description: getMovementDescription(movementScore)
  };

  // 4. TEMPORAL CONSISTENCY (0-20 points)
  const consistencyScore = 20; // Default, would be tracked over time
  stressScore += consistencyScore * 0.2;
  factors.consistency = {
    score: consistencyScore,
    description: 'Monitoring temporal patterns'
  };

  return {
    stressLevel: Math.min(100, Math.round(stressScore)),
    intensity: getIntensityLevel(stressScore),
    factors,
    timestamp: new Date(),
    recommendations: getRecommendations(stressScore)
  };
};

const analyzePosture = (posture) => {
  let score = 0;

  // Shoulder height asymmetry (tension indicator)
  if (posture.shoulderHeight && Math.abs(posture.shoulderHeight) > 0.15) {
    score += 25; // High tension
  } else if (posture.shoulderHeight && Math.abs(posture.shoulderHeight) > 0.08) {
    score += 15; // Moderate tension
  }

  // Head forward tilt (stress posture)
  if (posture.headTilt && Math.abs(posture.headTilt) > 20) {
    score += 20; // Forward head posture
  } else if (posture.headTilt && Math.abs(posture.headTilt) > 10) {
    score += 10;
  }

  // Spinal alignment (hunching indicator)
  if (posture.spineAlignment && posture.spineAlignment < 0.7) {
    score += 20; // Poor posture
  } else if (posture.spineAlignment && posture.spineAlignment < 0.85) {
    score += 10;
  }

  // Arm tension and position
  if (posture.armTension && posture.armTension > 0.8) {
    score += 15; // High tension
  } else if (posture.armTension && posture.armTension > 0.5) {
    score += 8;
  }

  return Math.min(100, score);
};

const analyzeFacialExpression = (facial) => {
  let score = 0;

  // Eye openness (fatigue/stress)
  if (facial.eyeOpenness && facial.eyeOpenness < 0.5) {
    score += 20; // Eyes closed/squinted (stress)
  } else if (facial.eyeOpenness && facial.eyeOpenness < 0.7) {
    score += 10;
  }

  // Mouth tension (stress indicator)
  if (facial.mouthShape && facial.mouthShape < 0.4) {
    score += 20; // Tight/clenched mouth
  } else if (facial.mouthShape && facial.mouthShape < 0.6) {
    score += 10;
  }

  // Eyebrow position (emotion indicator)
  if (facial.eyebrowPosition && facial.eyebrowPosition > 0.7) {
    score += 15; // Raised eyebrows (worry/concentration)
  } else if (facial.eyebrowPosition && facial.eyebrowPosition > 0.5) {
    score += 8;
  }

  // Facial muscle contraction (tension)
  if (facial.muscleContraction && facial.muscleContraction > 0.8) {
    score += 20; // High tension
  } else if (facial.muscleContraction && facial.muscleContraction > 0.5) {
    score += 10;
  }

  return Math.min(100, score);
};

const analyzeMovement = (movement) => {
  let score = 0;

  // High gesture frequency (fidgeting, restlessness)
  if (movement.gestureFrequency && movement.gestureFrequency > 30) {
    score += 25; // High restlessness
  } else if (movement.gestureFrequency && movement.gestureFrequency > 15) {
    score += 15;
  }

  // Very still posture (can indicate stress/focus)
  if (movement.stillnessLevel && movement.stillnessLevel > 0.9) {
    score += 15; // Frozen/very tense
  } else if (movement.stillnessLevel && movement.stillnessLevel > 0.7) {
    score += 8;
  }

  return Math.min(100, score);
};

const getIntensityLevel = (score) => {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Low';
  return 'Minimal';
};

const getPostureDescription = (score) => {
  if (score >= 60) return 'Poor posture detected - shoulders raised, forward head position';
  if (score >= 30) return 'Moderate muscle tension visible in shoulders and neck';
  return 'Relaxed and upright posture';
};

const getFacialDescription = (score) => {
  if (score >= 60) return 'Facial tension detected - clenched jaw, furrowed brow';
  if (score >= 30) return 'Moderate facial tension - concentration or mild stress';
  return 'Relaxed facial expression';
};

const getMovementDescription = (score) => {
  if (score >= 60) return 'Excessive fidgeting and movement - sign of anxiety';
  if (score >= 30) return 'Normal fidgeting and movement';
  return 'Calm and stable movement';
};

const getRecommendations = (stressScore) => {
  const recommendations = [];

  if (stressScore >= 80) {
    recommendations.push('Take a 5-10 minute break immediately');
    recommendations.push('Practice deep breathing exercises');
    recommendations.push('Step away from your desk and move around');
    recommendations.push('Perform shoulder rolls and neck stretches');
  } else if (stressScore >= 60) {
    recommendations.push('Take a short 3-5 minute break');
    recommendations.push('Practice the 4-7-8 breathing technique');
    recommendations.push('Stretch your neck and shoulders');
    recommendations.push('Get some fresh air or water');
  } else if (stressScore >= 40) {
    recommendations.push('Maintain good posture');
    recommendations.push('Stay hydrated');
    recommendations.push('Take periodic breaks every 45 minutes');
    recommendations.push('Practice mindfulness for a few minutes');
  } else {
    recommendations.push('Keep up the good stress management');
    recommendations.push('Continue with regular breaks and hydration');
    recommendations.push('Maintain your current positive habits');
  }

  return recommendations;
};

module.exports = {
  analyzeStressFromVideo,
  getIntensityLevel,
  getRecommendations
};
