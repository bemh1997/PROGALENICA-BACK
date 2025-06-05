const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('MetodoPago', {
    id_metodo_pago: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
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