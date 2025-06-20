const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>{ 
  sequelize.define('Cliente', {
  id_cliente: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.BIGINT,
    unique: true,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  genero: {
    type: DataTypes.TEXT, 
    allowNull: false
  },
  notas_adminstrativas: DataTypes.TEXT,
  activo: DataTypes.BOOLEAN
}, {
  tableName: 'clientes',
  timestamps: false
})
};