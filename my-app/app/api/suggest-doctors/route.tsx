import { AIDoctorAgents } from "@/app/Shared/list";
import { openai } from "@/config/OpenAiModel";
import { NextRequest, NextResponse } from "next/server";




export async function POST(req:NextRequest) {
    const {notes}=await req.json();

    try{
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
                {role:"system",content:JSON.stringify(AIDoctorAgents)},
                { role: "user", content:"User Notes/Symptoms:"+notes+", Depends on user notes and symptons, Please suggest list of doctors , Return object JSON only  "}
            ],
          });

          const rawResp=completion.choices[0].message;
          //@ts-ignore
          const Resp=rawResp.content.trim().replace('```json','').replace('```','');
          console.log("Raw OpenAI response:", Resp);
          const JSONResp=JSON.parse(Resp);
          console.log("Parsed JSON:", JSONResp);
          return NextResponse.json(JSONResp);
    }catch(e)
    {
        return NextResponse.json(e);


    }

}
