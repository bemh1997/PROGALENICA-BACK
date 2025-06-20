const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Administrador', {
    id_administrador: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    id_usuario: {
      type: DataTypes.UUID,
      unique: true,
      allowNull: false
    },
    rol: {
      type: DataTypes.TEXT
    },
    activo: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'administradores',
    timestamps: false
  });
};