const { Sequelize } = require('sequelize');
// require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = require('./env');

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`, {
  logging: false,
  native: false,
});


// const sequelize = new Sequelize(DB_DEPLOY, {
//   logging: false, // set to console.log to see the raw SQL queries
//   native: false, // lets Sequelize know we can use pg-native for ~30% more speed
// });

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
  Paqueteria,
  Cliente,
  Representante,
  Medico,
  Producto,
  Pedido,
  Detallespedido,
  Administrador,
} = sequelize.models;


// En config/database.js
console.log('Modelos cargados:', Object.keys(sequelize.models));

// Relaciones
Pedido.belongsTo(Paqueteria, { foreignKey: 'paqueteria_id' });
Pedido.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Pedido.belongsTo(Representante, { foreignKey: 'representante_id' });
Pedido.belongsTo(Medico, { foreignKey: 'medico_id' });

Detallespedido.belongsTo(Pedido, { foreignKey: 'pedido_id' });
Detallespedido.belongsTo(Producto, { foreignKey: 'producto_id' });

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};
