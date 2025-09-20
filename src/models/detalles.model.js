const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DetallePedido = sequelize.define('DetallePedido', {
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
  
  async function actualizarSubtotal(id_pedido) {
    const { Pedido, DetallePedido } = sequelize.models;

    const total = await DetallePedido.sum('total', {
      where: { id_pedido }
    });

    await Pedido.update(
      { subtotal: total || 0 },
      { where: { id_pedido } }
    );
  }

  DetallePedido.afterCreate(async (detalle, options) => {
    await actualizarSubtotal(detalle.id_pedido);
  });

  DetallePedido.afterUpdate(async (detalle, options) => {
    await actualizarSubtotal(detalle.id_pedido);
  });

  DetallePedido.afterDestroy(async (detalle, options) => {
    await actualizarSubtotal(detalle.id_pedido);
  });

  return DetallePedido;
};