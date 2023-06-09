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

    async createTodo(userId, title) {
        console.log(title, userId)
        const generatedTodo = await TodoModel.create({
            user: userId,
            title,
        });

        return generatedTodo;
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
