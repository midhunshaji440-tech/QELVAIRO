import { Navigate, Route, Routes } from "react-router";
import BrandIntro from "./components/BrandIntro.jsx";
import SiteChrome from "./components/SiteChrome.jsx";
import OnePage from "./pages/OnePage.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <>
      <BrandIntro />
      <Routes>
        <Route path="/" element={<SiteChrome><OnePage /></SiteChrome>} />
        <Route path="/admin" element={<SiteChrome><Admin /></SiteChrome>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
