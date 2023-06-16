module.exports = class UserDto {
    email;
    id;
    todos;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.todos = model.todos;
    }
}
