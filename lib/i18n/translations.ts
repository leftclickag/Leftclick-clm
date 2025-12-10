// Multi-Language Support System

export type SupportedLocale = "de" | "en" | "fr" | "es" | "it" | "nl";

export interface TranslationStrings {
  // Common
  common: {
    next: string;
    back: string;
    submit: string;
    cancel: string;
    save: string;
    loading: string;
    error: string;
    success: string;
    required: string;
    optional: string;
    yes: string;
    no: string;
  };
  // Widget
  widget: {
    startButton: string;
    stepOf: string;
    progress: string;
    almostDone: string;
    complete: string;
  };
  // Form
  form: {
    email: string;
    emailPlaceholder: string;
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
    message: string;
    privacyConsent: string;
    marketingConsent: string;
    invalidEmail: string;
    requiredField: string;
  };
  // Completion
  completion: {
    congratulations: string;
    thankYou: string;
    checkEmail: string;
    downloadPdf: string;
    shareResult: string;
  };
  // Social Proof
  socialProof: {
    peopleCompleted: string;
    todayCount: string;
    weekCount: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
  };
  // Exit Intent
  exitIntent: {
    waitTitle: string;
    specialOffer: string;
    stayButton: string;
    leaveButton: string;
  };
  // Errors
  errors: {
    generic: string;
    network: string;
    validation: string;
    notFound: string;
  };
}

