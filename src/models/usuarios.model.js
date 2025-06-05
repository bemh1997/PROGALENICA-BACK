const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: DataTypes.TEXT,
  apellido_paterno: DataTypes.TEXT,
  apellido_materno: DataTypes.TEXT,
  telefono: DataTypes.TEXT,
  rfc: DataTypes.TEXT,
  correo: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo_usuario: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  activo: DataTypes.BOOLEAN
}, {
  tableName: 'usuarios',
  timestamps: false
})
};