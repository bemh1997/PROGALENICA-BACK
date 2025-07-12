const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Pedido', {
    id_pedido: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    },
    id_cliente: {
      type: DataTypes.UUID,
      references: {
        model: 'clientes',
        key: 'id_cliente'
      }
    },
    id_medico: {
      type: DataTypes.UUID,
      references: {
        model: 'medicos',
        key: 'id_medico'
      }
    },
    id_representante: {
      type: DataTypes.UUID,
      references: {
        model: 'representantes',
        key: 'id_representante'
      }
    },
    id_paqueteria: {
      type: DataTypes.UUID,
      references: {
        model: 'paqueterias',
        key: 'id_paqueteria'
      }
    },
    id_metodo_pago: {
      type: DataTypes.UUID,
      references: {
        model: 'metodo_pago',
        key: 'id_metodo_pago'
      }
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: false,
    tableName: 'pedidos',
  });
};
