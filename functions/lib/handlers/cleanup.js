"use strict";
// functions/src/handlers/cleanup.ts
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
exports.cleanupSummaries = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_admin_1 = require("../lib/firebase-admin");
exports.cleanupSummaries = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
    const now = new Date();
    const deleteExpired = async (days) => {
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const snap = await firebase_admin_1.db.collection("summaryLogs").where("createdAt", "<", cutoff).get();
        const batch = firebase_admin_1.db.batch();
        snap.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log(`🧹 Deleted ${snap.size} expired summaries (${days}일 초과)`);
    };
    await deleteExpired(7);
    await deleteExpired(30);
    return null;
});
