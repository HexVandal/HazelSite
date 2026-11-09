import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { authenticate,hasRole,hasScope } from "@/lib/platform/auth";
import { query } from "@/lib/platform/db";
export const runtime="nodejs";
const schema=z.object({id:z.string().uuid(),blurhash:z.string().max(200).optional(),altText:z.string().max(300).optional()});
export async function PATCH(request:NextRequest){const actor=await authenticate(request);if(!actor||!(actor.tokenId?hasScope(actor,"storage:write"):hasRole(actor,"editor")))return NextResponse.json({error:"Storage write access required."},{status:401});const data=schema.safeParse(await request.json().catch(()=>null));if(!data.success)return NextResponse.json({error:"Invalid asset metadata."},{status:400});const {rows}=await query("update media_assets set blurhash=coalesce($1,blurhash),alt_text=coalesce($2,alt_text) where id=$3 returning id,public_url,blurhash,alt_text",[data.data.blurhash??null,data.data.altText??null,data.data.id]);if(!rows[0])return NextResponse.json({error:"Asset not found."},{status:404});return NextResponse.json({asset:rows[0]});}
