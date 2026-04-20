import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Admin, AdminDocument } from "../schemas/admin.schema";

@Injectable()
export class AdminRepository {
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
  ) {}

  async findByUsername(username: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ username }).exec();
  }

  async createAdmin(
    username: string,
    passwordHash: string,
  ): Promise<AdminDocument> {
    const admin = new this.adminModel({
      username,
      password_hash: passwordHash,
      created_date: new Date(),
      updated_date: new Date(),
    });

    return admin.save();
  }
}
