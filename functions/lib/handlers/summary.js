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
function getCurrentDateKey() {
    const now = new Date();
    return now.toISOString().slice(0, 10); // YYYY-MM-DD
}
function getCurrentMonthKey() {
    const now = new Date();
    return now.toISOString().slice(0, 7); // YYYY-MM
}
exports.summary = functions
    .runWith({ timeoutSeconds: 15, memory: "256MB" })
    .https.onRequest(async (req, res) => {
    try {
        const { messages, sellerId, inquiryId } = req.body;
        if (!Array.isArray(messages) || !sellerId) {
            res.status(400).send("Invalid request");
            return;
        }
        // 🔐 요금제 확인
        const sellerSnap = await firebase_admin_1.db.doc(`sellers/${sellerId}`).get();
        const sellerData = sellerSnap.exists ? sellerSnap.data() : null;
        if (!sellerData) {
            res.status(403).json({ error: "판매자 정보가 없습니다." });
            return;
        }
        const plan = sellerData.plan || "free";
        // 📊 사용량 제한 확인
        const usageRef = firebase_admin_1.db.doc(`usageStats/${sellerId}`);
        const usageSnap = await usageRef.get();
        const usageData = usageSnap.exists ? usageSnap.data() || {} : {};
        const monthlyCount = usageData.monthlyChatCount || 0;
        const dailyKey = getCurrentDateKey();
        const dailyCount = usageData.daily?.[dailyKey] || 0;
        if (plan === "free") {
            if (dailyCount >= 5 || monthlyCount >= 30) {
                res.status(403).json({ error: "Free 요금제는 요약 기능이 일 5회, 월 30회로 제한됩니다." });
                return;
            }
        }
        else {
            if (monthlyCount >= 1000) {
                res.status(403).json({ error: "GPT 챗봇 사용량이 초과되었습니다." });
                return;
            }
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
        await firebase_admin_1.db
            .collection("admin")
            .doc("chat-logs")
            .collection("rooms")
            .doc(`${sellerId}-${inquiryId}`)
            .collection("messages")
            .add({
            text: messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
            reply: summary,
            sender: "gpt",
            createdAt: new Date(),
        });
        // 🔄 사용량 업데이트
        const monthKey = getCurrentMonthKey();
        const updateData = {
            monthlyChatCount: monthlyCount + 1,
            lastMonth: monthKey,
        };
        updateData[`daily.${dailyKey}`] = dailyCount + 1;
        await usageRef.set(updateData, { merge: true });
        res.status(200).json({ summary });
    }
    catch (err) {
        console.error("Summary error", err);
        res.status(500).send("Internal server error");
    }
});
