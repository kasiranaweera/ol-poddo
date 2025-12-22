import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Button } from "../components/common/Button";
import { Accordion } from "../components/common/Accordion";
import {
  Activity,
  BookOpen,
  CaseSensitive,
  FileText,
  FileType,
  Languages,
  Library,
  Microscope,
  Pi,
  Users,
} from "lucide-react";
import studentsImage from "../assets/img-1.jpg";
import Logo from "../components/Logo";

export const Home = () => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 font-bold text-xl justify-center mb-8">
            <Logo height={100} width={"auto"}/>
          </div>
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold">
              Your Complete O/L <br /> Success Platform
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Access thousands of past papers, textbooks, notes, and resources -
              all in one place, completely free
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 items-center">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                Browse Resources
              </Button>
              <Button variant="outline">Download</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="container mx-auto px-4 mt-12 gap-4 grid-cols-2 md:grid-cols-4 grid">
          <Link to="/resources">
            <div className="flex justify-center items-center gap-4 p-4 border rounded-lg shadow bg-card border-border text-muted-foreground hover:text-secondary transition-colors">
              <FileText className="w-12 h-12" />
              <div className="text-xl  font-medium">
                500+ <br />
                Past Papers
              </div>
            </div>
          </Link>
          <Link to="/resources">
            <div className="flex justify-center items-center gap-4 p-4 border rounded-lg shadow bg-card border-border text-muted-foreground hover:text-secondary transition-colors">
              <BookOpen className="w-12 h-12" />
              <div className="text-xl  font-medium">
                100+ <br />
                Textbooks
              </div>
            </div>
          </Link>
          <Link to="/resources">
            <div className="flex justify-center items-center gap-4 p-4 border rounded-lg shadow bg-card border-border text-muted-foreground hover:text-secondary transition-colors">
              <FileType className="w-12 h-12" />
              <div className="text-xl  font-medium">
                200+ <br />
                Revision Notes
              </div>
            </div>
          </Link>
          <Link to="/resources">
            <div className="flex justify-center items-center gap-4 p-4 border rounded-lg shadow bg-card border-border text-muted-foreground hover:text-secondary transition-colors">
              <Users className="w-12 h-12" />
              <div className="text-xl  font-medium">
                50+ <br />
                Happy Students
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Why Students Trust Us
            </h2>
            <p className="text-muted-foreground">
              Our commitment to quality and accessibility
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="mx-auto w-full">
              <img
                className="rounded-xl"
                width="full"
                src={studentsImage}
                alt="studentsImage"
              />
            </div>
            <div className="mx-auto w-full">
              <Accordion items={keyPoints} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              What You'll Find Here
            </h2>
            <p className="text-muted-foreground">
              Choose your subject and access everything you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-8">
              <div>
                <h5 className="text-2xl mb-4">Explore by Subject</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 flex gap-4 justify-center items-center hover:bg-muted transition-colors">
                    <Pi className="text-xl" />
                    <div className="text-xl">Mathematics</div>
                  </div>
                  <div className="border rounded-lg p-4 flex gap-4 justify-center items-center hover:bg-muted transition-colors">
                    <Microscope className="text-xl" />
                    <div className="text-xl">Science</div>
                  </div>
                  <div className="border rounded-lg p-4 flex gap-4 justify-center items-center hover:bg-muted transition-colors">
                    <Languages className="text-xl" />
                    <div className="text-xl">Sinhala</div>
                  </div>
                  <div className="border rounded-lg p-4 flex gap-4 justify-center items-center hover:bg-muted transition-colors">
                    <Library className="text-xl" />
                    <div className="text-xl">History</div>
                  </div>
                  <div className="border rounded-lg p-4 flex gap-4 justify-center items-center hover:bg-muted transition-colors">
                    <CaseSensitive className="text-xl" />
                    <div className="text-xl">English</div>
                  </div>
                  <div className="border rounded-lg p-4 flex gap-4 justify-center items-center hover:bg-muted transition-colors">
                    <Activity className="text-xl" />
                    <div className="text-xl">Buddhism</div>
                  </div>
                </div>
              </div>
              <div className="">
                <h5 className="text-2xl">Explore by Subject</h5>
                <p className="text-muted-foreground">
                  Fresh resources uploaded this week
                </p>
                <ul className="list-disc list-inside mt-4">
                  <li>2024 Mathematics Paper I & II with Marking Schemes</li>
                  <li>Grade 11 Science Textbook (New Syllabus)</li>
                  <li>Complete History Revision Notes</li>
                  <li>Buddhism Model Papers Collection</li>
                  <li>Grade 10 Science Textbook (New Syllabus)</li>
                </ul>
              </div>
              <Button
                variant="text"
                size="small"
                className="border rounded-lg px-4 py-1 hover:bg-muted"
              >
                See All Resources
              </Button>{" "}
            </div>
            <div>
              <h5 className="text-2xl mb-4">Resource Types</h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="border rounded-lg p-4 flex gap-4 items-center hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📝</div>
                    <div className="">
                      <h6>Past Papers</h6>
                      <p className="text-muted-foreground">
                        Complete question papers with marking schemes from the
                        last 15 years
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 flex gap-4 items-center hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📚</div>
                    <div className="">
                      <h6>Textbooks</h6>
                      <p className="text-muted-foreground">
                        Official textbooks and reference books for all subjects
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 flex gap-4 items-center hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">✍️</div>
                    <div className="">
                      <h6>Revision Notes</h6>
                      <p className="text-muted-foreground">
                        Concise, exam-focused notes prepared by experienced
                        teachers
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 flex gap-4 items-center hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📊</div>
                    <div className="">
                      <h6>Model Papers</h6>
                      <p className="text-muted-foreground">
                        Practice papers designed to match exam patterns
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 flex gap-4 items-center hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🎯</div>
                    <div className="">
                      <h6>Quick Guides</h6>
                      <p className="text-muted-foreground">
                        Short lessons and summary sheets for last-minute
                        revision
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto px-4">
          <div className="bg-card border border-border rounded-lg p-12 text-center space-y-4">
            <h2 className="text-3xl font-bold">
              Start Your Journey to Success Today
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who are already using our platform to
              achieve their O/L goals. Everything you need is just a click away.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    id: 1,
    icon: "⚡",
    title: "Fast & Modern",
    description:
      "Built with Vite for lightning-fast development and optimized production builds.",
  },
  {
    id: 2,
    icon: "🎨",
    title: "Beautiful UI",
    description:
      "Stunning components with shadcn/ui and Tailwind CSS for amazing designs.",
  },
  {
    id: 3,
    icon: "🛣️",
    title: "Smart Routing",
    description:
      "Powered by React Router for seamless navigation and dynamic routing.",
  },
  {
    id: 4,
    icon: "🌓",
    title: "Theme Support",
    description:
      "Light and dark modes with beautiful amber gradients and zinc colors.",
  },
  {
    id: 5,
    icon: "👤",
    title: "User Auth",
    description: "Built-in authentication with user profiles and avatars.",
  },
  {
    id: 6,
    icon: "📱",
    title: "Responsive",
    description: "Mobile-first design that looks great on all devices.",
  },
];

const keyPoints = [
  {
    title: "Comprehensive Coverage",
    content:
      "Every subject, every year, every paper type. From 2016 to 2024, we have collected the most complete database of O/L resources in Sri Lanka. Whether you're studying in Sinhala, English, or Tamil medium, you'll find everything you need here.",
  },
  {
    title: "Easy to Navigate",
    content:
      "No more wasting time searching through cluttered websites. Our platform is organized logically by subject and year. Find what you need in seconds, download instantly, and start studying.",
  },
  {
    title: "Quality Assured",
    content:
      "All resources are verified by experienced teachers. Past papers include official marking schemes, notes are exam-focused, and textbooks are from trusted publishers. We only share materials that truly help you succeed.",
  },
  {
    title: "Always Free",
    content:
      "Education is a right, not a privilege. Every resource on this platform is completely free and will remain free forever. No hidden charges, no subscriptions, no ads blocking your downloads.",
  },
];
