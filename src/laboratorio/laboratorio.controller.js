require('dotenv').config();
const { Laboratorio } = require('../config/database.js');
const fs = require('fs').promises;
const path = require('path');
class LaboratorioController {
  /**
   * Obtiene todos los laboratorios
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllLaboratorios(req, res) {
    try {
      let laboratorios = await Laboratorio.findAll({
        order: [['id_laboratorio', 'ASC']],
        where: { activo: true }
      });

      if (laboratorios.length === 0) {
        const jsonLabsPath = path.join(__dirname, process.env.SEED_LABS_PATH);
        const dataLabs = await fs.readFile(jsonLabsPath, 'utf-8');
        const seedLabs = JSON.parse(dataLabs);
        await Laboratorio.bulkCreate(seedLabs);

        laboratorios = await Laboratorio.findAll({
          order: [['id_laboratorio', 'ASC']], 
          where: { activo: true }
        });
      }

      res.status(200).json({
        success: true,
        data: laboratorios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los laboratorios',
        error: error.message
      });
    }
  }
  /**
   * Busca laboratorios por nombre
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async searchLaboratorios(req, res) {
    try {
      const { query } = req.query;
      const laboratorios = await Laboratorio.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: `%${query}%` } }
          ]
        },
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: laboratorios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al buscar los laboratorios',
        error: error.message
      });
    }
  }
  /**
   * Crea un nuevo laboratorio
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async createLaboratorio(req, res) {
    try {
      const {
        nombre
      } = req.body;

      // Validaciones de campos obligatorios
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre es obligatorio'
        });
      }

      const laboratorio = await Laboratorio.create({nombre, activo: true});

      res.status(201).json({
        success: true,
        data: laboratorio
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el laboratorio',
        error: error.message
      });
    }
  }

  /**
   * Actualiza un laboratorio existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updateLaboratorio(req, res) {
    try {
      const { id } = req.params;
      const laboratorio = await Laboratorio.findByPk(id);

      if (!laboratorio) {
        return res.status(404).json({
          success: false,
          message: 'Laboratorio no encontrado'
        });
      }

      // Extraer campos del body
      const {nombre} = req.body;

      // Validaciones básicas
      if (nombre !== undefined && (nombre === null || nombre.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del laboratorio no puede estar vacío'
        });
      }

      await laboratorio.update(updateData);

      res.status(200).json({
        success: true,
        data: laboratorio,
        message: 'Laboratorio actualizado correctamente'
      });
    } 
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el laboratorio',
        error: error.message
      });
    }
  }

  /**
   * Elimina un laboratorio por medio de softdelete
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async deleteLaboratorio(req, res) {
    try {
      const { id } = req.params;

      const laboratorio = await Laboratorio.findByPk(id);

      if (!laboratorio) {
        return res.status(404).json({
          success: false,
          message: 'Laboratorio no encontrado'
        });
      }

      await laboratorio.update({
        activo : false
      });
      
      res.status(200).json({
        success: true,
        message: 'Laboratorio eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el laboratorio',
        error: error.message
      });
    }
  }
}

module.exports = LaboratorioController;