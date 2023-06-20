const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);
router.get('/user', authMiddleware, userController.getUser);
router.patch('/user', authMiddleware, userController.updateUser);

router.get('/todos', authMiddleware, userController.getTodos);
router.get('/todos/:todoId', authMiddleware, userController.getTodo);
router.post('/todos', authMiddleware, userController.createTodo);
router.put('/todos/:todoId', authMiddleware, userController.updateTodo);
router.delete('/todos/:todoId', authMiddleware, userController.deleteTodo);

router.get('/todos/:todoId/tasks', authMiddleware, userController.getTasks);
router.post('/todos/:todoId/tasks', authMiddleware, userController.createTask);
router.put('/todos/:todoId/tasks', authMiddleware, userController.updateTask);
router.delete('/todos/:todoId/:taskId', authMiddleware, userController.deleteTask);

module.exports = router
