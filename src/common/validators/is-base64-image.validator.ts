import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

const DATA_URI_REGEX = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
const BASE64_BODY_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 10MB

@ValidatorConstraint({ name: "isBase64Image", async: false })
export class IsBase64ImageConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== "string" || value.length === 0) return false;

    const base64Body = DATA_URI_REGEX.test(value)
      ? value.replace(DATA_URI_REGEX, "")
      : value;

    if (!BASE64_BODY_REGEX.test(base64Body)) return false;

    const byteSize = Math.ceil((base64Body.replace(/=/g, "").length * 3) / 4);
    return byteSize <= MAX_SIZE_BYTES;
  }

  defaultMessage(): string {
    return "bannerImage must be a valid base64 image (jpeg, jpg, png, gif, webp) and must not exceed 5MB";
  }
}

export function IsBase64Image(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBase64ImageConstraint,
    });
  };
}
