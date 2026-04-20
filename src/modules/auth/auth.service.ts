import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { convertKeysToCamelCase } from "../../common/utils/case-converter.util";
import { AdminRepository } from "./repositories/admin.repository";

type JwtExpiresIn =
  | number
  | `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}`;

interface LoginResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
}

interface CreateAdminResponse {
  message: string;
  username: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const adminUsername = this.configService.get<string>(
      "ADMIN_USERNAME",
      "admin",
    );
    const adminPassword = this.configService.get<string>(
      "ADMIN_PASSWORD",
      "admin12345",
    );

    const existingAdmin =
      await this.adminRepository.findByUsername(adminUsername);
    if (existingAdmin) {
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await this.adminRepository.createAdmin(adminUsername, passwordHash);
  }

  async register(
    username: string,
    password: string,
  ): Promise<CreateAdminResponse> {
    const existing = await this.adminRepository.findByUsername(username);
    if (existing) {
      throw new ConflictException(
        `Admin with username "${username}" already exists`,
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await this.adminRepository.createAdmin(
      username,
      passwordHash,
    );

    return { message: "Admin created successfully", username: admin.username };
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const admin = await this.adminRepository.findByUsername(username);
    if (!admin) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const adminData = convertKeysToCamelCase(admin.toObject()) as unknown as {
      passwordHash: string;
      username: string;
    };
    const isPasswordMatched = await bcrypt.compare(
      password,
      adminData.passwordHash,
    );
    if (!isPasswordMatched) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const expiresInRaw = this.configService.get<string>("JWT_EXPIRES_IN", "1d");
    const expiresIn = expiresInRaw as JwtExpiresIn;
    const accessToken = await this.jwtService.signAsync(
      {
        sub: admin.id,
        username: adminData.username,
      },
      {
        expiresIn,
      },
    );

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: expiresInRaw,
    };
  }
}
