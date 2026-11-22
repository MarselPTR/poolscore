// Shared password policy for sign-up and password reset. Enforced in the app so
// users get instant feedback; set the SAME rules in Supabase (Authentication ->
// Providers -> Email) so they are also enforced server-side.
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Returns a human-readable reason the password is too weak, or null if it is OK.
 * Rule: at least 8 characters, containing both a letter and a number.
 */
export function passwordIssue(pw: string): string | null {
  if (pw.length < PASSWORD_MIN_LENGTH) {
    return `Kata sandi minimal ${PASSWORD_MIN_LENGTH} karakter.`;
  }
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) {
    return 'Kata sandi harus mengandung huruf dan angka.';
  }
  return null;
}
