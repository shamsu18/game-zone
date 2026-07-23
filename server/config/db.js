import { Sequelize } from 'sequelize';

// Supports MySQL (default, production) and SQLite (handy for tests) via DB_DIALECT.
const dialect = process.env.DB_DIALECT || 'mysql';

let sequelize;

if (dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_STORAGE || ':memory:',
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'gamezone_bd',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      define: {
        // keep camelCase column names to match the model attributes
        underscored: false,
        freezeTableName: false,
      },
    }
  );
}

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      `✔ ${dialect.toUpperCase()} connected` +
        (dialect === 'mysql'
          ? `: ${process.env.DB_HOST || '127.0.0.1'}/${process.env.DB_NAME || 'gamezone_bd'}`
          : '')
    );
  } catch (err) {
    console.error(`✖ Database connection error: ${err.message}`);
    process.exit(1);
  }
};

export { sequelize };
export default sequelize;
