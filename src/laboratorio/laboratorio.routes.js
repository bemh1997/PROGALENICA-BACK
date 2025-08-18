
const express = require('express');
const router = express.Router();
const LaboratorioController = require('./laboratorio.controller');

// Obtener todos los laboratorios PERMISOS DE ADMINISTRADOR
router.get('/', LaboratorioController.getAllLaboratorios);

// Buscar laboratorios por nombre o correo electrónico PERMISOS DE ADMINISTRADOR
router.get('/search', LaboratorioController.searchLaboratorios);

// Crear un nuevo laboratorio
router.post('/', LaboratorioController.createLaboratorio);

// Actualizar un laboratorio existente
router.put('/:id', LaboratorioController.updateLaboratorio);

// Eliminar un laboratorio
router.delete('/:id', LaboratorioController.deleteLaboratorio);

module.exports = router;
