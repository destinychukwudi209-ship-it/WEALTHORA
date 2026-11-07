import {NextResponse} from 'next/server';import {requireAdmin} from '@/lib/auth';
export async function GET(){try{await requireAdmin();return NextResponse.json({ok:true,scope:'admin'});}catch{return NextResponse.json({error:'Forbidden'},{status:403});}}
