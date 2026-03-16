import { BroadcastDialog } from "@/components/broadcast-dialog";
import { IngressDialog } from "@/components/ingress-dialog";
import { Button, Container, Flex, Separator, Text } from "@radix-ui/themes";
import Image from "next/image";
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-12 p-6 sm:p-24">
      <Container size="1">
        <Flex direction="column" align="center" gap="5">
          <Image
            src="/logo_camera.svg"
            alt="Svistic streaming logo"
            width="240"
            height="120"
            className="invert dark:invert-0 mt-8 mb-2"
          />
          <Text as="p" size="4" weight="bold">
            Streamer Dashboard
          </Text>
          <Flex gap="2" wrap="wrap" justify="center">
            <BroadcastDialog>
              <Button size="3">Stream from browser</Button>
            </BroadcastDialog>
            <IngressDialog>
              <Button size="3">Stream from OBS</Button>
            </IngressDialog>
          </Flex>
          <Separator orientation="horizontal" size="4" className="my-2" />
          <Link href="/">
            <Text size="2" className="text-accent-11 hover:underline">
              &larr; Back to home
            </Text>
          </Link>
        </Flex>
      </Container>
    </main>
  );
}
