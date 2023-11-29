import { Errors } from "../errors";

describe("Errors", () => {
  it("should correctly construct an Errors object", () => {
    const errorData = [
      { errorType: "type1", message: "message1" },
      { errorType: "type2", message: "message2" },
    ];
    const errors = new Errors(errorData);

    expect(errors.name).toBe("Errors");
    expect(errors.errors).toEqual(errorData);
  });

  it("should correctly return the message", () => {
    const errorData = [
      { errorType: "type1", message: "message1" },
      { errorType: "type2", message: "message2" },
    ];
    const errors = new Errors(errorData);

    expect(errors.message).toBe("message1, message2");
  });
});
