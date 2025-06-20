"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = void 0;
// src/handlers/summary.ts
const functions = __importStar(require("firebase-functions"));
const openai_1 = __importDefault(require("openai"));
const dotenv = __importStar(require("dotenv"));
const firebase_admin_1 = require("../lib/firebase-admin");
dotenv.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY_GPT35,
});
exports.summary = functions
    .runWith({ timeoutSeconds: 15, memory: "256MB" })
    .https.onRequest(async (req, res) => {
    try {
        const { messages, sellerId, inquiryId } = req.body;
        if (!Array.isArray(messages)) {
            res.status(400).send("Invalid message format");
            return;
        }
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
        });
        const summary = completion.choices[0]?.message?.content ?? "요약 실패";
        await firebase_admin_1.db.collection("admin").doc("chat-logs").collection("logs").add({
            sellerId,
            inquiryId,
            reply: summary,
            source: "api-summary",
            createdAt: new Date(),
        });
        // ✅ 관리자용 GPT 응답 로그 저장 (src/handlers/summary.ts)
        await firebase_admin_1.db.collection("admin")
            .doc("chat-logs")
            .collection("rooms")
            .doc(`${sellerId}-${inquiryId}`)
            .collection("messages")
            .add({
            text: messages.map(m => `${m.role}: ${m.content}`).join("\n"),
            reply: summary,
            sender: "gpt",
            createdAt: new Date(),
        });
        res.status(200).json({ summary });
    }
    catch (err) {
        console.error("Summary error:", err);
        res.status(500).send("Server error");
    }
});
