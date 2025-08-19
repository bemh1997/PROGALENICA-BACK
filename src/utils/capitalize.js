function capitalizeWords(cadena) {
  if (!cadena) return '';
  return cadena
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

module.exports = { capitalizeWords };