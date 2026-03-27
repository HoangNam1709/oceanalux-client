import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { CruiseDetailPage } from "./pages/CruiseDetailPage";
import { BookingPage } from "./pages/BookingPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { Layout } from "./components/Layout";

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
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
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