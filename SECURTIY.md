Do you need to configure CORS for your setup?
Next.js kümmert sich intern um serverseitige Anfragen. Für clientseitige Anfragen kann CORS im Dashboard konfiguriert werden

Describe how you configured a CSP for your project.
im next.config.js file wurde die passende CSP gesetzt.

Describe if/how your Database-Layer is vulnerable to SQL Injection and what you need to avoid to be safe.
Supabase bietet Schutz vor SQL-Injection-Angriffen weil es Benutzereingaben automatisch bereinigt und escaped.

Describe if/how your View-Layer is vulnerable to XSS and what you need to avoid to be safe.
mit Hilfe der CSP und da NEXT.js Inhalte standart mäßig escaped schützen wir uns