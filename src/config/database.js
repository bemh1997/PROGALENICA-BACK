const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = require('./env');

let sequelize;

if (process.env.DB_DEPLOY) {
  // 🌐 Modo deploy (Railway, Supabase, RDS, etc.)
  sequelize = new Sequelize(process.env.DB_DEPLOY, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // 🖥️ Modo local
  sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`, {
    logging: false,
    native: false,
  });
}


const modelDefiners = [];

fs.readdirSync(path.join(__dirname, '../models'))
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '../models', file)));
  });

modelDefiners.forEach(model => model(sequelize));

let entries = Object.entries(sequelize.models);
let capsEntries = entries.map(([name, model]) => [
  name[0].toUpperCase() + name.slice(1),
  model,
]);
sequelize.models = Object.fromEntries(capsEntries);

const {
  Usuario,
  Cliente,
  Medico,
  Representante,
  Interno, 
  Direccion,
  Producto,
  Paqueteria,
  MetodoPago,
  Pedido,
  DetallePedido,
  Laboratorio,
} = sequelize.models;


// En config/database.js
// console.log('Modelos cargados:', Object.keys(sequelize.models));

// Relaciones
Cliente.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Medico.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Representante.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Interno.belongsTo(Usuario, { foreignKey: 'id_usuario' }); 

Direccion.belongsTo(Cliente, { foreignKey: 'id_cliente' });

Pedido.belongsTo(Cliente, { foreignKey: 'id_cliente' });
Pedido.belongsTo(Medico, { foreignKey: 'id_medico' });
Pedido.belongsTo(Representante, { foreignKey: 'id_representante' });
Pedido.belongsTo(Paqueteria, { foreignKey: 'id_paqueteria' });
Pedido.belongsTo(MetodoPago, { foreignKey: 'id_metodo_pago' });

DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });
DetallePedido.belongsTo(Producto, { foreignKey: 'id_producto' });

Usuario.hasOne(Interno, { foreignKey: 'id_usuario' });
Producto.belongsTo(Laboratorio, { foreignKey: 'id_laboratorio' });
Laboratorio.hasOne(Producto, { foreignKey: 'id_laboratorio' });

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};
