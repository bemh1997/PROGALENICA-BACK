function formatoFecha(fecha) {
  return new Date(fecha).toISOString().split('T')[0];
}

module.exports = { formatoFecha };