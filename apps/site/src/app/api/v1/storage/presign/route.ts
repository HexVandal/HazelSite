import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authenticate, hasRole, hasScope, randomToken } from "@/lib/platform/auth";
import { query } from "@/lib/platform/db";
export const runtime = "nodejs";
const schema = z.object({ filename: z.string().min(1).max(180), contentType: z.enum(["image/jpeg","image/png","image/webp","image/gif","image/avif"]), size: z.number().int().positive().max(15*1024*1024) });
export async function POST(request: NextRequest) {
  const actor = await authenticate(request);
  if (!actor || !(actor.tokenId ? hasScope(actor,"storage:write") : hasRole(actor,"editor"))) return NextResponse.json({error:"Storage write access required."},{status:401});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:"Unsupported image or file size (15 MB maximum)."},{status:400});
  const cfg={bucket:process.env.S3_BUCKET,region:process.env.S3_REGION,accessKeyId:process.env.S3_ACCESS_KEY_ID,secretAccessKey:process.env.S3_SECRET_ACCESS_KEY};
  if(!cfg.bucket||!cfg.region||!cfg.accessKeyId||!cfg.secretAccessKey) return NextResponse.json({error:"S3-compatible storage is not configured. Set S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_PUBLIC_URL."},{status:503});
  const safeName=parsed.data.filename.replace(/[^a-zA-Z0-9._-]/g,"_").slice(-100); const key=`uploads/${new Date().toISOString().slice(0,10)}/${randomToken(18)}-${safeName}`;
  const client=new S3Client({region:cfg.region,endpoint:process.env.S3_ENDPOINT||undefined,forcePathStyle:process.env.S3_FORCE_PATH_STYLE==="true",credentials:{accessKeyId:cfg.accessKeyId,secretAccessKey:cfg.secretAccessKey}});
  const command=new PutObjectCommand({Bucket:cfg.bucket,Key:key,ContentType:parsed.data.contentType,ContentLength:parsed.data.size,CacheControl:"public,max-age=31536000,immutable"});
  const uploadUrl=await getSignedUrl(client,command,{expiresIn:300});
  const publicBase=process.env.S3_PUBLIC_URL;
  if(!publicBase) return NextResponse.json({error:"S3_PUBLIC_URL is required."},{status:503});
  const url=`${publicBase.replace(/\/$/,"")}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const {rows}=await query("insert into media_assets(storage_key,file_name,mime_type,size_bytes,public_url,uploaded_by) values($1,$2,$3,$4,$5,$6) returning id",[key,safeName,parsed.data.contentType,parsed.data.size,url,actor.id]);
  return NextResponse.json({uploadUrl,method:"PUT",headers:{"Content-Type":parsed.data.contentType},url,assetId:rows[0].id,expiresIn:300},{status:201,headers:{"Cache-Control":"no-store"}});
}
