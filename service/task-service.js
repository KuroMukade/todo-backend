const ApiError = require('../exceptions/api-error');
const taskModel = require('../models/task-model');
const TaskModel = require('../models/task-model');
const todoModel = require('../models/todo-model');
const userModel = require('../models/user-model');

class TaskService {
    async getTasks(userId, todoId) {

    }

    async getTask(taskId) {
        const task = await taskModel.findById(taskId);
        if (!task) {
            throw ApiError.BadRequest('Тасков с таким id не найдено');
        }

        return task;
    }

    async createTask(todoId, title, text, priority) {
        const newTask = new taskModel({
            title,
            text,
            priority: priority || 'LOW',
            todo: todoId,
        });

        const createdTask = await newTask.save();

        await todoModel.findByIdAndUpdate(
            todoId,
            { $push: { tasks: createdTask._id } },
            { new: true },    
        );

        return createdTask;
    }

    async updateTask(taskId, title, text, priority, completed) {
        const id = taskId.task;
        const task = await taskModel.findByIdAndUpdate(id, {
            title,
            text,
            priority,
            completed
        });
        return task;
    }

    async deleteTask(taskId) {
        const task = await TaskModel.findOne({ taskId });
        if (!task) {
            throw ApiError.BadRequest(`Задачи с таким id не найдено`);
        }
        const deletedTask = await TaskModel.findByIdAndDelete(taskId);
    }
}

module.exports = new TaskService();
