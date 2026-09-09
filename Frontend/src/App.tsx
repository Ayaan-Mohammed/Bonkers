import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';
import {
  HomePage,
  SearchPage,
  ParcelDetailPage,
  ConsentPortalPage,
  OfficerDashboardPage,
  DeveloperSandboxPage,
  NotFoundPage,
} from '@/pages';

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/parcel/:ulpin" element={<ParcelDetailPage />} />
        <Route path="/consents" element={<ConsentPortalPage />} />
        <Route path="/officer-dashboard" element={<OfficerDashboardPage />} />
        <Route path="/dev-sandbox" element={<DeveloperSandboxPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Shell>
  );
}
