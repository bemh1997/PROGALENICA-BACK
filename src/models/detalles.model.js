const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('DetallePedido', {
    id_detalle_pedido: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pedidos',
        key: 'id_pedido'
      }
    },
    id_producto: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id_producto'
      }
    },
    activo: {
      type: DataTypes.BOOLEAN
    }
  }, {
    timestamps: false,
    tableName: 'detallespedido',
  });
};