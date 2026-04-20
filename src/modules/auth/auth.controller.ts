import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("admin")
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
  ): Promise<{ message: string; username: string }> {
    return this.authService.register(
      createAdminDto.username,
      createAdminDto.password,
    );
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{
    accessToken: string;
    tokenType: "Bearer";
    expiresIn: string;
  }> {
    return this.authService.login(loginDto.username, loginDto.password);
  }
}
