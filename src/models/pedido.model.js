const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Pedido', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    estado: {
      type: DataTypes.TEXT
    },
    fecha_pedido: {
      type: DataTypes.DATE
    },
    fecha_entrega: {
      type: DataTypes.DATE
    },
    historial: {
      type: DataTypes.TEXT
    },
    forma_pago: {
      type: DataTypes.TEXT
    },
    costo_envio: {
      type: DataTypes.NUMERIC
    },
    guia_entrega: {
      type: DataTypes.TEXT
    },
    notas_administrativas: {
      type: DataTypes.TEXT
    },
    tarjeta: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: false,
    tableName: 'pedidos', 
  });
};
