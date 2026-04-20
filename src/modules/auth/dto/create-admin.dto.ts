import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
