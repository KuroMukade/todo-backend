const { Schema, model } = require('mongoose');

const TaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'LOW'
    },
    todo: {
        type: Schema.Types.ObjectId,
        ref: 'Todo'
    },
    completed: {
        type: Boolean,
        default: false
    }
});

module.exports = model('Task', TaskSchema);
