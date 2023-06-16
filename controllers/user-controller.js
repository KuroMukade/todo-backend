const userService = require('../service/user-service');
const todoService = require('../service/todo-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const tokenService = require('../service/token-service');
const taskService = require('../service/task-service');
const UserDto = require('../dtos/user-dto');
const todoModel = require('../models/todo-model');
const TodoDto = require('../dtos/todo-dto');
const taskModel = require('../models/task-model');
const userModel = require('../models/user-model');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {email, password} = req.body;
            const userData = await userService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }


    async getUser(req, res, next) {
        try {
            const token = req.headers.authorization;
            const accessToken = token.split(' ')[1];

            const userData = tokenService.validateAccessToken(accessToken);
            const user = await userModel.findById(userData.id);
            const dtoUser = new UserDto(user);
            return res.json(dtoUser);
        } catch (e) {
            next(e);
        }
    }

    async updateUser(req, res, next) {
        try {
            const token = req.headers.authorization;
            const { email } = req.body;
            if (!email) {
                throw ApiError.BadRequest('Неверные данные')
            }
            const accessToken = token.split(' ')[1];
            const user = tokenService.validateAccessToken(accessToken);
            if (!user) {
                throw ApiError('Пользователь не найден');
            }
            const updatedUser = await userService.updateUser(user.id, email);
            return res.json(updatedUser);
        } catch (e) {
            next(e);
        }
    }

    async getUserById(req, res, next) {
        try {
            const id = req.params.id;
            const user = await userService.getUserById(id);
            return res.json(user);
        } catch (e) {
            next(e);
        }
    }
    
    async getTodos(req, res, next) {
        try {
            const token = req.headers.authorization;
            const accessToken = token.split(' ')[1];
            const userData = tokenService.validateAccessToken(accessToken);
            const todos = await todoService.getTodo(userData.id);
            if (todos.length === 0) {
                throw ApiError.BadRequest('У пользователя еще нет туду');
            }
            return res.json(todos);
        } catch (e) {
            next(e);
        }
    }
    
    async getTodo(req, res, next) {
        try {
            const todoId = req.params.todoId;
            if (!todoId) {
                throw ApiError.BadRequest('Не указан туду id');
            }
            const todo = await todoModel.findById(todoId).populate('tasks');            
            return res.json(todo);
        } catch (e) {
            next(e);
        }
    }

    async createTodo(req, res, next) {
        try {
            const { title } = req.body;
            const token = req.headers.authorization;
            const accessToken = token.split(' ')[1];
            const userData = tokenService.validateAccessToken(accessToken);

            const todo = await todoService.createTodo(userData.id, title);
            return res.json(todo);
        } catch (e) {
            next(e);
        }
    }

    async updateTodo(req, res, next) {
        try {
            const { title } = req.body;
            const todoId = req.params.todoId;
            if (!todoId) {
                throw ApiError.BadRequest('Не указан todoId');
            }
            const updatedTodo = await todoService.updateTodo(todoId, title);
            return res.json(updatedTodo);
        } catch (e) {
            next(e);
        }
    }

    async deleteTodo(req, res, next) {
        try {
            const todoId = req.params.todoId;
            const deletedTodo = await todoModel.findByIdAndRemove(todoId);
            if (!deletedTodo) {
                throw ApiError.BadRequest('Туду с таким id не найдена');
            }
            const userTodos = await todoModel.find({ user: deletedTodo.user });
            return res.json(userTodos);
        } catch (e) {
            next(e);
        }
    }


    async getTasks(req, res, next) {
        try {
            const { todoId } = req.params;
            if (!todoId) {
                throw ApiError.BadRequest('Не верный todoId');
            }
            const todo = await todoModel.findById(todoId).populate('tasks');
            if (!todo) {
                throw ApiError.BadRequest('Не найдено такой todo');
            }
            return res.json(todo.tasks);
        } catch (e) {
            next(e);
        }
    }

    async getTask(req, res, next) {
        try {
            const { taskId } = req.query;
            if (!taskId) {
                throw ApiError.BadRequest('Не указан taskId');
            }

            const tasks = await taskService.getTask(taskId);
            return res.json(tasks);
        } catch (e) {
            next(e);
        }
    }

    async createTask(req, res, next) {
        try {
            const { title, text, priority } = req.body;
            const { todoId } = req.params;
            const newTask = await taskService.createTask(todoId, title, text, priority);
            return res.json(newTask);
        } catch (e) {
            next(e);
        }
    }

    async updateTask(req, res, next) {
        try {
            const { title, text, priority, completed } = req.body;
            const taskId = req.query;
            const updatedTask = await taskService.updateTask(taskId, title, text, priority, completed);
            return res.json(updatedTask);
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new UserController();
