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
exports.onUserMessage = exports.helloWorld = exports.aggregateStats = exports.cleanupSummaries = exports.summary = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const statsAggregator_1 = require("./utils/statsAggregator");
Object.defineProperty(exports, "aggregateStats", { enumerable: true, get: function () { return statsAggregator_1.aggregateStats; } });
var summary_1 = require("./handlers/summary");
Object.defineProperty(exports, "summary", { enumerable: true, get: function () { return summary_1.summary; } });
var cleanup_1 = require("./handlers/cleanup");
Object.defineProperty(exports, "cleanupSummaries", { enumerable: true, get: function () { return cleanup_1.cleanupSummaries; } });
const firestore_1 = require("firebase-admin/firestore");
const OpenAI = require("openai").default;
const firebase_admin_1 = require("./lib/firebase-admin");
async function incrementUsageCount(sellerId) {
    const ref = firebase_admin_1.db.doc(`usageStats/${sellerId}`);
    const snapshot = await ref.get();
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
    if (!snapshot.exists) {
        await ref.set({ monthlyCount: 1, lastMonth: currentMonth, blocked: false });
        return { blocked: false, count: 1 };
    }
    const data = snapshot.data();
    if (!data) {
        throw new Error(`사용자 usageStats/${sellerId} 문서에 데이터가 존재하지 않습니다.`);
    }
    let count = data.monthlyCount || 0;
    if (data.lastMonth !== currentMonth) {
        await ref.set({ monthlyCount: 1, lastMonth: currentMonth, blocked: false });
        return { blocked: false, count: 1 };
    }
    count += 1;
    const blocked = count > 1000;
    await ref.update({
        monthlyCount: firestore_1.FieldValue.increment(1),
        blocked,
    });
    return { blocked, count };
}
exports.helloWorld = functions.https.onRequest((req, res) => {
    res.send("Hello from Firebase Functions!");
});
exports.onUserMessage = functions.firestore
    .document("chatLogs/{sellerId}/rooms/{chatId}/messages/{messageId}")
    .onCreate(async (snap, context) => {
    const { sellerId, chatId } = context.params;
    const data = snap.data();
    if (data.sender !== "user")
        return null;
    // 월 채팅 사용량 집계 및 제한 체크 추가
    const { blocked, count } = await incrementUsageCount(sellerId);
    if (blocked) {
        console.log(`❌ ${sellerId} 월 채팅 1,000회 초과, 응답 제한`);
        // 차단 시 GPT 응답 메시지 저장 대신 종료 (원한다면 별도 알림 저장 가능)
        return null;
    }
    const sellerRef = firebase_admin_1.db.doc(`sellers/${sellerId}`);
    const sellerSnap = await sellerRef.get();
    const settings = sellerSnap.data()?.settings || {};
    let { gptEnabled, lastAdminActive, plan } = settings;
    const now = Date.now();
    const adminLast = lastAdminActive?.toMillis?.() ?? 0;
    const isAdminOnline = now - adminLast < 10 * 60 * 1000;
    if (!gptEnabled && !isAdminOnline) {
        await sellerRef.update({ "settings.gptEnabled": true });
        gptEnabled = true;
    }
    if (!gptEnabled)
        return null;
    // 신규 메시지 알림 저장
    const alertRef = firebase_admin_1.db.collection(`sellers/${sellerId}/alerts`);
    await alertRef.add({
        type: "new_message",
        chatId,
        messageId: snap.id,
        userId: data.userId || null,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        read: false,
    });
    const model = plan === "premium" ? "gpt-4" : "gpt-3.5-turbo";
    const apiKey = plan === "premium"
        ? functions.config().openai.gpt40
        : functions.config().openai.gpt35;
    if (!apiKey) {
        console.error("❌ OpenAI API 키가 설정되지 않았습니다.");
        return null;
    }
    try {
        const openai = new OpenAI({ apiKey });
        const response = await openai.chat.completions.create({
            model,
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
            .collection(`chatLogs/${sellerId}/rooms/${chatId}/messages`)
            .add({
            sender: "gpt",
            text: reply,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    catch (err) {
        console.error("❌ GPT 오류:", err);
    }
    exports.updateAdminActive = functions.pubsub
        .schedule('every 9 minutes 30 seconds')
        .onRun(async () => {
        const usersSnap = await firebase_admin_1.db.collection('users').get();
        const now = admin.firestore.FieldValue.serverTimestamp();
        const updates = [];
        for (const userDoc of usersSnap.docs) {
            const sellerRef = firebase_admin_1.db.collection('users').doc(userDoc.id).collection('seller').doc('profile');
            updates.push(sellerRef.update({ lastAdminActive: now }).catch((e) => console.log(`❌ ${userDoc.id} 실패`, e)));
        }
        await Promise.all(updates);
        console.log('✅ lastAdminActive 갱신 완료');
    });
    return null;
});
