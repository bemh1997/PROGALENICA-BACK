const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('MetodoPago', {
    id_metodo_pago: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    metodo: {
      type: DataTypes.TEXT
    },
    activo: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'metodo_pago',
    timestamps: false
  });
};