import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/config/OpenAiModel";
import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";

const REPORT_GEN_PROMPT = `You are an AI Medical Voice Agent. Based on the doctor AI agent info and the conversation between the AI medical agent and the user, generate a structured medical report as a JSON object with these fields:

- sessionId: unique session identifier
- agent: medical specialist name (e.g., "General Physician AI")
- user: name of the patient or "Anonymous" if not provided
- timestamp: current date and time in ISO format
- chiefComplaint: one-sentence summary of the main health concern
- summary: a 2-3 sentence summary of the conversation, symptoms, and recommendations
- symptoms: array of symptoms mentioned by the user
- duration: how long the user has experienced the symptoms
- severity: mild, moderate, or severe
- medicationsMentioned: array of any medicines mentioned
- recommendations: array of AI suggestions (e.g., rest, see a doctor)

Return ONLY a valid JSON object with these fields:
{
  "sessionId": "string",
  "agent": "string",
  "user": "string",
  "timestamp": "ISO Date string",
  "chiefComplaint": "string",
  "summary": "string",
  "symptoms": ["symptom1", "symptom2"],
  "duration": "string",
  "severity": "string",
  "medicationsMentioned": ["med1", "med2"],
  "recommendations": ["rec1", "rec2"]
}
Respond with nothing else.`;

export async function POST(request: Request) {
   const {sessionId,SessionDetail,message } = await request.json();

   try {
            const UserInput='AI Doctor Agent Info' + JSON.stringify(SessionDetail)+',Conversation :' + JSON.stringify(message);
            const completion = await openai.chat.completions.create({
                model: "deepseek/deepseek-chat-v3-0324:free",
                messages: [
                    {role:"system",content:REPORT_GEN_PROMPT},
                    { role: "user", content:UserInput}
                ],
              });
    
              const rawResp=completion.choices[0].message;
              //@ts-ignore
              const Resp=rawResp.content.trim().replace('```json','').replace('```','');
              console.log("Raw OpenAI response:", Resp);

              // Save to Database
              const result=await db.update(SessionChatTable).set({
                report:Resp
              }).where (eq(SessionChatTable.sessionId,sessionId));
              const JSONResp=JSON.parse(Resp);
              return NextResponse.json(JSONResp);
   } catch (e) {
    return NextResponse.json(e);
   }
}
