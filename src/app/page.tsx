import { JoinDialog } from "@/components/join-dialog";
import { Button, Container, Flex, Separator, Text } from "@radix-ui/themes";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-12 p-6 sm:p-24">
      <Container size="1">
        <Flex direction="column" align="center" gap="5">
          <Image
            src="/logo.svg"
            alt="Svistic streaming logo"
            width="240"
            height="120"
            className="invert dark:invert-0 mt-8 mb-2"
          />
          <Text as="p">Welcome to the stream.</Text>
          <JoinDialog>
            <Button size="3" className="w-full">
              Watch a stream
            </Button>
          </JoinDialog>
        </Flex>
      </Container>
    </main>
  );
}
