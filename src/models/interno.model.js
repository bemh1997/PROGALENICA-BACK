const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Interno', {
    id_interno: {
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
      type: DataTypes.ENUM('administrador', 'almacenista', 'ejecutivo'),
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'internos',
    timestamps: false
  });
};
