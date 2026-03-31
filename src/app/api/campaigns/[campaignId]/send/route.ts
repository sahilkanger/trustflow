import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { absoluteUrl } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

interface RouteParams {
  params: Promise<{ campaignId: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const { campaignId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      space: { select: { userId: true, name: true, slug: true } },
      recipients: { where: { sentAt: null } },
    },
  });

  if (!campaign || campaign.space.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (campaign.status === "SENT") {
    return NextResponse.json(
      { error: "Campaign already sent" },
      { status: 400 }
    );
  }

  const collectionUrl = absoluteUrl(`/t/${campaign.space.slug}`);
  let sentCount = 0;

  // Send emails in batches
  for (const recipient of campaign.recipients) {
    try {
      const personalizedBody = campaign.body
        .replace(/{{name}}/g, recipient.name || "there")
        .replace(/{{link}}/g, collectionUrl);

      await resend.emails.send({
        from: `${campaign.space.name} via TrustFlow <testimonials@trustflow.app>`,
        to: recipient.email,
        subject: campaign.subject.replace(
          /{{name}}/g,
          recipient.name || "there"
        ),
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              ${personalizedBody.replace(/\n/g, "<br/>")}
            </p>
            <div style="margin-top: 24px;">
              <a href="${collectionUrl}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Share your experience
              </a>
            </div>
            <p style="margin-top: 32px; font-size: 12px; color: #9ca3af;">
              Sent via <a href="https://trustflow.app" style="color: #6366f1;">TrustFlow</a>
            </p>
          </div>
        `,
      });

      await prisma.emailRecipient.update({
        where: { id: recipient.id },
        data: { sentAt: new Date() },
      });

      sentCount++;
    } catch {
      // Continue sending to other recipients
    }
  }

  // Update campaign
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      totalSent: { increment: sentCount },
    },
  });

  return NextResponse.json({ sent: sentCount });
}
