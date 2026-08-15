import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ProducerDashboardPage } from '../pages/ProducerDashboardPage';
import { ProductListPage } from '../pages/ProductListPage';
import { ProductCreatePage } from '../pages/ProductCreatePage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductEditPage } from '../pages/ProductEditPage';
import { AudioCapturePage } from '../pages/AudioCapturePage';
import { SoftwareAudioCapturePage } from '../pages/SoftwareAudioCapturePage';
import { AcousticAnalysisPage } from '../pages/AcousticAnalysisPage';
import { ProvenanceDetailPage } from '../pages/ProvenanceDetailPage';
import { PublicProductVerificationPage } from '../pages/PublicProductVerificationPage';
import { ProvenanceListPage } from '../pages/ProvenanceListPage';
import { CertifierDashboardPage } from '../pages/CertifierDashboardPage';
import { SecurityDashboardPage } from '../pages/SecurityDashboardPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleRoute } from '../components/RoleRoute';

export const AppRoutes: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Public Consumer QR Verification & Provenance Certificate Detail */}
        <Route path="/verify/:productId" element={<PublicProductVerificationPage />} />
        <Route path="/provenance/:provenanceId" element={<ProvenanceDetailPage />} />

        {/* Protected Authenticated Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Direct Product Routes */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <ProductCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/create"
          element={
            <ProtectedRoute>
              <ProductCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute>
              <ProductEditPage />
            </ProtectedRoute>
          }
        />

        {/* Direct Audio Capture & Acoustic DSP Routes */}
        <Route
          path="/audio/capture"
          element={
            <ProtectedRoute>
              <AudioCapturePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audio/upload"
          element={
            <ProtectedRoute>
              <SoftwareAudioCapturePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acoustic-analysis/:id"
          element={
            <ProtectedRoute>
              <AcousticAnalysisPage />
            </ProtectedRoute>
          }
        />

        {/* Direct Provenance List Route */}
        <Route
          path="/provenance"
          element={
            <ProtectedRoute>
              <ProvenanceListPage />
            </ProtectedRoute>
          }
        />

        {/* Producer Nested Routes */}
        <Route
          path="/producer"
          element={<Navigate to="/producer/dashboard" replace />}
        />
        <Route
          path="/producer/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['PRODUCER', 'ADMIN']}>
                <ProducerDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/producer/products"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['PRODUCER', 'ADMIN']}>
                <ProductListPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/producer/products/new"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['PRODUCER', 'ADMIN']}>
                <ProductCreatePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/producer/products/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['PRODUCER', 'ADMIN']}>
                <ProductDetailPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/producer/products/:id/edit"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['PRODUCER', 'ADMIN']}>
                <ProductEditPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/producer/products/:id/audio"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['PRODUCER', 'ADMIN']}>
                <AudioCapturePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/producer/audio-capture"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['PRODUCER', 'ADMIN']}>
                <SoftwareAudioCapturePage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/producer/acoustic-analysis/:captureId"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['PRODUCER', 'ADMIN']}>
                <AcousticAnalysisPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/producer/provenance"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['PRODUCER', 'ADMIN']}>
                <ProvenanceListPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Certifier Routes */}
        <Route
          path="/certifier"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['CERTIFIER', 'REGULATOR', 'ADMIN']}>
                <CertifierDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/certifier/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['CERTIFIER', 'REGULATOR', 'ADMIN']}>
                <CertifierDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Security & Fraud Monitor Routes */}
        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['CERTIFIER', 'REGULATOR', 'ADMIN']}>
                <SecurityDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['CERTIFIER', 'REGULATOR', 'ADMIN']}>
                <SecurityDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Fallback Unknown Route Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};
