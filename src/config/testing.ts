/**
 * TESTING SWITCH.
 * true  = every app and every sealed letter is open, whatever the date.
 * false = normal behaviour: things unlock on their dates (in UNLOCK_TZ, src/config/time.ts).
 *
 * ⚠ Set this back to false before gifting. While it's true the taskbar shows a "Test mode" chip.
 * Themes, the countdown and the date simulator are not affected.
 */
export const UNLOCK_EVERYTHING = false;
