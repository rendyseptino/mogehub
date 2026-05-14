import { Howl } from "howler";

/**
 * Play a notification sound
 * @param {string} soundFile - file name, contoh "chat1.wav"
 * @param {number} volume - 0.0 - 1.0
 */
export const playSound = (soundFile, volume = 0.5) => {
  const sound = new Howl({
    src: [`/sounds/${soundFile}`], // path ke file
    volume, // pakai volume dari parameter
  });
  sound.play();
};