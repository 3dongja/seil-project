"use strict";
// functions/src/index.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.unused = exports.handleAdminCommand = exports.syncSellerStats = exports.deleteOldMessages = exports.onUserMessage = exports.helloWorld = exports.aggregateStats = exports.cleanupSummaries = exports.summary = void 0;
const functions = __importStar(require("firebase-functions"));
const statsAggregator_1 = require("./utils/statsAggregator");
Object.defineProperty(exports, "aggregateStats", { enumerable: true, get: function () { return statsAggregator_1.aggregateStats; } });
var summary_1 = require("./handlers/summary");
Object.defineProperty(exports, "summary", { enumerable: true, get: function () { return summary_1.summary; } });
var cleanup_1 = require("./handlers/cleanup");
Object.defineProperty(exports, "cleanupSummaries", { enumerable: true, get: function () { return cleanup_1.cleanupSummaries; } });
const OpenAI = require("openai").default;
const firebase_admin_1 = require("./lib/firebase-admin");
exports.helloWorld = functions.https.onRequest((req, res) => {
    res.send("Hello from Firebase Functions!");
});
exports.onUserMessage = functions.firestore
    .document("chatLogs/{sellerId}/rooms/{chatId}/messages/{messageId}")
    .onCreate(async (snap, context) => {
    const { sellerId, chatId } = context.params;
    const data = snap.data();
    if (!data)
        return null;
    if (data.sender !== "user")
        return null;
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_GPT35 });
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "당신은 친절한 고객 상담원입니다. 질문에 간단하고 명확하게 답해주세요.",
                },
                {
                    role: "user",
                    content: data.text,
                },
            ],
        });
        const reply = response.choices[0]?.message?.content ??
            "죄송합니다. 답변을 생성하지 못했습니다.";
        await firebase_admin_1.db
            .collection("chatLogs")
            .doc(sellerId)
            .collection("rooms")
            .doc(chatId)
            .collection("messages")
            .add({
            text: reply,
            sender: "gpt",
            createdAt: new Date(),
        });
    }
    catch (error) {
        console.error("OpenAI 응답 오류:", error);
    }
    return null;
});
exports.deleteOldMessages = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async (context) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const snapshot = await firebase_admin_1.db
        .collectionGroup("messages")
        .where("createdAt", "<", cutoff)
        .get();
    const batch = firebase_admin_1.db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`${snapshot.size} old messages deleted.`);
});
exports.syncSellerStats = functions.firestore
    .document("sellers/{sellerId}")
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before?.name !== after?.name) {
        await firebase_admin_1.db.doc(`sellerStats/${context.params.sellerId}`).set({ name: after?.name }, { merge: true });
    }
});
exports.handleAdminCommand = functions.firestore
    .document("adminCommands/{commandId}")
    .onCreate(async (snap, context) => {
    try {
        const command = snap.data();
        if (!command) {
            console.warn("Empty command data", context.params.commandId);
            return;
        }
        if (command.type === "broadcast") {
            const sellersSnap = await firebase_admin_1.db.collection("sellers").get();
            const batch = firebase_admin_1.db.batch();
            sellersSnap.forEach((doc) => {
                batch.set(firebase_admin_1.db.doc(`sellers/${doc.id}/notifications/${context.params.commandId}`), {
                    message: command.message,
                    createdAt: new Date(),
                });
            });
            await batch.commit();
        }
    }
    catch (error) {
        console.error("handleAdminCommand error:", error);
    }
});
exports.unused = functions.https.onRequest((req, res) => {
    res.send("This is a placeholder for future exports.");
});
