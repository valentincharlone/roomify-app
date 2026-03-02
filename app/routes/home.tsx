import NavBar from "components/NavBar";
import type { Route } from "./+types/home";
import { ArrowRightIcon, ArrowUpRight, ClockIcon, Layers } from "lucide-react";
import { Button } from "components/ui/Button";
import { Upload } from "components/Upload";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  const handleUploadComplete = async (base64Image: string) => {
    const newId = Date.now().toString();

    navigate(`/visualizer/${newId}`);

    return true;
  };
  return (
    <div className="home">
      <NavBar />
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>

          <p>Introducing Roomify</p>
        </div>

        <h1>Build beautiful spaces at the speed of thought with Roomify</h1>

        <p className="subtitle">
          Transform your ideas into stunning visualizations with Roomify's
          intuitive design tools and collaborative features.
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Get Started <ArrowRightIcon className="icon" />
          </a>
          <Button variant="outline" size="lg" className="demo">
            View Demo
          </Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />

          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>

              <h3>Upload your image</h3>
              <p>Supports JPG, PNG, formats up to 10MB</p>
            </div>

            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Your Projects</h2>
              <p>Explore your visualizations and manage your projects</p>
            </div>
          </div>

          <div className="projects-grid">
            <div className="project-card group">
              <div className="preview">
                <img
                  src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png"
                  alt="Project Preview"
                />

                <div className="badge">
                  <span>Community</span>
                </div>
              </div>

              <div className="card-body">
                <div>
                  <h3>Modern Living Room</h3>
                  <div className="meta">
                    <ClockIcon className="icon" size={12} />
                    <span>{new Date().toLocaleDateString()}</span>
                    <span>By John Doe</span>
                  </div>
                </div>

                <div className="arrow">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
