import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { CruiseDetailPage } from "./pages/CruiseDetailPage";
import { BookingPage } from "./pages/BookingPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { Dashboard } from "./pages/Dashboard";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { Layout } from "./components/Layout";
import { PaymentResultPage } from "./pages/PaymentResultPage";
import { BookingDetailPage } from './pages/BookingDetailPage'; 
import { AboutPage } from './pages/AboutPage';
import { OffersPage } from './pages/OffersPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cruise/:id" element={<CruiseDetailPage />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          // ... trong phần khai báo 
          <Route path="/booking/:id" element={<BookingDetailPage />} />
          // Thêm :bookingId vào cuối path để React Router hiểu đây là một biến
          <Route path="/checkout/payment/:bookingId?" element={<CheckoutPage />} />
        </Route>
        
        {/* Các trang không dùng chung Layout (như Login, Admin) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}



export default App;