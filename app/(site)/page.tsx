
'use client';
import * as React from 'react';
import { CssBaseline, Container, Box, Typography } from '@mui/material';
import InventoryTable from '@/components/InventoryTable';

export default function Page() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box py={3}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Inventory (TanStack Multi‑Layer)
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Status → Product → Service lines
          </Typography>
          <InventoryTable />
        </Box>
      </Container>
    </>
  );
}
