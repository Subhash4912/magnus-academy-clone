const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, default: 'admin', enum: ['admin'] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, result) {
        delete result.password;
        delete result.__v;
        return result;
      },
    },
  },
);

// Hash only when a plaintext password is set through document save/create.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (this.password.length < 8 || bcrypt.truncates(this.password)) {
    throw new Error(
      'Password must be at least 8 characters and at most 72 UTF-8 bytes.',
    );
  }
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.toPublicUser = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
  };
};

module.exports = mongoose.model('User', userSchema);
