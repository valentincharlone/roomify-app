import NavBar from "components/NavBar";
import type { Route } from "./+types/home";
import { ArrowRightIcon, ArrowUpRight, ClockIcon, Layers } from "lucide-react";
import { Button } from "components/ui/Button";
import { Upload } from "components/Upload";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { createProject, getProjects } from "lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roomify - Visualizador 3D de espacios" },
    {
      name: "description",
      content:
        "Transformá planos y fotos en visualizaciones 3D con Roomify.",
    },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const isCreatingProjectRef = useRef(false);

  const handleUploadComplete = async (base64Image: string) => {
    try {
      if (isCreatingProjectRef.current) return false;
      isCreatingProjectRef.current = true;
      const newId = Date.now().toString();

      const name = `Residence ${newId}`;

      const newItem = {
        id: newId,
        name,
        sourceImage: base64Image,
        renderedImage: undefined,
        timestamp: Date.now(),
      };

      const saved = await createProject({
        item: newItem,
        visibility: "private",
      });

      if (!saved) {
        console.error("Failed to create project");
        return false;
      }

      setProjects((prev) => [saved, ...prev]);

      navigate(`/visualizer/${newId}`, {
        state: {
          initialImage: saved.sourceImage,
          initialRendered: saved.renderedImage || null,
          name,
        },
      });

      return true;
    } catch (error) {
    } finally {
      isCreatingProjectRef.current = false;
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const items = await getProjects();
      setProjects(items!);
    };

    fetchProjects();
  }, []);

  return (
    <div className="home">
      <NavBar />
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>

          <p>Te presentamos Roomify</p>
        </div>

        <h1>Diseñá espacios increíbles en segundos con Roomify</h1>

        <p className="subtitle">
          Transformá tus ideas en visualizaciones 3D sin esfuerzo, usando IA
          pensada para arquitectos, diseñadores y estudios.
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Empezar ahora <ArrowRightIcon className="icon" />
          </a>
          <Button variant="outline" size="lg" className="demo">
            Ver demo
          </Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />

          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>

              <h3>Subí tu imagen</h3>
              <p>Soporta JPG y PNG, hasta 10&nbsp;MB</p>
            </div>

            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Tus proyectos</h2>
              <p>Explorá tus visualizaciones y gestioná tus proyectos</p>
            </div>
          </div>

          <div className="projects-grid">
            {projects.map(
              ({ id, name, renderedImage, sourceImage, timestamp }) => (
                <div
                  key={id}
                  className="project-card group"
                  onClick={() => navigate(`/visualizer/${id}`)}
                >
                  <div className="preview">
                    <img
                      src={renderedImage || sourceImage}
                      alt="Vista previa del proyecto"
                    />

                    <div className="badge">
                      <span>Personal</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div>
                      <h3>{name}</h3>
                      <div className="meta">
                        <ClockIcon className="icon" size={12} />
                        <span>{new Date(timestamp).toLocaleDateString()}</span>
                        <span>Por vos</span>
                      </div>
                    </div>

                    <div className="arrow">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
