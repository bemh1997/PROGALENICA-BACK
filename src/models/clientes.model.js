const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>{ 
  sequelize.define('Cliente', {
    id_cliente: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    id_usuario: {
      type: DataTypes.UUID,
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