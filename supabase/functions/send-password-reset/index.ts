
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink }: PasswordResetRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "LURE CRM <onboarding@resend.dev>",
      to: [email],
      subject: "重設您的密碼 - LURE CRM",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>重設密碼</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 32px; font-weight: bold;">L</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">LURE CRM</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">客戶關係管理系統</p>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px; font-weight: 600;">重設您的密碼</h2>
              
              <p style="color: #6b7280; line-height: 1.6; margin: 0 0 30px; font-size: 16px;">
                您收到這封郵件是因為您要求重設 LURE CRM 帳戶的密碼。點擊下方按鈕即可重設您的密碼。
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  重設密碼
                </a>
              </div>
              
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.5; margin: 30px 0 0;">
                如果您無法點擊上方按鈕，請複製以下連結到瀏覽器中：<br>
                <span style="word-break: break-all; color: #6b7280;">${resetLink}</span>
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; margin: 30px 0 0; padding: 20px 0 0;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0; line-height: 1.5;">
                  如果您沒有要求重設密碼，請忽略這封郵件。您的密碼不會被更改。
                </p>
                <p style="color: #9ca3af; font-size: 14px; margin: 20px 0 0;">
                  此連結將在 24 小時後失效。
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0 0;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                © 2024 LURE CRM. 版權所有.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
