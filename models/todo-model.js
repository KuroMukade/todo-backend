const { Schema, model } = require('mongoose');

const TodoSchema = new Schema({
    title: { type: String, required: true },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task',
    }],
});

module.exports = model('Todo', TodoSchema);
