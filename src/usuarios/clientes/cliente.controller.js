require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { 
  Cliente,
  Usuario
} = require('../../config/database.js');

// Clave secreta para JWT - debe estar en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_temporal';

class ClienteController {
  /**
   * Inicia sesión de cliente y genera token JWT
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async loginCliente(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario por email
      const usuario = await Usuario.findOne({
        where: { 
          email,
          activo: true,
          tipo_usuario: 'cliente'
        }
      });

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, usuario.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Obtener información adicional del cliente
      const cliente = await Cliente.findOne({
        where: { 
          id_usuario: usuario.id_usuario,
          activo: true
        }
      });

      if (!cliente) {
        return res.status(401).json({
          success: false,
          message: 'Cliente no encontrado o inactivo'
        });
      }
      
      const userInfo = { 
        id_cliente: cliente.id_cliente,
        genero: cliente.genero 
      };

      // Generar token JWT
      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario,
          ...userInfo
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido_paterno: usuario.apellido_paterno,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario,
          ...userInfo
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en el inicio de sesión',
        error: error.message
      });
    }
  }

  /**
   * Obtiene todos los clientes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllClientes(req, res) {
    try {
      let clientes = await Cliente.findAll({
        include: [{ model: Usuario, attributes: [
          'id_usuario',
          'nombre',
          'apellido_paterno',
          'apellido_materno',
          'telefono',
          'rfc', 
          'email'
        ] }],
        order: [['id_cliente', 'ASC']],
        where: { activo: true }
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
      const { term } = req.query; // término de búsqueda desde query params
      if (!term) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un término de búsqueda'
        });
      }

      const { Op } = require('sequelize');
      const clientes = await Cliente.findAll({
        where: { activo: true },
        include: [{
          model: Usuario,
          where: {
            [Op.or]: [
              { nombre: { [Op.iLike]: `%${term}%` } },
              { apellido_paterno: { [Op.iLike]: `%${term}%` } },
              { email: { [Op.iLike]: `%${term}%` } }
            ]
          },
          attributes: ['id_usuario', 'nombre', 'apellido_paterno', 'apellido_materno', 'telefono', 'rfc', 'email']
        }]
      });

      res.status(200).json({
        success: true,
        data: clientes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al buscar clientes',
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
      const usuario = await Usuario.findByPk(cliente.id_usuario);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario asociado no encontrado'
        });
      }
      // Desactivar el usuario asociado
      await usuario.update({ activo: false });
      
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