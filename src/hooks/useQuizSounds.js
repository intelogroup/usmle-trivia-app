import useSound from 'use-sound';
import correctSfx from '../assets/sounds/correct.mp3';
import wrongSfx from '../assets/sounds/wrong.wav';
import timesupSfx from '../assets/sounds/timesup.wav';
import nextSfx from '../assets/sounds/next.ogg';
import completeSfx from '../assets/sounds/completed.wav';

export function useQuizSounds(isMuted) {
  const [playCorrect] = useSound(correctSfx, { volume: 0.5, soundEnabled: !isMuted });
  const [playWrong] = useSound(wrongSfx, { volume: 0.5, soundEnabled: !isMuted });
  const [playTimesUp] = useSound(timesupSfx, { volume: 0.5, soundEnabled: !isMuted });
  const [playNext] = useSound(nextSfx, { volume: 0.5, soundEnabled: !isMuted });
  const [playComplete] = useSound(completeSfx, { volume: 0.5, soundEnabled: !isMuted });

  return { playCorrect, playWrong, playTimesUp, playNext, playComplete };
} 