import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const doc = (await request.formData()).get('files')  as File

    return NextResponse.json([
        {
            type: "plain/text",
            text: await doc.text()
        }
    ])
}
