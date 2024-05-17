export class Errors extends Error {
    constructor(errors) {
        super();
        this.errors = errors;
        this.name = "Errors";
    }
    get message() {
        return this.errors.map((error) => error.message).join(", ");
    }
}
//# sourceMappingURL=error.js.map