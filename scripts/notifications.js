/**
 * Shoelace Notification Utilities
 * 
 * Reusable toast notification functions using Shoelace <sl-alert> component
 * 
 * Usage:
 *   import { showSuccessAlert, showErrorAlert, showWarningAlert, showInfoAlert } from './notifications.js';
 *   showSuccessAlert('Usuário criado com sucesso!');
 *   showErrorAlert('Erro ao conectar com o servidor');
 */

/**
 * Creates and displays a toast alert
 * @param {string} message - The message to display
 * @param {string} variant - The alert variant: 'primary', 'success', 'neutral', 'warning', 'danger'
 * @param {string} icon - The icon name from Shoelace icon library
 * @param {number} duration - Duration in milliseconds (0 = no auto-close)
 * @returns {HTMLElement} The alert element
 */
function createToast(message, variant = 'primary', icon = 'info-circle', duration = 3000) {
  const alert = Object.assign(document.createElement('sl-alert'), {
    variant: variant,
    closable: true,
    duration: duration,
    innerHTML: `
      <sl-icon name="${icon}" slot="icon"></sl-icon>
      ${message}
    `
  });

  document.body.append(alert);
  
  // Apply toast styling
  alert.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 2000;
    max-width: 400px;
    min-width: 300px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  `;

  // Show the alert with toast animation
  requestAnimationFrame(() => alert.toast());

  // Auto-remove from DOM after it's hidden
  alert.addEventListener('sl-after-hide', () => {
    alert.remove();
  });

  return alert;
}

/**
 * Show a success alert (green)
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds (default: 3000)
 * @returns {HTMLElement} The alert element
 */
export function showSuccessAlert(message, duration = 3000) {
  return createToast(message, 'success', 'check-circle-fill', duration);
}

/**
 * Show an error alert (red)
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds (default: 4000)
 * @returns {HTMLElement} The alert element
 */
export function showErrorAlert(message, duration = 4000) {
  return createToast(message, 'danger', 'exclamation-octagon-fill', duration);
}

/**
 * Show a warning alert (yellow)
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds (default: 3500)
 * @returns {HTMLElement} The alert element
 */
export function showWarningAlert(message, duration = 3500) {
  return createToast(message, 'warning', 'exclamation-triangle-fill', duration);
}

/**
 * Show an info alert (blue)
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds (default: 3000)
 * @returns {HTMLElement} The alert element
 */
export function showInfoAlert(message, duration = 3000) {
  return createToast(message, 'primary', 'info-circle-fill', duration);
}

/**
 * Show a neutral alert (gray)
 * @param {string} message - Neutral message
 * @param {number} duration - Duration in milliseconds (default: 3000)
 * @returns {HTMLElement} The alert element
 */
export function showNeutralAlert(message, duration = 3000) {
  return createToast(message, 'neutral', 'info-circle', duration);
}

/**
 * Show a loading alert (doesn't auto-close)
 * @param {string} message - Loading message (default: 'Carregando...')
 * @returns {HTMLElement} The alert element (must be manually closed)
 */
export function showLoadingAlert(message = 'Carregando...') {
  return createToast(message, 'primary', 'arrow-repeat', 0);
}

/**
 * Close a specific alert programmatically
 * @param {HTMLElement} alert - The alert element to close
 */
export function closeAlert(alert) {
  if (alert && typeof alert.hide === 'function') {
    alert.hide();
  }
}
