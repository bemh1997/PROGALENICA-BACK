const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Promocion', {
    id_promocion: {
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
    tipo_promocion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // 1: X x Y (2x1, 3x2 etc), incluye 3+1, 
      // 2: Descuento fijo: Precio de descuento
      // 3: Porcentaje de descuento
      // 4: Descuento por volumen: en la compra de X unidades, se aplica un descuento
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    unidades_requeridas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unidades_obsequiadas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cantidad_descuento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    porcentaje_descuento: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    minimo_compra: {
      type: DataTypes.INTEGER,
    },
    acumulable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    tableName: 'promociones',
    timestamps: false
  });
};
