/**
 * uiTranslations.js
 * Local UI translation dictionary for English, Spanish, and French.
 * Enables zero-API offline translation of the entire REUNITE AI interface.
 */

export const locales = {
  en: {
    // Navbar
    dashboard: "Dashboard",
    reportIncident: "Report Incident",
    opsConsole: "Operations Console",
    tagline: "FIFA World Cup Operations Suite",
    
    // Dashboard Stats
    totalActive: "Total Active Incidents",
    resolvedCases: "Resolved Cases",
    pendingVerification: "Pending Verification",
    avgMatchTime: "Average Match Time",
    realtimeFeed: "Real-time feed",
    sec: "sec",
    
    // Predictive Operations
    predictiveOps: "Predictive Stadium Operations & Intelligence",
    predictiveOpsDesc: "AI analysis of lost item patterns, crowd flow data, and reported locations to optimize volunteer deployment.",
    heatmapTitle: "📍 Heatmap & Congestion Zones",
    volunteerRec: "🤖 Volunteer Deployment Recommendations",
    crowdFlowTitle: "📊 Busy Gates & Crowd Predictions",
    activeIncidents: "Active Incidents",
    unclaimedItems: "Awaiting Owner Reports",
    
    // Form Labels
    logFound: "Log Found Item",
    logFoundDesc: "Upload visual data or descriptions of items retrieved by stadium hostesses or stewards.",
    itemDesc: "Item Description",
    foundLoc: "Found Location",
    startSearch: "Start AI Match Search",
    prefillNike: "Pre-fill Nike Backpack",
    prefillPassport: "Pre-fill German Passport",
    prefillMaya: "Pre-fill Lost Child (Maya)",
    
    // Sustainability
    sustainabilityTitle: "🍃 Green Stadium Sustainability Impact",
    sustainabilityDesc: "Reunited items reduce carbon footprint and electronic waste. Calculated from active stadium return rates.",
    co2Saved: "Est. CO2 Carbon Offset",
    ewasteSaved: "Landfill Waste Prevented",
    sustainabilityKpi: "Operational Sustainability Rating",
    
    // AI Match Card
    potentialMatch: "Potential Match Found",
    confidence: "Confidence",
    reportedPhoto: "Reported Photo",
    foundPhoto: "Found Photo",
    aiReasoning: "AI Visual & Semantic Reasoning",
    incidentTimeline: "AI Incident Timeline",
    ownerVerification: "Suggested Owner Verification",
    decisionSupportRec: "Decision Support Recommendation",
    confirmReturn: "Confirm Return & Resolve",
    resetView: "Reset View",
  },
  es: {
    // Navbar
    dashboard: "Panel de Control",
    reportIncident: "Reportar Incidente",
    opsConsole: "Consola de Operaciones",
    tagline: "Suite de Operaciones de la Copa Mundial de la FIFA",
    
    // Dashboard Stats
    totalActive: "Total de Incidentes Activos",
    resolvedCases: "Casos Resueltos",
    pendingVerification: "Pendiente de Verificación",
    avgMatchTime: "Tiempo Promedio de Coincidencia",
    realtimeFeed: "Transmisión en tiempo real",
    sec: "seg",
    
    // Predictive Operations
    predictiveOps: "Operaciones Predictivas e Inteligencia de Estadio",
    predictiveOpsDesc: "Análisis de patrones de objetos perdidos, flujo de multitudes y ubicaciones reportadas para optimizar voluntarios.",
    heatmapTitle: "📍 Zonas de Congestión e Incidencias",
    volunteerRec: "🤖 Recomendaciones de Despliegue de Voluntarios",
    crowdFlowTitle: "📊 Puertas Ocupadas y Predicciones de Multitud",
    activeIncidents: "Incidentes Activos",
    unclaimedItems: "Reportes en Espera de Propietario",
    
    // Form Labels
    logFound: "Registrar Objeto Encontrado",
    logFoundDesc: "Suba datos visuales o descripciones de objetos recuperados por azafatas o auxiliares.",
    itemDesc: "Descripción del Objeto",
    foundLoc: "Ubicación del Hallazgo",
    startSearch: "Iniciar Búsqueda de Coincidencia AI",
    prefillNike: "Rellenar Mochila Nike",
    prefillPassport: "Rellenar Pasaporte Alemán",
    prefillMaya: "Rellenar Niña Perdida (Maya)",
    
    // Sustainability
    sustainabilityTitle: "🍃 Impacto de Sostenibilidad del Estadio Verde",
    sustainabilityDesc: "Los objetos devueltos reducen la huella de carbono y los desechos electrónicos.",
    co2Saved: "Compensación Est. de CO2",
    ewasteSaved: "Desechos Evitados en Vertederos",
    sustainabilityKpi: "Calificación de Sostenibilidad Operativa",
    
    // AI Match Card
    potentialMatch: "Posible Coincidencia Encontrada",
    confidence: "Confianza",
    reportedPhoto: "Foto Reportada",
    foundPhoto: "Foto Encontrada",
    aiReasoning: "Razonamiento Visual y Semántico de IA",
    incidentTimeline: "Cronología del Incidente de IA",
    ownerVerification: "Verificación de Propietario Sugerida",
    decisionSupportRec: "Recomendación de Soporte de Decisión",
    confirmReturn: "Confirmar Entrega y Resolver",
    resetView: "Restablecer Vista",
  },
  fr: {
    // Navbar
    dashboard: "Tableau de Bord",
    reportIncident: "Signaler un Incident",
    opsConsole: "Console d'Opérations",
    tagline: "Suite des Opérations de la Coupe du Monde de la FIFA",
    
    // Dashboard Stats
    totalActive: "Total des Incidents Actifs",
    resolvedCases: "Casos Résolus",
    pendingVerification: "En Attente de Vérification",
    avgMatchTime: "Temps Moyen de Correspondance",
    realtimeFeed: "Flux en temps réel",
    sec: "sec",
    
    // Predictive Operations
    predictiveOps: "Opérations Prédictives et Intelligence du Stade",
    predictiveOpsDesc: "Analyse des objets perdus, flux de foule et zones signalées pour optimiser le déploiement des bénévoles.",
    heatmapTitle: "📍 Zones de Congestion et d'Incidents",
    volunteerRec: "🤖 Recommandations de Déploiement des Bénévoles",
    crowdFlowTitle: "📊 Prédictions des Portes et Flux de Foule",
    activeIncidents: "Incidents Actifs",
    unclaimedItems: "Rapports en Attente du Propriétaire",
    
    // Form Labels
    logFound: "Enregistrer un Objet Trouvé",
    logFoundDesc: "Téléchargez des photos ou descriptions des objets trouvés par les stewards ou hôtesses.",
    itemDesc: "Description de l'Objet",
    foundLoc: "Lieu de la Découverte",
    startSearch: "Lancer la Recherche de Correspondance IA",
    prefillNike: "Pré-remplir Sac Nike",
    prefillPassport: "Pré-remplir Passeport Allemand",
    prefillMaya: "Pré-remplir Enfant Perdu (Maya)",
    
    // Sustainability
    sustainabilityTitle: "🍃 Impact Écologique du Stade Durable",
    sustainabilityDesc: "La restitution d'objets réduit l'empreinte carbone et le gaspillage d'équipements.",
    co2Saved: "Compensation CO2 Estimée",
    ewasteSaved: "Déchets Évités en Décharge",
    sustainabilityKpi: "Note de Sostenabilité Opérationnelle",
    
    // AI Match Card
    potentialMatch: "Correspondance Potentielle Trouvée",
    confidence: "Confiance",
    reportedPhoto: "Photo Signalée",
    foundPhoto: "Photo Trouvée",
    aiReasoning: "Raisonnement Visuel & Sémantique IA",
    incidentTimeline: "Chronologie de l'Incident IA",
    ownerVerification: "Questions de Vérification Suggérées",
    decisionSupportRec: "Recommandation d'Aide à la Décision",
    confirmReturn: "Confirmer la Remise et Résoudre",
    resetView: "Réinitialiser la Vue",
  }
};
