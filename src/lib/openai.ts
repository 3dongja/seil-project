// src/lib/openai.ts
import { OpenAI } from "openai";

const apiKey = process.env.OPENAI_API_KEY_GPT35; // 혹은 동적 분기

export const openai = new OpenAI({ apiKey });