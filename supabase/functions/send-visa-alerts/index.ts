import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Interface for Resend Email
interface EmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

serve(async (req: Request) => {
  try {
    // Only allow POST requests (how pg_net calls it) or explicit GETs for testing
    if (req.method !== "POST" && req.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Starting Visa Expiry Alert Job...");

    // Find visas expiring exactly in 30 days or 7 days
    const today = new Date();

    const target30Days = new Date(today);
    target30Days.setDate(today.getDate() + 30);
    const date30 = target30Days.toISOString().split('T')[0];

    const target7Days = new Date(today);
    target7Days.setDate(today.getDate() + 7);
    const date7 = target7Days.toISOString().split('T')[0];

    // Fetch visas expiring on these precise dates, including student and institution emails
    const { data: expiringVisas, error } = await supabase
      .from('visas')
      .select(`
        id, 
        end_date, 
        student:students (
          full_name, 
          email,
          institution:institutions (
            name,
            contact_email
          )
        )
      `)
      .in('end_date', [date30, date7])
      .eq('status', 'ACTIVE');

    if (error) {
      console.error("Error fetching visas:", error);
      throw error;
    }

    if (!expiringVisas || expiringVisas.length === 0) {
      console.log("No visas expiring in exactly 30 or 7 days found today.");
      return new Response(JSON.stringify({ message: "No alerts needed today." }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${expiringVisas.length} visas approaching expiration.`);

    const emailPromises = expiringVisas.map(async (visa: any) => {
      // Cast the joined data (Supabase JS returns arrays/objects depending on schema, usually objects for belongs-to)
      const student = Array.isArray(visa.student) ? visa.student[0] : visa.student;
      if (!student) return;

      const institution = Array.isArray(student.institution) ? student.institution[0] : student.institution;

      const studentEmail = student.email;
      const adminEmail = institution?.contact_email;

      const daysLeft = visa.end_date === date30 ? 30 : 7;

      const emailTo = [];
      if (studentEmail) emailTo.push(studentEmail);
      if (adminEmail) emailTo.push(adminEmail);

      if (emailTo.length === 0) {
        console.warn(`No email addresses found for student ${student.full_name}. Skipping.`);
        return;
      }

      const payload: EmailPayload = {
        from: "IMS Alerts <noreply@ims.kz>",
        to: emailTo,
        subject: `⚠️ URGENT: Visa Expiring in ${daysLeft} Days - ${student.full_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Visa Expiry Warning</h2>
            </div>
            <div style="padding: 30px; background-color: #ffffff; color: #333333;">
              <p>Dear ${student.full_name} and ${institution?.name || 'University'} Administration,</p>
              
              <p>This is an automated alert from the <strong>Kazakhstan Immigration Management System (IMS)</strong>.</p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b;">
                  The national visa for <strong>${student.full_name}</strong> is scheduled to expire on <strong>${visa.end_date}</strong>.
                  <br/><br/>
                  <strong>Days remaining: ${daysLeft}</strong>
                </p>
              </div>
              
              <p>Please ensure that a renewal application is submitted immediately via the IMS portal. Failure to renew before the expiration date will result in a breach of immigration compliance and may lead to deportation protocols.</p>
              
              <p style="margin-top: 30px;">Thank you for your prompt attention to this matter.</p>
              <p style="color: #64748b; font-size: 12px; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                This is an automated system message. Do not reply directly to this email.
              </p>
            </div>
          </div>
        `
      };

      if (!resendApiKey) {
        // Mock Mode
        console.log(`================ MOCK EMAIL LOG ================`);
        console.log(`TO: ${payload.to.join(", ")}`);
        console.log(`SUBJECT: ${payload.subject}`);
        console.log(`BODY: (HTML payload generated perfectly)`);
        console.log(`================================================`);
        return Promise.resolve({ success: true, mock: true });
      } else {
        // Live Mode
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errBody = await res.text();
          console.error(`Failed to send email via Resend: ${errBody}`);
          return { success: false, error: errBody };
        }
        return await res.json();
      }
    });

    const results = await Promise.all(emailPromises);

    return new Response(JSON.stringify({
      message: `Successfully processed ${results.length} alerts.`,
      mode: resendApiKey ? "LIVE" : "MOCK",
      results
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Critical error in Visa Alerts job:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
})
