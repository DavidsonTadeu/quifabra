// js/sanitize.js
// Utilitário de sanitização para prevenir XSS
// Usado em qualquer lugar que injete dados do usuário via innerHTML

'use strict';

/**
 * Sanitiza uma string para uso seguro em HTML (escapa caracteres especiais).
 * Previne ataques XSS quando dados do usuário são injetados via innerHTML.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return str == null ? '' : String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Versão não-module para uso em scripts sem import (cart.js, main.js)
 */
window.escapeHtml = function(str) {
  if (typeof str !== 'string') return str == null ? '' : String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
};
