import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { currentUser } from "@clerk/nextjs/server";
import { desc } from "drizzle-orm";
export async function POST(req: NextRequest) {
    const {notes,selectedDoctors}=await req.json();
    const user=await currentUser();
    try{
        const sessionId = uuidv4();
        const result = await db.insert(SessionChatTable).values({
                sessionId:sessionId,
                createdBy:user?.primaryEmailAddress?.emailAddress,
                notes:notes,
                selectedDoctors:selectedDoctors,
                createdOn:new Date().toString() 
        //@ts-ignore
        }).returning({SessionChatTable});

        return NextResponse.json(result[0]?.SessionChatTable);
    }catch (e) {
        return NextResponse.json(e);
    }
}


export async function GET(req: NextRequest) {
    const {searchParams}=new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const user=await currentUser();
    if (sessionId!=='all') 
    {

    }
    else {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 } as any);
    }
    const result = await db.select().from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, email))
        .orderBy(desc(SessionChatTable.id));

        //@ts-ignore
        return NextResponse.json(result);

    }
}