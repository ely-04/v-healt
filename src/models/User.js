import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
      },
      len: {
        args: [2, 50],
        msg: 'El nombre debe tener entre 2 y 50 caracteres'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Ya existe un usuario con este email'
    },
    validate: {
      isEmail: {
        msg: 'Por favor ingresa un email válido'
      },
      notEmpty: {
        msg: 'El email es requerido'
      }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La contraseña es requerida'
      },
      len: {
        args: [8, 255],
        msg: 'La contraseña debe tener al menos 8 caracteres'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  passwordChangedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  faceDescriptor: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  faceRegisteredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  faceMetadata: {
    type: DataTypes.TEXT, // JSON con datos de captura
    allowNull: true
  },
  loginMethod: {
    type: DataTypes.ENUM('password', 'facial'),
    defaultValue: 'password'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  defaultScope: {
    attributes: { 
      exclude: ['password'] // No incluir la contraseña por defecto
    }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] }
    }
  },
  hooks: {
    // Hook para encriptar la contraseña antes de crear
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    // Hook para encriptar la contraseña antes de actualizar
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
        if (!user.isNewRecord) {
          user.passwordChangedAt = new Date(Date.now() - 1000);
        }
      }
    }
  },
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['role']
    }
  ]
});

// Método para comparar contraseñas
User.prototype.comparePassword = async function(candidatePassword) {
  const userWithPassword = await User.scope('withPassword').findByPk(this.id);
  return await bcrypt.compare(candidatePassword, userWithPassword.password);
};

// Método para verificar si la contraseña fue cambiada después del JWT
User.prototype.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export default User;