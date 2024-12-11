import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
export const userRouter = express();
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
userRouter.use(cookieParser());

userRouter.post( "/signup",async ({ req, res }: { req: any; res: any }) => {
    const body = await req.body.json();
    const { fullName, email, phoneNumber, password, role } = body;
    if (!fullName || !email || !phoneNumber || !password || !role) {
      res.json({
        message: "Something is missing",
        status: false,
      });
    }
    const prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      let user = await prisma.user.create({
        data: {
          fullName: req.body.fullName,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          password: hashedPassword,
          role: req.body.role,
        },
      });
      user = {
        id: user.id,
        fullName,
        email,
        phoneNumber,
        password,
        role,
        createdAt: user.createdAt,
      };
      const token = jwt.sign(
        {
          userId: user.id,
        },
        process.env.JWT_SECRET || "",
        {
          expiresIn: "1h",
        }
      );
      return res
        .status(200)
        .cookie("token", token, {
          maxAge: 1 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: "strict",
        })
        .json({
          message: "Signup Successfully ",
          status: true,
          user,
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
        status: false,
      });
    }
  }
);

