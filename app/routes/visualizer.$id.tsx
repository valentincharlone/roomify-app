import { Button } from "components/ui/Button";
import { generate3DView } from "lib/ai.action";
import { createProject, getProjectById } from "lib/puter.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { useNavigate, useOutletContext, useParams } from "react-router";

const VisualizerId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, isSignedIn, signIn } = useOutletContext<AuthContext>();

  const hasInitialGenerated = useRef(false);

  const [project, setProject] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const handleBack = () => navigate("/");

  const handleExport = () => {
    if (!currentImage) return;

    try {
      const link = document.createElement("a");
      link.href = currentImage;
      link.download = project?.name
        ? `${project.name.replace(/\s+/g, "-").toLowerCase()}-plano3d.png`
        : "plano3d-render.png";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("No se pudo exportar la imagen", error);
    }
  };

  const runGeneration = async (item: DesignItem) => {
    if (!id || !item.sourceImage) return;

    try {
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: item.sourceImage });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        const updatedItem = {
          ...item,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: item.ownerId ?? userId ?? null,
          isPublic: item.isPublic ?? false,
        };

        const saved = await createProject({
          item: updatedItem,
          visibility: "private",
        });

        if (saved) {
          setProject(saved);
          setCurrentImage(saved.renderedImage || result.renderedImage);
        }
      }
    } catch (error) {
      console.error("Falló la generación del render", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      // Demo pública: no requiere cuenta ni datos previos
      if (id === "demo") {
        const demoProject: DesignItem = {
          id: "demo",
          name: "Departamento 2 ambientes - Demo",
          sourceImage:
            "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg",
          renderedImage:
            "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg",
          timestamp: Date.now(),
        };

        if (!isMounted) return;

        setProject(demoProject);
        setCurrentImage(demoProject.renderedImage || null);
        setIsProjectLoading(false);
        hasInitialGenerated.current = true;
        return;
      }

      if (!isSignedIn) {
        setProject(null);
        setCurrentImage(null);
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);

      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;

      setProject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !isSignedIn ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />

          <span className="name">Plano3D</span>
        </div>

        <div className="topbar-actions">
          {!isSignedIn && (
            <Button variant="secondary" size="sm" onClick={signIn}>
              Iniciar sesión
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleBack}
            className="exit"
          >
            <X className="icon" /> Salir del editor
          </Button>
        </div>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Proyecto</p>
              <h2>{project?.name || `Residencia ${id}`}</h2>
              <p className="note">Creado por vos</p>
            </div>

            <div className="panel-actions">
              <Button
                className="export"
                size="sm"
                onClick={handleExport}
                disabled={!currentImage}
              >
                <Download className="w-4 h-4 mr-2" /> Exportar
              </Button>

              <Button size="sm" onClick={() => {}} className="share">
                <Share2 className="w-4 h-4 mr-2" /> Compartir
              </Button>
            </div>
          </div>

          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {currentImage ? (
              <img src={currentImage} alt="Render de IA" className="render-img" />
            ) : (
              <div className="render-placeholder">
                {!isSignedIn && id !== "demo" ? (
                  <div className="text-center">
                    <p className="text-zinc-600 text-sm mb-4">
                      Iniciá sesión para ver tu proyecto.
                    </p>
                    <Button variant="secondary" size="sm" onClick={signIn}>
                      Iniciar sesión
                    </Button>
                  </div>
                ) : (
                  project?.sourceImage && (
                    <img
                      src={project?.sourceImage}
                      alt="Imagen original"
                      className="render-fallback"
                    />
                  )
                )}

                {isProcessing && (
                  <div className="render-overlay">
                    <div className="rendering-card">
                      <RefreshCcw className="spinner" />
                      <span className="title">Renderizando...</span>
                      <span className="subtitle">
                        Generando la vista 3D de tu espacio
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="panel compare">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Comparación</p>
              <h3>Antes y después</h3>
            </div>
            <div className="hint">Deslizá para comparar</div>
          </div>

          <div className="compare-stage">
            {project?.sourceImage && currentImage ? (
              <ReactCompareSlider
                defaultValue={50}
                style={{ width: "100%", height: "auto" }}
                itemOne={
                  <ReactCompareSliderImage
                    src={project?.sourceImage}
                    alt="Antes"
                    className="comapare-img"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={currentImage}
                    alt="Después"
                    className="comapare-img"
                  />
                }
              />
            ) : (
              <div className="compare-fallback">
                {project?.sourceImage && (
                  <img
                    src={project.sourceImage}
                    alt="Antes"
                    className="compare-img"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VisualizerId;
