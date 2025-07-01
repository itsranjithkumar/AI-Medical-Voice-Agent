import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { currentUser } from "@clerk/nextjs/server";
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
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const user = await currentUser();

    if (sessionId === 'all') {
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) {
            return NextResponse.json({ error: 'User email not found' }, { status: 400 } as any);
        }
        const result = await db.select().from(SessionChatTable)
            .where(eq(SessionChatTable.createdBy, email))
            .orderBy(desc(SessionChatTable.id));
        // Add selectedDoctor to each session
        const sessionsWithSelectedDoctor = result.map((session: any) => {
            let selectedDoctor = undefined;
            if (session.selectedDoctors) {
                try {
                    const parsed = typeof session.selectedDoctors === 'string'
                        ? JSON.parse(session.selectedDoctors)
                        : session.selectedDoctors;
                    selectedDoctor = Array.isArray(parsed) ? parsed[0] : parsed;
                } catch (e) {
                    console.error('Error parsing selectedDoctors:', e, session.selectedDoctors);
                    selectedDoctor = undefined;
                }
            }
            return {
                ...session,
                selectedDoctor,
            };
        });
        //@ts-ignore
        return NextResponse.json(sessionsWithSelectedDoctor);
    } else if (sessionId) {
        //@ts-ignore
        const result = await db.select().from(SessionChatTable).where(eq(SessionChatTable.sessionId, sessionId));
        try {
            if (!result[0]) {
                return NextResponse.json({ error: 'Session not found' }, { status: 404 } as any);
            }
            let selectedDoctor = undefined;
            if (result[0].selectedDoctors) {
                try {
                    const parsed = typeof result[0].selectedDoctors === 'string' ? JSON.parse(result[0].selectedDoctors) : result[0].selectedDoctors;
                    selectedDoctor = Array.isArray(parsed) ? parsed[0] : parsed;
                } catch (e) {
                    console.error('Error parsing selectedDoctors:', e, result[0].selectedDoctors);
                    selectedDoctor = undefined;
                }
            }
            const response = {
                ...result[0],
                selectedDoctor,
            };
            return NextResponse.json(response);
        } catch (error) {
            console.error('API GET /api/session-chat error:', error);
            return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : error }, { status: 500 } as any);
        }
    } else {
        return NextResponse.json({ error: 'No sessionId provided' }, { status: 400 } as any);
    }
}