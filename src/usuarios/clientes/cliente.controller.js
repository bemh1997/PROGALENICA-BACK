const dotenv = require('dotenv');
dotenv.config();
const { Sequelize } = require('sequelize');
const { 
  Cliente,
  Usuario, 
  conn: sequelize
} = require('../../config/database.js');

class ClienteController {
  /**
   * Obtiene todos los clientes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllClientes(req, res) {
    try {
      const clientes = await Cliente.findAll({
        include: [{ model: Usuario, attributes: [
          'id_usuario',
          'nombre',
          'apellido_paterno',
          'apellido_materno',
          'telefono',
          'rfc', 
          'email'
        ] }],
        order: [['id_cliente', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        data: clientes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los clientes',
        error: error.message
      });
    }
  }
  /**
   * Busca clientes por nombre o correo electrónico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async searchClientes(req, res) {
    try {
      const { query } = req.query;
      const clientes = await Cliente.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } }
          ]
        },
        include: [{ model: Usuario, attributes: ['email'] }],
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        data: clientes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al buscar los clientes',
        error: error.message
      });
    }
  }
  /**
   * Acceso a cliente por email y password
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async loginCliente(req, res) {
    try {
      const { email, password } = req.body;
      const cliente = await Cliente.findOne({
        where: { email },
        include: [{ model: Usuario, attributes: ['password'] }]
      });
      
      if (!cliente || !cliente.Usuario || cliente.Usuario.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      res.status(200).json({
        success: true,
        data: cliente
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      });
    }
  }
  /**
   * Crea un nuevo cliente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async createCliente(req, res) {
    try {
      const { 
        nombre,
        apellido_paterno,
        apellido_materno,
        genero,
        telefono,
        rfc, 
        email, 
        password 
      } = req.body;

      // Validaciones de campos obligatorios
      if(!nombre || nombre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre es obligatorio'
        });
      }

      
      if (!apellido_paterno || apellido_paterno.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El apellido paterno es obligatorio'
        });
      }
      
      if (!genero || genero.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El genero es obligatorio'
        });
      }

      if (!email || email.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico es obligatorio'
        });
      }

      if (!password || password.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'La contraseña es obligatoria'
        });
      }

      const usuario = await Usuario.create({
        nombre,
        apellido_paterno,
        apellido_materno,
        telefono,
        rfc,
        email,
        password,
        tipo_usuario: 'cliente',
        activo: true
      });
      
      const cliente = await Cliente.create({ 
        id_usuario: usuario.id_usuario,
        genero,
        notas_adminstrativas: '',
        activo: true
      });
      // regresar el cliente con los datos del usuario
      const clienteConUsuario = await Cliente.findOne({
        where: { id_cliente: cliente.id_cliente },
        attributes: [],
        include: [{
          model: Usuario,
          attributes: [
            'nombre',
            'apellido_paterno',
            'apellido_materno',
            'telefono',
            'rfc',
            'email'
          ]
        }],
        raw: true,
        nest: true
      });
      
      const respuesta = {
        ...clienteConUsuario,
        Usuario: {
          ...clienteConUsuario.Usuario,
          genero: cliente.genero
        }
      };

      res.status(201).json({
        success: true,
        data: respuesta
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el cliente',
        error: error.message
      });
    }
  }

  /**
   * Actualiza un cliente existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updateCliente(req, res) {
    try {
      const { id_cliente } = req.body;
      const cliente = await Cliente.findByPk(id_cliente);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }
      
      const updatedCliente = await cliente.update(req.body);
      
      res.status(200).json({
        success: true,
        data: updatedCliente
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el cliente',
        error: error.message
      });
    }
  }

  /**
   * Elimina un cliente por medio de softdelete
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async deleteCliente(req, res) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }
      
      await cliente.update({ activo: false });
      
      res.status(200).json({
        success: true,
        message: 'Cliente eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el cliente',
        error: error.message
      });
    }
  }
}

module.exports = ClienteController;