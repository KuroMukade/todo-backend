const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const todoModel = require('../models/todo-model');
const TodoModel = require('../models/todo-model');
const userModel = require('../models/user-model');
const tokenService = require('../service/token-service');
const TodoDto = require('../dtos/todo-dto');

class TodoService {
    async getAllTodos() {
        const todos = await TodoModel.find();
        return todos;
    }

    async getTodo(userId) {
        const user = await userModel.findById(userId).populate('todos');

        console.log(user)

        if (!user) {
            throw ApiError.BadRequest('Не найдено пользовательских туду');
        }

        return user.todos;
    }

    async createTodo(userId, title) {
        const newTodo = new todoModel({
            title,
            user: userId,
        });

        const createdTodo = await newTodo.save();

        await userModel.findByIdAndUpdate(
            userId,
            { $push: { todos: createdTodo._id } },
            { new: true }
          );
        
        return createdTodo;
    }

    async updateTodo(todoId, title) {
        const todo = await TodoModel.findById(todoId);
        if (!todoId) {
            throw ApiError.BadRequest('Не найдено туду с таким id');
        }
        todo.title = title || todo.title;

        const updatedTodo = await todo.save();
        return updatedTodo;
    }

    async deleteTodo(title, accessToken) {
        if (!accessToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = tokenService.validateAccessToken(accessToken);   

        if (!userData) {
            throw ApiError.UnauthorizedError();
        }

        const userId = userData.id;

        const candidate = await userModel.findOne({ _id: userId });
        if (!candidate) {
            throw ApiError.BadRequest(`Пользователей с таким id не сущетсвует`);
        }

        const todoCandidate = await todoModel.findOne({ title });

        if (!todoCandidate) {
            throw ApiError.BadRequest(`У пользователя нет туду с таким названием`);
        }

        const result = await TodoModel.deleteOne({ title, user: userId });
        return result;
    }
}

module.exports = new TodoService();
