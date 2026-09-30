import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import ReportIncident from "@/pages/ReportIncident";
import SurveyResponses from "@/pages/SurveyResponses";
import TakeSurvey from "@/pages/TakeSurvey";

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportIncident />} />
        <Route path="/responses" element={<SurveyResponses />} />
        <Route path="/survey" element={<TakeSurvey />} />
      </Routes>
      <Toaster />
    </>
  );
}
