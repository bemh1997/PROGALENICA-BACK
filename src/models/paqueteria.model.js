const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Paqueteria', {
    id_paqueteria: {
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
    tableName: 'paqueterias',
    timestamps: false
  });
};
