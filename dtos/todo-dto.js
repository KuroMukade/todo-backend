module.exports = class TodoDto {
    user;
    id;
    title;

    constructor(model) {
        this.user = model.user;
        this.id = model.id;
        this.title = model.title;
    }
}
