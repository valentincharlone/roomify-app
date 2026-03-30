import NavBar from "components/NavBar";
import type { Route } from "./+types/home";
import { ArrowRightIcon, ArrowUpRight, ClockIcon, Layers } from "lucide-react";
import { Button } from "components/ui/Button";
import { Upload } from "components/Upload";
import { useNavigate, useOutletContext } from "react-router";
import { useEffect, useRef, useState } from "react";
import { createProject, getProjects } from "lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Plano3D - Renders rápidos para arquitectura" },
    {
      name: "description",
      content:
        "Convertí planos en renders preliminares para presentar a clientes. Ideal para estudios de arquitectura e interiorismo en Argentina.",
    },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const { isSignedIn, signIn } = useOutletContext<AuthContext>();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const isCreatingProjectRef = useRef(false);

  const handleUploadComplete = async (base64Image: string) => {
    try {
      if (isCreatingProjectRef.current) return false;
      isCreatingProjectRef.current = true;
      const newId = Date.now().toString();

      const name = `Proyecto ${newId}`;

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
    if (!isSignedIn) return;

    const fetchProjects = async () => {
      const items = await getProjects();
      setProjects(items!);
    };

    fetchProjects();
  }, [isSignedIn]);

  return (
    <div className="home">
      <NavBar />
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>

          <p>Para arquitectura e interiorismo</p>
        </div>

        <h1>
          Pasá de plano a render preliminar en minutos con{" "}
          <span className="brand-highlight">Plano3D</span>
        </h1>

        <p className="subtitle">
          Subí un plano o una foto y obtené una visualización lista para
          presentar y mandar por WhatsApp al cliente. Pensado para estudios y
          profesionales en Argentina.
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Empezar ahora <ArrowRightIcon className="icon" />
          </a>
          <Button
            variant="outline"
            size="lg"
            className="demo"
            onClick={() => navigate("/visualizer/demo")}
          >
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
              <p>Plano, croquis o foto. JPG/PNG, hasta 10&nbsp;MB</p>
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
            {isSignedIn ? (
              projects.map(
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
                )
              )
            ) : (
              <div className="empty">
                <p>
                  Iniciá sesión para ver y gestionar tus proyectos.
                </p>
                <div style={{ marginTop: 12 }}>
                  <Button size="lg" onClick={signIn} variant="secondary">
                    Iniciar sesión
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="pricing">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Planes pensados para estudios</h2>
              <p>
                Precios orientativos en pesos argentinos. Cobrále a tu cliente
                como siempre, pagá Plano3D con Mercado Pago.
              </p>
            </div>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Freelancer</h3>
              <p className="price">
                Desde <span className="amount">$15.000</span> / mes
              </p>
              <ul>
                <li>Hasta 20 renders preliminares</li>
                <li>Ideal para proyectos puntuales</li>
                <li>Soporte por mail</li>
              </ul>
              <p className="note">
                Pagás mes a mes con Mercado Pago, sin contrato mínimo.
              </p>
            </div>

            <div className="pricing-card featured">
              <h3>Estudio</h3>
              <p className="price">
                Desde <span className="amount">$35.000</span> / mes
              </p>
              <ul>
                <li>Hasta 60 renders preliminares</li>
                <li>Varios proyectos en paralelo</li>
                <li>Soporte prioritario</li>
              </ul>
              <p className="note">
                Pensado para estudios de arquitectura e interiorismo que
                renderizan todas las semanas.
              </p>
            </div>

            <div className="pricing-card">
              <h3>Desarrolladora</h3>
              <p className="price">
                A medida <span className="amount">por proyecto</span>
              </p>
              <ul>
                <li>Volumen alto de renders</li>
                <li>Soporte dedicado</li>
                <li>Integración con tu flujo actual</li>
              </ul>
              <p className="note">
                Hablemos y armamos un esquema a medida para tu equipo comercial.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
