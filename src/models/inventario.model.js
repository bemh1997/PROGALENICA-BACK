const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventario = sequelize.define('Inventario', {
    id_inventario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    id_producto: {
      type: DataTypes.UUID,
      references: {
        model: 'productos',
        key: 'id_producto'
      }
    },
    numero_lote:{
      type: DataTypes.TEXT,
      allowNull: false
    },
    fecha_caducidad:{
      type: DataTypes.DATE,
      allowNull: false
    },
    cantidad_disponible:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ubicacion_almacen:{
      type: DataTypes.TEXT,
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    tableName: 'inventario',
    timestamps: false
  });

  // 👇 Agregamos los hooks directamente al modelo
  async function actualizarCantidadReal(id_producto) {
    const { Producto, Inventario } = sequelize.models;

    const total = await Inventario.sum('cantidad_disponible', {
      where: { id_producto }
    });

    await Producto.update(
      { cantidad_real: total || 0 },
      { where: { id_producto } }
    );
  }

  Inventario.afterCreate(async (inventario, options) => {
    await actualizarCantidadReal(inventario.id_producto);
  });

  Inventario.afterUpdate(async (inventario, options) => {
    await actualizarCantidadReal(inventario.id_producto);
  });

  Inventario.afterDestroy(async (inventario, options) => {
    await actualizarCantidadReal(inventario.id_producto);
  });

  return Inventario;
};
