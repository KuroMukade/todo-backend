const { Schema, model } = require('mongoose');

const TodoSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
});

module.exports = model('Todo', TodoSchema);
