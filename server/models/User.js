import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/db.js';

class User extends Model {
  // Compare a plaintext password against the stored hash.
  async matchPassword(entered) {
    return bcrypt.compare(entered || '', this.passwordHash || '');
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('email', String(value || '').toLowerCase().trim());
      },
      validate: { isEmail: true },
    },
    phone: { type: DataTypes.STRING },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('customer', 'staff', 'admin'),
      defaultValue: 'customer',
    },
    // Fine-grained permissions for staff (JSON array of strings)
    permissions: { type: DataTypes.JSON, defaultValue: [] },
    isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Virtual: set `password` and it gets hashed into passwordHash on save.
    password: {
      type: DataTypes.VIRTUAL,
      set(value) {
        // store on the instance (not in dataValues) so it never leaks
        this._password = value;
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    // Never return the password hash by default
    defaultScope: { attributes: { exclude: ['passwordHash'] } },
    scopes: { withPassword: { attributes: { include: ['passwordHash'] } } },
  }
);

// Hash the password whenever it is provided. Runs on beforeValidate so the
// passwordHash column is populated before the notNull validation fires.
const hashIfNeeded = async (user) => {
  if (user._password) {
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(user._password, salt);
    user._password = undefined;
  }
};
User.beforeValidate(hashIfNeeded);

export default User;
