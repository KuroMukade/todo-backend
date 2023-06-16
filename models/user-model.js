const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    todos: [{
        type: Schema.Types.ObjectId,
        ref: 'Todo'
      }]
})

module.exports = model('User', UserSchema);
