import Hero from "@/components/Hero";
import ChatSection from "@/components/ChatSection";
import About from "@/components/About";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import CurrentlyBuilding from "@/components/CurrentlyBuilding";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Hero />

      <ChatSection id="about" question="Who are you?" title="About Me">
        <About />
      </ChatSection>

      <ChatSection id="projects" question="What have you built?" title="My Projects">
        <Projects />
      </ChatSection>

      <ChatSection id="tech-stack" question="What's your tech stack?" title="Tech Stack">
        <TechStack />
      </ChatSection>

      <ChatSection
        id="currently-building"
        question="What are you working on right now?"
        title="Currently Building"
      >
        <CurrentlyBuilding />
      </ChatSection>

      <ChatSection id="contact" question="How can I reach you?" title="Contact">
        <Contact />
      </ChatSection>
    </>
  );
}
