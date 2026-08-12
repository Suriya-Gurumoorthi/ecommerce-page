import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

export function EmailShell({ preview, title, children }: { preview: string; title: string; children: ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#0D0F14", color: "#F0EEE8", fontFamily: "Inter, Arial, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px" }}>
          <Section style={{ backgroundColor: "#161A23", border: "1px solid #252A35", borderRadius: 16, padding: 28 }}>
            <Text style={{ color: "#F5C842", fontWeight: 700, letterSpacing: 1 }}>STOREFRONT</Text>
            <Heading style={{ color: "#F0EEE8", margin: "12px 0 20px" }}>{title}</Heading>
            {children}
          </Section>
          <Text style={{ color: "#8B8F9E", fontSize: 12, textAlign: "center" }}>
            Need help? Reply to this email or contact support.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
