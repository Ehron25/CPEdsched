import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// --- SHARED EMAIL TEMPLATE WRAPPER ---
const getHtmlTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset & Base */
    body { margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; color: #1f2937; }
    .wrapper { width: 100%; background-color: #f9fafb; padding: 40px 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; }
    
    /* Header with PUP Maroon */
    .header { background-color: #810806; padding: 30px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .header-sub { color: #dba729; font-size: 14px; font-weight: 600; text-transform: uppercase; margin-top: 5px; letter-spacing: 1px; }

    /* Content */
    .content { padding: 40px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #111827; }
    .message { margin-bottom: 20px; font-size: 16px; color: #4b5563; }
    
    /* Info Box */
    .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .info-row { margin-bottom: 8px; font-size: 14px; display: flex; flex-wrap: wrap; }
    .info-label { font-weight: 600; color: #64748b; width: 120px; flex-shrink: 0; }
    .info-value { color: #334155; font-weight: 500; flex: 1; }

    /* Alert Boxes */
    .alert-box-red { background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin: 25px 0; color: #991b1b; }
    .alert-box-yellow { background-color: #fefce8; border: 1px solid #fef9c3; border-radius: 8px; padding: 20px; margin: 25px 0; color: #854d0e; }

    /* Buttons */
    .btn-container { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; margin: 0 5px; transition: opacity 0.2s; color: #ffffff !important; }
    .btn-success { background-color: #28a745; }
    .btn-danger { background-color: #dc3545; }
    .btn:hover { opacity: 0.9; }

    /* Footer */
    .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>CPEdSched</h1>
        <div class="header-sub">Polytechnic University of the Philippines</div>
      </div>

      <div class="content">
        ${content}
      </div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} CPEdSched. All rights reserved.</p>
        <p>Polytechnic University of the Philippines</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export async function POST() {
  try {
    // 1. Initialize Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Bulk Update: Unverify all students
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_verified: false })
      .eq('role', 'student');

    if (updateError) throw updateError;

    // 3. Fetch Emails AND Names for personalization
    const { data: students, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('role', 'student')
      .not('email', 'is', null);

    if (fetchError) throw fetchError;

    // 4. Send Individual Emails
    if (students && students.length > 0) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      // Use Promise.all to send emails concurrently but individually
      const emailPromises = students.map((student) => {
        if (!student.email) return Promise.resolve();

        // Personalize content
        const innerContent = `
          <p class="greeting">Hello ${student.full_name || 'Student'},</p>
          <p class="message">Welcome to the new semester! As part of our system reset, your account verification status has been reset.</p>
          
          <div class="alert-box-yellow">
            <div style="font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">Action Required</div>
            Please log in to your account and update your profile with your new <strong>Certificate of Registration (COR)</strong> for the current semester to restore your reservation privileges.
          </div>

          <p class="message">Once you have updated your COR link, an admin will review your account for re-verification.</p>
          
          <div class="btn-container">
            <a href="${baseUrl}/profile" class="btn btn-success">Update Profile</a>
          </div>
        `;

        const htmlContent = getHtmlTemplate(innerContent);

        return transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: student.email, // Sent directly to the specific student
          subject: '[ACTION REQUIRED] New Semester Verification - CPEdSched',
          html: htmlContent,
        });
      });

      await Promise.all(emailPromises);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Reset successful. Updated and notified ${students?.length} students.` 
    });

  } catch (error: unknown) {
    console.error("Reset Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}