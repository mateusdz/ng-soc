export const env = {
  soarcaApiBase: import.meta.env.VITE_SOARCA_API_BASE ?? "/api/soarca",
  roasterBase: import.meta.env.VITE_ROASTER_BASE ?? "/roaster",
  soarcaGuiBase: import.meta.env.VITE_SOARCA_GUI_BASE ?? "/executions",
  roasterEmbedUrl: import.meta.env.VITE_ROASTER_EMBED_URL ?? "http://127.0.0.1:3000",
  soarcaGuiEmbedUrl: import.meta.env.VITE_SOARCA_GUI_EMBED_URL ?? "http://127.0.0.1:8081",
  ngSoarApiBase: import.meta.env.VITE_NG_SOAR_API_BASE ?? "/api/ng-soar"
};
