const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Laboratorio', {
    id_laboratorio: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'laboratorios',
    timestamps: false
  });
};
