/**
 * Validate email format.
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

/**
 * Validate password strength.
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true, message: '' };
};

/**
 * Validate registration input.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateRegisterInput = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  const passwordCheck = validatePassword(data.password);
  if (!passwordCheck.valid) {
    errors.push(passwordCheck.message);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate login input.
 * @param {{ email: string, password: string }} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateLoginInput = (data) => {
  const errors = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }
  if (!data.password) {
    errors.push('Password is required');
  }

  return { valid: errors.length === 0, errors };
};

module.exports = { isValidEmail, validatePassword, validateRegisterInput, validateLoginInput };
