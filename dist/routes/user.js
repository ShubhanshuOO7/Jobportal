"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.userRouter = (0, express_1.default)();
const bcrypt_1 = __importDefault(require("bcrypt"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.userRouter.use((0, cookie_parser_1.default)());
exports.userRouter.post("/signup", (_a) => __awaiter(void 0, [_a], void 0, function* ({ req, res }) {
    const body = yield req.body.json();
    const { fullName, email, phoneNumber, password, role } = body;
    if (!fullName || !email || !phoneNumber || !password || !role) {
        res.json({
            message: "Something is missing",
            status: false,
        });
    }
    const prisma = new client_1.PrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
    });
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        let user = yield prisma.user.create({
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
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
        }, process.env.JWT_SECRET || "", {
            expiresIn: "1h",
        });
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
            status: false,
        });
    }
}));
