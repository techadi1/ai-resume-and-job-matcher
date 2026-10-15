/**
 * User Data Access Repository
 */

const User = require('../models/User');

class UserRepository {
  async findById(id, select = '-passwordHash -password -refreshToken') {
    return User.findById(id).select(select);
  }

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() });
  }

  async create(userData) {
    return User.create(userData);
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-passwordHash -password -refreshToken');
  }

  async updateRefreshToken(id, refreshToken) {
    return User.findByIdAndUpdate(id, { refreshToken }, { new: true });
  }

  async count() {
    return User.countDocuments();
  }
}

module.exports = new UserRepository();
