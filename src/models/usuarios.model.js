const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Usuario', {
    id_usuario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    apellido_paterno: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    apellido_materno: DataTypes.TEXT,
    telefono: DataTypes.TEXT,
    rfc: DataTypes.TEXT,
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tipo_usuario: {
      type: DataTypes.ENUM('cliente', 'interno', 'medico', 'representante'),
      allowNull: false
    },
    activo: DataTypes.BOOLEAN
  }, {
    tableName: 'usuarios',
    timestamps: false
  })
};