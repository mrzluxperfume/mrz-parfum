import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'

export default function PrivacyPage() {
  return (
    <section className="py-14 md:py-20">
      <Container className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
          MRZ Perfume
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">
          Politique de confidentialité
        </h1>
        <p className="mt-4 text-sm text-ink/65">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink/80">
          <section>
            <h2 className="font-display text-2xl text-ink">1. Responsable</h2>
            <p className="mt-3">
              MRZ Perfume — contact :{' '}
              <a
                href="mailto:mrz.lux.perfume@gmail.com"
                className="underline underline-offset-2"
              >
                mrz.lux.perfume@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">
              2. Données collectées
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Compte client : prénom, nom, email, mot de passe chiffré
                (jamais stocké en clair).
              </li>
              <li>
                Commandes : coordonnées de livraison / facturation et contenu
                du panier.
              </li>
              <li>
                Contact : messages envoyés via le formulaire.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">3. Cookies</h2>
            <p className="mt-3">
              Le site utilise :
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Cookies essentiels</strong> : session compte, panier,
                préférences de consentement.
              </li>
              <li>
                <strong>Cookies analytiques</strong> : uniquement si vous les
                acceptez via la bannière cookies.
              </li>
            </ul>
            <p className="mt-3">
              Vous pouvez modifier votre choix en effaçant les cookies du
              navigateur, la bannière réapparaîtra.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">4. Sécurité</h2>
            <p className="mt-3">
              Les mots de passe sont protégés par un hachage fort (PBKDF2). Les
              pages compte, panier et administration sont exclues de
              l’indexation (robots.txt / sitemap). Les communications sensibles
              passent par HTTPS en production.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">5. Vos droits</h2>
            <p className="mt-3">
              Conformément au RGPD, vous pouvez demander l’accès, la
              rectification ou la suppression de vos données en écrivant à{' '}
              <a
                href="mailto:mrz.lux.perfume@gmail.com"
                className="underline underline-offset-2"
              >
                mrz.lux.perfume@gmail.com
              </a>
              .
            </p>
          </section>

          <p>
            Voir aussi nos{' '}
            <Link to="/terms" className="underline underline-offset-2">
              conditions générales
            </Link>
            .
          </p>
        </div>
      </Container>
    </section>
  )
}
