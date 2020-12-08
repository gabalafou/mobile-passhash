// Note: these are the same defaults as the old Firefox
// extension, except for size (old default was 8)
export const defaultPasswordOptions = Object.freeze({
  requireDigit: true,
  requirePunctuation: true,
  requireMixedCase: true,
  noSpecial: false,
  digitsOnly: false,
  size: 16,
  newPasswordBumper: 0,
});
