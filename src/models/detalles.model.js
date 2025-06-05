const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('DetallePedido', {
    id_detalle_pedido: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    cantidad: {
      type: DataTypes.BIGINT
    },
    total: {
      type: DataTypes.NUMERIC
    },
    factura: {
      type: DataTypes.TEXT,
      unique: true
    },
    id_pedido: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    id_producto: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN
    }
  }, {
    timestamps: false,
    tableName: 'detallespedido',
  });
};