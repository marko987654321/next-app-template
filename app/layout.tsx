import '@mantine/core/styles.css';

import React from 'react';
import { 
  ColorSchemeScript, 
  mantineHtmlProps, 
  MantineProvider,
  AppShell,
  AppShellHeader,
  AppShellMain,
  Group,
  Title,
  Button,
  Container
} from '@mantine/core';
import Link from 'next/link';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { theme } from '../theme';

export const metadata = {
  title: 'Pokédex - Generation 1',
  description: 'Complete Pokédex for Generation 1 Pokémon (001-151)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <AppShell header={{ height: 70 }} padding="md">
            <AppShellHeader>
              <Container size="xl" h="100%">
                <Group h="100%" justify="space-between" align="center">
                  <Group>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                      <Title order={2} c="blue.6">Pokédex</Title>
                    </Link>
                  </Group>
                  
                  <Group>
                    <Button component={Link} href="/pokemon" variant="subtle">
                      Browse Pokémon
                    </Button>
                    <ColorSchemeToggle />
                  </Group>
                </Group>
              </Container>
            </AppShellHeader>
            
            <AppShellMain>
              <Container size="xl">
                {children}
              </Container>
            </AppShellMain>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
