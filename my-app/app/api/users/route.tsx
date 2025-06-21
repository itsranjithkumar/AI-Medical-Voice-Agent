import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user || !user.primaryEmailAddress?.emailAddress || !user.firstName) {
            console.error('User object is invalid:', user);
            return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
        }

        // Check if user already exists
        const users = await db.select().from(usersTable)
            // @ts-ignore
            .where(eq(usersTable.email, user.primaryEmailAddress.emailAddress));

        if (users.length === 0) {
            const [result] = await db.insert(usersTable).values({
                // @ts-ignore
                name: user.firstName,
                email: user.primaryEmailAddress.emailAddress,
                credit: 10
            }).returning(); // Return all columns
            return NextResponse.json(result);
        }
        return NextResponse.json(users[0]);
    } catch (e) {
        console.error('Error in POST /api/users:', e);
        return NextResponse.json({ error: 'Internal Server Error', details: e?.message || e }, { status: 500 });
    }
}