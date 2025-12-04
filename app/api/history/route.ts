// app/api/history/route.ts
import { getHistory } from '../../lib/history';
import { NextRequest, NextResponse } from 'next/server';

// 强制此路由为动态执行，防止 Vercel 缓存旧的聊天记录
export const dynamic = 'force-dynamic';

/**
 * 处理 GET /api/history 请求
 * 需要一个 'userId' 查询参数
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    try {
        const history = await getHistory(userId);
        return NextResponse.json(history, { status: 200 });
    } catch (error) {
        console.error(`Error fetching history for user ${userId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
