/**
 * Password for the hidden date simulator (opened with ` or 5 taps on the taskbar clock).
 * The template's default password is "change-me": change it before you share your site.
 * Only the SHA-256 hash is stored, so the password itself isn't in the published code.
 *
 * To change the password, run this and paste the output below:
 *   node -e "console.log(require('crypto').createHash('sha256').update('NEW-PASSWORD').digest('hex'))"
 */
export const SIMULATOR_PASSWORD_SHA256 = 'e2186dbdb1bb4193608605e84f33208765b5693b55edd4f730a719a100eeea6f';