const translations: Record<SupportedLocale, TranslationStrings> = {
  de: {
    common: {
      next: "Weiter",
      back: "Zurück",
      submit: "Absenden",
      cancel: "Abbrechen",
      save: "Speichern",
      loading: "Laden...",
      error: "Fehler",
      success: "Erfolg",
      required: "Erforderlich",
      optional: "Optional",
      yes: "Ja",
      no: "Nein",
    },
    widget: {
      startButton: "Jetzt starten",
      stepOf: "Schritt {current} von {total}",
      progress: "{percent}% abgeschlossen",
      almostDone: "Fast geschafft!",
      complete: "Abgeschlossen",
    },
    form: {
      email: "E-Mail-Adresse",
      emailPlaceholder: "deine@email.de",
      firstName: "Vorname",
      lastName: "Nachname",
      company: "Unternehmen",
      phone: "Telefon",
      message: "Nachricht",
      privacyConsent: "Ich stimme der Datenschutzerklärung zu",
      marketingConsent: "Ich möchte Updates und Angebote per E-Mail erhalten",
      invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein",
      requiredField: "Dieses Feld ist erforderlich",
    },
    completion: {
      congratulations: "🎉 Gratulation!",
      thankYou: "Vielen Dank für deine Teilnahme!",
      checkEmail: "Wir haben dir eine E-Mail gesendet.",
      downloadPdf: "PDF herunterladen",
      shareResult: "Ergebnis teilen",
    },
    socialProof: {
      peopleCompleted: "{count} Personen haben das gemacht",
      todayCount: "{count} heute",
      weekCount: "{count} diese Woche",
      justNow: "gerade eben",
      minutesAgo: "vor {count} Minuten",
      hoursAgo: "vor {count} Stunden",
    },
    exitIntent: {
      waitTitle: "Warte! Bevor du gehst...",
      specialOffer: "Hier ist ein spezielles Angebot für dich:",
      stayButton: "Ja, ich will das!",
      leaveButton: "Nein, danke",
    },
    errors: {
      generic: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
      network: "Netzwerkfehler. Bitte überprüfe deine Verbindung.",
      validation: "Bitte überprüfe deine Eingaben.",
      notFound: "Die angeforderte Ressource wurde nicht gefunden.",
    },
  },

  en: {
    common: {
      next: "Next",
      back: "Back",
      submit: "Submit",
      cancel: "Cancel",
      save: "Save",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      required: "Required",
      optional: "Optional",
      yes: "Yes",
      no: "No",
    },
    widget: {
      startButton: "Get Started",
      stepOf: "Step {current} of {total}",
      progress: "{percent}% complete",
      almostDone: "Almost there!",
      complete: "Complete",
    },
    form: {
      email: "Email Address",
      emailPlaceholder: "your@email.com",
      firstName: "First Name",
      lastName: "Last Name",
      company: "Company",
      phone: "Phone",
      message: "Message",
      privacyConsent: "I agree to the Privacy Policy",
      marketingConsent: "I want to receive updates and offers via email",
      invalidEmail: "Please enter a valid email address",
      requiredField: "This field is required",
    },
    completion: {
      congratulations: "🎉 Congratulations!",
      thankYou: "Thank you for participating!",
      checkEmail: "We've sent you an email.",
      downloadPdf: "Download PDF",
      shareResult: "Share Result",
    },
    socialProof: {
      peopleCompleted: "{count} people have done this",
      todayCount: "{count} today",
      weekCount: "{count} this week",
      justNow: "just now",
      minutesAgo: "{count} minutes ago",
      hoursAgo: "{count} hours ago",
    },
    exitIntent: {
      waitTitle: "Wait! Before you go...",
      specialOffer: "Here's a special offer for you:",
      stayButton: "Yes, I want this!",
      leaveButton: "No, thanks",
    },
    errors: {
      generic: "An error occurred. Please try again.",
      network: "Network error. Please check your connection.",
      validation: "Please check your inputs.",
      notFound: "The requested resource was not found.",
    },
  },

  fr: {
    common: {
      next: "Suivant",
      back: "Retour",
      submit: "Envoyer",
      cancel: "Annuler",
      save: "Enregistrer",
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      required: "Requis",
      optional: "Optionnel",
      yes: "Oui",
      no: "Non",
    },
    widget: {
      startButton: "Commencer",
      stepOf: "Étape {current} sur {total}",
      progress: "{percent}% terminé",
      almostDone: "Presque terminé!",
      complete: "Terminé",
    },
    form: {
      email: "Adresse e-mail",
      emailPlaceholder: "votre@email.fr",
      firstName: "Prénom",
      lastName: "Nom",
      company: "Entreprise",
      phone: "Téléphone",
      message: "Message",
      privacyConsent: "J'accepte la politique de confidentialité",
      marketingConsent: "Je souhaite recevoir des mises à jour par e-mail",
      invalidEmail: "Veuillez entrer une adresse e-mail valide",
      requiredField: "Ce champ est obligatoire",
    },
    completion: {
      congratulations: "🎉 Félicitations!",
      thankYou: "Merci pour votre participation!",
      checkEmail: "Nous vous avons envoyé un e-mail.",
      downloadPdf: "Télécharger le PDF",
      shareResult: "Partager le résultat",
    },
    socialProof: {
      peopleCompleted: "{count} personnes ont fait cela",
      todayCount: "{count} aujourd'hui",
      weekCount: "{count} cette semaine",
      justNow: "à l'instant",
      minutesAgo: "il y a {count} minutes",
      hoursAgo: "il y a {count} heures",
    },
    exitIntent: {
      waitTitle: "Attendez! Avant de partir...",
      specialOffer: "Voici une offre spéciale pour vous:",
      stayButton: "Oui, je le veux!",
      leaveButton: "Non, merci",
    },
    errors: {
      generic: "Une erreur s'est produite. Veuillez réessayer.",
      network: "Erreur réseau. Vérifiez votre connexion.",
      validation: "Veuillez vérifier vos entrées.",
      notFound: "La ressource demandée n'a pas été trouvée.",
    },
  },

  es: {
    common: {
      next: "Siguiente",
      back: "Atrás",
      submit: "Enviar",
      cancel: "Cancelar",
      save: "Guardar",
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      required: "Requerido",
      optional: "Opcional",
      yes: "Sí",
      no: "No",
    },
    widget: {
      startButton: "Empezar",
      stepOf: "Paso {current} de {total}",
      progress: "{percent}% completado",
      almostDone: "¡Casi listo!",
      complete: "Completado",
    },
    form: {
      email: "Correo electrónico",
      emailPlaceholder: "tu@email.es",
      firstName: "Nombre",
      lastName: "Apellido",
      company: "Empresa",
      phone: "Teléfono",
      message: "Mensaje",
      privacyConsent: "Acepto la política de privacidad",
      marketingConsent: "Quiero recibir actualizaciones por correo",
      invalidEmail: "Por favor ingresa un correo válido",
      requiredField: "Este campo es obligatorio",
    },
    completion: {
      congratulations: "🎉 ¡Felicitaciones!",
      thankYou: "¡Gracias por participar!",
      checkEmail: "Te hemos enviado un correo.",
      downloadPdf: "Descargar PDF",
      shareResult: "Compartir resultado",
    },
    socialProof: {
      peopleCompleted: "{count} personas han hecho esto",
      todayCount: "{count} hoy",
      weekCount: "{count} esta semana",
      justNow: "justo ahora",
      minutesAgo: "hace {count} minutos",
      hoursAgo: "hace {count} horas",
    },
    exitIntent: {
      waitTitle: "¡Espera! Antes de irte...",
      specialOffer: "Aquí hay una oferta especial para ti:",
      stayButton: "¡Sí, lo quiero!",
      leaveButton: "No, gracias",
    },
    errors: {
      generic: "Ocurrió un error. Por favor intenta de nuevo.",
      network: "Error de red. Verifica tu conexión.",
      validation: "Por favor verifica tus datos.",
      notFound: "El recurso solicitado no fue encontrado.",
    },
  },

  it: {
    common: {
      next: "Avanti",
      back: "Indietro",
      submit: "Invia",
      cancel: "Annulla",
      save: "Salva",
      loading: "Caricamento...",
      error: "Errore",
      success: "Successo",
      required: "Richiesto",
      optional: "Opzionale",
      yes: "Sì",
      no: "No",
    },
    widget: {
      startButton: "Inizia",
      stepOf: "Passo {current} di {total}",
      progress: "{percent}% completato",
      almostDone: "Quasi fatto!",
      complete: "Completato",
    },
    form: {
      email: "Indirizzo email",
      emailPlaceholder: "tua@email.it",
      firstName: "Nome",
      lastName: "Cognome",
      company: "Azienda",
      phone: "Telefono",
      message: "Messaggio",
      privacyConsent: "Accetto l'informativa sulla privacy",
      marketingConsent: "Desidero ricevere aggiornamenti via email",
      invalidEmail: "Inserisci un indirizzo email valido",
      requiredField: "Questo campo è obbligatorio",
    },
    completion: {
      congratulations: "🎉 Congratulazioni!",
      thankYou: "Grazie per aver partecipato!",
      checkEmail: "Ti abbiamo inviato un'email.",
      downloadPdf: "Scarica PDF",
      shareResult: "Condividi risultato",
    },
    socialProof: {
      peopleCompleted: "{count} persone hanno fatto questo",
      todayCount: "{count} oggi",
      weekCount: "{count} questa settimana",
      justNow: "proprio ora",
      minutesAgo: "{count} minuti fa",
      hoursAgo: "{count} ore fa",
    },
    exitIntent: {
      waitTitle: "Aspetta! Prima di andare...",
      specialOffer: "Ecco un'offerta speciale per te:",
      stayButton: "Sì, lo voglio!",
      leaveButton: "No, grazie",
    },
    errors: {
      generic: "Si è verificato un errore. Riprova.",
      network: "Errore di rete. Controlla la connessione.",
      validation: "Controlla i tuoi dati.",
      notFound: "La risorsa richiesta non è stata trovata.",
    },
  },

  nl: {
    common: {
      next: "Volgende",
      back: "Terug",
      submit: "Verzenden",
      cancel: "Annuleren",
      save: "Opslaan",
      loading: "Laden...",
      error: "Fout",
      success: "Succes",
      required: "Verplicht",
      optional: "Optioneel",
      yes: "Ja",
      no: "Nee",
    },
    widget: {
      startButton: "Start nu",
      stepOf: "Stap {current} van {total}",
      progress: "{percent}% voltooid",
      almostDone: "Bijna klaar!",
      complete: "Voltooid",
    },
    form: {
      email: "E-mailadres",
      emailPlaceholder: "jouw@email.nl",
      firstName: "Voornaam",
      lastName: "Achternaam",
      company: "Bedrijf",
      phone: "Telefoon",
      message: "Bericht",
      privacyConsent: "Ik ga akkoord met het privacybeleid",
      marketingConsent: "Ik wil updates en aanbiedingen per e-mail ontvangen",
      invalidEmail: "Voer een geldig e-mailadres in",
      requiredField: "Dit veld is verplicht",
    },
    completion: {
      congratulations: "🎉 Gefeliciteerd!",
      thankYou: "Bedankt voor je deelname!",
      checkEmail: "We hebben je een e-mail gestuurd.",
      downloadPdf: "Download PDF",
      shareResult: "Deel resultaat",
    },
    socialProof: {
      peopleCompleted: "{count} mensen hebben dit gedaan",
      todayCount: "{count} vandaag",
      weekCount: "{count} deze week",
      justNow: "zojuist",
      minutesAgo: "{count} minuten geleden",
      hoursAgo: "{count} uur geleden",
    },
    exitIntent: {
      waitTitle: "Wacht! Voordat je gaat...",
      specialOffer: "Hier is een speciale aanbieding voor jou:",
      stayButton: "Ja, ik wil dit!",
      leaveButton: "Nee, bedankt",
    },
    errors: {
      generic: "Er is een fout opgetreden. Probeer het opnieuw.",
      network: "Netwerkfout. Controleer je verbinding.",
      validation: "Controleer je invoer.",
      notFound: "De gevraagde bron is niet gevonden.",
    },
  },
};

export function getTranslations(locale: SupportedLocale): TranslationStrings {
  return translations[locale] || translations.de;
}

export function t(
  locale: SupportedLocale,
  path: string,
  params?: Record<string, string | number>
): string {
  const keys = path.split(".");
  let value: any = translations[locale] || translations.de;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`Translation missing: ${path} for locale ${locale}`);
      return path;
    }
  }

  if (typeof value !== "string") return path;

  // Replace parameters
  if (params) {
    return Object.entries(params).reduce(
      (str, [key, val]) => str.replace(new RegExp(`\\{${key}\\}`, "g"), String(val)),
      value
    );
  }

  return value;
}

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
};

export const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  de: "🇩🇪",
  en: "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸",
  it: "🇮🇹",
  nl: "🇳🇱",
};

