
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
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token }: PasswordResetRequest = await req.json();
    console.log("Password reset request received for:", email);
    console.log("Reset token provided:", token ? "Yes" : "No");

    // Use the correct domain for the reset link
    const baseUrl = "https://lure.lovable.app";
    
    // We'll use the email in the URL to help with identification
    // The actual token hash will be in the link that Supabase generates
    const resetLink = `${baseUrl}/reset-password?email=${encodeURIComponent(email)}`;

    const emailResponse = await resend.emails.send({
      from: "密碼重設 <onboarding@resend.dev>",
      to: [email],
      subject: "重設您的密碼",
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
            <div style="background: white; padding: 40px; text-align: center; border-radius: 16px 16px 0 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <img src="${baseUrl}/lovable-uploads/bf4895f7-2032-4f5d-a050-239497c44107.png" style="width: 64px; height: 64px; margin: 0 auto 20px;">
              <h1 style="color: #1f2937; margin: 0 0 20px; font-size: 24px; font-weight: 600;">重設您的密碼</h1>
              
              <p style="color: #6b7280; line-height: 1.6; margin: 0 0 30px; font-size: 16px;">
                您收到這封郵件是因為您要求重設帳戶的密碼。請點擊下方按鈕以重設密碼。
              </p>
              
              <p style="color: #6b7280; line-height: 1.6; margin: 0 0 30px; font-size: 16px;">
                請查看您的郵箱中另一封由 Supabase Auth 發送的郵件，其中包含密碼重設連結。
              </p>
              
              <p style="color: #6b7280; line-height: 1.6; margin: 0 0 30px; font-size: 16px;">
                如果您沒有收到包含重設連結的郵件，請檢查垃圾郵件資料夾或重新申請密碼重設。
              </p>
            </div>
            
            <div style="background: white; padding: 20px 40px 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <p style="color: #9ca3af; font-size: 14px; margin: 20px 0 0; text-align: center;">
                如果您沒有要求重設密碼，請忽略這封郵件。<br>此連結將在 1 小時後失效。
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0 0;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                © 2024 版權所有.
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
