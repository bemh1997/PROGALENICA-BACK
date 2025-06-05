const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = require('./env');

// const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`, {
//   logging: false,
//   native: false,
// });

const sequelize = new Sequelize(process.env.DB_DEPLOY, {
  dialect: 'postgres',
  logging: false, // o true si quieres ver queries en consola
});

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
  Administrador,
  Representante,
  Direccion,
  Producto,
  Paqueteria,
  MetodoPago,
  Pedido,
  DetallePedido,
} = sequelize.models;


// En config/database.js
// console.log('Modelos cargados:', Object.keys(sequelize.models));

// Relaciones
Cliente.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Medico.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Administrador.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Representante.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Direccion.belongsTo(Cliente, { foreignKey: 'id_cliente' });

Pedido.belongsTo(Cliente, { foreignKey: 'id_cliente' });
Pedido.belongsTo(Medico, { foreignKey: 'id_medico' });
Pedido.belongsTo(Representante, { foreignKey: 'id_representante' });
Pedido.belongsTo(Paqueteria, { foreignKey: 'id_paqueteria' });
Pedido.belongsTo(MetodoPago, { foreignKey: 'id_metodo_pago' });

DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });
DetallePedido.belongsTo(Producto, { foreignKey: 'id_producto' });

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};
