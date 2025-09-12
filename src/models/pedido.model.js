const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Pedido', {
    id_pedido: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // ✅ Usamos ENUM para controlar los estados posibles del pedido.
    estatus: {
      type: DataTypes.ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'),
      defaultValue: 'pendiente',
      allowNull: false
    },
    // ✅ Usamos ENUM para las formas de pago.
    forma_pago: {
      type: DataTypes.ENUM('tarjeta', 'transferencia', 'efectivo', 'otro'),
      allowNull: false
    },
    // ✅ Campos calculados para tener un resumen rápido sin joins complejos.
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    // impuestos: { // Podrías llamarlo 'iva' si solo manejas un tipo de impuesto
    //     type: DataTypes.DECIMAL(10, 2),
    //     allowNull: false,
    //     defaultValue: 0.00
    // },
    costo_envio: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    guia_entrega: {
      type: DataTypes.TEXT
    },
    // ✅ El número de factura corresponde a todo el pedido, no a un solo producto.
    factura: {
      type: DataTypes.TEXT,
      unique: true // La factura sí debe ser única por pedido.
    },
    notas_administrativas: {
      type: DataTypes.TEXT
    },
    id_cliente: {
      type: DataTypes.UUID,
      references: {
        model: 'clientes',
        key: 'id_cliente'
      }
    },
    id_paqueteria: {
      type: DataTypes.UUID,
      references: {
        model: 'paqueterias',
        key: 'id_paqueteria'
      }
    },
    id_direccion_envio: {
      type: DataTypes.UUID,
      // allowNull: true // Se permite nulo por si la dirección fue temporal y no estaba guardada.
    },
    envio_contacto: { // Quién recibe
        type: DataTypes.TEXT,
        allowNull: false
    },
    envio_direccion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // envio_colonia: {
    //     type: DataTypes.TEXT,
    //     allowNull: false
    // },
    // envio_municipio: {
    //     type: DataTypes.TEXT,
    //     allowNull: false
    // },
    // envio_estado: {
    //     type: DataTypes.TEXT,
    //     allowNull: false
    // },
    // envio_codigo_postal: {
    //     type: DataTypes.STRING(10),
    //     allowNull: false
    // },
    // envio_telefono_contacto: {
    //     type: DataTypes.TEXT
    // },
    envio_referencias: { // Referencias adicionales (ej: "casa azul de dos pisos")
        type: DataTypes.TEXT
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true, 
    tableName: 'pedidos'
  });
};