const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Pedido', {
    id_pedido: {
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
    },
    id_cliente: {
      type: DataTypes.BIGINT,
      references: {
        model: 'clientes', // Nombre de la tabla referenciada
        key: 'id_cliente' // Clave primaria de la tabla referenciada
      }
    },
    id_medico: {
      type: DataTypes.BIGINT,
      references: {
        model: 'medicos', // Nombre de la tabla referenciada
        key: 'id_medico' // Clave primaria de la tabla referenciada
      }
    },
    id_representante: {
      type: DataTypes.BIGINT,
      references: {
        model: 'representantes', // Nombre de la tabla referenciada
        key: 'id_representante' // Clave primaria de la tabla referenciada
      }
    },
    id_paqueteria: {
      type: DataTypes.BIGINT,
      references: {
        model: 'paqueterias', // Nombre de la tabla referenciada
        key: 'id_paqueteria' // Clave primaria de la tabla referenciada
      }
    },
    id_metodo_pago: {
      type: DataTypes.BIGINT,
      references: {
        model: 'metodos_pago', // Nombre de la tabla referenciada
        key: 'id_metodo_pago' // Clave primaria de la tabla referenciada
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
