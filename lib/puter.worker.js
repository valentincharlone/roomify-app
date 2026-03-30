const PROJECT_PREFIX = "roomify_project_";

const jsonError = (status, message, extra = {}) => {
  return new Response(
    JSON.stringify({
      error: message,
      ...extra,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
};

const getUserId = async (userPuter) => {
  try {
    const user = await userPuter.auth.getUser();
    return user?.uuid || null;
  } catch {
    return null;
  }
};

router.post("/api/projects/save", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;

    if (!userPuter) {
      return jsonError(401, "Error de autenticación", {
        message: "Iniciá sesión para guardar proyectos",
      });
    }

    const body = await request.json();
    const project = body?.project;

    if (!project?.id || !project?.sourceImage) {
      return jsonError(400, "Faltan datos del proyecto", {
        message: "Se requiere ID de proyecto e imagen de origen",
      });
    }

    const userId = await getUserId(userPuter);
    if (!userId) {
      return jsonError(401, "Error de autenticación", {
        message: "No se pudo obtener el usuario",
      });
    }

    const payload = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    const key = `${PROJECT_PREFIX}${project.id}`;
    await userPuter.kv.set(key, payload);

    return { saved: true, id: project.id, project: payload };
  } catch (error) {
    return jsonError(500, "No se pudo guardar el proyecto", {
      message: error?.message || "Error desconocido",
    });
  }
});

router.get("/api/projects/list", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;

    if (!userPuter) {
      return jsonError(401, "Error de autenticación", {
        message: "Iniciá sesión para ver tus proyectos",
      });
    }

    const userId = await getUserId(userPuter);
    if (!userId) {
      return jsonError(401, "Error de autenticación", {
        message: "No se pudo obtener el usuario",
      });
    }

    const entries = await userPuter.kv.list(`${PROJECT_PREFIX}*`, true);
    const projects = Array.isArray(entries)
      ? entries.map((entry) => entry.value)
      : [];

    return { projects };
  } catch (error) {
    return jsonError(500, "No se pudieron listar los proyectos", {
      message: error?.message || "Error desconocido",
    });
  }
});

router.get("/api/projects/get", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;

    if (!userPuter) {
      return jsonError(401, "Error de autenticación", {
        message: "Iniciá sesión para ver proyectos",
      });
    }

    const userId = await getUserId(userPuter);
    if (!userId) {
      return jsonError(401, "Error de autenticación", {
        message: "No se pudo obtener el usuario",
      });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return jsonError(400, "Falta el ID de proyecto", {
        message: "Incluí el parámetro id en la URL",
      });
    }

    const key = `${PROJECT_PREFIX}${id}`;
    const project = await userPuter.kv.get(key);

    if (!project) {
      return jsonError(404, "Proyecto no encontrado", {
        message: "No encontramos un proyecto con ese ID",
      });
    }

    return { project };
  } catch (error) {
    return jsonError(500, "No se pudo obtener el proyecto", {
      message: error?.message || "Error desconocido",
    });
  }
});
